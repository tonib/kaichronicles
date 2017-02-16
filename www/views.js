
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
            template.setViewContent( views.getTranslatedView(views.viewCache[viewPath]) );
            // Return a resolved promise:
            var dfd = jQuery.Deferred();
            dfd.resolve();
            return dfd.promise();
        }

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
            template.setViewContent( views.getTranslatedView(data) );
        })
        .fail(function( jqXHR, textStatus, errorThrown ) {
            var msg = 'Error loading view ' + viewPath + ', error: ' + 
                textStatus + ' / ' + errorThrown;
            template.setViewContent('<p>' + msg + '</p>');
            alert( msg );
        });
    },
    
    /**
     * Returns a DOM view translated to the current language
     * @param {DOM} view The view to translate
     */
    getTranslatedView( view ) {

        var table = translationsTable[state.language];
        if( !translationsTable[state.language] )
            // Translation not available
            return view;
 
        var $clonedView = $(view).clone();

        // Translate the view
        var translatedTags = $clonedView
            .find('[data-translation]')
            .addBack('[data-translation]');
        for(var i=0; i<translatedTags.length; i++ ) {
            var translationId = $(translatedTags[i]).attr('data-translation');
            var html = table[ translationId ];
            if( html )
                $(translatedTags[i]).html( html );
        }

        return $clonedView;
    }

};

