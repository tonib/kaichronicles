/**
 * Class to handle the download state of a Project Aon book.
 * Only for Cordova app
 */

/**
 * Constructor
 * @param {Number} bookNumber 1-based index of the book
 */
function BookDownloadState(bookNumber) {
    this.bookNumber = bookNumber;
    this.downloaded = false;
    this.title = projectAon.getBookTitle( bookNumber, state.language );
}

/**
 * Directory where are stored the books inside cordova.file.dataDirectory
 */
BookDownloadState.BOOKS_DIR = 'books';

/**
 * Check if the book is already downloaded
 * @param {DirectoryEntry} booksDir The books directory root
 */
BookDownloadState.prototype.checkDownloadStateAsync = function(booksDir) {
    var dfd = jQuery.Deferred();
    var self = this;
    cordovaFS.getDirectoryAsync( booksDir , this.bookNumber.toString() , {} )
    .done(function() { 
        // Book directory found
        self.downloaded = true; 
        dfd.resolve(self);
    })
    .fail(function() {
        // Book directory not found
        self.downloaded = false; 
        dfd.resolve(self);
    });
    return dfd.promise();
};

BookDownloadState.prototype.deleteAsync = function( booksDir ) {
    
    console.log( 'Deleting book ' + this.bookNumber );
    var self = this;
    return cordovaFS.getDirectoryAsync( booksDir , this.bookNumber.toString() )
        .then(function(bookDir) { return cordovaFS.removeRecursivelyAsync( bookDir ); })
        .done(function() { self.downloaded = false; });
};

BookDownloadState.prototype.downloadAsync = function( booksDir , progressCallback) {

    var fileName = this.bookNumber + '.zip';
    var url = 'http://192.168.1.11/ls/data/projectAon/' + fileName;
    //var url = 'https://www.projectaon.org/staff/toni/data/projectAon/' + fileName;
    var dstDir = booksDir.toURL();
    var dstPath = dstDir + '/' + fileName;
    var self = this;

    var zEntry = null;
    return cordovaFS.downloadAsync(url , dstPath, progressCallback)
        .then(function(zipFileEntry) {
            // Download ok. Uncompress the book
            zEntry = zipFileEntry;
            return cordovaFS.unzipAsync( dstPath , dstDir );
        })
        .done(function() { 
            console.log( 'Book ' + self.bookNumber + ' downloaded and unzipped');
            self.downloaded = true; 
        })
        .always(function() {
            // Delete the downloaded zip file
            if( zEntry ) {
                console.log('Deleting zip file');
                zEntry.remove();
            }
        });
};

/**
 * Get the directory where books are stored on the device
 */
BookDownloadState.getBooksDirectoryAsync = function(callback) {
    return cordovaFS.requestFileSystemAsync()
        .then(function(fs) {
            return cordovaFS.getDirectoryAsync(fs.root, BookDownloadState.BOOKS_DIR, { create: true });
        });
};

/**
 * Resolve the directory where the books are stored. The directory URL will be stored on 
 * BookDownloadState.BOOKS_PATH
 * @return {Promise} The resolution promise
 */
BookDownloadState.resolveBooksDirectoryAsync = function() {

    if( !cordovaApp.isRunningApp() )
        // This is just for the app
        return jQuery.Deferred().resolve().promise();

    console.log('Resolving books directory');
    return BookDownloadState.getBooksDirectoryAsync()
        .then(function(booksDirEntry) {
            BookDownloadState.BOOKS_PATH = booksDirEntry.toURL();
            console.log('Books are at ' + BookDownloadState.BOOKS_PATH );
        });
};

/**
 * Get all available books
 * @param {bool} markAsDownloaded True if the books should be marked as downloaded
 * @return {Array<BookDownloadState>} All books state
 */
BookDownloadState.getAllBooks = function(markAsDownloaded) {
    var books = [];
    for( var i=1; i<=projectAon.supportedBooks.length; i++) {
        var book = new BookDownloadState(i);
        if( markAsDownloaded )
            book.downloaded = true;
        books.push( book );
    }
    return books;
};

/**
 * Get the downloaded books
 * @return {Promise} Promise with an array of BookDownloadState with the downloaded books
 */
BookDownloadState.getDownloadedBooksAsync = function(booksToCheck) {

    if( !booksToCheck )
        booksToCheck = BookDownloadState.getAllBooks();

    if( cordovaApp.isRunningApp() ) {
        // Cordova app: Check downloaded books
        return BookDownloadState.getBooksDirectoryAsync()
        .then( function(booksDir) {
            var promises = [];
            // Start each book check
            booksToCheck.forEach( function(book) {
                promises.push( book.checkDownloadStateAsync(booksDir) );
            });

            // Wait for all checks
            return $.when.apply($, promises);
        })
        .then(function() {
            // Return downloaded books
            var downloadedBooks = [];
            for(var i=0; i<booksToCheck.length; i++) {
                if( booksToCheck[i].downloaded )
                    downloadedBooks.push( booksToCheck[i] );
            }

            return jQuery.Deferred().resolve( downloadedBooks ).promise();
        });
    }
    else {
        // Web: Return all books as downloaded
        return jQuery.Deferred()
            .resolve( BookDownloadState.getAllBooks(true) )
            .promise();
    }

};

BookDownloadState.isBookDownloadedAsync = function(bookNumber) {
    if( cordovaApp.isRunningApp() ) {
        // Cordova app: Check if the book was downloaded
        return BookDownloadState.getBooksDirectoryAsync()
        .then( function(booksDir) {
            var book = new BookDownloadState(bookNumber);
            return book.checkDownloadStateAsync(booksDir);
        })
        .then(function(book) {
            return jQuery.Deferred().resolve( book.downloaded ).promise();
        });
    }
    else {
        // Web: Yes, it's downloaded (no apply)
        return jQuery.Deferred().resolve( true ).promise();
    }
};
