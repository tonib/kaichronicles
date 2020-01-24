
/**
 * The cordova app
 */
var cordovaApp = {

    /**
     * Setup Cordova app, if needed
     * @returns {Promise} The process promise
     */
    setup() {
        var dfd = jQuery.Deferred();

        if ( !cordovaApp.isRunningApp() ) {
            // Running on web
            return dfd.resolve().promise();
        }

        document.addEventListener( "deviceready", function() {
            // Register event listeners
            document.addEventListener("backbutton", cordovaApp.onBackButton.bind(this), false);
            dfd.resolve();
        },
        false );

        return dfd.promise();
    },

    /**
     * Hardware back button clicked
     */
    onBackButton() {
        console.log("onBackButton");
        // If a modal has class "nobackbutton", do not allow to close it with the back button
        if ( $(".modal.in").length > 0 && !$(".modal").hasClass("nobackbutton") ) {
            // It there is any bootstrap modal open, close it
            $(".modal").modal("hide");
        } else if ( template.isMenuExpanded() ) {
            // If the bootstrap menu is expanded, collapse it
            template.collapseMenu();
        } else {
            // Go back to the parent controller
            routing.onBackButton();
        }
    },

    closeApp() {
        try {
            navigator.app.exitApp();
        } catch (e) {
            console.log(e);
        }
    },

    /**
     * Are we running inside an app?
     */
    isRunningApp() {
        return window.cordova;
    },

    /**
     * Returns true if there is some kind of connection to Internet
     */
    thereIsInternetConnection() {
        try {
            return navigator.connection.type != Connection.NONE;
        } catch (e) {
            console.log(e);
            return true;
        }
    }

};
