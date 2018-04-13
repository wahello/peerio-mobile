import React from 'react';
import { Text, WebView, Image, View, Platform } from 'react-native';
import { observable } from 'mobx';
import { t, tu, tx } from '../utils/translator';
import TextInputStateful from '../controls/text-input-stateful';
import popupState from '../layout/popup-state';
import locales from '../../lib/locales';
import CheckBox from './checkbox';
import { vars } from '../../styles/styles';
import { fileStore, User, config } from '../../lib/icebear';
import testLabel from '../helpers/test-label';
import FilePreview from '../files/file-preview';
import PopupMigration from '../controls/popup-migration';

const titleStyle = {
    color: vars.lighterBlackText,
    fontSize: vars.font.size.huge,
    fontWeight: vars.font.weight.regular
};
const textStyle = {
    color: vars.lighterBlackText,
    fontSize: vars.font.size.normal,
    fontWeight: vars.font.weight.regular
};

function textControl(str, style) {
    const text = {
        color: '#000000AA',
        marginVertical: vars.spacing.small.maxi,
        lineHeight: 22
    };

    let formatted = str;
    if (typeof str === 'string') {
        formatted = str.replace('\n', '\n\n');
    }
    if (style) Object.assign(text, style);

    return <Text {...testLabel('textControl')} style={text}>{formatted}</Text>;
}

function checkBoxControl(str, checked, press, alignLeft, accessibilityLabel) {
    return <CheckBox text={str} isChecked={checked} onChange={press} alignLeft accessibilityLabel={accessibilityLabel} />;
}

function inputControl(state, placeholder, props) {
    return (
        <TextInputStateful placeholder={placeholder} state={state} {...props} />
    );
}

function previewAndInputControl(state) {
    return (
        <FilePreview state={state} />
    );
}

const swActions = {};

/**
 * Hook action to a system warning action type
 * @param {string} type
 * @param {func} action
 */
function addSystemWarningAction(type, action) {
    swActions[type] = action;
}

function popupSystemWarning(title, contents, buttons) {
    const button = (text, action) => ({ id: 'ok', text, action });
    const swButton = i => ({ id: i.action, text: t(i.label), action: swActions[i.action] });
    return new Promise((resolve) => {
        popupState.showPopup({
            title,
            type: 'systemWarning',
            contents: textControl(contents),
            buttons: buttons ?
                buttons.map(i => (i.action ? swButton(i) : button(i, resolve)))
                : [button(tu('button_ok'), resolve)]
        });
    });
}

function popupYes(title, subTitle, text) {
    return new Promise((resolve) => {
        popupState.showPopup({
            title,
            subTitle: subTitle ? textControl(subTitle) : null,
            contents: text ? textControl(text) : null,
            buttons: [{
                id: 'ok', text: tu('button_ok'), action: resolve
            }]
        });
    });
}

function popupAbout() {
    const showPoweredBy = process.env.EXECUTABLE_NAME === 'medcryptor';
    const image = require('../../assets/poweredByPeerio_colour.png');
    const text = (<Text>
        Version: {config.appVersion}{'\n'}
        SDK: {config.sdkVersion} {'\n'}
        OS: {Platform.OS} {'\n'}
        OS Version: {Platform.Version}
    </Text>);
    const contents = (
        <View>
            {textControl(text)}
            {showPoweredBy && <Image source={image} resizeMode="contain" style={{ width: '80%' }} />}
        </View>
    );
    return new Promise((resolve) => {
        popupState.showPopup({
            title: 'About',
            contents,
            buttons: [{
                id: 'ok', text: tu('button_ok'), action: resolve
            }]
        });
    });
}

function popupUpgrade(title, subTitle, text) {
    // TODO: add upgrade button
    return popupYes(title, subTitle, text);
}

function popupYesCancel(title, subTitle, text) {
    return new Promise((resolve) => {
        popupState.showPopup({
            title,
            subTitle: textControl(subTitle),
            contents: text ? textControl(text) : null,
            buttons: [
                { id: 'no', text: t('button_no'), action: () => resolve(false), secondary: true },
                { id: 'yes', text: t('button_yes'), action: () => resolve(true) }
            ]
        });
    });
}

function popupOkCancel(title, subTitle, text) {
    return new Promise((resolve) => {
        popupState.showPopup({
            title,
            subTitle: textControl(subTitle),
            contents: text ? textControl(text) : null,
            buttons: [
                { id: 'cancel', text: tu('button_cancel'), action: () => resolve(false), secondary: true },
                { id: 'ok', text: tu('button_ok'), action: () => resolve(true) }
            ]
        });
    });
}

function popupYesSkip(title, subTitle, text) {
    return new Promise((resolve) => {
        popupState.showPopup({
            title,
            subTitle: textControl(subTitle),
            contents: textControl(text),
            buttons: [
                { id: 'no', text: t('button_skip'), action: () => resolve(false), secondary: true },
                { id: 'yes', text: t('button_yes'), action: () => resolve(true) }
            ]
        });
    });
}

