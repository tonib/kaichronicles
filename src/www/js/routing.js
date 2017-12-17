
/**
 * The routes handler.
 * As this is a single page app, routes are implemented with the URL hash
 */
var routing = {

    /**
     * The current controller name
     */
    lastControllerName: null,

    /**
     * Redirect to some controler / action route
     * @param {string} route The route to redirect. It has a format "controller".
     * @param {object} parameters Hash with parameters for the route. It can be null
     * @returns True if the redirection can be done. False otherwise
     */
    redirect: function(route, parameters) {
        try {

            // Remove hash
            route = routing.normalizeHash(route);

            // Add parameters
            if( parameters ) {
                var txtParms = routing.objectToUrlParms(parameters );
                if( txtParms )
                    route += '?' + txtParms;
            }

            template.collapseMenu();
            
            // This will fire the onHashChange callback:
            location.hash = route;

        }
        catch(e) {
            console.log(e);
            return false;
        }

    },

    /** Setup the routing events and redirect to the initial action */
    setup: function() {

        // Hash change events
        $(window).on('hashchange', routing.onHashChange );

        // Call the initial controller
        var initialHash = routing.normalizeHash(location.hash);
        if( initialHash === '' )
            initialHash = 'mainMenu';
        routing.redirect(initialHash);

        // Force the initial load
        routing.onHashChange();
    },

    /**
     * Get the controller name from the current URL hash
     */
    getControllerName: function() {
        try {
            var route = routing.normalizeHash( location.hash );
            var idxParms = route.indexOf('?');
            if( idxParms >= 0 )
                route = route.substring( 0 , idxParms );

            return route + 'Controller';
        }
        catch(e) {
            console.log(e);
            return null;
        }
    },

    /** Get the the controller object by its name */
    getController: function(controllerName) {
        try {
            if( !controllerName )
                return null;

            /* jshint ignore:start */
            return eval( controllerName );
            /* jshint ignore:end */
        }
        catch(e) {
            console.log(e);
            return null;
        }
    },

    /** Get the current controller object */
    getCurrentController: function() {
        return routing.getController( routing.getControllerName() );
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

        var controller;

        // Notify the previous controler that we leave
        try {
            if( routing.lastControllerName ) {
                controller = routing.getController(routing.lastControllerName);
                if( controller && controller.onLeave ) {
                    //console.log('Leaving ' + routing.lastControllerName);
                    controller.onLeave();
                }
            }
        }
        catch(e) {
            console.log(e);
        }

        // Move to the new controller
        try {
            controller = routing.getCurrentController();
            if( !controller )
                console.log("Undefined controller: " + routing.getControllerName() );
            else {
                // Store the new hash
                routing.lastControllerName = routing.getControllerName();
                console.log( routing.lastControllerName + '.index()' );
                controller.index();
            }
        }
        catch(e) {
            console.log(e);
        }
    },

    /**
     * Convert an object to URL parameters
     * @param {object} o Object to convert
     * @returns {string} URL equivalent params 
     */
    objectToUrlParms: function(o) {
        var str = '';
        for (var key in o) {
            if (str !== '')
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
        
        if( backController == 'DONOTHING' )
            // ok:
            return;

        if( !backController ){
            window.history.back();
            return;
        }
        routing.redirect( backController );

    }

};
