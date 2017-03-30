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
}

BookDownloadState.getBooksDirectory = function(callback) {
    // TODO: Handle errors
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        fs.root.getDirectory('books', { create: true }, function( booksDir ) {
            callback( booksDir );
        });
    });
}
