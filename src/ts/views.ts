/// <reference path="external.ts" />

var views = {

    /**
     * Cache with views already loaded
     */
    viewCache: {},

    /**
     * Views setup
     */
    setup: function() {
        if( ENVIRONMENT == 'DEVELOPMENT' ) {
            // Nothing to do. Return a resolved promise
            return jQuery.Deferred().resolve().promise();
        }

        // Production. Preload all views, for better UX:
        return $.ajax({
            url: 'views.html',
            dataType: "html"
        })
        .done( function(data: string) {
            // views.html contains a div for each view, the div id is the html file name
            $(data).find('.htmlpage').each(function(index: number, div: HTMLElement) {
                var viewName = $(div).attr('id');
                views.viewCache[viewName] = div;
            });
        })
        .then(null, function( jqXHR, textStatus, errorThrown ) {
            // TODO: "then"??? should not be this the "fail"???
            // Format a error message as a reason
            var msg = 'Error loading views.html, error: ' + 
                ajaxErrorMsg(this, jqXHR, textStatus, errorThrown);
            return jQuery.Deferred().reject(msg);
        });
    },

    /**
     * Load a view asynchronously
     * @param viewPath The view path, relative to the "views" folder 
     * @returns a jQuery deferred object with the load view action
     */
    loadView: function(viewPath: string) {
        
        if( views.viewCache[viewPath] ) {
            // View was already loaded:
            template.setViewContent( translations.translateView(views.viewCache[viewPath]) );
            // Return a resolved promise:
            var dfd = jQuery.Deferred();
            dfd.resolve();
            return dfd.promise();
        }

        // This should be executed only on development environment:
        
        // Download the view
        if( !cordovaApp.isRunningApp() )
            // Set a busy message
            template.setViewContent('<img src="images/ajax-loader.gif" alt="Loading image" /> Loading view...');

        return $.ajax({
            url: 'views/' + viewPath,
            dataType: "html"
        })
        .done( function(data) {
            // Save view on cache:
            views.viewCache[viewPath] = data;
            // Display the view
            template.setViewContent( translations.translateView(data) );
        })
        .fail(function( jqXHR, textStatus, errorThrown ) {
            var msg = 'Error loading view ' + viewPath + ', error: ' + 
                ajaxErrorMsg(this, jqXHR, textStatus, errorThrown);
            template.setErrorMessage( msg );
            alert( msg );
        });
    },

    /**
     * Returns a cached view. null if the view was not already loaded
     */
    getCachedView: function(viewPath: string) {
        return views.viewCache[viewPath];
    }

};

