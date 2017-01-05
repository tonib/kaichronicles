
/**
 * The routes handler.
 * As this is a single page app, routes are implemented with the URL hash
 */
var routing = {

    /**
     * The current route
     */
    currentRoute: null,

    /**
     * Is the hash change event enabled?
     */
    hashChangeEventEnabled: true,

    /**
     * Redirect to some controler / action route
     * @param {string} route The route to redirect. It has a format "controller".
     * @param {object} parameters Hash with parameters for the route. It can be null
     * @returns True if the redirection can be done. False otherwise
     */
    redirect: function(route, parameters) {
        try {
            routing.hashChangeEventEnabled = false;

            // Remove hash
            route = routing.normalizeHash(route);

            // Add parameters
            if( parameters ) {
                var txtParms = routing.objectToUrlParms(parameters );
                if( txtParms )
                    route += '?' + txtParms;
            }

            if( route == routing.currentRoute )
                // On hash change duplicate event:
                return;

            template.collapseMenu();
            
            routing.currentRoute = route; 
            location.hash = route;
            
            //console.log('route: ' + route);
            var controller = routing.getCurrentController();
            if( !controller ) {
                console.log("Undefined controller: " + routing.getControllerName() );
                return false;
            }
            else {
                controller['index']();
                return true;
            }

        }
        catch(e) {
            console.log(e);
            return false;
        }
        finally {
            routing.hashChangeEventEnabled = true;
        }
    },

    /** Setup the routing events and redirect to the initial action */
    setup: function() {

        // Hash change events
        $(window).on('hashchange', routing.onHashChange );

        // Call the initial controller
        var initialHash = routing.normalizeHash(location.hash);
        if( initialHash == '' )
            initialHash = 'mainMenu';
        routing.redirect(initialHash);
    },

    /**
     * Get the controller name from the current URL hash
     */
    getControllerName: function() {
        var route = routing.normalizeHash( location.hash );
        var idxParms = route.indexOf('?');
        if( idxParms >= 0 )
            route = route.substring( 0 , idxParms );

        return route + 'Controller';
    },

    /** Get the current controller object */
    getCurrentController: function() {
        //console.log('route: ' + route);
        try {
            return eval( routing.getControllerName() );
        }
        catch(e) {
            console.log(e);
            return null;
        }
    },

    /**
     * Get a normalized version of a URL hash
     * @param hash The hash to normalized
     * @returns The hash, without '#' and trimmed
     */
    normalizeHash: function(hash) {
        hash = hash.trim();
        if( hash.startsWith('#') )
            hash = hash.substr(1);
        return hash;
    },

    /** 
     * Hash change event handler
     */
    onHashChange: function() {
        if( !routing.hashChangeEventEnabled )
            return;
        routing.redirect( location.hash );
    },

    /**
     * Convert an objecto to URL parameters
     * @param {object} o Object to convert
     * @returns {string} URL equivalent params 
     */
    objectToUrlParms: function(o) {
        var str = '';
        for (var key in o) {
            if (str != '')
                str += "&";
            str += key + "=" + encodeURIComponent(o[key]);
        }
        return str;
    },

    /**
     * Get a hash parameter value
     * @param {string} paramName The hash parameter name
     * @returns {string} The parameter value. null it was not defined
     */
    getHashParameter: function(paramName) {

        var hash = routing.normalizeHash(location.hash);
        var idx = hash.indexOf( '?' );
        if( idx >= 0 )
            hash = hash.substring( idx + 1 );
        return hash.getUrlParameter(paramName);
    },

    /**
     * Hardware back button pressed (Cordova app)
     */
    onBackButton: function() {

        // Get the current controler
        var controller = routing.getCurrentController();
        if( !controller || !controller.getBackController ) {
            window.history.back();
            return;
        }

        // Get the back page for the current controller, and go there
        var backController = controller.getBackController();
        if( backController == 'exitApp' ) {
            cordovaApp.closeApp();
            return;
        }
        if( !backController ){
            window.history.back();
            return;
        }
        if( !routing.redirect( controller.getBackController() ) )
            window.history.back();

    }

};
