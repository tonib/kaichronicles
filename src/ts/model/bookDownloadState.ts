
/**
 * Class to handle the download state of a Project Aon book.
 * Only for Cordova app
 */
class BookDownloadState {

    /** The book number, 1-index based */
    public bookNumber : number;

    /** Book has been downloaded? */
    public downloaded = false;

    /** Book zip size, in MB, to show on UI */
    public size : string;

    /**
     * Constructor
     * @param bookNumber 1-based index of the book
     */
    public constructor( bookNumber : number ) {
        this.bookNumber = bookNumber;

        const sizeMB : number = ( projectAon.supportedBooks[bookNumber-1].zipSize / 1024.0 ) / 1024.0;
        this.size = sizeMB.toFixed(1);
    }

    /**
     * Get the translated book title
     * @return The translated book title
     */
    public getTitle() : string {
        return projectAon.getBookTitle( this.bookNumber, state.language );
    }

    /**
     * Check if the book is already downloaded
     * @param {DirectoryEntry} booksDir The books directory root
     * @returns Promise with the check process. The parameter is this instance
     */
    public checkDownloadStateAsync( booksDir : any ) : JQueryPromise<BookDownloadState> {
        const dfd = jQuery.Deferred<BookDownloadState>();
        const self = this;

        cordovaFS.getDirectoryAsync( booksDir , this.bookNumber.toString() , {} )
        .then(
            function() { 
                // Book directory found
                self.downloaded = true; 
                dfd.resolve(self);
            },
            function() {
                // Book directory not found
                self.downloaded = false; 
                dfd.resolve(self);
        });

        return dfd.promise();
    }

    /**
     * Delete the book content from file system
     * @param {DirectoryEntry} booksDir Directory where are stored the books
     * @returns Promise with the process
     */
    public deleteAsync( booksDir : any ) : JQueryPromise<void> {

        console.log( 'Deleting book ' + this.bookNumber );
        const self = this;
        return cordovaFS.getDirectoryAsync( booksDir , this.bookNumber.toString() , {} )
        .then( function( bookDir : any ) { 
            return cordovaFS.deleteDirRecursivelyAsync( bookDir );
        })
        .then( function() { 
            self.downloaded = false;
            return jQuery.Deferred<void>().resolve().promise();
        });
    }

    /**
     * 
     * @param {DirectoryEntry} booksDir Directory where are stored the books
     * @param progressCallback Optional callback to call with the download progress. Parameter is the downloaded 
     * percentage (0.0 - 100.0)
     */
    public downloadAsync( booksDir : any , progressCallback : (number) => void = null ): JQueryPromise<void> {
        
        const fileName = this.bookNumber + '.zip';
        //var url = 'http://192.168.1.4/ls/data/projectAon/' + fileName;
        const url = 'https://www.projectaon.org/staff/toni/data/projectAon/' + fileName;
        const dstDir = booksDir.toURL();
        const dstPath = dstDir + '/' + fileName;
        const self = this;

        let zEntry : any = null;
        const clean = function( withErrors : boolean , error : any ) {

            // Delete the downloaded zip file
            if( zEntry ) {
                console.log('Deleting downloaded zip file');
                zEntry.remove();
            }
            else
                console.log( 'No downloaded zip found' );

            // Return the previous error
            const dfd = jQuery.Deferred<void>();
            if( withErrors )
                dfd.reject( error );
            else
                dfd.resolve();
            return dfd.promise();
        };

        return cordovaFS.downloadAsync(url , dstPath, progressCallback)
        .then(function(zipFileEntry) {
            // Download ok. Uncompress the book
            zEntry = zipFileEntry;
            return cordovaFS.unzipAsync( dstPath , dstDir );
        })
        .then(function() { 
            console.log( 'Book ' + self.bookNumber + ' downloaded and unzipped' );
            self.downloaded = true; 
            return jQuery.Deferred().resolve().promise();
        })
        // Always clean the downloaded zip file
        .then( 
            function() { return clean(false , null); },
            function( error ) { return clean( true , error ); }
        );
    };
}
