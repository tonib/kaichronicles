
var views = {

    /**
     * Cache with views already loaded
     */
    viewCache: {},

    /**
     * Load a view asynchronously
     * @param viewPath The view path, relative to the "views" folder 
     * @returns a jQuery deferred object with the load view action
     */
    loadView: function(viewPath) {

        // TODO: Show a busy image when loading a view from internet
        
        if( views.viewCache[viewPath] ) {
            // View was already loaded:
            views.viewLoaded( views.viewCache[viewPath] );
            // Return a resolved promise:
            var dfd = jQuery.Deferred();
            dfd.resolve();
            return dfd.promise();
        }

        return $.ajax({
            url: 'views/' + viewPath,
            dataType: "html"
        })
        .done( function(data) {
            // Save view on cache:
            views.viewCache[viewPath] = data;
            views.viewLoaded(data);
        })
        .fail(function( jqXHR, textStatus, errorThrown ) {
            alert( 'Error loading view ' + viewPath + ', error: ' + 
                textStatus + ' / ' + errorThrown );
        });
    },
    
    viewLoaded: function(viewContent) {
        $('#body').html(viewContent);
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
};

