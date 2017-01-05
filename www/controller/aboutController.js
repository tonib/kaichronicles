
/**
 * About the book controller
 */
var aboutController = {

    /**
     * Render the about page
     */
    index: function() {

        if( !setupController.checkBook() )
            return;
        
        document.title = 'About';
        views.loadView('about.html')
        .then(function() {
            
            // Get all metadata about the book:
            $('#about-title').text( state.book.getBookTitle() );
            $('#about-copyright').append( state.book.getCopyrightHtml() );

             aboutController.appendSection( 'dedicate' , '#about-dedication' );
             aboutController.appendSection( 'acknwldg' , '#about-content' );
        });
    },

    appendSection: function(sectionId, containerId) {
        var section = new Section( state.book , sectionId );
        var renderer = new SectionRenderer( section );
        $(containerId).append( renderer.renderSection() );
    },

    /** Return page */
    getBackController: function() { return 'settings'; }

};
