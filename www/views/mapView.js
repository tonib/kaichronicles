
var mapView = {

    /**
     * Show the map section
     * @param section The map Section
     */
    setSectionContent: function( section ) {
        document.title = section.getTitleText();
        $('#map-title').text( section.getTitleText() );
        $('#map-section').html( section.getHtml() );
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
