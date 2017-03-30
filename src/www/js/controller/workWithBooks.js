
/** 
 * Handle / download books (only for Cordova app)
 */
var workWithBooksController = {

    /**
     * Render the work with books
     */
    index: function() {
        template.setNavTitle( translations.text('kaiChronicles') , '#mainMenu', true);
        template.showStatistics(false);

        views.loadView('workWithBooks.html')
        .then(function() { workWithBooksController.setupList(); });
    },

    setupList: function() {

        // Initialize books
        var books = [];
        for( var i=1; i<=projectAon.supportedBooks.length; i++)
            books.push( new BookDownloadState(i) );
        
        // Setup UI
        workWithBooksView.fillBooksTable(books);

        // Check books state
        BookDownloadState.getBooksDirectory(function(booksDir) {
            books.forEach( function(book) {
                book.checkDownloadState(booksDir, function() {
                    console.log( 'Book ' + book.bookNumber + ' downloaded?: ' + book.downloaded );
                });
            });
        });
    }
};
