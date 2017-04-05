
/** 
 * Handle / download books (only for Cordova app)
 */
var workWithBooksController = {

    /** The book states */
    books: [],

    /** Are we currently downloading / deleting books? */
    changingBooks: false,

    /**
     * Render the work with books
     */
    index: function() {
        template.setNavTitle( translations.text('kaiChronicles') , '#mainMenu', true);
        template.showStatistics(false);

        views.loadView('workWithBooks.html')
        .then(function() { 
            // Setup UI
            workWithBooksView.setup();
            // Update the books list
            workWithBooksController.updateBooksList(); 
        });
    },

    updateBooksList: function() {

        // Initialize books
        workWithBooksController.books = [];
        for( var i=1; i<=projectAon.supportedBooks.length; i++)
            workWithBooksController.books.push( new BookDownloadState(i) );

        // Recreate the books list
        workWithBooksView.updateBooksList( workWithBooksController.books );

        // Check books state
        BookDownloadState.getBooksDirectoryAsync()
        .then( function(booksDir) {
            workWithBooksController.books.forEach( function(book) {
                book.checkDownloadState(booksDir, function() {
                    //console.log( 'Book ' + book.bookNumber + ' downloaded?: ' + book.downloaded );
                    if( book.downloaded )
                        workWithBooksView.markBookAsDownloaded( book.bookNumber );
                });
            });
        });
    },

    downloadBooks: function(selectedBookNumbers) {

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

        if( toRemove.length === 0 && toDownload.length === 0 ) {
            alert( translations.text( 'noChangesSelected' ) );
        }
        else {
            if( !confirm( translations.text('confirmChanges') ) )
                return;

            BookDownloadState.getBooksDirectoryAsync()
            .then( function(booksDir) {

                var allOk = true;
                workWithBooksController.changingBooks = true;

                workWithBooksView.displayModal(true);

                // Initial empty resolved promise
                var changesPromise = jQuery.Deferred().resolve().promise();

                // Remove books, chaining promises
                toRemove.forEach(function(book) {
                    // Chain always the next promise, it was failed the previous or not
                    var work = function() {
                        workWithBooksView.setCurrentWork( 
                            translations.text( 'deletingBook' , [book.bookNumber] ) ) ;
                        return book.deleteAsync(booksDir);
                    };
                    changesPromise = changesPromise.then(
                        function() { return work(); } , 
                        function() { return work(); }
                    )
                    .done(function() { 
                        workWithBooksView.logEvent( 
                            translations.text( 'bookDeleted' , [book.bookNumber] ) );
                    })
                    .fail(function(reason) { 
                        workWithBooksView.logEvent(
                            translations.text( 'deletionFailed' , [ book.bookNumber , reason ] ) );
                        allOk = false;
                    });
                });

                // Download books, chaining promises
                toDownload.forEach(function(book) {
                    // Chain always the next promise, it was failed the previous or not
                    var work = function() {
                        workWithBooksView.setCurrentWork(
                            translations.text( 'downloadingBook' , [book.bookNumber] ) );
                        return book.downloadAsync(booksDir, function(percent) {
                            workWithBooksView.updateProgress(percent);
                        });
                    };
                    changesPromise = changesPromise.then(
                        function() { return work(); } , 
                        function() { return work(); }
                    )
                    .done(function() { 
                        workWithBooksView.logEvent( 
                            translations.text( 'bookDownloaded' , [book.bookNumber] ) );
                    })
                    .fail(function(reason) { 
                        workWithBooksView.logEvent( 
                            translations.text( 'downloadFailed' , [ book.bookNumber , reason ] ) );
                        allOk = false;
                    });
                });

                // When the actions chain ends, update the UI
                var updateUI = function() {
                    // Refresh the books list
                    workWithBooksController.updateBooksList();
                    
                    if( allOk )
                        // If all was ok, close the modal
                        workWithBooksView.displayModal(false);
                    else
                        // Enable the close button
                        workWithBooksView.enableCloseModal();

                    workWithBooksController.changingBooks = false;
                };
                changesPromise.then(
                    function(){ updateUI(); },
                    function(){ updateUI(); }
                );

            })
            .fail(function(reason){ alert(reason); });
        }
    },

    /** Return page */
    getBackController: function() { 
        if( workWithBooksController.changingBooks )
            // Do not allow to cancel downloads (unsupported)
            return 'DONOTHING';
        else
            return 'mainMenu'; 
    }
    
};
