import React, { Component } from 'react';
import {
    View
} from 'react-native';
import { observable, autorun, reaction } from 'mobx';
import { observer } from 'mobx-react/native';
import { vars } from '../../styles/styles';

// const width = Dimensions.get('window').width;

@observer
export default class FileProgress extends Component {
    // @observable width = 0;
    prevFile = null;

    get hidden() {
        const file = this.props.file;
        return !file || (!file.downloading && !file.uploading);
    }

    get value() {
        const file = this.props.file;
        if (!file) return 0;
        const max = file.progressMax || 1;
        // console.log(`file-progress.js: ${file.progress}, ${file.progressMax}`);
        return (this.width * file.progress / max);
    }

    @observable progress = 0;

    layout(evt) {
        this.width = evt.nativeEvent.layout.width;
        reaction(() => this.props.file, file => {
            if (file !== this.prevFile) {
                this.prevFile = file;
                // this.progress.setValue(this.value);
                this.progress = 0;
            }
        }, true);
        autorun(() => {
            if (this.hidden) {
                // this.progress.setValue(0);
                this.progress = 0;
                return;
            }
            const toValue = this.value;
            this.progress = toValue;
            // this.forceUpdate();
            // console.log(`file-progress.js: ${toValue}`);
            // const duration = 100;
            // this.progress.setValue(toValue);
            // Animated.timing(this.progress, { toValue, duration }).start();
        });
    }

    render() {
        const height = 4;

        const pbContainer = {
            flexGrow: 1,
            marginTop: -height,
            height,
            backgroundColor: '#CFCFCF',
            borderWidth: 0,
            borderColor: 'green',
            opacity: this.hidden ? 0 : 1
        };
        const pbProgress = {
            height,
            backgroundColor: vars.bg,
            borderWidth: 0,
            borderColor: 'red',
            width: this.progress
        };

        return (
            <View style={pbContainer} onLayout={evt => this.layout(evt)}>
                <View style={pbProgress} />
            </View>
        );
    }
}

FileProgress.propTypes = {
    file: React.PropTypes.any
};

