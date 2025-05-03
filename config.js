{
    "name": "App Name", // 12 character max including spaces
        "version": "1.0.0", // version in the format [Major].[Minor].[Patch] (string)
            "build": 1, // build in the format [Build] (should be a positive integer)
                "id": "com.example.appname", // Must be in Java package form with no dashes (ex: com.example.app)
                    "fullscreen": false, // true | false
                        "orientation": "default", // "portrait" | "landscape" | "default"
                            "plugins": [], // (see below)
                                // optional add your build credentials:
                                "credentials": {
        "ios": {
            "ad-hoc": {
                "name": "NAME",
                    "secret": "SECRET"
            },
            "store": {
                "name": "NAME",
                    "secret": "SECRET"
            }
        },
        "android": {
            "release": {
                "name": "NAME",
                    "secret": "SECRET"
            }
        }
    },
    // enable mixed content for the Android WebView (This is not intended for use in production)
    "allowMixedContent": false
}