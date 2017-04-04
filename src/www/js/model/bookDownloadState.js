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
 * @param {function} callback Function to run when the check is finished
 */
BookDownloadState.prototype.checkDownloadState = function(booksDir, callback) {
    var self = this;
    booksDir.getDirectory( this.bookNumber.toString() , {} , 
        function() { self.downloaded = true; callback(); },
        function() { self.downloaded = false; callback(); }
    );
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

