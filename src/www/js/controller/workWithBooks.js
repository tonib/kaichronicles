
/** 
 * Handle / download books (only for Cordova app)
 */
var workWithBooksController = {

    /** The book states */
    books: [],

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
        workWithBooksController.books = [];
        for( var i=1; i<=projectAon.supportedBooks.length; i++)
            workWithBooksController.books.push( new BookDownloadState(i) );
        
        // Setup UI
        workWithBooksView.setup(workWithBooksController.books);

        // Check books state
        BookDownloadState.getBooksDirectory(function(booksDir) {
            workWithBooksController.books.forEach( function(book) {
                book.checkDownloadState(booksDir, function() {
                    console.log( 'Book ' + book.bookNumber + ' downloaded?: ' + book.downloaded );
                    if( book.downloaded )
                        workWithBooksView.setBookChecked( book.bookNumber );
                });
            });
        });
    },

    updateBooks: function(selectedBookNumbers) {
        // Check differences:
        var toRemove = [], toDownload = [];
        for( var i=0; i<workWithBooksController.books.length; i++) {
            var book = workWithBooksController.books[i];
            var bookSelected = selectedBookNumbers.contains( book.bookNumber );
            if( book.downloaded && !bookSelected )
                toRemove.push( book );
            else if( !book.downloaded && bookSelected )
                toDownload.push( book );
        }

        // TODO: Translate
        if( toRemove.length == 0 && toDownload.length == 0 ) {
            alert( 'No changes selected' );
        }
        else {
            if( !confirm( 'Are you sure you want to do the selected changes?' ) )
                return;

            BookDownloadState.getBooksDirectory(function(booksDir) {

                // Remove books
                toRemove.forEach(function(book) {
                    book.delete(booksDir, 
                        function() { console.log('Book deleted'); },
                        function() { console.log('Error deleting book'); }
                    );
                });

                // Download books
                toDownload.forEach(function(book) {
                    book.download(booksDir,
                        function() { console.log('Book downloaded'); },
                        function() { console.log('Error downloading book'); }
                    );
                });

            });
        }
    },

};
