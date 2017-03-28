import { observable, action, when, reaction } from 'mobx';
import { chatStore, TinyDb } from '../../lib/icebear';
import sounds from '../../lib/sounds';

class ChatState {
    store = chatStore;
    _loading = true;

    constructor() {
        chatStore.events.on(chatStore.EVENT_TYPES.messagesReceived, () => {
            console.log('chat-state.js: messages received');
            sounds.received();
        });

        reaction(() => chatStore.activeChat, chat => {
            if (chat && !chat.loadingMeta) {
                console.log(`chat-store switched to ${chat.id}`);
                chat.loadMessages();
                this.save();
                this.loading = false;
            }
        });
        // when(() => chatStore.loaded, () => {
        //     let c = this.saved && chatStore.chatMap[this.saved.currentChat];
        //     if (!c && chatStore.chats.length) {
        //         c = chatStore.chats[chatStore.chats.length - 1];
        //     }
        //     c && this.activate(c);
        // });
    }

    get currentChat() {
        return chatStore.activeChat;
    }

    @observable _loading = true;

    get loading() {
        const c = this.currentChat;
        return this._loading ||
            chatStore.loading || c && (c.loadingMeta || !c.initialPageLoaded);
    }

    set loading(v) {
        this._loading = v;
    }

    get title() {
        return this.currentChat ? this.currentChat.chatName : '';
    }

    activate(chat) {
        if (chat.id) {
            console.log(`chat-state.js: activating chat ${chat.id}`);
            chatStore.activate(chat.id);
        }
    }

    onTransition(active, c) {
        console.log(`chat-state.js: loading all chats`);
        active && chatStore.loadAllChats();
        if (active) {
            when(() => !chatStore.loading, () => {
                if (!chatStore.chats.length) this.loading = false;
                const chat = c || (chatStore.chats.length && chatStore.chats[chatStore.chats.length - 1]);
                chat && this.activate(chat);
            });
        }
    }

    @action async save() {
        await TinyDb.user.setValue('main-state', { currentChat: this.currentChat.id });
    }

    get unreadMessages() {
        let r = 0;
        chatStore.chats.forEach(c => (r += c.unreadCount));
        return r;
    }

    get canSend() {
        return this.currentChat && this.currentChat.id &&
                      !this.currentChat.loadingMessages;
    }

    @action addMessage(msg, files) {
        sounds.sending();
        this.currentChat && (
            files ? this.currentChat.shareFiles(files) : this.currentChat.sendMessage(msg)
        ).then(sounds.sent).catch(sounds.destroy);
    }

    @action addAck() {
        sounds.ack();
        this.currentChat && this.currentChat
            .sendAck().then(sounds.sent).catch(sounds.destroy);
    }
}

export default new ChatState();