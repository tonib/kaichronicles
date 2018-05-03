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
     * Bind map events
     */
    bindEvents: function() {
        // Bind clicks on image to resize it
        $('#map-section div.illustration img').click(function() {
            // Reset fixed width / height
            const $this = $(this);
            $this.removeAttr( 'width' );
            $this.removeAttr( 'height' );
            $this.toggleClass('originalsize');
        });
        $('#map-increasezoom').click(function(e : Event) {
            mapView.changeZoom(true, e);
        });
        $('#map-decreasezoom').click(function(e : Event) {
            mapView.changeZoom(false, e);
        });

        // Add window resize event handler
        window.addEventListener( 'resize' , mapView.onWindowResize , false);
    },

    /**
     * Unbind map events
     */
    unbindEvents: function() {
        //console.log( 'mapView.unbindEvents' );
        window.removeEventListener( 'resize' , mapView.onWindowResize );
    },

    /**
     * Event handler for window resize.
     * This will reset the map zoom
     */
    onWindowResize: function( e : Event ) {
        // Window has been resized (orientation change). Reset to original size:
        //console.log( 'onWindowResize' );
        let $image = $('#map-section img');
        $image.removeAttr( 'width' );
        $image.removeAttr( 'height' );
        $image.removeClass( 'originalsize' );
    },

    /**
     * Increase / decrease the map zoom
     * @param increase True to increase the zoom. False to decrease
     * @param e The click event on the zoom links
     */
    changeZoom: function(increase: boolean, e : Event) {
        e.preventDefault();

        let $image = $('#map-section img');
        let image = $image[0];

        let factor = ( increase ? 1.1 : 0.9 );
        image.width *= factor;
        image.height *= factor;

        // If originalsize class is not set, the width is fixed to 100%, and the image appears distorted
        $image.addClass('originalsize');
    }

};