function popupSignOutAutologin() {
    return new Promise((resolve) => {
        const o = observable({ value: '', checked: false });
        const contents = (
            <View style={{ minHeight: vars.popupMinHeight }}>
                {textControl(t('title_signOutConfirmKeys'))}
                {User.current.trustedDevice &&
                    checkBoxControl(
                        t('title_stopTrustingThisDevice'),
                        o.checked,
                        v => { o.checked = v; })
                }
            </View>
        );
        popupState.showPopup({
            title: t('title_gotYourKeys'),
            contents,
            buttons: [
                { id: 'no', text: tu('button_getKey'), action: () => resolve(false) },
                { id: 'yes', text: tu('button_logout'), action: () => resolve(o), secondary: true }
            ]
        });
    });
}

function popupCopyCancel(title, subTitle, text) {
    return popupState.showPopupPromise(resolve => ({
        title,
        subTitle: textControl(subTitle),
        contents: textControl(text),
        buttons: [
            { id: 'cancel', text: tu('button_close'), action: () => resolve(false), secondary: true },
            { id: 'copy', text: tu('title_copy'), action: () => resolve(true) }
        ]
    }));
}

function popupCancelConfirm(title, subTitle, text) {
    return popupState.showPopupPromise(resolve => ({
        title,
        subTitle: textControl(subTitle),
        contents: textControl(text),
        buttons: [
            { id: 'cancel', text: tu('button_cancel'), secondary: true, action: () => resolve(false) },
            { id: 'confirm', text: tu('button_confirm'), action: () => resolve(true) }
        ]
    }));
}

function popupInput(title, subTitle, value, textInputProps) {
    return new Promise((resolve) => {
        const o = observable({ value });
        popupState.showPopup({
            title,
            subTitle: textControl(subTitle),
            contents: inputControl(o, null, textInputProps),
            buttons: [{
                id: 'ok', text: tu('button_ok'), action: () => resolve(o.value)
            }]
        });
    });
}

function popupInputWithPreview(title, fileProps) {
    return new Promise((resolve) => {
        const o = observable({ value: fileProps });
        popupState.showPopup({
            title,
            contents: previewAndInputControl(o.value),
            buttons: [
                { id: 'cancel', text: tu('button_cancel'), secondary: true, action: () => resolve({ shouldUpload: false, newName: '' }) },
                { id: 'ok', text: tu('button_ok'), action: () => { resolve({ shouldUpload: true, newName: o.value.name }); } }
            ]
        });
    });
}

function popupInputCancel(title, placeholder, cancelable) {
    return new Promise((resolve) => {
        const o = observable({ value: '' });
        const buttons = [];
        cancelable && buttons.push({
            id: 'cancel', text: tu('button_cancel'), action: () => resolve(false), secondary: true
        });
        buttons.push({
            id: 'ok', text: tu('button_ok'), action: () => resolve(o), get disabled() { return !o.value; }
        });
        const contents = (
            <View>
                {inputControl(o, placeholder, { autoCapitalize: 'sentences' })}
            </View>
        );
        popupState.showPopup({
            title,
            contents,
            buttons
        });
    });
}

let tos = '';

function popupTOS() {
    console.log(`popups.js: popup tos`);
    return new Promise((resolve) => {
        popupState.showPopup({
            fullScreen: 1,
            contents: <WebView
                source={{ html: tos }} />,
            buttons: [{
                id: 'ok', text: tu('button_ok'), action: resolve
            }]
        });
    });
}

function popupKeychainError(title, subTitle, text) {
    return new Promise((resolve) => {
        popupState.showPopup({
            title,
            type: 'systemWarning',
            subTitle: textControl(subTitle),
            contents: text ? textControl(text) : null,
            buttons: [
                { id: 'no', text: t('button_no'), action: () => resolve(false), secondary: true },
                { id: 'yes', text: t('button_yes'), action: () => resolve(true) }
            ]
        });
    });
}


function popup2FA(title, placeholder, checkBoxText, checked, cancelable) {
    const helperTextStyle = {
        color: vars.subtleText,
        fontSize: vars.font.size.smaller,
        fontWeight: vars.font.weight.regular,
        paddingVertical: vars.spacing.small.midi
    };
    return new Promise((resolve) => {
        const o = observable({ value: '', checked });
        const buttons = [];
        cancelable && buttons.push({
            id: 'cancel', text: tu('button_cancel'), action: () => resolve(false), secondary: true
        });
        buttons.push({
            id: 'ok', text: tu('button_submit'), action: () => resolve(o), get disabled() { return !o.value; }
        });
        const contents = (
            <View style={{ minHeight: vars.popupMinHeight }}>
                {inputControl(o, placeholder, testLabel('2faTokenInput'))}
                <Text style={helperTextStyle}>
                    {tx('title_2FAHelperText')}
                </Text>
                {checkBoxText && checkBoxControl(checkBoxText, o.checked, v => { o.checked = v; }, false, 'trustDevice')}
            </View>
        );
        popupState.showPopup({
            title,
            contents,
            buttons
        });
    });
}

