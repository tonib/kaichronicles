
/**
 * Stuff to access the file system via cordova
 * TODO: This is almost crap. Replace by deferreds (oh javascript)
 */
var cordovaFS = {

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

    getDirectoryFiles: function( callback ) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
            function (fs) {
                cordovaFS.enumerateFiles(fs, callback);
            }, 
            function() { alert('Error requesting file system'); }
        );
    },

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
     * Requests a filesystem in which to store application data.
     * TODO: Use this anywhere
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
     */
    getDirectoryAsync: function(dir, path, options) {
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

    downloadAsync: function(url, dstPath) {
        
        var dfd = jQuery.Deferred();
        console.log('Downloading ' + url + ' to ' + dstPath);
        var fileTransfer = new FileTransfer();
        fileTransfer.download(url, dstPath, 
            function(zipFileEntry) { 
                // Download ok
                dfd.resolve( zipFileEntry );
            },
            function(fileTransferError) { 
                // Download failed
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
