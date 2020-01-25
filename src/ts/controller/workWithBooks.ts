/// <reference path="../external.ts" />

/**
 * Handle / download books (only for Cordova app)
 */
const workWithBooksController = {

    /** Are we currently downloading / deleting books? */
    changingBooks: false,

    /**
     * Has been the download process cancelled?
     */
    processCancelled: false,

    /**
     * All runned processes are ok?
     */
    allOk: true,

    /**
     * Render the work with books
     */
    index() {
        template.setNavTitle( translations.text("kaiChronicles") , "#mainMenu", true);
        template.showStatistics(false);

        views.loadView("workWithBooks.html")
        .then(function() {
            // Setup UI
            workWithBooksView.setup();
            // Update the books list
            workWithBooksController.updateBooksList();
        });
    },

    updateBooksList() {

        // Uncheck the "select all" check
        workWithBooksView.setSelectAllState(false);

        // Recreate the books list
        workWithBooksView.updateBooksList( state.localBooksLibrary.booksLibrary );

        // Check books state
        state.localBooksLibrary.updateBooksDownloadStateAsync()
        .then(function() {
            const downloadedBooks = state.localBooksLibrary.getDownloadedBooks();
            for (let i = 0; i < downloadedBooks.length; i++) {
                workWithBooksView.markBookAsDownloaded( downloadedBooks[i].bookNumber );
            }

            // If all books are downloaded, check the "select all"
            if ( downloadedBooks.length == state.localBooksLibrary.booksLibrary.length ) {
                workWithBooksView.setSelectAllState(true);
            }
        });

    },

    downloadBooks(selectedBookNumbers: number[]) {

        // Check differences:
        const toRemove = [], toDownload = [];
        for ( let i = 0; i < state.localBooksLibrary.booksLibrary.length; i++) {
            const book = state.localBooksLibrary.booksLibrary[i];
            const bookSelected = selectedBookNumbers.contains( book.bookNumber );
            if ( book.downloaded && !bookSelected ) {
                toRemove.push( book );
            } else if ( !book.downloaded && bookSelected ) {
                toDownload.push( book );
            }
        }

        if ( toRemove.length === 0 && toDownload.length === 0 ) {
            alert( translations.text( "noChangesSelected" ) );
            return;
        }

        if ( toDownload.length > 0 && !cordovaApp.thereIsInternetConnection() ) {
            alert( translations.text( "noInternet" ) );
            return;
        }

        if ( !confirm( translations.text("confirmChanges") ) ) {
            return;
        }

        LocalBooksLibrary.getBooksDirectoryAsync()
        .then( function(booksDir) {

            workWithBooksController.changingBooks = true;
            workWithBooksController.processCancelled = false;
            workWithBooksController.allOk = true;

            workWithBooksView.displayModal(true);

            // Initial empty resolved promise
            let changesPromise = jQuery.Deferred<void>().resolve().promise();

            // If we will remove books, clean the cached book: Needed, because
            // the cached book may be deleted now
            if ( toRemove.length > 0 ) {
                state.removeCachedState();
            }

            // Remove books, chaining promises
            toRemove.forEach(function(book) {
                changesPromise = workWithBooksController.deleteBook( booksDir , book , changesPromise );
            });

            // Download books, chaining promises
            toDownload.forEach(function(book) {
                changesPromise = workWithBooksController.downloadBook( booksDir , book , changesPromise );
            });

            // When the actions chain ends, update the UI
            workWithBooksController.updateUIAfterProcess(changesPromise);

        })
        .fail(function(reason) { alert(reason); });

    },

    deleteBook(booksDir: string , book: BookDownloadState, changesPromise: JQueryPromise<void>): JQueryPromise<void> {

        // Work to delete the book
        const work = function() {

            if ( workWithBooksController.processCancelled ) {
                // Process cancelled. Do nothing else
                return changesPromise;
            }

            workWithBooksView.setCurrentWork(
                translations.text( "deletingBook" , [book.bookNumber] ) ) ;
            return book.deleteAsync(booksDir);

        };

        // Chain always the next promise, it was failed the previous or not
        return changesPromise.then(
            function() { return work(); } ,
            function() { return work(); }
        )
        .done(function() {
            workWithBooksView.logEvent(
                translations.text( "bookDeleted" , [book.bookNumber] ) );
        })
        .fail(function(reason) {
            if ( !workWithBooksController.processCancelled ) {
                workWithBooksView.logEvent( translations.text( "deletionFailed" , [ book.bookNumber , reason ] ) );
            }
            workWithBooksController.allOk = false;
        });
    },

    downloadBook(booksDir: string , book: BookDownloadState, changesPromise: JQueryPromise<void>): JQueryPromise<void> {

        // Work to download the book
        const work = function(): JQueryPromise<void> {

            if ( workWithBooksController.processCancelled ) {
                // Process cancelled. Do nothing else
                return changesPromise;
            }

            workWithBooksView.setCurrentWork(
                translations.text( "downloadingBook" , [book.bookNumber] ) );
            return book.downloadAsync(booksDir, function(percent) {
                workWithBooksView.updateProgress(percent);
            });

        };

        // Chain always the next promise, it was failed the previous or not
        return changesPromise.then(
            function() { return work(); } ,
            function() { return work(); }
        )
        .done(function() {
            workWithBooksView.logEvent(
                translations.text( "bookDownloaded" , [book.bookNumber] ) );
        })
        .fail(function(reason) {
            if ( !workWithBooksController.processCancelled ) {
                workWithBooksView.logEvent( translations.text( "downloadFailed" , [ book.bookNumber , reason ] ) );
            }
            workWithBooksController.allOk = false;
        });

    },

    updateUIAfterProcess(changesPromise: JQueryPromise<void>) {

        const updateUI = function() {
            // Refresh the books list
            workWithBooksController.updateBooksList();

            if ( workWithBooksController.allOk ) {
                // If all was ok, close the modal
                workWithBooksView.displayModal(false);
            } else {
                // Enable the close button
                workWithBooksView.enableCloseModal();
                // Show info:
                workWithBooksView.setCurrentWork(
                    translations.text( "processFinishedErrors" ) );
                workWithBooksView.updateProgress(100);
            }

            workWithBooksController.changingBooks = false;
        };

        changesPromise.then(
            function() { updateUI(); },
            function() { updateUI(); }
        );
    },

    /**
     * Close / cancel button clicked
     */
    closeCancelClicked() {
        if ( workWithBooksController.changingBooks ) {
            // Cancel process
            workWithBooksController.cancelProcess();
        } else {
            // Close modal with finished process
            workWithBooksView.displayModal(false);
        }
    },

    /**
     * Cancel the current process
     */
    cancelProcess() {
        workWithBooksController.processCancelled = true;
        workWithBooksController.allOk = false;
        cordovaFS.cancelCurrentDownload();
        workWithBooksView.logEvent( translations.text( "processCancelled" ) );
    },

    /** Return page */
    getBackController(): string {
        if ( workWithBooksController.changingBooks ) {
            // Cancel download
            workWithBooksView.closeCancelClicked();
            return "DONOTHING";
        } else {
            return "mainMenu";
        }
    }

};