function popupDeleteAccount() {
    const checked = false;
    return popupState.showPopupPromise(resolve => ({
        title: textControl(tx('title_accountDelete')),
        contents: (
            <View>
                {textControl(tx('title_accountDeleteDescription1'))}
                {textControl(tx('title_accountDeleteDescription2'))}
                {textControl(tx('title_accountDeleteDescription3'))}
                {/* checkBoxControl(tx('title_accountDeleteAllFiles'), checked, value => {
                    checked = value;
                    console.log(checked);
                }) */}
            </View>
        ),
        buttons: [
            { id: 'cancel', text: tu('button_cancel'), action: () => resolve(false), secondary: true },
            { id: 'copy', text: tu('button_confirm'), action: () => resolve(true, checked) }
        ]
    }));
}

function popupControl(contents, button) {
    console.log(`popups.js: popup control`);
    return new Promise((resolve) => {
        popupState.showPopup({
            contents,
            buttons: [{
                id: 'ok', text: tu(button || 'button_ok'), action: resolve
            }]
        });
    });
}

function popupSetupVideo() {
    const dialog = {
        titleText: tx('title_videoCall'),
        subText: tx('dialog_videoCall')
    };
    return new Promise((resolve) => {
        popupState.showPopup({
            title: textControl(dialog.titleText),
            subTitle: textControl(dialog.subText),
            buttons: [
                { id: 'cancel', text: tu('button_cancel'), action: () => resolve(false), secondary: true },
                { id: 'ok', text: tu('button_startVideoCall'), action: () => resolve(true) }
            ]
        });
    });
}

function popupFolderDelete(isShared, isOwner) {
    let text = 'dialog_deleteFolderText';
    if (isShared) {
        text = isOwner ? 'dialog_deleteSharedFolderText' : 'dialog_deleteSharedFolderNonOwnerText';
    }
    return popupState.showPopupPromise(resolve => ({
        title: textControl(tx('title_deleteFolder_mobile')),
        contents: textControl(tx(text)),
        type: 'systemWarning',
        buttons: [
            { id: 'cancel', text: tu('button_cancel'), secondary: true, action: () => resolve(false) },
            { id: 'confirm', text: tu('button_delete'), action: () => resolve(true) }
        ]
    }));
}

function popupMoveToSharedFolder() {
    return new Promise((resolve) => {
        const o = observable({ value: '', checked: false });
        const alignedLeft = true;
        popupState.showPopup({
            title: textControl(tx('title_moveToSharedFolder')),
            contents: (
                <View>
                    {textControl(tx('title_moveToSharedFolderDescription'))}
                    {checkBoxControl(
                        tx('title_dontShowMessageAgain'),
                        o.checked,
                        v => { o.checked = v; },
                        alignedLeft
                    )}
                </View>
            ),
            buttons: [
                { id: 'cancel', text: tu('button_cancel'), action: () => resolve(false), secondary: true },
                { id: 'move', text: tu('button_move'), action: () => resolve(o) }
            ]
        });
    });
}

function popupUpgradeNotification() {
    return new Promise((resolve) => {
        popupState.showPopup({
            type: 'systemUpgrade',
            title: textControl(tx('title_upgradeFileSystem'), titleStyle),
            contents: (
                <View>
                    {textControl(tx('title_upgradeFileSystemDescription1'), textStyle)}
                    {textControl(tx('title_upgradeFileSystemDescription2'), textStyle)}
                    {fileStore.hasLegacySharedFiles && textControl(tx('title_upgradeFileSystemDescription3'), textStyle)}
                </View>
            ),
            buttons: [
                { id: 'update', text: tu('button_update'), action: () => resolve(true) }
            ]
        });
    });
}

function popupUpgradeProgress() {
    return (
        popupState.showPopup({
            type: 'systemUpgrade',
            title: textControl(tx('title_fileUpdateProgress'), titleStyle),
            contents: <PopupMigration />
        }));
}

locales.loadAssetFile('terms.txt').then(s => {
    tos = s;
});

export {
    textControl,
    addSystemWarningAction,
    popupYes,
    popupYesCancel,
    popupOkCancel,
    popupYesSkip,
    popupInput,
    popupInputWithPreview,
    popupTOS,
    popupKeychainError,
    popup2FA,
    popupCopyCancel,
    popupInputCancel,
    popupUpgrade,
    popupSystemWarning,
    popupDeleteAccount,
    popupControl,
    popupSignOutAutologin,
    popupCancelConfirm,
    popupSetupVideo,
    popupUpgradeNotification,
    popupUpgradeProgress,
    popupFolderDelete,
    popupMoveToSharedFolder,
    popupAbout
};

