
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

        // TODO: Show a busy image when loading a view from Internet
        
        if( views.viewCache[viewPath] ) {
            // View was already loaded:
            template.setViewContent( views.viewCache[viewPath] );
            // Return a resolved promise:
            var dfd = jQuery.Deferred();
            dfd.resolve();
            return dfd.promise();
        }

        // Load the view from Internet
        return $.ajax({
            url: 'views/' + viewPath,
            dataType: "html"
        })
        .done( function(data) {
            // Save view on cache:
            views.viewCache[viewPath] = data;
            // Display the view
            template.setViewContent(data);
        })
        .fail(function( jqXHR, textStatus, errorThrown ) {
            var msg = 'Error loading view ' + viewPath + ', error: ' + 
                textStatus + ' / ' + errorThrown;
            template.setViewContent('<p>' + msg + '</p>');
            alert( msg );
        });
    }
    
};

