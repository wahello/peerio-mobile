import React from 'react';
import { t } from '../utils/translator';
// import LanguagePickerBox from '../controls/language-picker-box';
import TextBox from '../controls/textbox';
import Center from '../controls/center';
import loginState from './login-state';
import LoginWizardPage from './login-wizard-page';

export default class LoginClean extends LoginWizardPage {
    items() {
        return (
            <TextBox
                lowerCase key="usernameLogin"
                state={loginState}
                name="username"
                testID="usernameLogin"
                hint={t('title_username')} />
        );
        /* <LanguagePickerBox key="lpp" /> */
    }

    buttons() {
        return (
            <Center>
                {this._footerButton('continue', () => this.props.submit(), null, !loginState.usernameValid)}
            </Center>
        );
    }
}
