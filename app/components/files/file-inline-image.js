import React from 'react';
import { observer } from 'mobx-react/native';
import { observable, when, reaction } from 'mobx';
import { View, Image, Text, Dimensions, LayoutAnimation, TouchableOpacity } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import SafeComponent from '../shared/safe-component';
import InlineUrlPreviewConsent from './inline-url-preview-consent';
import inlineImageCacheStore from './inline-image-cache-store';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';
import settingsState from '../settings/settings-state';
import { clientApp } from '../../lib/icebear';
import { T } from '../utils/translator';

const toSettings = text => (
    <Text
        onPress={() => {
            settingsState.transition('preferences');
            settingsState.transition('display');
        }}
        style={{ textDecorationLine: 'underline' }}>
        {text}
    </Text>
);

const toSettingsParser = { toSettings };

@observer
export default class FileInlineImage extends SafeComponent {
    @observable width = 0;
    @observable height = 0;
    @observable optimalContentWidth = 0;
    @observable optimalContentHeight = 0;
    @observable opened;
    @observable loaded;
    @observable tooBig;
    @observable loadImage;
    @observable showUpdateSettingsLink;
    @observable cachedImage;
    outerPadding = 8;

    componentWillMount() {
        this.optimalContentHeight = Dimensions.get('window').height;
        this.opened = clientApp.uiUserPrefs.peerioContentEnabled;
        // this.tooBig = Math.random() > 0.5;
        this.loadImage = clientApp.uiUserPrefs.peerioContentEnabled && !this.tooBig;
        when(() => this.loadImage && this.cachedImage, () => this.fetchSize());
        const { image } = this.props;
        const { cached, tmpCached } = image;
        if (!tmpCached && !cached) {
            setTimeout(() => {
                image.tryToCacheTemporarily();
            });
        }
        when(() => image.cached || image.tmpCached, () => {
            this.cachedImage = inlineImageCacheStore.getImage(image.tmpCachePath);
        });
    }

    fetchSize() {
        const { cachedImage } = this;
        when(() => cachedImage.width && cachedImage.height && this.optimalContentWidth, () => {
            const { width, height } = cachedImage;
            const { optimalContentWidth, optimalContentHeight } = this;
            let w = width + 0.0, h = height + 0.0;
            // console.log(w, h, optimalContentHeight, optimalContentWidth);
            if (w > optimalContentWidth) {
                h *= optimalContentWidth / w;
                w = optimalContentWidth;
            }
            if (h > optimalContentHeight) {
                w *= optimalContentHeight / h;
                h = optimalContentHeight;
            }
            this.width = Math.floor(w);
            this.height = Math.floor(h);
            console.debug(`calculated width: ${this.width}, ${this.height}`);
        });
    }

    componentDidMount() {
        reaction(() => this.opened, () => LayoutAnimation.easeInEaseOut());
    }

    layout = (evt) => {
        this.optimalContentWidth = evt.nativeEvent.layout.width - this.outerPadding * 2 - 2;
    }

    renderInner() {
    }

    get displayTooBigImageOffer() {
        const outer = {
            padding: this.outerPadding
        };
        const text0 = {
            color: vars.txtDark
        };
        const text = {
            color: vars.bg,
            fontStyle: 'italic',
            marginVertical: 10
        };
        return (
            <View style={outer}>
                <Text style={text0}>Images larger than 1 MB are not displayed.</Text>
                <TouchableOpacity pressRetentionOffset={vars.pressRetentionOffset} onPress={() => { this.loadImage = true; }}>
                    <Text style={text}>Display this image anyway</Text>
                </TouchableOpacity>
            </View>
        );
    }

    get displayImageOffer() {
        const text = {
            color: vars.bg,
            fontStyle: 'italic',
            textAlign: 'center',
            marginVertical: 10
        };
        return (
            <TouchableOpacity pressRetentionOffset={vars.pressRetentionOffset} onPress={() => { this.loadImage = true; }}>
                <Text style={text}>Display this image</Text>
            </TouchableOpacity>
        );
    }

    get updateSettingsOffer() {
        const text = {
            color: vars.txtDate,
            fontStyle: 'italic',
            marginBottom: 4
        };
        return (
            <View style={{ flexDirection: 'row' }}>
                <View style={{ paddingTop: 2, marginRight: 4 }}>
                    {icons.coloredAsText('check-circle', vars.snackbarBgGreen, 14)}
                </View>
                <Text style={text}>
                    <T k="title_updateSettingsAnyTime">{toSettingsParser}</T>
                </Text>
            </View>
        );
    }

    renderThrow() {
        // return <InlineUrlPreviewConsent />;
        const { image } = this.props;
        const { name, title, description } = image;
        const { width, height, loaded, showUpdateSettingsLink } = this;
        const { source, isLocal } = this.cachedImage || {};
        // console.debug(`received source: ${width}, ${height}, ${JSON.stringify(source)}`);
        const outer = {
            padding: this.outerPadding,
            borderColor: vars.lightGrayBg,
            borderWidth: 1,
            marginVertical: 4
        };

        const header = {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: this.opened ? 10 : 0
        };

        const text = {
            fontWeight: 'bold',
            color: vars.txtMedium
        };

        const titleText = {
            color: vars.bg,
            marginVertical: 2
        };

        const descText = {
            color: vars.txtDark,
            marginBottom: 2
        };

        const inner = {
            backgroundColor: loaded ? vars.white : vars.lightGrayBg
        };
        return (
            <View>
                <View style={outer} onLayout={this.layout}>
                    <View>
                        {!!title && <Text style={titleText}>{title}</Text>}
                        {!!description && <Text style={descText}>{description}</Text>}
                    </View>
                    <View style={header}>
                        <Text style={text}>{name}</Text>
                        {isLocal ? <View style={{ flexDirection: 'row' }}>
                            {icons.darkNoPadding(this.opened ? 'arrow-drop-up' : 'arrow-drop-down', () => { this.opened = !this.opened; })}
                            {icons.darkNoPadding('more-vert', () => this.props.onAction(this.props.image))}
                        </View> : <View />}
                    </View>
                    <View style={inner}>
                        {this.opened && this.loadImage && width && height ?
                            <Image onLoad={() => { this.loaded = true; }} source={source} style={{ width, height }} /> : null}
                        {this.opened && !this.loadImage && !this.tooBig && this.displayImageOffer}
                        {this.opened && !this.loadImage && this.tooBig && this.displayTooBigImageOffer}
                    </View>
                </View>
                {showUpdateSettingsLink && this.updateSettingsOffer}
            </View>
        );
    }
}