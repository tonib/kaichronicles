/**
 * Class to handle the download state of a Project Aon book.
 * Only for Cordova app
 */
class BookDownloadState {

    /** The book number, 1-index based */
    public bookNumber: number;

    /** Book has been downloaded? */
    public downloaded = false;

    /** Book zip size, in MB, to show on UI */
    public size: string;

    /**
     * Constructor
     * @param bookNumber 1-based index of the book
     */
    public constructor( bookNumber: number ) {
        this.bookNumber = bookNumber;

        const sizeMB: number = ( projectAon.supportedBooks[bookNumber - 1].zipSize / 1024.0 ) / 1024.0;
        this.size = sizeMB.toFixed(1);
    }

    /**
     * Get the translated book title
     * @return The translated book title
     */
    public getTitle(): string {
        return projectAon.getBookTitle( this.bookNumber, state.language );
    }

    /**
     * Check if the book is already downloaded
     * @param {DirectoryEntry} booksDir The books directory root
     * @returns Promise with the check process. The parameter is this instance
     */
    public checkDownloadStateAsync( booksDir: any ): JQueryPromise<BookDownloadState> {
        const dfd = jQuery.Deferred<BookDownloadState>();

        cordovaFS.getDirectoryAsync( booksDir , this.bookNumber.toString() , {} )
        .then(
            () => {
                // Book directory found
                this.downloaded = true;
                dfd.resolve(this);
            },
            () => {
                // Book directory not found
                this.downloaded = false;
                dfd.resolve(this);
        });

        return dfd.promise();
    }

    /**
     * Delete the book content from file system
     * @param {DirectoryEntry} booksDir Directory where are stored the books
     * @returns Promise with the process
     */
    public deleteAsync( booksDir: any ): JQueryPromise<void> {

        console.log( "Deleting book " + this.bookNumber );
        return cordovaFS.getDirectoryAsync( booksDir , this.bookNumber.toString() , {} )
        .then( ( bookDir: any ) => {
            return cordovaFS.deleteDirRecursivelyAsync( bookDir );
        })
        .then( () => {
            this.downloaded = false;
            return jQuery.Deferred<void>().resolve().promise();
        });
    }

    /**
     *
     * @param {DirectoryEntry} booksDir Directory where are stored the books
     * @param progressCallback Optional callback to call with the download progress. Parameter is the downloaded
     * percentage (0.0 - 100.0)
     */
    public downloadAsync( booksDir: any , progressCallback: (percent: number) => void = null ): JQueryPromise<void> {

        const fileName = this.bookNumber + ".zip";
        // var url = 'http://192.168.1.4/ls/data/projectAon/' + fileName;
        const url = "https://www.projectaon.org/staff/toni/data/projectAon/" + fileName;
        const dstDir = booksDir.toURL();
        const dstPath = dstDir + "/" + fileName;

        let zEntry: any = null;
        const clean = ( withErrors: boolean , error: any ) => {

            // Delete the downloaded zip file
            if ( zEntry ) {
                console.log("Deleting downloaded zip file");
                zEntry.remove();
            } else {
                console.log( "No downloaded zip found" );
            }

            // Return the previous error
            const dfd = jQuery.Deferred<void>();
            if ( withErrors ) {
                dfd.reject( error );
            } else {
                dfd.resolve();
            }
            return dfd.promise();
        };

        return cordovaFS.downloadAsync(url , dstPath, progressCallback)
        .then((zipFileEntry) => {
            // Download ok. Uncompress the book
            zEntry = zipFileEntry;
            return cordovaFS.unzipAsync( dstPath , dstDir );
        })
        .then(() => {
            console.log( "Book " + this.bookNumber + " downloaded and unzipped" );
            this.downloaded = true;
            return jQuery.Deferred().resolve().promise();
        })
        // Always clean the downloaded zip file
        .then(
            () => clean(false , null),
            ( error ) => clean( true , error )
        );
    }
}
