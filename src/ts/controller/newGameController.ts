/// <reference path="../external.ts" />

/**
 * New game controller
 */
const newGameController = {

    /**
     * New game page
     */
    index() {

        // Get available books
        const downloadedBooks = state.localBooksLibrary.getDownloadedBooks();

        if ( downloadedBooks.length === 0 ) {
            // No books downloaded:
            alert( translations.text("noDownloadedBooks") );
            routing.redirect("mainMenu");
            return;
        }

        template.setNavTitle( translations.text("kaiChronicles") , "#mainMenu", true);
        template.showStatistics(false);

        views.loadView("newGame.html")
        .then(function() {
            newGameView.setup(downloadedBooks);
        });

    },

    /**
     * Start new game event
     * @param {string} bookNumber The book number
     * @param {string} language The book language
     */
    startNewGame( bookNumber: number, language: string ) {

        state.reset(true);
        routing.redirect( "setup" , {
            bookNumber,
            language
        });

    },

    selectedBookChanged(newBookNumber: number) {
        const book = new Book(newBookNumber, "en");
        newGameView.setCoverImage( book.getCoverURL() );
    },

    /** Return page */
    getBackController() { return "mainMenu"; }

};
