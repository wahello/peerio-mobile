import React, { Component } from 'react';
import {
    View, TouchableOpacity
} from 'react-native';
import { observer } from 'mobx-react/native';
import icons from '../helpers/icons';
import mainState from '../main/main-state';
import { helpers } from '../../styles/styles';

@observer
export default class BackIcon extends Component {
    render() {
        return (
            <TouchableOpacity onPress={() => mainState.back()}>
                <View style={{
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginRight: 16,
                    width: 56,
                    height: 56
                }}>
                    {icons.plainWhite('arrow-back')}
                </View>
            </TouchableOpacity>
        );
    }
}
