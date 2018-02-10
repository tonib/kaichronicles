const BookData = require( './bookData.js' ).BookData;

/*
    Check for Project Aon books XML upgrades
    Command line parameters:
    1) Book code (en/es)
    2) Book index (1-based)
*/

// The language code
var langCode = process.argv[2];

// The book index (1-based)
var bookIndex = parseInt( process.argv[3] );

// Stuff
var book = new BookData( bookIndex );
book.checkNewupgrades();
