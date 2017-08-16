import React from 'react';
import { observer } from 'mobx-react/native';
import { View, ListView, Animated } from 'react-native';
import { observable, reaction } from 'mobx';
import { chatInviteStore } from '../../lib/icebear';
import SafeComponent from '../shared/safe-component';
import MessagingPlaceholder from './messaging-placeholder';
import ChatListItem from './chat-list-item';
import ChannelListItem from './channel-list-item';
import ProgressOverlay from '../shared/progress-overlay';
import chatState from './chat-state';
import ChatSectionHeader from './chat-section-header';
import ChatChannelInviteSection from './chat-channel-invites-section';
import { tx } from '../utils/translator';

const INITIAL_LIST_SIZE = 10;
const PAGE_SIZE = 2;

@observer
export default class Files extends SafeComponent {
    constructor(props) {
        super(props);
        this.dataSource = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2,
            sectionHeaderHasChanged: (r1, r2) => r1 !== r2
        });
    }

    get isFabVisible() { return true; }

    @observable dataSource = null;
    @observable refreshing = false
    @observable maxLoadedIndex = INITIAL_LIST_SIZE;
    actionsHeight = new Animated.Value(0)

    get data() {
        return chatState.store.chats;
    }

    componentWillUnmount() {
        this.reaction && this.reaction();
        this.reaction = null;
    }

    componentDidMount() {
        this.reaction = reaction(() => [
            chatState.routerMain.route === 'chats',
            chatState.routerMain.currentIndex === 0,
            chatInviteStore.received,
            chatInviteStore.received.length,
            this.data,
            this.data.length,
            this.maxLoadedIndex
        ], () => {
            console.log(`chat-list.js: update ${this.data.length} -> ${this.maxLoadedIndex}`);
            this.dataSource = this.dataSource.cloneWithRowsAndSections({
                title_channels: this.data.filter(d => !!d.isChannel),
                title_channelInvites: [],
                title_directMessages: this.data.filter(d => !d.isChannel).slice(0, this.maxLoadedIndex)
            });
            this.forceUpdate();
        }, true);
    }

    sectionHeader = (data, key) => {
        const titles = {
            title_channels: tx('title_channels'),
            title_directMessages: tx('title_directMessages')
        };
        const invitesCount = chatInviteStore.received.length;
        return key === 'title_channelInvites' ?
            <ChatChannelInviteSection
                title="Channel invites"
                data={invitesCount} onPress={() => chatState.routerMain.channelInviteList()} /> : <ChatSectionHeader title={titles[key]} />;
    }

    item(chat) {
        if (!chat.id) return null;
        return chat.isChannel ? <ChannelListItem chat={chat} /> : (
            <ChatListItem key={chat.id} chat={chat} />
        );
    }

    onEndReached = () => {
        console.log('files.js: on end reached');
        this.maxLoadedIndex += PAGE_SIZE;
    }

    listView() {
        if (chatState.routerMain.currentIndex !== 0) return null;
        return (
            <ListView
                style={{ flexGrow: 1 }}
                initialListSize={INITIAL_LIST_SIZE}
                pageSize={PAGE_SIZE}
                dataSource={this.dataSource}
                renderRow={this.item}
                renderSectionHeader={this.sectionHeader}
                onEndReached={this.onEndReached}
                onEndReachedThreshold={20}
                onContentSizeChange={this.scroll}
                enableEmptySections
                ref={sv => (this.scrollView = sv)}
            />
        );
    }

    renderThrow() {
        const body = ((this.data.length || chatInviteStore.received.length) && chatState.store.loaded) ?
            this.listView() : <MessagingPlaceholder />;

        return (
            <View
                style={{ flexGrow: 1, flex: 1 }}>
                <View style={{ flexGrow: 1, flex: 1 }}>
                    {body}
                </View>
                <ProgressOverlay enabled={chatState.store.loading} />
            </View>
        );
    }
}
