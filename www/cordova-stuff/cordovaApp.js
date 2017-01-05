
/**
 * The cordova app
 */
var cordovaApp = {

    /**
     * Application Constructor
     */
    setup: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        // Register event listeners
        document.addEventListener('backbutton', this.onBackButton.bind(this), false);
    },

    onBackButton: function() {
        console.log('onBackButton');
        if( template.isMenuExpanded() )
            template.collapseMenu();
        else
            routing.onBackButton();
    },

    closeApp: function() {
        try {
            navigator.app.exitApp();
        }
        catch(e) {
            console.log(e);
        }
    },

    /**
     * Are we running inside an app?
     */
    isRunningApp: function() { 
        return navigator.app; 
    }
};
