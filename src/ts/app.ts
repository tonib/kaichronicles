import { views, cordovaApp, state, LocalBooksLibrary, template, routing, GoogleAnalytics, declareCommonHelpers, mechanicsEngine } from ".";

/** Execution enviroment type */
export enum EnvironmentType {
    Development = "DEVELOPMENT",
    Production = "PRODUCTION"
}

/** Debug execution mode */
export enum DebugMode {
    NO_DEBUG = 0,
    DEBUG = 1,
    TEST = 2
}

/**
 * The web application
 */
export class App {

    /** The webpack library name */
    public static readonly PACKAGE_NAME = "kai";

    /** Execution environment type */
    public static environment: EnvironmentType;

    /** Debug functions are enabled? */
    public static debugMode: DebugMode;

    /** Web application setup  */
    public static run(environment: string) {

        // Declare helper functions in common.ts
        declareCommonHelpers();

        App.environment =  environment as EnvironmentType;

        // Are we in debug / test mode?
        if (window.getUrlParameter("test") === "true") {
            App.debugMode = DebugMode.TEST;
            // To avoid Selenium clicks blocked by navbar
            template.fixedNavbarTop();
        } else if (window.getUrlParameter("debug") === "true") {
            App.debugMode = DebugMode.DEBUG;
        } else {
            App.debugMode = DebugMode.NO_DEBUG;
        }

        if (App.debugMode !== DebugMode.NO_DEBUG) {
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

                    if ( App.debugMode === DebugMode.DEBUG && state.existsPersistedState() ) {
                        // If we are developing a book, avoid to press the "Continue game"
                        routing.redirect( "setup" );
                    }

                } catch (e) {
                    // d'oh!
                    mechanicsEngine.debugWarning(e);
                    return jQuery.Deferred().reject(e).promise();
                }
            })
            // This chain can fail for any reason, not just because it failed the views load
            /*.fail(function(jqXHR, textStatus, errorThrown) {
                let reason = "Error loading views.html, error: " +
                ajaxErrorMsg(this, jqXHR, textStatus, errorThrown);
                if ( !reason ) {
                    reason = "Unknown error";
                }
                template.setErrorMessage(reason);
            });*/
            .fail((reason) => {
                if ( !reason ) {
                  reason = "Unknown error";
                }
                template.setErrorMessage(reason.toString());
            });
    }
}
