/// <reference types="cordova-plugin-file" />
/// <reference types="cordova-plugin-file-transfer" />

import { mechanicsEngine } from "..";

/**
 * Stuff to access the file system on Cordova app
 */
export const cordovaFS = {

    /**
     * The current download (see downloadAsync and cancelCurrentDownload)
     */
    currentDownload: null as FileTransfer,

    // TODO: Replace this with functions with Promises
    saveFile(originalFileName: string, fileContent: Blob, callback: () => void) {
        cordovaFS.requestFileSystemAsync()
            .then((fs: FileSystem) => {
                console.log("file system open: " + fs.name);

                cordovaFS.getUnusedName(originalFileName, fs, (fileName) => {
                    // Get the file to save
                    fs.root.getFile(fileName,
                        {
                            create: true,
                            exclusive: false
                        },
                        (fileEntry) => {
                            console.log("fileEntry is file?" + fileEntry.isFile.toString());
                            cordovaFS.writeFile(fileEntry, fileContent, callback);
                        },
                        () => { alert("Error getting file"); }
                    );
                });
            },
            () => { alert("Error requesting file system"); });
    },

    // TODO: Remove this and use writeFileContentAsync
    writeFile(fileEntry: FileEntry, fileContent: Blob, callback: () => void) {
        cordovaFS.writeFileContentAsync(fileEntry, fileContent)
            .then(() => { callback(); });
    },

    /**
     * Write a content on a file
     * @param fileEntry The file to write
     * @param fileContent The file content
     * @returns Promise with the write process. The parameter is the written file entry
     */
    writeFileContentAsync(fileEntry: FileEntry, fileContent: Blob): JQueryPromise<FileEntry> {
        const dfd = jQuery.Deferred<FileEntry>();

        cordovaFS.createWriterAsync(fileEntry)
            .then((fileWriter: FileWriter) => {

                fileWriter.onwriteend = () => {
                    console.log("Successful file write");
                    dfd.resolve(fileEntry);
                };

                fileWriter.onerror = (error) => {
                    let msg = "Failed to write file";
                    if (error) {
                        msg += ": " + error.toString();
                    }
                    mechanicsEngine.debugWarning(msg);
                    dfd.reject(msg);
                };

                fileWriter.write(fileContent);
            });

        return dfd.promise();
    },

    /**
     * Creates a new FileWriter associated with a file
     * @param fileEntry The file
     * @returns Promise with the new FileWriter
     */
    createWriterAsync(fileEntry: FileEntry): JQueryPromise<FileWriter> {
        const dfd = jQuery.Deferred<FileWriter>();

        fileEntry.createWriter(
            (fileWriter: FileWriter) => {
                dfd.resolve(fileWriter);
            },
            (error: FileError) => {
                const msg = "Error creating file writer. Code: " + error.code;
                mechanicsEngine.debugWarning(msg);
                dfd.reject(msg);
            }
        );

        return dfd.promise();
    },

    /**
     * Get the name and extension of a file name
     * @param fileName The file name to check
     * @returns The name and extension. The extension will be an empty string, if no extension was found
     */
    getFileNameAndExtension(fileName: string): { name: string, extension: string } {
        const idx = fileName.lastIndexOf(".");
        if (idx < 0) {
            return { name: fileName, extension: "" };
        }

        return {
            name: fileName.substr(0, idx),
            extension: fileName.substr(idx + 1)
        };
    },

    /**
     * Get an unused name "version" for a file name.
     * If the file name is "a.ext", and it exists, it will return a "a-xxx.ext", where xxx is a number
     * TODO: Change to return a Promise
     * @param fileName The file name to check
     * @param fs The file system. We will check existing files on the root directory
     * @param callback Callback to call with the new file name
     */
    getUnusedName(fileName: string, fs: FileSystem, callback: (fileName: string) => void) {

        const nameAndExtension = cordovaFS.getFileNameAndExtension(fileName);

        cordovaFS.enumerateFiles(fs, (entries) => {
            console.log("Searching unused name for " + fileName);
            let idx = 0;
            const hasSameName = (f) => f.name === fileName;
            while (true) {
                fileName = nameAndExtension.name + (idx > 0 ? "-" + idx : "") + "." + nameAndExtension.extension;
                console.log("Checking " + fileName);
                if (entries.some(hasSameName)) {
                    idx++;
                    continue;
                }

                try {
                    callback(fileName);
                } catch (ex) {
                    mechanicsEngine.debugWarning("Error calling callback: " + ex.toString());
                }
                return;
            }
        });
    },

    // TODO: Remove this and use getRootFilesAsync
    enumerateFiles(fs: FileSystem, callback: (entries: Entry[]) => void) {
        console.log("file system open: " + fs.name);

        const dirReader = fs.root.createReader();
        dirReader.readEntries(
            (entries) => {
                console.log("Got list of files. Running callback");
                callback(entries);
                console.log("Callback finished");
            },
            () => {
                mechanicsEngine.debugWarning("Error listing files");
                alert("Error listing files");
                callback([]);
            }
        );
    },

    /**
     * Get the the entries contained on the file system root directory
     * @param fs The cordova file sytem
     * @returns Promise with array of entries on the root file system
     */
    getRootFilesAsync(fs: FileSystem): JQueryPromise<Entry[]> {
        console.log("file system open: " + fs.name);
        return cordovaFS.readEntriesAsync(fs.root);
    },

    /**
     * Get the the entries contained on a directory
     * @param dirEntry The directory to read
     * @returns Promise with array of entries on the directory
     */
    readEntriesAsync(dirEntry: DirectoryEntry): JQueryPromise<Entry[]> {
        const dfd = jQuery.Deferred<Entry[]>();
        const dirReader = dirEntry.createReader();
        dirReader.readEntries(
            (entries: Entry[]) => {
                console.log("Got list of files");
                dfd.resolve(entries);
            },
            (error: FileError) => {
                const msg = "Error listing files. Error code: " + error.code;
                mechanicsEngine.debugWarning(msg);
                dfd.reject(msg);
            }
        );

        return dfd.promise();
    },

    /**
     * Copy a file to other directory
     * @param fileEntry The file / directory to copy
     * @param  parent The destination directory
     * @param newFileName The new file name. If it's null, it will be the original
     * @returns Promise with the new copied file
     */
    copyToAsync(fileEntry: Entry, parent: DirectoryEntry, newFileName: string = null): JQueryPromise<Entry> {
        const dfd = jQuery.Deferred<Entry>();
        fileEntry.copyTo(parent, newFileName,
            (entry: Entry) => {
                dfd.resolve(entry);
            },
            (error: FileError) => {
                const msg = "Error copying file. Error code: " + error.code;
                mechanicsEngine.debugWarning(msg);
                dfd.reject(msg);
            }
        );

        return dfd.promise();
    },

    /**
     * Copy a set of files to other directory
     * @param entries The files to copy
     * @param parent The destination directory
     * @returns Promise with the copy process
     */
    copySetToAsync(entries: Entry[], parent: DirectoryEntry): JQueryPromise<void> {
        console.log("Copying " + entries.length + " files to other directory");

        const promises: Array< JQueryPromise<Entry> > = [];
        for (const entry of entries) {
            promises.push( cordovaFS.copyToAsync(entry, parent) );
        }

        // Wait for all copys to finish
        return $.when.apply($, promises);
    },

    /**
     * Load the text content from a file on the root of the persistent file system.
     * @param fileName The file name to read
     * @returns The promise with the file content
     */
    readRootTextFileAsync(fileName: string): JQueryPromise<string> {
        return cordovaFS.requestFileSystemAsync()
            .then((fs: FileSystem) => {
                return cordovaFS.getFileAsync(fs.root, fileName);
            })
            .then((fileEntry: FileEntry) => {
                return cordovaFS.readFileAsync(fileEntry, false) as JQueryPromise<string>;
            });
    },

    /**
     * Get a file from an FileEntry
     * @param entry The entry
     * @returns Promise with the File
     */
    fileAsync(entry: FileEntry): JQueryPromise<File> {
        const dfd = jQuery.Deferred<File>();
        entry.file(
            (file: File) => {
                console.log("file call OK");
                dfd.resolve(file);
            },
            (fileError: FileError) => {
                const msg = "Error getting file: " + fileError.code;
                mechanicsEngine.debugWarning(msg);
                dfd.reject(msg);
            }
        );
        return dfd.promise();
    },

    /**
     * Read a file content
     * @param entry The entry to read
     * @param binary True if the content should be read as binary. False to read as text
     * @returns Promise with the contet file (text or binary)
     */
    readFileAsync(entry: FileEntry, binary: boolean): JQueryPromise<string|ArrayBuffer> {
        const dfd = jQuery.Deferred<string|ArrayBuffer>();

        cordovaFS.fileAsync(entry)
            .then(
                // tslint:disable-next-line only-arrow-functions
                function(file: File) {
                    const reader = new FileReader();
                    reader.onloadend = function() {
                        console.log("File read finished");
                        dfd.resolve(this.result);
                    };
                    // Types for reader.onerror seem to be wrong. We asume the documentation is right:
                    reader.onerror = (error: any) => {
                        let msg = "Error reading file";
                        if (error && error.message) {
                            msg += ": " + error.message;
                        }
                        mechanicsEngine.debugWarning(msg);
                        dfd.reject(msg);
                    };
                    if (binary) {
                        // reader.readAsBinaryString(file);
                        reader.readAsArrayBuffer(file);
                    } else {
                        reader.readAsText(file);
                    }
                },
                (error: any) => { dfd.reject(error); }
            );

        return dfd.promise();
    },

    /**
     * Delete file
     * @param entry The file entry to delete
     * @returns Promise with the deletion process
     */
    deleteFileAsync(fileEntry: FileEntry): JQueryPromise<void> {

        const dfd = jQuery.Deferred<void>();

        console.log("Deleting file " + fileEntry.toURL());
        fileEntry.remove(
            () => {
                console.log("File deleted");
                dfd.resolve();
            },
            (error: FileError) => {
                const msg = "Error deleting entry. Error code: " + error.code;
                mechanicsEngine.debugWarning(msg);
                dfd.reject(msg);
            }
        );

        return dfd.promise();
    },

    /**
     * Delete directory recursivelly
     * @param directoryEntry The directory entry to delete
     * @returns Promise with the deletion process
     */
    deleteDirRecursivelyAsync(directoryEntry: DirectoryEntry): JQueryPromise<void> {

        const dfd = jQuery.Deferred<void>();
        console.log("Deleting directory " + directoryEntry.toURL());
        directoryEntry.removeRecursively(
            () => {
                console.log("Directory deleted");
                dfd.resolve();
            },
            (fileError) => {
                dfd.reject("Error deleting directory " + directoryEntry.toURL() +
                    " (code " + fileError.code + ")");
            }
        );
        return dfd.promise();
    },

    /**
     * Requests a filesystem in which to store application data.
     * TODO: Use this anywhere
     * @returns Promise with the LocalFileSystem.PERSISTENT file System
     */
    requestFileSystemAsync(): JQueryPromise<FileSystem> {

        const dfd = jQuery.Deferred<FileSystem>();
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            (fileSystem) => {
                dfd.resolve(fileSystem);
            },
            (fileError) => {
                // TODO: Test this (codes?)
                dfd.reject("Error requesting file system (code " + fileError.code + ")");
            }
        );
        return dfd.promise();
    },

    /**
     * Look up file system Entry referred to by local URI.
     * @param uri URI referring to a local file or directory
     * @returns Promise with the file / directory entry
     */
    resolveLocalFileSystemURIAsync(uri: string): JQueryPromise<Entry> {
        const dfd = jQuery.Deferred<Entry>();

        window.resolveLocalFileSystemURI(uri,
            (entry: Entry) => {
                console.log("URI resolved");
                dfd.resolve(entry);
            },
            (error: FileError) => {
                const msg = "Error resolving local file URI (code " + error.code + ")";
                mechanicsEngine.debugWarning(msg);
                dfd.reject(msg);
            }
        );

        return dfd.promise();
    },

    /**
     * Creates or looks up a directory
     * TODO: Use this anywhere
     * @param dir  The parent directory
     * @param path Either an absolute path or a relative path from the parent directory to the directory to be looked up or created.
     * @param options  create : true to create the directory, if it does not exist
     * @returns Promise with the directory
     */
    getDirectoryAsync(dir: DirectoryEntry, path: string, options: Flags): JQueryPromise<DirectoryEntry> {
        const dfd = jQuery.Deferred<DirectoryEntry>();
        dir.getDirectory(path, options,
            (subdir) => {
                dfd.resolve(subdir);
            },
            (fileError) => {
                // TODO: Test this (codes?)
                dfd.reject("Error getting / creating directory " + dir.toURL() + "/" + path +
                    ": (code " + fileError.code + ")");
            }
        );
        return dfd.promise();
    },

    /**
     * Get a file from a directory
     * @param dir The directory
     * @param fileName The file name to get / create
     * @param options Options to get / create the file
     * @returns Promise with the file
     */
    getFileAsync(dir: DirectoryEntry, fileName: string, options: object = { create: false, exclusive: false }): JQueryPromise<FileEntry> {
        const dfd = jQuery.Deferred<FileEntry>();
        dir.getFile(fileName, options,
            (fileEntry: FileEntry) => {
                console.log("Got the file: " + fileName);
                dfd.resolve(fileEntry);
            },
            (error: FileError) => {
                const msg = "Error getting / creating file. Error code: " + error.code;
                mechanicsEngine.debugWarning(msg);
                dfd.reject(msg);
            }
        );
        return dfd.promise();
    },

    /**
     * Download a file from Internet
     * @param url URL to dowload
     * @param dstPath Destination path where the file will be download
     * @param progressCallback Optional callback to call with the download progress. Parameter is the downloaded
     * percentage (0.0 - 100.0)
     * @returns Promise with the process. Parameter is the downloaded file FileEntry
     */
    downloadAsync(url: string, dstPath: string, progressCallback: (percent: number) => void = null): JQueryPromise<FileEntry> {

        const dfd = jQuery.Deferred<FileEntry>();
        console.log("Downloading " + url + " to " + dstPath);

        const fileTransfer = new FileTransfer();
        cordovaFS.currentDownload = fileTransfer;
        if (progressCallback) {
            console.log("Registering progress callback");
            fileTransfer.onprogress = (progressEvent) => {
                if (!progressEvent.lengthComputable || progressEvent.total === 0) {
                    console.log("No computable length");
                    return;
                }
                const percent = (progressEvent.loaded / progressEvent.total) * 100.0;
                console.log("Calling progress callback (" + percent + "%)");
                progressCallback(percent);
            };
        } else {
            console.log("No callback progress");
        }

        fileTransfer.download(url, dstPath,
            (zipFileEntry) => {
                // Download ok
                cordovaFS.currentDownload = null;
                dfd.resolve(zipFileEntry);
            },
            (fileTransferError) => {
                // Download failed
                cordovaFS.currentDownload = null;
                let msg = "Download of " + url + " to " + dstPath + " failed.\n Code: " + fileTransferError.code;
                if (fileTransferError.http_status) {
                    msg += "\n http_status: " + fileTransferError.http_status.toString();
                }
                if (fileTransferError.exception) {
                    msg += "\n exception: " + fileTransferError.exception.toString();
                }
                dfd.reject(msg);
            },
            true
        );
        return dfd.promise();
    },

    cancelCurrentDownload() {
        try {
            if (!cordovaFS.currentDownload) {
                return;
            }
            cordovaFS.currentDownload.abort();
        } catch (e) {
            mechanicsEngine.debugWarning(e);
        }
    },

    zipAsync(dirToCompressPath: string, zipFilePath: string): JQueryPromise<void> {

        const dfd = jQuery.Deferred<void>();

        // Create the zip
        Zeep.zip({ from: dirToCompressPath, to: zipFilePath },
            () => {
                console.log("Zip created succesfuly");
                dfd.resolve();
            },
            (error) => {
                let msg = "Error creating zip file";
                if (error) {
                    msg += ": " + error.toString();
                }
                mechanicsEngine.debugWarning(msg);
                dfd.reject(msg);
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
    unzipAsync(zipPath: string, dstDir: string): JQueryPromise<void> {

        const dfd = jQuery.Deferred<void>();
        console.log("Unzipping " + zipPath + " to " + dstDir);
        zip.unzip(zipPath, dstDir, (resultCode) => {
            // Check the unzip operation
            if (resultCode === 0) {
                dfd.resolve();
            } else {
                dfd.reject("Unknown error unzipping " + zipPath + " to " + dstDir);
            }
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
    copyToDownloadAsync(url: string, title: string, description: string, mimeType: string): JQueryPromise<void> {

        const dfd = jQuery.Deferred<void>();

        CopyToDownload.copyToDownload(url, title, description, false, mimeType, true,
            () => {
                console.log("copyToDownloadAsync ok");
                dfd.resolve();
            },
            (error) => {
                let msg = "error copying file to Download folder";
                if (error) {
                    msg += ": " + error.toString();
                }
                mechanicsEngine.debugWarning(msg);
                dfd.reject(msg);
            }
        );
        return dfd.promise();
    },

    /**
     * Copy a file with native filesystem URLs, without Cordova functions
     * @param srcFileUrl URL to the source file to copy
     * @param dstDirectoryUrl URL to the target directory where to copy
     * @returns Promise with the process. The parameter is the FileEntry for the new copied file
     */
    copyNativePathsAsync(srcFileUrl: string, dstDirectoryUrl: string): JQueryPromise<FileEntry> {

        const dfd = jQuery.Deferred<string>();

        // Do the copy
        CopyToDownload.copyNativePaths(srcFileUrl, dstDirectoryUrl,
            (dstFilePath: string) => {
                console.log("copyNativePathsAsync ok");
                dfd.resolve(dstFilePath);
            },
            (error) => {
                let msg = "error copying file with native paths";
                if (error) {
                    msg += ": " + error.toString();
                }
                mechanicsEngine.debugWarning(msg);
                dfd.reject(msg);
            }
        );

        // Return the FileEntry for the copied file
        return dfd.promise()
            .then((dstFilePath: string) => {
                return cordovaFS.resolveLocalFileSystemURIAsync(dstFilePath) as JQueryPromise<FileEntry>;
            });
    }

};
