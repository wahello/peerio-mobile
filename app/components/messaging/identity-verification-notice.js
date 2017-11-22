import React, { Component } from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { vars } from '../../styles/styles';
import { T } from '../utils/translator';

export default class IdentityVerificationNotice extends Component {
    idVerificationContainer = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: vars.spacing.small.midi,
        marginBottom: vars.spacing.small.midi,
        marginLeft: vars.spacing.small.maxi2x,
        marginRight: vars.spacing.small.maxi2x
    };

    securityIcon = {
        margin: vars.spacing.small.mini,
        marginRight: vars.spacing.small.midi
    };

    idVerificationText = {
        flex: 1,
        color: vars.txtMedium,
        flexGrow: 1
    };

    hyperlink = {
        color: vars.txtMedium,
        textDecorationLine: 'underline'
    };

    render() {
        return (
            <View style={this.idVerificationContainer} >
                <Icon style={this.securityIcon}
                    name="security"
                    size={vars.iconSize}
                    color="gray"
                />
                <Text style={this.idVerificationText}>
                    <T k="title_verifyUserIdentity" />
                </Text>
            </View>
        );
    }
}