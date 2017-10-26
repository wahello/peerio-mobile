import React from 'react';
import { LayoutAnimation, Platform } from 'react-native';
import { observable, reaction, action } from 'mobx';
import Router from './router';
import uiState from '../layout/ui-state';
import SettingsLevel1 from '../settings/settings-level-1';
import SettingsLevel2 from '../settings/settings-level-2';
import SettingsLevel3 from '../settings/settings-level-3';
import Ghosts from '../ghosts/ghosts';
import GhostsLevel1 from '../ghosts/ghosts-level-1';
import Chat from '../messaging/chat';
import ChatList from '../messaging/chat-list';
import Files from '../files/files';
import FileView from '../files/file-view';
import ContactAdd from '../contacts/contact-add';
import ContactView from '../contacts/contact-view';
import ContactList from '../contacts/contact-list';
import ContactListInvite from '../contacts/contact-list-invite';
import ChannelInviteList from '../messaging/channel-invite-list';
import Logs from '../logs/logs';
import { fileState, mainState, ghostState, chatState, settingsState, contactState, contactAddState } from '../states';
// import { enablePushNotifications } from '../../lib/push';
import routes from './routes';
import { T } from '../utils/translator';

class RouterMain extends Router {
    // current route object
    @observable current = null;
    @observable isBackVisible = false;
    @observable isInputVisible = false;
    @observable blackStatusBar = false;
    @observable currentIndex = 0;
    @observable suppressTransition = false;
    @observable loading = false;
    @observable invoked = false;
    _initialRoute = 'chats';

    constructor() {
        super();
        routes.main = this;
        reaction(() => this.currentIndex, i => { this.isBackVisible = i > 0; });
        reaction(() => [this.route, this.currentIndex], () => uiState.hideAll());
        this.add('files', [<Files />, <FileView />], fileState);
        this.add('ghosts', [<Ghosts />, <GhostsLevel1 />], ghostState);
        this.add('chats', [<ChatList />, <Chat />], chatState);
        this.add('contacts', [<ContactList />, <ContactView nonModal />], contactState);
        this.add('contactAdd', [<ContactAdd />], contactAddState);
        this.add('contactInvite', [<ContactListInvite />], contactAddState);
        this.add('channelInviteList', [<ChannelInviteList />], chatState);
        this.add('settings', [<SettingsLevel1 />, <SettingsLevel2 />, <SettingsLevel3 />], settingsState);
        this.add('logs', [<Logs />], { title: <T k="title_logs" /> });
    }

    @action initialRoute() {
        this[this._initialRoute](null, true);
    }

    get isInitialRoute() {
        return this.route === this._initialRoute;
    }

    @action async initial() {
        if (this.invoked) return;
        this.invoked = true;
        this.loading = true;
        // if (EN === 'peeriomobile') await enablePushNotifications();
        await mainState.init();
        await chatState.init();
        await contactState.init();
        await fileState.init();
        this.loading = false;
        this.initialRoute();
    }

    add(key, components, routeState) {
        const route = super.add(key, null);
        route.components = observable.ref(components);
        route.routeState = routeState;
        this[key] = route.transition = (item, suppressTransition, index) => {
            if (this.route !== key) {
                !suppressTransition && LayoutAnimation.easeInEaseOut();
                this.onTransition(this.current, false, item);
            }
            this.resetMenus();
            this.current = route;
            this.route = key;

            let newIndex = index;
            if (newIndex === undefined) newIndex = (components.length > 1 && item) ? 1 : 0;
            if (newIndex !== this.currentIndex) {
                !suppressTransition && LayoutAnimation.easeInEaseOut();
            }
            this.currentIndex = newIndex;
            this.onTransition(route, true, item);
            console.log(`router-main: transition to ${this.route}:${this.currentIndex}`);
        };
    }

    get title() {
        return this.current && this.current.routeState ? this.current.routeState.title : null;
    }

    get titleAction() {
        return this.current && this.current.routeState ? this.current.routeState.titleAction : null;
    }

    get pages() {
        return this.current ? this.current.components : [];
    }

    get currentComponent() {
        return this.current && (this.current.components.length > this.currentIndex)
            ? this.current.components[this.currentIndex].type.prototype : {};
    }

    onTransition(route, active, param) {
        try {
            route && route.routeState && route.routeState.onTransition && route.routeState.onTransition(active, param);
        } catch (e) {
            console.error(e);
        }
    }

    @action fabAction() {
        console.log(`router-main.js: fab action`);
        this.current && this.current.routeState && this.current.routeState.fabAction();
    }

    @action back() {
        if (this.currentIndex > 0) this.currentIndex--;
        this.onTransition(this.current, true);
        if (Platform.OS !== 'android') LayoutAnimation.easeInEaseOut();
        console.log(`router-main: transition to ${this.route}:${this.currentIndex}`);
    }

    @action resetMenus() {
        this.isInputVisible = false;
        this.modalRoute = null;
    }
}

const routerMain = new RouterMain();

export default routerMain;
