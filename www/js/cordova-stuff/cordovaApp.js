
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
        if( $('.modal.in').length > 0 )
            // It there is any bootstrap modal open, close it
            $('.modal').modal('hide');
        else if( template.isMenuExpanded() )
            // If the bootstrap menu is expanded, collapse it
            template.collapseMenu();
        else
            // Go back to the parent controller
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
        return window.cordova; 
    }
};
