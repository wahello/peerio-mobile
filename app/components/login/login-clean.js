import React, { Component } from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import { t, tx } from '../utils/translator';
// import LanguagePickerBox from '../controls/language-picker-box';
import TextBox from '../controls/textbox';
import ActivityOverlay from '../controls/activity-overlay';
import loginState from './login-state';
import LoginWizardPage, {
    header, title1, title3, title2, row, container
} from './login-wizard-page';
import { vars } from '../../styles/styles';
import uiState from '../layout/ui-state';

const header2 = [header, { marginBottom: 20, justifyContent: 'flex-end' }];

const inner2 = {
    borderRadius: 4,
    backgroundColor: vars.white,
    justifyContent: 'center',
    minHeight: 300
};

const footer = {
    justifyContent: 'flex-end',
    alignItems: 'center'
};

const formStyle = {
    padding: 20,
    justifyContent: 'space-between'
};

const findKeyText = {
    alignSelf: 'center',
    color: vars.bg,
    fontSize: 14
};

export default class LoginClean extends LoginWizardPage {
    countDebugPress = 0;

    handleTitlePress() {
        this.countDebugPress++;
        if (this.countDebugPress >= 10) {
            uiState.showDebugMenu = true;
        }
    }

    render() {
        return (
            <View style={container}>
                <View style={header2}>
                    <TouchableWithoutFeedback onPress={() => this.handleTitlePress()}>
                        <View style={header2}>
                            <Text style={title1}>{t('title_welcome')}</Text>
                            <Text style={title2}>{t('title_login')}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <View>
                    <View style={inner2}>
                        <View style={formStyle}>
                            <TextBox
                                lowerCase key="usernameLogin"
                                state={loginState}
                                name="username"
                                testID="usernameLogin"
                                hint={t('title_username')} />
                            <TextBox key="usernamePassword"
                                returnKeyType="go"
                                onSubmit={() => this.props.submit()}
                                state={loginState} name="passphrase" hint={t('title_AccountKey')} secureTextEntry />
                            {/* TODO: peerio copy */}
                            {/* TODO: make link active */}
                            <Text style={findKeyText}>{tx('title_whereToFind')}</Text>
                        </View>
                    </View>
                    <View style={[row, { justifyContent: 'flex-end' }]}>
                        {this.button(
                            'button_login',
                            () => this.props.submit(),
                            loginState.isInProgress, !loginState.passphrase || !loginState.isValid())}
                    </View>
                </View>
                <View style={footer}>
                    {/* TODO: peerio copy */}
                    <Text style={title3}>
                        {tx('title_signupHere')}
                    </Text>
                </View>
                <ActivityOverlay large visible={loginState.isInProgress} />
            </View>
        );
    }
}
