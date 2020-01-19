/**
 * Privacy controller page
 */
const privacyController = {

    /**
     * Render the page
     */
    index() {
        views.loadView( "privacy_" + state.language + ".html" )
        .then(() => {
            if ( cordovaApp.isRunningApp() ) {
                $("#privacy-web").hide();
            } else {
                privacyController.setupWeb();
            }
        });
    },

    /**
     * Setup the web page
     */
    setupWeb() {

        $("#privacy-app").hide();

        // Setup checkbox
        $("#privacy-send").prop( "checked" , GoogleAnalytics.isEnabled() );

        // Change send analytics event
        $("#privacy-send").click( function( e: Event ) {
            GoogleAnalytics.setEnabled( $(this).prop( "checked" ) );
            toastr.info( "OK" );
        });
    },

};
