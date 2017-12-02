/// <reference path="../external.ts" />


/**
 * Stuff to access the file system via cordova
 * TODO: This is almost crap. Replace by promises (oh javascript...)
 */
const cordovaFS = {
    
    /**
     * The current download (see downloadAsync and cancelCurrentDownload)
     */
    currentDownload: null,

    // TODO: Replace this with functions with Promises
    saveFile: function(originalFileName, fileContent, callback) {
        cordovaFS.requestFileSystemAsync()
        .then( function(fs) {
            console.log('file system open: ' + fs.name);

            cordovaFS.getUnusedName(originalFileName, fs, function(fileName) {
                // Get the file to save
                fs.root.getFile(fileName, 
                    { 
                        create: true, 
                        exclusive: false 
                    }, 
                    function (fileEntry) {
                        console.log("fileEntry is file?" + fileEntry.isFile.toString());
                        cordovaFS.writeFile(fileEntry, fileContent, callback);
                    }, 
                    function() { alert('Error getting file'); }
                );
            });
        }, 
        function() { alert('Error requesting file system'); } );
    },

    // TODO: Remove this and use writeFileContentAsync
    writeFile: function (fileEntry, fileContent, callback) {
        cordovaFS.writeFileContentAsync( fileEntry , fileContent )
        .then( function() { callback(); } );
    },
    
    /**
     * Write a content on a file
     * @param {FileEntry} fileEntry The file to write
     * @param fileContent The file content
     * @returns {Promise<FileEntry>} Promise with the write process. The parameter is the written file entry
     */
    writeFileContentAsync: function( fileEntry : any, fileContent: any ) : Promise<any> {
        var dfd = jQuery.Deferred();

        cordovaFS.createWriterAsync( fileEntry )
        .then( function( fileWriter /* : FileWriter */ ) {
            
            fileWriter.onwriteend = function() {
                console.log( 'Successful file write' );
                dfd.resolve(fileEntry);
            };

            fileWriter.onerror = function( error ) {
                let msg = 'Failed to write file';
                if( error )
                    msg += ': ' + error.toString();
                console.log( msg );
                dfd.reject( msg );
            };

            fileWriter.write(fileContent);
        });

        return dfd.promise();
    },

    /**
     * Creates a new FileWriter associated with a file
     * @param {FileEntry} fileEntry The file
     * @returns Promise with the new FileWriter
     */
    createWriterAsync: function( fileEntry : any ) : Promise<any> {
        var dfd = jQuery.Deferred();

        fileEntry.createWriter(
            function( fileWriter /* : FileWriter */ ) {
                dfd.resolve( fileWriter );
            },
            function( error /* : FileError */ ) {
                let msg = 'Error creating file writer. Code: ' + error.code;
                console.log( msg );
                dfd.reject( msg );
            }
        );

        return dfd.promise();
    },

    /**
     * Get the name and extension of a file name
     * @param fileName The file name to check
     * @returns The name and extension. The extension will be an empty string, if no extension was found
     */
    getFileNameAndExtension: function( fileName : string ) : { name : string , extension : string } {
        const idx = fileName.lastIndexOf('.');
        if( idx < 0 )
            return { name : fileName , extension : '' };

        return { 
            name : fileName.substr(0, idx) , 
            extension : fileName.substr( idx + 1 ) 
        };
    },

    /**
     * Get an unused name "version" for a file name.
     * If the file name is "a.ext", and it exists, it will return a "a-xxx.ext", where xxx is a number
     * TODO: Change to return a Promise
     * @param fileName The file name to check
     * @param {FileSystem} fs The file system. We will check existing files on the root directory
     * @param callback Callback to call with the new file name
     */
    getUnusedName: function( fileName : string, fs : any, callback : (string) => void ) {
        /*var idx = fileName.lastIndexOf('.');
        var name = fileName.substr(0, idx);
        const extension = fileName.substr(idx +1);*/
        const nameAndExtension = cordovaFS.getFileNameAndExtension( fileName );

        cordovaFS.enumerateFiles(fs, function(entries) {
            console.log('Searching unused name for ' + fileName);
            let idx = 0;
            var hasSameName = function(f) { return f.name == fileName; };
            while(true) {
                fileName = nameAndExtension.name + ( idx > 0 ? '-' + idx : '' ) + '.' + nameAndExtension.extension;
                console.log('Checking ' + fileName);
                if( entries.some( hasSameName ) ) {
                    idx++;
                    continue;
                }
                try {
                    callback(fileName);
                }
                finally {
                    return;
                }
            }
        });
    },

    // TODO: Remove this and use getRootFilesAsync
    enumerateFiles: function( fs, callback ) {
        console.log('file system open: ' + fs.name);

        var dirReader = fs.root.createReader();
        dirReader.readEntries(
            function( entries ) {
                console.log('Got list of files. Running callback');
                callback( entries );
                console.log('Callback finished');
            },
            function() { 
                console.log('Error listing files');
                alert('Error listing files');
                callback( [] );
            }
        );
    },

    /**
     * Get the the entries contained on the file system root directory
     * @param {FileSystem} fs The cordova file sytem
     * @returns {Promise<Array<Entry>>} Promise with array of entries on the root file system
     */
    getRootFilesAsync : function( fs : any ) : Promise< Array<any> > {
        console.log('file system open: ' + fs.name);
        return cordovaFS.readEntriesAsync( fs.root );
    },

    /**
     * Get the the entries contained on a directory
     * @param {DirectoryEntry} dirEntry The directory to read
     * @returns {Promise<Array<Entry>>} Promise with array of entries on the directory
     */
    readEntriesAsync : function( dirEntry : any ) : Promise< Array<any> > {
        var dfd = jQuery.Deferred();
        var dirReader = dirEntry.createReader();
        dirReader.readEntries(
            function( entries : Array<any> ) {
                console.log('Got list of files');
                dfd.resolve( entries );
            },
            function( error /*: FileError*/ ) { 
                const msg = 'Error listing files. Error code: ' + error.code;
                console.log( msg );
                dfd.reject( msg );
            }
        );

        return dfd.promise();
    },

    /**
     * Copy a file to other directory
     * @param {Entry} fileEntry The file / directory to copy
     * @param {DirectoryEntry} parent The destination directory
     * @param newFileName The new file name. If it's null, it will be the original
     * @returns {Promise<Entry>} Promise with the new copied file
     */
    copyToAsync: function( fileEntry : any , parent : any , newFileName : string = null ) : Promise<any> {
        var dfd = jQuery.Deferred();
        fileEntry.copyTo( parent , newFileName , 
            function( entry /*: Entry*/ ) {
                dfd.resolve( entry );
            },
            function( error /*: FileError*/ ) {
                const msg = 'Error copying file. Error code: ' + error.code;
                console.log( msg );
                dfd.reject( msg );
            }
        );

        return dfd.promise();
    },

    /**
     * Copy a set of files to other directory
     * @param {Array<Entry>} entries The files to copy
     * @param {DirectoryEntry} parent The destination directory
     * @returns Promise with the copy process
     */
    copySetToAsync : function( entries : Array<any> , parent : any ) : Promise<void> {
        console.log( 'Copying ' + entries.length + ' files to other directory' );
        
        let promises : Array< Promise<any> > = [];
        for( let entry of entries )
            promises.push( cordovaFS.copyToAsync( entry , parent ) );

        // Wait for all copys to finish
        return $.when.apply($, promises);
    },

    /**
     * Load the text content from a file on the root of the persistent file system.
     * @param fileName The file name to read
     * @returns The promise with the file content
     */
    readRootTextFileAsync: function( fileName : string ) : Promise<string> {
        return cordovaFS.requestFileSystemAsync()
        .then( function( fs /* : FileSystem */ ) {
            return cordovaFS.getFileAsync( fs.root , fileName );
        })
        .then( function( fileEntry /* : FileEntry */ ) {
            return cordovaFS.readFileAsync( fileEntry , false );
        });
    },

    /** 
     * Get a file from an FileEntry
     * @param {FileEntry} entry The entry
     * @returns {Promise<File>} Promise with the File
     */
    fileAsync: function( entry : any ) : Promise<any> {
        var dfd = jQuery.Deferred();
        entry.file(
            function (file /* : File */ ) {
                console.log( 'file call OK' );
                dfd.resolve(file);
            }, 
            function( fileError /* : FileError */ ) { 
                let msg = 'Error getting file: ' + fileError.code;
                console.log( msg );
                dfd.reject( msg );
            }
        );
        return dfd.promise();
    },

    /**
     * Read a file content
     * @param {Entry} entry The entry to read
     * @param binary True if the content should be read as binary. False to read as text
     * @returns Promise with the contet file (text or binary)
     */
    readFileAsync: function( entry : any, binary : boolean ) : Promise<any> {
        var dfd = jQuery.Deferred();

        cordovaFS.fileAsync( entry )
        .then(
            function( file /* : File */ ) {
                var reader = new FileReader();
                reader.onloadend = function() {
                    console.log( 'File read finished' );
                    dfd.resolve( this.result );
                };
                reader.onerror = function( error ) {
                    let msg = 'Error reading file';
                    if( error && error.message )
                        msg += ': ' + error.message;
                    console.log( msg );
                    dfd.reject( msg );
                }
                if( binary )
                    //reader.readAsBinaryString(file);
                    reader.readAsArrayBuffer(file);
                else
                    reader.readAsText(file);
            },
            function( error : any ) { dfd.reject( error ); }
        );

        return dfd.promise();
    },

    /**
     * Delete file
     * @param {FileEntry} entry The file entry to delete
     * @returns Promise with the deletion process
     */
    deleteFileAsync: function( fileEntry : any ) : Promise<void> {

        var dfd = jQuery.Deferred();

        console.log('Deleting file ' + fileEntry.toURL() );
        fileEntry.remove(
            function() { 
                console.log('File deleted');
                dfd.resolve();
            }, 
            function( error /* : FileError*/ ) { 
                let msg = 'Error deleting entry. Error code: ' + error.code;
                console.log( msg );
                dfd.reject( msg );
            }
        );
        
        return dfd.promise();
    },

    /**
     * Delete directory recursivelly
     * @param {DirectoryEntry} directoryEntry The directory entry to delete
     * @returns Promise with the deletion process
     */
    deleteDirRecursivelyAsync: function( directoryEntry : any ) : Promise<void> {

        var dfd = jQuery.Deferred();
        console.log('Deleting directory ' + directoryEntry.toURL() );
        directoryEntry.removeRecursively(
            function() { 
                console.log('Directory deleted');
                dfd.resolve(); 
            },
            function(fileError) { 
                dfd.reject( 'Error deleting directory ' + directoryEntry.toURL() + 
                    ' (code ' + fileError.code + ')' );
            }
        );
        return dfd.promise();
    },
    
    /**
     * Requests a filesystem in which to store application data.
     * TODO: Use this anywhere
     * @returns Promise with the LocalFileSystem.PERSISTENT file System
     */
    requestFileSystemAsync: function() {
        var dfd = jQuery.Deferred();
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
            function( fileSystem ) {
                dfd.resolve( fileSystem );
            },
            function( fileError ) {
                // TODO: Test this (codes?)
                dfd.reject( 'Error requesting file system (code ' + fileError.code + ')' );
            }
        );
        return dfd.promise();
    },

    /**
     * Look up file system Entry referred to by local URI.
     * @param uri URI referring to a local file or directory
     * @returns {Promise<Entry>} Promise with the file / directory entry
     */
    resolveLocalFileSystemURIAsync: function(uri : string) : Promise<any> {
        var dfd = jQuery.Deferred();

        window.resolveLocalFileSystemURI( uri, 
            function( entry /* : Entry */ ) {
                console.log( 'URI resolved' );
                dfd.resolve( entry );
            },
            function( error /* : FileError */ ) {
                let msg = 'Error resolving local file URI (code ' + error.code + ')';
                console.log( msg );
                dfd.reject( msg );
            }
        );

        return dfd.promise();
    },

    /**
     * Creates or looks up a directory
     * TODO: Use this anywhere
     * @param {DirectoryEntry} dir  The parent directory
     * @param path Either an absolute path or a relative path from the parent directory to the directory to be looked up or created.
     * @param {Flags} options  create : true to create the directory, if it does not exist
     * @returns {Promise<DirectoryEntry>} Promise with the directory
     */
    getDirectoryAsync: function(dir : any , path : string , options : any ) : Promise<any> {
        var dfd = jQuery.Deferred();
        dir.getDirectory( path , options, 
            function( subdir ) {
                dfd.resolve( subdir );
            },
            function( fileError ) {
                // TODO: Test this (codes?)
                dfd.reject( 'Error getting / creating directory ' + dir.toURL() + '/' + path + 
                    ': (code ' + fileError.code + ')' );
            }
        );
        return dfd.promise();
    },

    /**
     * Get a file from a directory
     * @param {DirectoryEntry} dir The directory
     * @param fileName The file name to get / create
     * @param options Options to get / create the file
     * @returns {Promise<FileEntry>} Promise with the file
     */
    getFileAsync: function(dir : any , fileName : string , options : Object = { create: false, exclusive: false } ) : Promise<any> {
        var dfd = jQuery.Deferred();
        dir.getFile(fileName, options, 
            function ( fileEntry /* : FileEntry */ ) {
                console.log('Got the file: ' + fileName);
                dfd.resolve( fileEntry );
            }, 
            function( error /* : FileError */ ) { 
                let msg = 'Error getting / creating file. Error code: ' + error.code;
                console.log( msg );
                dfd.reject( msg );
            }
        );
        return dfd.promise();
    },

    downloadAsync: function(url, dstPath, progressCallback) {
        
        var dfd = jQuery.Deferred();
        console.log('Downloading ' + url + ' to ' + dstPath);

        var fileTransfer = new FileTransfer();
        cordovaFS.currentDownload = fileTransfer;
        if( progressCallback) {
            console.log('Registering progress callback');
            fileTransfer.onprogress = function(progressEvent) {
                if(!progressEvent.lengthComputable || progressEvent.total === 0) {
                    console.log('No computable length');
                    return;
                }
                var percent = (progressEvent.loaded / progressEvent.total) * 100.0;
                console.log('Calling progress callback (' + percent + '%)');
                progressCallback(percent);
            };
        }
        else
            console.log('No callback progress');

        fileTransfer.download(url, dstPath, 
            function(zipFileEntry) { 
                // Download ok
                cordovaFS.currentDownload = null;
                dfd.resolve( zipFileEntry );
            },
            function(fileTransferError) { 
                // Download failed
                cordovaFS.currentDownload = null;
                var msg = 'Download of ' + url + ' to ' + dstPath + ' failed. Code: ' + 
                    fileTransferError.code;
                if(fileTransfer.exception)
                    msg += '. Exception: ' + fileTransfer.exception.toString();
                dfd.reject( msg );
            },
            true
        );
        return dfd.promise();
    },

    cancelCurrentDownload: function() {
        try {
            if( !cordovaFS.currentDownload ) 
                return;
            cordovaFS.currentDownload.abort();
        }
        catch(e) {
            console.log(e);
        }
    },

    zipAsync: function( dirToCompressPath : string , zipFilePath : string ) : Promise<void> {

        var dfd = jQuery.Deferred();

        // Create the zip
        Zeep.zip( { from : dirToCompressPath, to : zipFilePath } , 
            function() {
                console.log( 'Zip created succesfuly' );
                dfd.resolve();
            },
            function( error ) {
                let msg = 'Error creating zip file';
                if( error )
                    msg += ': ' + error.toString();
                console.log( msg );
                dfd.reject( msg );
            }
        );

        return dfd.promise();
    },

    /**
     * Uncompress a zip file
     * @param zipPath Path to the zip file
     * @param dstDir Path to the directory where uncompress the zip file
     * @returns Promise with the process
     */
    unzipAsync: function( zipPath : string , dstDir : string ) : Promise<void> {

        var dfd = jQuery.Deferred();
        console.log('Unzipping ' + zipPath + ' to ' + dstDir);
        zip.unzip( zipPath , dstDir , function(resultCode) {
            // Check the unzip operation
            if(resultCode === 0)
                dfd.resolve();
            else
                dfd.reject('Unknown error unzipping ' + zipPath + ' to ' + dstDir );
        });
        return dfd.promise();
    },

    /**
     * Copy a file to the Download directory, and notify the DownloadManager of that file.
     * @param url URL / path to the local file to copy to the Download directory.
     * @param title the title that would appear for this file in Downloads App.
     * @param description the description that would appear for this file in Downloads App.
     * @param mimeType    mimetype of the file.
     */
    copyToDownloadAsync: function( url : string , title : string , description : string , mimeType : string ) : Promise<void> {
        
        const dfd = jQuery.Deferred();

        CopyToDownload.copyToDownload( url , title , description , false , mimeType , true , 
            function() { 
                console.log( 'copyToDownloadAsync ok' );
                dfd.resolve();
            },
            function( error ) {
                let msg = 'error copying file to Download folder';
                if( error )
                    msg += ': ' + error.toString();
                console.log( msg );
                dfd.reject( error );
            }
        );
        return dfd.promise();
    }

};
