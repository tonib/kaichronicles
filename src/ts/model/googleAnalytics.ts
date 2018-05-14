

/**
 * Google Analytics stuff.
 * Only for the web version
 */
class GoogleAnalytics {

    /** Cookie name to disable Google Analytics */
    private static readonly GA_DISABLED_COOKIE = "gadisabled";

    /** Returns true if Google Analytics is enabled */
    public static isEnabled() : boolean {
        try {

            if( ENVIRONMENT != 'PRODUCTION' || cordovaApp.isRunningApp() )
                // Debug or in Cordova app
                return false;

            // Check if disabled by user
            return new Cookie( GoogleAnalytics.GA_DISABLED_COOKIE ).getValue() != "true";
        }
        catch(ex) {
            console.log(ex);
            return false;
        }
    }

    public static setEnabled( enabled : boolean ) {
        try {
            const cookie = new Cookie( GoogleAnalytics.GA_DISABLED_COOKIE );
            if( enabled )
                cookie.delete();
            else
                cookie.setValue( "true" , 9999 );
        }
        catch(ex) {
            console.log(ex);
        }
    }

    /**
     * Send a page view to Google Analytics, if enabled
     */
    public static sendPageView( url : string = null) {

        try {
            
            if( !GoogleAnalytics.isEnabled() )
                return;

            if( url )
                // Set specific URL
                ga('set', 'page', url);

            // Send page view
            ga('send', 'pageview');

        }
        catch(e) {
            console.log(e);
        }
    }

    public static setup() {

        try {

            // Google analytics Id
            ga('create', 'UA-96192501-1', 'auto');

            // Anonymize IPs (https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#anonymizeIp)
            ga('set', 'anonymizeIp', true);

            // Send "index.html" page view, if enabled
            GoogleAnalytics.sendPageView();
        }
        catch(e) {
            console.log(e);
        }   
    }
}