package com.peerio.app;

import android.content.pm.PackageManager;
import android.os.Bundle;
import android.view.WindowManager;
import android.net.Uri;
import android.content.Intent;

import com.facebook.react.*;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.ReactActivityDelegate;
import android.support.annotation.Nullable;

public class MainActivity extends ReactActivity {
    protected Uri imageUri = null;
    /**
     * Override this to prevent screenshots to be taken
     * @param savedInstanceState
     */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // only enable FLAG_SECURE for release builds
        if (BuildConfig.DEBUG) return;
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE,
                WindowManager.LayoutParams.FLAG_SECURE);

        Intent intent = getIntent();
        this.imageUri = (Uri) intent.getParcelableExtra(Intent.EXTRA_STREAM);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           String permissions[], int[] grantResults) {
        final int REACT_NATIVE_IMAGE_PICKER_PERMISSION = 1;
        final int REACT_NATIVE_CONTACTS_PERMISSION = 2;
        if (grantResults.length > 0) {
            ReactContext context = this.getReactInstanceManager().getCurrentReactContext();
            if (context == null) {
                return;
            }
            String jsCallback = "";
            switch (requestCode) {
                case REACT_NATIVE_IMAGE_PICKER_PERMISSION: jsCallback = "CameraPermissionsGranted"; break;
                case REACT_NATIVE_CONTACTS_PERMISSION: jsCallback = "ContactPermissionsGranted"; break;
            }

            context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(jsCallback, grantResults[0] == PackageManager.PERMISSION_GRANTED);
        }
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    @Override
    public void invokeDefaultOnBackPressed() {
        moveTaskToBack(true);
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "peeriomobile";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Nullable
            @Override
            protected Bundle getLaunchOptions() {
                Bundle initialProps = new Bundle();
                initialProps.putString("sharedImage", imageUri);
                return initialProps;
            }
        };
    }
}
