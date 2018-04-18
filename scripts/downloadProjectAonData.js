const fs = require('node-fs-extra');
const BookData = require( './bookData.js' ).BookData;
const projectAon = require( '../src/www/js/ts-generated/model/projectAon.js' ).projectAon;

/*
    Dowload Project Aon book data
    Command line parameters:
    1) Book index (1-based). If it does not exists, the "src/www/data/projectAon" will be re-created and all books will be downloaded
*/

// Download PAON XML patches
// THIS COULD BREAK THE PAON LICENSE, SO, DON'T DO IT
//BookData.downloadBooksXmlPatches();

// Check if we should download only a single book
var bookNumber = 0;
if( process.argv.length >= 3 )
    // The book number (1-index based) number
    bookNumber = parseInt( process.argv[2] );

// Recreate the books root directory, if we are downloading all books
if( !bookNumber )
    fs.removeSync( BookData.TARGET_ROOT );
if( !fs.existsSync(BookData.TARGET_ROOT) )
    fs.mkdirSync( BookData.TARGET_ROOT );

// Download books data
var from, to;
if( bookNumber )
    // Download single book
    from = to = bookNumber;
else {
    // Download all books
    from = 1;
    to = projectAon.supportedBooks.length;
}

// Do the download stuff
for( var i=from; i <= to; i++ )
    new BookData(i).downloadBookData();
