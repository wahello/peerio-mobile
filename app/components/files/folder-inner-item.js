import PropTypes from 'prop-types';
import React from 'react';
import { observer } from 'mobx-react/native';
import { observable, action } from 'mobx';
import { Text, View, TouchableOpacity } from 'react-native';
import moment from 'moment';
import SafeComponent from '../shared/safe-component';
import { vars, helpers } from '../../styles/styles';
import icons from '../helpers/icons';
import { tx } from '../utils/translator';
import fileState from './file-state';
import chatState from '../messaging/chat-state';

const height = vars.filesListItemHeight;
const checkBoxWidth = height;
const itemContainerStyle = {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: vars.filesBg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, .12)',
    height,
    borderWidth: 0,
    borderColor: 'red',
    paddingLeft: vars.spacing.medium.mini2x
};

const folderInfoContainerStyle = {
    flexGrow: 1,
    flexDirection: 'row',
    backgroundColor: 'white'
};

@observer
export default class FolderInnerItem extends SafeComponent {
    @observable progressWidth = 0;

    @action.bound onPress() {
        const { folder, onPress } = this.props;
        onPress && onPress(folder);
    }

    @action.bound onCheckBoxPressed() {
        const { folder } = this.props;
        if (!chatState.currentChat.isChannel) {
            folder.selected = !folder.selected;
        }
    }

    checkbox() {
        if (!fileState.isFileSelectionMode) return null;
        const { folder } = this.props;
        const checked = folder.selected;
        const v = vars;
        const disabled = chatState.currentChat.isChannel || folder.isBlocked;
        const iconBgColor = 'transparent';
        let iconColor;
        if (disabled) {
            iconColor = v.checkboxDisabled;
        } else {
            iconColor = checked ? v.checkboxIconActive : v.checkboxIconInactive;
        }
        const icon = checked ? 'check-box' : 'check-box-outline-blank';
        const outer = {
            backgroundColor: 'transparent',
            paddingHorizontal: vars.spacing.small.mini2x,
            flex: 0,
            width: checkBoxWidth,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: vars.spacing.small.mini2x,
            left: 0,
            zIndex: 1
        };
        return (
            <View style={outer}>
                {icons.colored(icon, this.onCheckBoxPressed, iconColor, iconBgColor)}
            </View>
        );
    }

    get currentProgress() {
        const { folder } = this.props;
        const { progressWidth } = this;
        if (!progressWidth) return 0;
        return progressWidth * folder.progressPercentage / 100;
    }

    @action.bound layout(evt) {
        this.progressWidth = evt.nativeEvent.layout.width;
    }

    get radio() {
        if (!this.props.radio) return null;
        const outer = {
            width: vars.listItemHeight,
            height: vars.listItemHeight,
            alignItems: 'center',
            justifyContent: 'center',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0, 0, 0, .12)'
        };
        const s = [helpers.circle(20), {
            backgroundColor: vars.white,
            borderColor: vars.txtMedium,
            borderWidth: 2
        }];
        return (
            <TouchableOpacity
                onPress={this.props.onSelect}
                pressRetentionOffset={vars.pressRetentionOffset}>
                <View style={outer}>
                    <View style={s} />
                </View>
            </TouchableOpacity>
        );
    }

    get fileDetails() {
        const { folder } = this.props;
        const infoStyle = {
            backgroundColor: 'transparent',
            color: vars.extraSubtleText,
            fontSize: vars.font.size.smaller,
            fontWeight: vars.font.weight.regular,
            fontStyle: 'italic'
        };
        const { progressPercentage, progressText, progressMax } = folder;
        if (progressMax) {
            return (
                <Text style={infoStyle}>
                    <Text>{tx(progressText)}{`(${progressPercentage}%)`}</Text>
                </Text>
            );
        } else if (folder.isBlocked) {
            return (
                <Text style={infoStyle}>
                    {tx('title_locked')}
                </Text>
            );
        }
        return (
            <Text style={infoStyle}>
                {folder.size ?
                    <Text>{folder.sizeFormatted}</Text> :
                    <Text>{tx('title_empty')}</Text>}
                &nbsp;&nbsp;
                {folder.createdAt && moment(folder.createdAt).format('DD/MM/YYYY')}
            </Text>);
    }

    renderThrow() {
        const { folder, onSelect, hideMoreOptionsIcon, onFolderAction } = this.props;
        const { isShared, isBlocked } = folder;
        const progressContainer = {
            backgroundColor: vars.fileUploadProgressColor,
            width: this.currentProgress,
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0
        };
        const nameStyle = {
            color: isBlocked ? vars.extraSubtleText : vars.txtDark,
            fontSize: vars.font.size.normal,
            fontWeight: vars.font.weight.bold,
            backgroundColor: 'transparent'
        };
        const checkboxPadding = {
            paddingLeft: fileState.isFileSelectionMode ? checkBoxWidth : vars.spacing.medium.mini2x
        };
        const loadingStyle = null;
        const optionsIcon = hideMoreOptionsIcon || fileState.isFileSelectionMode ? null : (
            <View style={{ flex: 0 }}>
                {icons.dark(
                    'more-vert',
                    !isBlocked ? onFolderAction : null,
                    !isBlocked ? null : { opacity: 0.38 })}
            </View>);
        return (
            <View style={{ backgroundColor: vars.chatItemPressedBackground }}>
                <TouchableOpacity
                    onPress={hideMoreOptionsIcon ? onSelect : this.onPress}
                    style={{ backgroundColor: vars.filesBg }}>
                    <View style={folderInfoContainerStyle}>
                        {this.radio}
                        <View style={[itemContainerStyle, checkboxPadding]}>
                            <View style={progressContainer} />
                            {this.radio}
                            <View style={[loadingStyle, { flex: 0 }]}>
                                {icons.plaindark(isShared ? 'folder-shared' : 'folder', vars.iconSize, null)}
                            </View>
                            <View style={{ flexGrow: 1, flexShrink: 1, marginLeft: vars.spacing.medium.maxi2x }}>
                                <Text style={nameStyle} numberOfLines={1} ellipsizeMode="tail">{folder.isRoot ? tx('title_files') : folder.name}</Text>
                                {this.fileDetails}
                            </View>
                            {optionsIcon}
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

FolderInnerItem.propTypes = {
    onPress: PropTypes.func,
    onSelect: PropTypes.func,
    folder: PropTypes.any.isRequired,
    hideMoreOptionsIcon: PropTypes.bool,
    radio: PropTypes.bool,
    onFolderActionPress: PropTypes.func
};
