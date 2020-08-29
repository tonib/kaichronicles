import * as fs from "fs-extra";
import { projectAon } from "..";
import { BookData } from "./bookData";

/*
    Dowload Project Aon book data
    Command line parameters:
    1) Book index (1-based). If it does not exists, the "www/data/projectAon" will be re-created and all books will be downloaded
*/

// Download PAON XML patches
// THIS COULD BREAK THE PAON LICENSE, SO, DON'T DO IT
// BookData.downloadBooksXmlPatches();

// Check if we should download only a single book
let bookNumber = 0;
if ( process.argv.length >= 3 ) {
    // The book number (1-index based) number
    bookNumber = parseInt( process.argv[2], 10);
}

// Recreate the books root directory, if we are downloading all books
if ( !bookNumber ) {
    fs.removeSync( BookData.TARGET_ROOT );
}
if ( !fs.existsSync(BookData.TARGET_ROOT) ) {
    fs.mkdirSync( BookData.TARGET_ROOT );
}

// Download books data
let from: number;
let to: number;
if ( bookNumber ) {
    // Download single book
    from = to = bookNumber;
} else {
    // Download all books
    from = 1;
    to = projectAon.supportedBooks.length;
}

// Do the download stuff
for (let i = from; i <= to; i++) {
    new BookData(i).downloadBookData();
}
