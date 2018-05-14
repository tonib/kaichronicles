
/**
 * Privacy controller page
 */
class privacyController {

    /**
      * Render the page
      */
    public static index() {
        views.loadView( 'privacy_' + state.language + '.html' )
        .then(function() {
            // TODO: Setup events and curent GA status
        });
    }

}