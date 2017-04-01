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

BookDownloadState.prototype.delete = function( booksDir , callbackOk , callbackError ) {
    
    console.log( 'Deleting book ' + this.bookNumber );
    booksDir.getDirectory( this.bookNumber.toString() , {} , 
        function(bookDir) { 
            // Succeed callback
            bookDir.removeRecursively(
                function() { callbackOk(); },
                function(fileError) { callbackError(fileError); }
            );
        },
        function(fileError) { callbackError(fileError); }
    );
};

BookDownloadState.prototype.download = function( booksDir, callbackOk , callbackError ) {

    var fileName = this.bookNumber + '.zip';
    var url = 'http://192.168.1.11/ls/data/projectAon/' + fileName;
    var dstDir = booksDir.toURL();
    var dstPath = dstDir + '/' + fileName;
    console.log('Downloading ' + url + ' to ' + dstPath);

    var fileTransfer = new FileTransfer();
    fileTransfer.download(url, dstPath, 
        function(zipFileEntry) { 
            // Download ok. Uncompress the book
            console.log('Unzipping ' + dstPath + ' to ' + dstDir);
            zip.unzip( dstPath , dstDir , function(resultCode) {
                
                // Delete the unzipped file
                console.log('Deleting unzipped file');
                zipFileEntry.remove();

                // Check the unzip operation
                if(resultCode === 0)
                    callbackOk(); 
                else
                    callbackError();
            });
        },
        function(fileTransferError) { 
            // Download failed
            callbackError(fileTransferError); 
        },
        true
    );

};

/**
 * Get the directory where books are stored on the device
 */
BookDownloadState.getBooksDirectory = function(callback) {
    // TODO: Handle errors
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        fs.root.getDirectory( BookDownloadState.BOOKS_DIR , { create: true }, function( booksDir ) {
            callback( booksDir );
        });
    });
};
