
/**
 * New game controller
 */
var newGameController = {

    /**
     * New game page
     */
    index: function() {

        // Get available books
        var downloadedBooks = state.localBooksLibrary.getDownloadedBooks();

        if( downloadedBooks.length === 0 ) {
            // No books downloaded:
            alert( translations.text('noDownloadedBooks') );
            routing.redirect('mainMenu');
            return;
        }

        template.setNavTitle( translations.text('kaiChronicles') , '#mainMenu', true);
        template.showStatistics(false);

        views.loadView('newGame.html')
        .then(function() {
            newGameView.setup(downloadedBooks);
        });

    },

    /**
     * Start new game event
     * @param {string} bookNumber The book number
     * @param {string} language The book language
     */
    startNewGame: function( bookNumber, language ) {
        
        state.reset(true);
        routing.redirect( 'setup' , {
            bookNumber: bookNumber,
            language: language
        });
        
    },

    selectedBookChanged: function(newBookNumber) {
        var book = new Book(newBookNumber, 'en');
        newGameView.setCoverImage( book.getCoverURL() );
    },

    /** Return page */
    getBackController: function() { return 'mainMenu'; }

};
