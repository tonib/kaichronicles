
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

        return this.setup()
        .then( function() {
            return self.copySavedGamesToTmpDir();
        })
        .then( function() {
            // Create the zip
            console.log( 'Creating zip file' );
            return cordovaFS.zipAsync( self.tmpDir.toURL() , self.fs.root.toURL() + '/achilipu.zip' );
        })
        .then( function() {
            console.log( 'Copying the zip to Download directory' );
            // Copy the zip
            CopyToDownload.copyToDownload(self.fs.root.toURL() + '/achilipu.zip', 'achilipu.zip' , 'Kai Chronicles save games export' , 
                false , 'application/zip' , true , 
                function() { 
                    console.log('ok');
                },
                function( error ) {
                    let msg = 'error';
                    if( error )
                        msg += ': ' + error.toString();
                    console.log( msg );
                }
            );
        });

        // TODO: Check errors
        // TODO: Delete tmp dir
        // TODO: Show download notification ???
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
