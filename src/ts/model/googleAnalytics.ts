
/**
 * Google Analytics stuff.
 * Only for the web version
 */
class GoogleAnalytics {

    /** Cookie name to disable Google Analytics */
    private static readonly GA_DISABLED_COOKIE = "KC_gadisabled";

    /** Returns true if Google Analytics is enabled */
    public static isEnabled(): boolean {
        try {

            if (ENVIRONMENT != "PRODUCTION" || cordovaApp.isRunningApp()) {
                // Debug or in Cordova app
                return false;
            }

            // Check if disabled by user
            return new Cookie(GoogleAnalytics.GA_DISABLED_COOKIE).getValue() != "true";
        } catch (ex) {
            console.log(ex);
            return false;
        }
    }

    /** Enable or disable Google Analytics */
    public static setEnabled(enabled: boolean) {
        try {
            const cookie = new Cookie(GoogleAnalytics.GA_DISABLED_COOKIE);
            if (enabled) {
                cookie.delete();
            } else {
                cookie.setValue("true" , 9999);
            }
            console.log("Changed send Anayltics to " + enabled);
        } catch (ex) {
            console.log(ex);
        }
    }

    /**
     * Send a page view to Google Analytics, if enabled
     * @param pageName Page name to send
     */
    public static sendPageView(pageName: string) {

        try {

            if (!GoogleAnalytics.isEnabled()) {
                // Google Analytics disabled
                return;
            }

            if (typeof ga == "undefined") {
                // Google Analytics object not defined
                return;
            }

            // Set specific URL
            ga("set", "page", pageName);

            // Send page view
            ga("send", "pageview");

            console.log("Page view sent to Google Analytics: " + pageName);

        } catch (e) {
            console.log(e);
        }
    }

    /** Configure Google Analytics and send the initial page */
    public static setup() {

        try {

            if (typeof ga == "undefined") {
                // Google Analytics object not defined
                return;
            }

            // Google analytics Id
            ga("create", "UA-96192501-1", "auto");

            // Anonymize IPs (https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#anonymizeIp)
            ga("set", "anonymizeIp", true);

            // Send "index.html" page view, if enabled
            GoogleAnalytics.sendPageView("index.html");
        } catch (e) {
            console.log(e);
        }
    }

}
