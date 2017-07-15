/// <reference path="../external.ts" />

const mapView = {

    /**
     * Show the map section
     * @param section The map Section
     */
    setSectionContent: function( section : Section ) {
        document.title = section.getTitleText();
        $('#map-title').text( section.getTitleText() );
        // Render the map, with the illustrations text. On book 5, it's the 
        // map description
        $('#map-section').html( section.getHtml(true) );
    },

    /**
     * Bind clicks on image to resize it
     */
    bindImageClicks: function() {
        $('#map-section div.illustration img').click(function() {
            $(this).toggleClass('originalsize');
        });
    }

};
