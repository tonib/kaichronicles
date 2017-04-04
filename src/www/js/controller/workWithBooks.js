
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
        BookDownloadState.getBooksDirectoryAsync()
        .then( function(booksDir) {
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
        if( toRemove.length === 0 && toDownload.length === 0 ) {
            alert( 'No changes selected' );
        }
        else {
            if( !confirm( 'Are you sure you want to do the selected changes?' ) )
                return;

            BookDownloadState.getBooksDirectoryAsync()
            .then( function(booksDir) {

                var allOk = true;

                workWithBooksView.displayModal(true);

                // Initial empty resolved promise
                var changesPromise = jQuery.Deferred().resolve().promise();

                // Remove books, chaining promises
                toRemove.forEach(function(book) {
                    // Chain always the next promise, it was failed the previous or not
                    var work = function() {
                        workWithBooksView.setCurrentWork('Removing book ' + book.bookNumber);
                        return book.deleteAsync(booksDir);
                    };
                    changesPromise = changesPromise.then(
                        function() { return work(); } , 
                        function() { return work(); }
                    )
                    .done(function() { 
                        workWithBooksView.logEvent('Book ' + book.bookNumber + ' removed');
                    })
                    .fail(function(reason) { 
                        workWithBooksView.logEvent('Book ' + book.bookNumber + ' deletion failed: ' + 
                            reason );
                        allOk = false;
                    });
                });

                // Download books, chaining promises
                toDownload.forEach(function(book) {
                    // Chain always the next promise, it was failed the previous or not
                    var work = function() {
                        workWithBooksView.setCurrentWork('Downloading book ' + book.bookNumber);
                        return book.downloadAsync(booksDir, function(percent) {
                            workWithBooksView.updateProgress(percent);
                        });
                    };
                    changesPromise = changesPromise.then(
                        function() { return work(); } , 
                        function() { return work(); }
                    )
                    .done(function() { 
                        workWithBooksView.logEvent('Book ' + book.bookNumber + ' downloaded');
                    })
                    .fail(function(reason) { 
                        workWithBooksView.logEvent('Book ' + book.bookNumber + ' download failed: ' + 
                            reason );
                        allOk = false;
                    });
                });

                changesPromise.then(function(){
                    // When the actions chain ends, refresh the books list
                    workWithBooksController.setupList();
                    // If all was ok, close the modal
                    if( allOk )
                        workWithBooksView.displayModal(false);
                });

            })
            .fail(function(reason){ alert(reason); });
        }
    },

    /** Return page */
    getBackController: function() { return 'mainMenu'; }
    
};
