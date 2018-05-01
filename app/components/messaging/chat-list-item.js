import PropTypes from 'prop-types';
import React from 'react';
import { observer } from 'mobx-react/native';
import { View, Text } from 'react-native';
import SafeComponent from '../shared/safe-component';
import Avatar from '../shared/avatar';
import chatState from './chat-state';
import { User, contactStore, systemMessages } from '../../lib/icebear';
import { tx } from '../utils/translator';
import { vars } from '../../styles/styles';

@observer
export default class ChatListItem extends SafeComponent {
    renderNewBadge() {
        const circleStyle = {
            width: vars.roomInviteCircleWidth,
            height: vars.roomInviteCircleHeight,
            borderRadius: 5,
            backgroundColor: vars.invitedBadgeColor,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center'
        };
        const textNewStyle = {
            fontSize: vars.font.size.smaller,
            fontWeight: vars.font.weight.semiBold,
            color: vars.unreadTextColor
        };
        return (
            <View style={circleStyle}>
                <Text semibold style={textNewStyle}>
                    {tx('title_new')}
                </Text>
            </View>);
    }

    renderUnreadCountBadge() {
        const { chat } = this.props;
        const circleStyle = {
            width: vars.spacing.large.mini2x,
            paddingVertical: 1,
            borderRadius: 14,
            backgroundColor: vars.peerioTeal,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center'
        };

        const circleTextStyle = {
            fontSize: vars.font.size.normal,
            fontWeight: vars.font.weight.semiBold,
            color: vars.badgeText
        };
        return (
            <View style={circleStyle}>
                <Text style={circleTextStyle}>
                    {`${chat.unreadCount}`}
                </Text>
            </View>
        );
    }

    get rightIcon() {
        const { chat } = this.props;
        if (chat.isPendingDM) return this.renderNewBadge();
        if (chat.unreadCount === 0) return null;
        return this.renderUnreadCountBadge();
    }

    // --- Feature disabled ---
    // renderMostRecentMessage(c) {
    //     const m = c.mostRecentMessage;
    //     if (!m) return null;
    //     if (m.systemData) {
    //         return <Text numberOfLines={1} ellipsizeMode="tail" style={{ fontStyle: 'italic' }}>{systemMessages.getSystemMessageText(m)}</Text>;
    //     }
    //     let { username } = m.sender;
    //     if (username === User.current.username) username = tx('title_you');
    //     return (
    //         <Text numberOfLines={1} ellipsizeMode="tail">
    //             <Text style={{ fontWeight: 'bold' }}>{username}{`: `}</Text>
    //             <Text style={{ color: vars.txtMedium }}>
    //                 {m.files && m.files.length
    //                     ? tx('title_filesShared', { count: m.files.length })
    //                     : m.text}
    //             </Text>
    //         </Text>
    //     );
    // }

    renderThrow() {
        if (chatState.collapseDMs) return null;
        if (!this.props || !this.props.chat) return null;
        const { chat } = this.props;
        const { otherParticipants, headLoaded } = chat;
        if (!headLoaded) return null;
        // group chats have null for contact
        let contact = null;
        let isDeleted = false;
        // no participants means chat with yourself
        if (!otherParticipants) contact = contactStore.getContact(User.current.username);
        // two participants
        if (otherParticipants && otherParticipants.length === 1) {
            contact = otherParticipants[0];
            ({ isDeleted } = contact);
        }

        const key = chat.id;
        let onPress;

        if (chat.isPendingDM) {
            onPress = () => chatState.routerMain.dmContactInvite({
                name: chat.name,
                id: chat.id,
                username: chat.name
            });
        } else onPress = () => chatState.routerMain.chats(chat);
        const unread = chat.unreadCount > 0;
        return (
            <Avatar
                disableMessageTapping
                pinned={chat.isFavorite}
                rightIcon={this.rightIcon}
                extraPaddingTop={8}
                extraPaddingVertical={8}
                unread={unread}
                ellipsize
                contact={contact}
                title={chat.name}
                isChat
                hideOnline
                isDeleted={isDeleted}
                key={key}
                onPress={onPress}
                onPressAvatar={onPress}
            />
        );
    }
}

ChatListItem.propTypes = {
    chat: PropTypes.any.isRequired
};
