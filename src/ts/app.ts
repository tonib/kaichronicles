const app = {

    run() {
        // *************** SETUP ***************

        // Are we on debug mode?
        const debugMode = ( window.getUrlParameter("debug") === "true" );

        if ( debugMode ) {
            // On debug mode, disable the cache (to always reload the books xml)
            console.log("Debug mode: cache disabled");
            $.ajaxSetup({ cache: false });
        }

        // Configure toast messages
        toastr.options.positionClass = "toast-position-lw";
        toastr.options.onclick = () => {
            // Remove all toasts on click one
            toastr.clear();
        };

        // First, load the views
        views.setup()
            .then(() => {
                // If we are running a Cordova app, wait for device APIs load
                return cordovaApp.setup();
            })
            .then(() => {
                // If we are on the app, setup the downloaded books state
                state.localBooksLibrary = new LocalBooksLibrary();
                return state.localBooksLibrary.setupAsync();
            })
            .then( () => {
                try {
                    console.log("Real setup started");

                    // Then do the real application setup
                    state.setupDefaultLanguage();
                    state.setupDefaultColorTheme();
                    template.setup();
                    routing.setup();

                    // Setup google analytics, if we are on web
                    GoogleAnalytics.setup();

                    if ( debugMode && state.existsPersistedState() ) {
                        // If we are developing a book, avoid to press the "Continue game"
                        routing.redirect( "setup" );
                    }

                } catch (e) {
                    // d'oh!
                    console.log(e);
                    return jQuery.Deferred().reject(e).promise();
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                let reason = "Error loading views.html, error: " +
                ajaxErrorMsg(this, jqXHR, textStatus, errorThrown);
                if ( !reason ) {
                    reason = "Unknown error";
                }
                template.setErrorMessage(reason);
            });
    },
};
