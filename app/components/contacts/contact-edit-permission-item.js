import PropTypes from 'prop-types';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { action } from 'mobx';
import { observer } from 'mobx-react/native';
import SafeComponent from '../shared/safe-component';
import { tx, tu } from '../utils/translator';
import icons from '../helpers/icons';
import { vars } from '../../styles/styles';
import AvatarCircle from '../shared/avatar-circle';

const avatarPadding = 16;

@observer
export default class ContactEditPermissionItem extends SafeComponent {
    get showWarning() {
        return this.props.state[this.props.toDeleteProperty] === this.props.contact;
    }

    set showWarning(value) {
        this.props.state[this.props.toDeleteProperty] = value ? this.props.contact : null;
    }

    @action.bound handleShowWarningClick() { this.showWarning = true; }

    removeButton() {
        const buttonStyle = {
            paddingHorizontal: vars.spacing.small.maxi,
            backgroundColor: '#D0021B',
            height: vars.removeButtonHeight,
            justifyContent: 'center'
        };
        // TODO wire up TouchableOpacity onPress
        return (
            <TouchableOpacity
                pressRetentionOffset={vars.pressRetentionOffset}
                style={buttonStyle}>
                <Text style={{ backgroundColor: 'transparent', color: vars.white }}>
                    {tu('button_remove')}
                </Text>
            </TouchableOpacity>);
    }

    deleteWarning() {
        const { firstName } = this.props.contact;
        const marginBottom = 8;
        const containerStyle = {
            height: vars.warningHeight - marginBottom,
            marginBottom,
            marginLeft: vars.avatarDiameter + avatarPadding * 2,
            paddingLeft: vars.spacing.medium.mini2x,
            borderLeftWidth: 1,
            borderLeftColor: vars.black12,
            flex: 1,
            justifyContent: 'center'
        };
        const textStyle = {
            color: vars.subtleText,
            fontWeight: vars.font.weight.semiBold,
            paddingRight: vars.spacing.medium.mini2x
        };
        return (
            <View style={containerStyle}>
                <Text style={textStyle}>
                    {tx('title_filesSharedRemoved', { firstName })}
                </Text>
            </View>
        );
    }

    renderThrow() {
        const { contact } = this.props;
        const { fullName } = contact;
        const containerStyle = {
            height: vars.headerHeight,
            flex: 1,
            flexGrow: 1,
            flexDirection: 'row',
            paddingLeft: avatarPadding
        };
        const nameStyle = {
            fontSize: vars.font.size.normal,
            color: vars.lighterBlackText,
            paddingLeft: vars.spacing.medium.mini2x
        };
        return (
            <View style={{ backgroundColor: this.showWarning ? vars.black05 : vars.white }}>
                <View style={containerStyle}>
                    <View style={{ flex: 1, flexGrow: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <AvatarCircle
                            contact={this.props.contact}
                        />
                        <Text style={nameStyle}>
                            {fullName}
                        </Text>
                    </View>
                    {this.showWarning ?
                        this.removeButton() :
                        icons.darkNoPadding(
                            'remove-circle-outline',
                            this.handleShowWarningClick,
                            { paddingRight: vars.spacing.medium.mini2x }
                        )}
                </View>
                {this.showWarning && this.deleteWarning()}
            </View>);
    }
}

ContactEditPermissionItem.propTypes = {
    contact: PropTypes.any
};
