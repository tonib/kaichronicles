/// <reference path="../external.ts" />

/**
 * The map controller
 */
const mapController = {

    /**
     * Render the map
     */
    index: function() {

        if( !setupController.checkBook() )
            return;
        
        var mapSection = new Section(state.book, 'map', state.mechanics);
        if( !mapSection.exists() ) {
            console.log("Map section does not exists" );
            return;
        }

        views.loadView('map.html')
        .then(function() {
            mapView.setSectionContent( mapSection );
            mapView.bindImageClicks();
        });
        
    },

    /** Return page */
    getBackController: function() { return 'game'; }
    
};
