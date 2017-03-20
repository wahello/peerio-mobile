import React from 'react';
import { Text, Clipboard } from 'react-native';
import { observable, action, reaction } from 'mobx';
import RoutedState from '../routes/routed-state';
import PinModal from '../controls/pin-modal';
import { User } from '../../lib/icebear';
import { popupCopyCancel, popupYes } from '../shared/popups';
import snackbarState from '../snackbars/snackbar-state';
import { tx } from '../utils/translator';

class SettingsState extends RoutedState {
    @observable subroute = null;
    @observable stack = [];
    _prefix = 'settings';

    get title() {
        const sr = this.subroute;
        return sr ? tx(sr) : tx('settings');
    }

    onTransition(active) {
        if (this.reaction) return;
        this.reaction = reaction(() => this.routerMain.currentIndex, (i) => {
            if (this.routerMain.route === 'settings') {
                while (i < this.stack.length) {
                    this.stack.pop();
                }
                this.subroute = i ? this.stack[i - 1] : null;
            }
        });
    }

    @action transition(subroute) {
        console.log(`settings-state.js: transition ${subroute}`);
        this.routerMain.route = 'settings';
        this.routerMain.isRightMenuVisible = false;
        this.routerMain.isLeftHamburgerVisible = false;
        if (subroute) {
            this.subroute = subroute;
            this.stack.push(subroute);
            this.routerMain.currentIndex = this.stack.length;
        } else {
            this.routerMain.currentIndex = 0;
            this.stack.clear();
        }
    }

    showPassphrase() {
        const success = passphrase => {
            const mp = (
                <Text style={{ fontWeight: 'bold', fontSize: 14 }}>
                    {passphrase}
                </Text>
            );
            popupCopyCancel(
                tx('passphrase'),
                tx('popup_masterPasswordText'),
                mp
            ).then(r => {
                if (!r) return;
                Clipboard.setString(passphrase);
                snackbarState.pushTemporary(tx('popup_masterPasswordCopied'));
            });
            this.routerModal.modalControl = null;
        };
        const pinModal = (
            <PinModal
                onSuccess={success}
                onCancel={() => (this.routerModal.modalControl = null)} />
        );
        User.current.hasPasscode().then(r => {
            if (!r) {
                popupYes(tx('passphrase'), tx('passcode_notSet'));
                return;
            }
            this.routerModal.modalControl = pinModal;
        });
    }
}

export default new SettingsState();
