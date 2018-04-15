const BookData = require( './bookData.js' ).BookData;

// Book number to review
var bookNumber = parseInt( process.argv[2] );
// Language code to review
var language = process.argv[3];

var bookData = new BookData(bookNumber);
bookData.reviewChangesCurrentVersion(language);
