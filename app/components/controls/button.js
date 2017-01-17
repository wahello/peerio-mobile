import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity
} from 'react-native';
import styles from '../../styles/styles';

const r = 30;
const offset = { top: r, left: r, bottom: r, right: r };

export default class Button extends Component {
    render() {
        const style = styles.button;
        let textStyle = this.props.bold ?
            style.text.bold : style.text.normal;
        const opacity = { opacity: this.props.disabled ? 0.5 : 1 };
        if (this.props.textStyle) {
            textStyle = [textStyle, this.props.textStyle];
        }
        const text = this.props.text || '';
        const press = () => {
            !this.props.disabled && this.props.onPress && this.props.onPress();
            return true;
        };
        return (
            <TouchableOpacity
                pressRetentionOffset={offset}
                hitSlop={offset}
                onPress={press}
                testID={this.props.testID}>
                <View
                    style={this.props.style}>
                    <Text style={[textStyle, opacity]}>
                        {text}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }
}

Button.propTypes = {
    onPress: React.PropTypes.func.isRequired,
    style: React.PropTypes.any,
    textStyle: React.PropTypes.any,
    text: React.PropTypes.any.isRequired,
    caps: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    testID: React.PropTypes.string,
    bold: React.PropTypes.bool
};
