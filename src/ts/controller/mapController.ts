/**
 * The map controller
 */
const mapController = {

    /**
     * Render the map
     */
    index() {

        if ( !setupController.checkBook() ) {
            return;
        }

        const mapSection = new Section(state.book, "map", state.mechanics);
        if ( !mapSection.exists() ) {
            console.log("Map section does not exists" );
            return;
        }

        views.loadView("map.html")
        .then(() => {
            if ( state.book.bookNumber === 11 ) {
                // Special case
                mapView.setMapBook11();
            } else {
                mapView.setSectionContent( mapSection );
            }
            mapView.bindEvents();
        });

    },

    /**
     * On leave controller
     */
    onLeave() {
        mapView.unbindEvents();
    },

    /** Return page */
    getBackController() { return "game"; },

};
