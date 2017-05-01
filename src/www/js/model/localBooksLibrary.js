/**
 * Only for Cordova app.
 * Stores the download state of all available books
 */
function LocalBooksLibrary() {
    
    /**
     * Info about the books state.
     */
    this.booksLibrary = [];

    var onWebEnvironment = !cordovaApp.isRunningApp();
    for( var i=1; i<=projectAon.supportedBooks.length; i++) {
        var book = new BookDownloadState(i);
        if( onWebEnvironment )
            book.downloaded = true;
        this.booksLibrary.push( book );
    }
    
    /**
     * Absolute path where to books are stored. It's filled at resolveBooksDirectoryAsync()
     */
    this.BOOKS_PATH = null;
    
}

/**
 * Get the currently downloaded books
 * @return {Array<BookDownloadState>} Downloaded books
 */
LocalBooksLibrary.prototype.getDownloadedBooks = function() {
    var result = [];
    for(var i=0; i<this.booksLibrary.length; i++) {
        if( this.booksLibrary[i].downloaded )
            result.push( this.booksLibrary[i] );
    }
    return result;
};

/**
 * Check if a book is downloaded
 * @param {number} bookNumber The book number to check (1-based index)
 * @return {bool} True if the book is downloaded
 */
LocalBooksLibrary.prototype.isBookDownloaded = function(bookNumber) {
    return this.booksLibrary[bookNumber - 1].downloaded;
};

/**
 * Get the directory where books are stored on the device
 */
LocalBooksLibrary.getBooksDirectoryAsync = function() {
    return cordovaFS.requestFileSystemAsync()
    .then(function(fs) {
        return cordovaFS.getDirectoryAsync(fs.root, 'books', { create: true });
    });
};

/**
 * Resolve the directory where the books are stored. The directory URL will be stored on 
 * this.BOOKS_PATH
 * @return {Promise} The resolution promise
 */
LocalBooksLibrary.prototype.resolveBooksDirectoryAsync = function() {

    if( !cordovaApp.isRunningApp() )
        // This is just for the app
        return jQuery.Deferred().resolve().promise();

    var self = this;
    console.log('Resolving books directory');
    return LocalBooksLibrary.getBooksDirectoryAsync()
        .then(function(booksDirEntry) {
            self.BOOKS_PATH = booksDirEntry.toURL();
            console.log('Books are at ' + self.BOOKS_PATH );
        });
};

/**
 * Check if books are downloaded or not
 * @return {Promise} The resolution promise
 */
LocalBooksLibrary.prototype.updateBooksDownloadStateAsync = function() {

    if( !cordovaApp.isRunningApp() )
        // This is just for the app
        return jQuery.Deferred().resolve().promise();

    // Cordova app: Check downloaded books
    var self = this;
    return LocalBooksLibrary.getBooksDirectoryAsync()
    .then( function(booksDir) {
        var promises = [];
        // Start each book check
        self.booksLibrary.forEach( function(book) {
            promises.push( book.checkDownloadStateAsync(booksDir) );
        });

        // Wait for all checks
        return $.when.apply($, promises);
    });

};

/**
 * Setup the books states
 * @return {Promise} The resolution promise
 */
LocalBooksLibrary.prototype.setupAsync = function() {
    var self = this;
    return this.resolveBooksDirectoryAsync()
    .then(function() { 
        return self.updateBooksDownloadStateAsync(); 
    });
};
