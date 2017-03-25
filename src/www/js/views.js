
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
            var dfd = jQuery.Deferred();
            dfd.resolve();
            return dfd.promise();
        }

        // Production. Preload all views, for better UX:
        return $.ajax({
            url: 'views.html',
            dataType: "html"
        })
        .done( function(data) {
            // views.html contains a div for each view, the div id is the html file name
            $(data).find('.htmlpage').each(function(index, div) {
                var viewName = $(div).attr('id');
                views.viewCache[viewName] = div;
            });
        })
        .fail(function( jqXHR, textStatus, errorThrown ) {
            var msg = 'Error loading views.html, error: ' + 
                textStatus + ' / ' + errorThrown;
            template.setViewContent('<p>' + msg + '</p>');
            alert( msg );
        });
    },

    /**
     * Load a view asynchronously
     * @param viewPath The view path, relative to the "views" folder 
     * @returns a jQuery deferred object with the load view action
     */
    loadView: function(viewPath) {
        
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
                textStatus + ' / ' + errorThrown;
            template.setViewContent('<p>' + msg + '</p>');
            alert( msg );
        });
    },

    /**
     * Returns a cached view. null if the view was not already loaded
     */
    getCachedView: function(viewPath) {
        return views.viewCache[viewPath];
    }

};

