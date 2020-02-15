
/**
 * Only for Cordova app.
 * Stores the download state of all available books
 */
class LocalBooksLibrary {

    /**
     * Info about the books states
     */
    public booksLibrary: BookDownloadState[] = [];

    /**
     * Absolute path where to books are stored. It's filled at resolveBooksDirectoryAsync()
     */
    public BOOKS_PATH: string = null;

    /**
     * Constructor
     */
    public constructor() {

        const onWebEnvironment = !cordovaApp.isRunningApp();
        for ( let i = 1; i <= projectAon.supportedBooks.length; i++) {
            const book = new BookDownloadState(i);
            if ( onWebEnvironment ) {
                book.downloaded = true;
            }
            this.booksLibrary.push( book );
        }
    }

    /**
     * Get the currently downloaded books
     * @return Downloaded books
     */
    public getDownloadedBooks(): BookDownloadState[] {
        const result = [];
        for (const book of this.booksLibrary) {
            if ( book.downloaded ) {
                result.push( book );
            }
        }
        return result;
    }

    /**
     * Check if a book is downloaded
     * @param bookNumber The book number to check (1-based index)
     * @return True if the book is downloaded
     */
    public isBookDownloaded( bookNumber: number ): boolean {
        const idx = bookNumber - 1;
        if ( idx >= this.booksLibrary.length ) {
            return false;
        }
        return this.booksLibrary[ idx ].downloaded;
    }

    /**
     * Get the directory where books are stored on the device
     * @returns {Promise<DirectoryEntry>} Promise with the Cordova directory entry where the books are stored
     */
    public static getBooksDirectoryAsync(): JQueryPromise<any> {
        return cordovaFS.requestFileSystemAsync()
        .then((fs: any) => {
            return cordovaFS.getDirectoryAsync(fs.root, "books", { create: true });
        });
    }

    /**
     * Resolve the directory where the books are stored. The directory URL will be stored on
     * this.BOOKS_PATH
     * @return The resolution promise
     */
    public resolveBooksDirectoryAsync(): JQueryPromise<void> {

        if ( !cordovaApp.isRunningApp() ) {
            // This is just for the app
            return jQuery.Deferred<void>().resolve().promise();
        }

        console.log("Resolving books directory");
        return LocalBooksLibrary.getBooksDirectoryAsync()
            .then((booksDirEntry) => {
                this.BOOKS_PATH = booksDirEntry.toURL();
                console.log("Books are at " + this.BOOKS_PATH );
            });
    }

    /**
     * Check if books are downloaded or not
     * @return The resolution promise
     */
    public updateBooksDownloadStateAsync(): JQueryPromise<void> {

        if ( !cordovaApp.isRunningApp() ) {
            // This is just for the app
            return jQuery.Deferred<void>().resolve().promise();
        }

        // Cordova app: Check downloaded books
        return LocalBooksLibrary.getBooksDirectoryAsync()
        .then( (booksDir) => {
            const promises = [];
            // Start each book check
            this.booksLibrary.forEach( (book) => {
                promises.push( book.checkDownloadStateAsync(booksDir) );
            });

            // Wait for all checks
            return $.when.apply($, promises);
        });

    }

    /**
     * Setup the books states
     * @return The resolution promise
     */
    public setupAsync(): JQueryPromise<void> {
        return this.resolveBooksDirectoryAsync()
        .then(() => {
            return this.updateBooksDownloadStateAsync();
        });
    }

}
