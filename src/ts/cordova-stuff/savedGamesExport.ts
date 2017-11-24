
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
            return self.copySavedGamesToTmpDir();
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
                toastr.success( 'Saved games exported to Downloads')
            },
            function( error ) {
                // ERROR
                let msg = 'Error exporting saved games';
                if( error )
                    msg += ': ' + error.toString();
                alert( msg );
            }
        );

        // TODO: Translate messages
        // TODO: Test errors
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
            // Store saved games
            self.fileGameEntries = []
            for(let entry of entries) {
                // There can be directories here (ex. downloaded books)
                if( entry.isFile )
                    self.fileGameEntries.push( entry );
            }

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

    /** 
     * Copy saved games to the temporal dir 
     * @returns Promise with the copy process
     */
    private copySavedGamesToTmpDir() : Promise<void> {
        console.log( 'Copying file games to tmp dir (' + this.fileGameEntries.length + ')' );

        let promises : Array< Promise<any> > = [];
        for( let fileGameEntry of this.fileGameEntries )
            promises.push( cordovaFS.copyToAsync( fileGameEntry , this.tmpDir ) );

        // Wait for all copys to finish
        return $.when.apply($, promises);
    }
}
