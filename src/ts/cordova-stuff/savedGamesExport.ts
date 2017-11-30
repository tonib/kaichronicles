
/**
 * Handles export / import saved games
 */
class SavedGamesExport {

    /**
     * The Cordova persistent file system (FileSystem)
     */
    private fs : any = null;

    /**
     * Saved games file entries (Array<Entry>)
     */
    private fileGameEntries : Array<any> = null;

    /**
     * Temporal directory (DirectoryEntry)
     */
    private tmpDir : any = null;

    /**
     * Export saved games to Download directory
     * @returns Promise with the export process
     */
    public export() : Promise<void> {
        const self = this;
        let zipPath : string = null;
        const zipFileName = 'KaiChroniclesExport-' + settingsController.getDateForFileNames() + '.zip';

        return this.setup()
        .then( function() {
            console.log( 'Copying file games to tmp dir (' + self.fileGameEntries.length + ')' );
            return cordovaFS.copySetToAsync( self.fileGameEntries , self.tmpDir );
        })
        .then( function() {
            // Create the zip
            console.log( 'Creating zip file' );
            zipPath = self.fs.root.toURL() + zipFileName;
            return cordovaFS.zipAsync( self.tmpDir.toURL() , zipPath );
        })
        .then( function() {
            console.log( 'Copying the zip to Download directory' );
            // Copy the zip
            return cordovaFS.copyToDownloadAsync(zipPath , zipFileName , 'Kai Chronicles saved games export' , 'application/zip' );
        })
        .then( function() {
            console.log( 'Get the zip file entry' );
            return cordovaFS.getFileAsync( self.fs.root , zipFileName );
        })
        .then( function( fileEntry /* : FileEntry */ ) {
            console.log( 'Delete the zip file' );
            return cordovaFS.deleteFileAsync( fileEntry );
        })
        .then( function() {
            // Delete tmp dir
            return self.deleteTmpDirectory();
        })
        .then( 
            function() {
                // OK
                toastr.success( 'Saved games exported to Downloads');
            },
            function( error ) {
                // ERROR
                let msg = 'Error exporting saved games';
                if( error )
                    msg += ': ' + error.toString();
                alert( msg );
            }
        );

        // TODO: Move UI stuff (messages) outside this class (it's part of the "model")
        // TODO: Translate messages
        // TODO: Test errors. If there are errors, remove sub-products (tmp dir, etc)
    }

    /**
     * Import saved games from a file
     * @param uri File URL with the games to import
     * @returns Promise with the export process
     */
    public import( doc : DocumentSelection ) {
        const self = this;
        this.setup()
        .then( function() {
            // Get the file type. It can be a zip file or a json file
            // TODO: Check the mime type too
            const nameAndExtension = cordovaFS.getFileNameAndExtension( doc.fileName.toLowerCase() );
            if( nameAndExtension.extension == 'zip' )
                return self.importZip( doc );
            else
                return self.importJson( doc );
        });
    }

    private importZip( doc : DocumentSelection ) : Promise<void> {

        const self = this;
        //const docEntry = window.resolveLocalFileSystemURI( doc.uri );
        let nNewGames = 0;
        let zipContent : any = null;

        // Well, the Entry returned by window.resolveLocalFileSystemURI( doc.uri ) is not really a FileEntry: It cannot be
        // copied with "copyTo". I suspect it's because is not a "file://" URL (it's a "content://"). 
        // So, get the file content, and create the the file on the tmp directory manually

        // TODO: Check files will not be overwritten!

        return cordovaFS.resolveLocalFileSystemURIAsync( doc.uri )
        // .then( function( entry /* : Entry */ ) {
        //     console.log( 'Copy zip to the tmp directory' );
        //     return cordovaFS.copyToAsync( entry , self.tmpDir , doc.fileName )
        // })
        .then( function( entry /* : Entry */ ) {
            console.log( 'Reading zip content' );
            return cordovaFS.readFileAsync( entry , true );
        })
        .then( function( content : any ) {
            zipContent = content;
            console.log( 'Create the zip file on the tmp dir (empty)' );
            return cordovaFS.getFileAsync( self.tmpDir , doc.fileName , { create: true, exclusive: false } );
        })
        .then( function( zipFileEntryOnTmpDir /* : FileEntry */ ) {
            console.log( 'Save the zip content' );
            return cordovaFS.writeFileContentAsync( zipFileEntryOnTmpDir , zipContent );
        })
        .then( function( zipFileEntryOnTmpDir /* : FileEntry */ ) {
            console.log( 'Unziping file on tmp directory' );
            return cordovaFS.unzipAsync( zipFileEntryOnTmpDir.toURL() , self.tmpDir.toURL() );
        })
        .then( function() { 
            console.log( 'Get unziped files' );
            return cordovaFS.readEntriesAsync( self.tmpDir );
        })
        .then( function( entries : Array<any> ) {
            console.log( 'Filtering unziped files' );
            entries = SavedGamesExport.filterSavedGamesEntries( entries );

            console.log( 'Copying saved games to the root' );
            nNewGames = entries.length;
            return cordovaFS.copySetToAsync( entries , self.fs.root );
        })
        .then( 
            function() {
                // OK
                toastr.success( nNewGames + ' imported' );
            },
            function( error ) {
                // ERROR
                let msg = 'Error importing saved games';
                if( error )
                    msg += ': ' + error.toString();
                alert( msg );
            }
        );
    }

    private importJson( doc : DocumentSelection ) : Promise<void> {
        return null;
    }

    private static filterSavedGamesEntries( entries : Array<any> ) {
        let result = []
        for(let entry of entries) {
            // TODO: Check extension (.json)
            if( entry.isFile )
                result.push( entry );
        }
        return result;
    }

    /** 
     * Setup current instance members
     * @returns Promise with the members setup process
     */
    private setup() : Promise<void> {
        const self = this;
        
        // Retrieve a FS and the saved games
        return cordovaFS.requestFileSystemAsync()
        .then(function( fileSystem /* : FileSystem */ ) {
            self.fs = fileSystem;
            // Get save game files
            console.log( 'Get save game files' );
            return cordovaFS.getRootFilesAsync( fileSystem );
        })
        .then( function( entries : Array<any> ) {
            console.log( 'Storing saved games entries' );
            // Store saved games, and ignore others. There can be directories here (ex. downloaded books)
            self.fileGameEntries = SavedGamesExport.filterSavedGamesEntries( entries );

            // Create a tmp directory, if it does not exists
            console.log( 'Creating tmp directory');
            return cordovaFS.getDirectoryAsync( self.fs.root , 'tmpKaiChronicles' , { create : true } );
        })
        .then(function(tmpDirEntry) {
            // Store the tmp directory entry
            self.tmpDir = tmpDirEntry;
        });
    }

    /**
     * Delete the temporal directory and all its content
     * @returns The deletion process
     */
    private deleteTmpDirectory() : Promise<void> {
        
        if( !this.tmpDir ) {
            console.log( 'No tmp dir stored, so nothing to delete');
            // Nothing to do
            var dfd = jQuery.Deferred();
            dfd.resolve();
            return dfd.promise();
        }
        
        console.log( 'Deleting tmp directory' );
        return cordovaFS.deleteDirRecursivelyAsync( this.tmpDir );
    }

}
