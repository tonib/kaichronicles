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

    /**
     * The book size, in MB
     */
    this.size = ( projectAon.supportedBooks[bookNumber-1].zipSize / 1024.0 ) / 1024.0;
    this.size = this.size.toFixed(1);
}

/**
 * Get the translated book title
 * @return {string} The translated book title
 */
BookDownloadState.prototype.getTitle = function() {
    return projectAon.getBookTitle( this.bookNumber, state.language );
};

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
    //var url = 'http://192.168.1.10/ls/data/projectAon/' + fileName;
    var url = 'https://www.projectaon.org/staff/toni/data/projectAon/' + fileName;
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
