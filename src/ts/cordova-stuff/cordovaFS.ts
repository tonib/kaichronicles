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

    getUnusedName: function(fileName, fs, callback) {
        var idx = fileName.lastIndexOf('.');
        var name = fileName.substr(0, idx);
        var extension = fileName.substr(idx +1);
        cordovaFS.enumerateFiles(fs, function(entries) {
            console.log('Searching unused name for ' + fileName);
            idx = 0;
            var hasSameName = function(f) { return f.name == fileName; };
            while(true) {
                fileName = name + ( idx > 0 ? '-' + idx : '' ) + '.' + extension;
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

    writeFile: function (fileEntry, fileContent, callback) {

        // Create a FileWriter object for our FileEntry (log.txt).
        fileEntry.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function() {
                console.log("Successful file write");
                callback();
            };

            fileWriter.onerror = function (e) {
                console.log("Failed file read: " + e.toString());
            };

            // If we are appending data to file, go to the end of the file.
            fileWriter.write(fileContent);

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
     * @param fs {FileSystem} The cordova file sytem
     * @returns {Promise<Array<Entry>>} Promise with array of entries on the root file system
     */
    getRootFilesAsync : function( fs : any ) : Promise< Array<any> > {
        console.log('file system open: ' + fs.name);

        var dfd = jQuery.Deferred();
        var dirReader = fs.root.createReader();
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
     * @returns {Promise<Entry>} The new copied file
     */
    copyToAsync: function( fileEntry : any , parent : any ) : Promise<any> {
        var dfd = jQuery.Deferred();
        fileEntry.copyTo( parent , null , 
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

    loadFile: function( fileName, callback ) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
            function (fs) {
                console.log('file system open: ' + fs.name);

                // Get the file to save
                fs.root.getFile(fileName, 
                    { 
                        create: false, 
                        exclusive: false
                    }, 
                    function (fileEntry) {
                        console.log("fileEntry is file?" + fileEntry.isFile.toString());
                        cordovaFS.readFile(fileEntry, callback);
                    }, 
                    function() { alert('Error getting file'); }
                );

            }, 
            function() { alert('Error requesting file system'); }
        );
    },

    readFile: function(fileEntry, callback) {
        fileEntry.file(
            function (file) {
                var reader = new FileReader();

                reader.onloadend = function() {
                    console.log("Successful file read: " + this.result);
                    callback(this.result);
                };

                reader.readAsText(file);

            }, 
            function() { alert('Error reading file'); }
        );
    },

    // TODO: Remove this and use deleteFileAsync
    deleteFile: function(fileName, callback) {

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
            function (fs) {
                console.log('file system open: ' + fs.name);

                // Get the file to save
                console.log('Get file to delete: ' + fileName);
                fs.root.getFile(fileName, 
                    { 
                        create: false, 
                        exclusive: false
                    }, 
                    function (fileEntry) {
                        console.log('Got the file to delete: ' + fileName);
                        fileEntry.remove(
                            function() { 
                                console.log('File deleted. Now callback()');
                                callback(); 
                            },
                            function() { 
                                console.log('Error deleting file');
                                alert('Error deleting file'); 
                            }
                        );
                    }, 
                    function() { alert('Error getting file'); }
                );

            }, 
            function() { alert('Error requesting file system'); }
        );
    },

    /**
     * Delete a file
     * @param {FileEntry} fileEntry The file to delete
     * @returns Promise with the deletion process
     */
    deleteFileAsync: function( fileEntry : any ) : Promise<void> {
        var dfd = jQuery.Deferred();
        fileEntry.remove(
            function() { 
                console.log('File deleted');
                dfd.resolve();
            },
            function( error /* : FileError*/ ) { 
                let msg = 'Error deleting file. Error code: ' + error.code;
                console.log( msg );
                dfd.reject( msg );
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

    unzipAsync: function(dstPath , dstDir) {

        var dfd = jQuery.Deferred();
        console.log('Unzipping ' + dstPath + ' to ' + dstDir);
        zip.unzip( dstPath , dstDir , function(resultCode) {
            // Check the unzip operation
            if(resultCode === 0)
                dfd.resolve();
            else
                dfd.reject('Unknown error unzipping ' + dstPath + ' to ' + dstDir );
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
        
        var dfd = jQuery.Deferred();

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
    },

    removeRecursivelyAsync: function(directoryEntry) {

        var dfd = jQuery.Deferred();
        console.log('Deleting directory ' + directoryEntry.toURL() );
        directoryEntry.removeRecursively(
            function() { dfd.resolve(); },
            function(fileError) { 
                dfd.reject( 'Error deleting directory ' + directoryEntry.toURL() + 
                    ' (code ' + fileError.code + ')' );
            }
        );
        return dfd.promise();
    }
};
