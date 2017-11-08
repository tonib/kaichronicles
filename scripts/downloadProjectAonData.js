
const fs = require('node-fs-extra');
const projectAon = require( '../src/www/js/ts-generated/model/projectAon.js' ).projectAon;
const child_process = require('child_process');

/**
 * Tool to download book data from the Project Aon SVN
 * @param {Number} bookNumber The book number (1-based index)
 */
function BookData( bookNumber ) {

    this.bookNumber = bookNumber;

    /** Metadata about the book */
    this.bookMetadata = projectAon.supportedBooks[ i - 1 ];
    /** The english book code */
    this.enCode = this.bookMetadata.code_en;
    /** The spanish book code */
    this.esCode = this.bookMetadata.code_es;
    /** Array with illustrations authors directories names */
    this.illAuthors = this.bookMetadata.illustrators;
}

/**
 * The SVN root
 */
BookData.SVN_ROOT = 'https://www.projectaon.org/data/tags/20151013';

/**
 * The target directory root
 */
BookData.TARGET_ROOT = 'src/www/data/projectAon';


/**
 * Get the book code for a given language
 */
BookData.prototype.getBookCode = function(language) {
    return language == 'en' ? this.enCode : this.esCode;
}

/**
 * Get the local relative path for the book data
 */
BookData.prototype.getBookDir = function() {
    return BookData.TARGET_ROOT + '/' + this.bookNumber;
}

/**
 * Download the book xml for a given language
 */
BookData.prototype.downloadXml = function(language) {
    var xmlFileName = this.getBookCode( language ) + '.xml';
    var sourcePath = BookData.SVN_ROOT + '/' + language + '/xml/' + 
        xmlFileName;
    var targetPath = this.getBookDir() + '/' + xmlFileName;
    var svnParams = [ 'export' , sourcePath , targetPath ];
    BookData.runSvnCommand( svnParams );
}

/**
 * Download an author biography file
 */
BookData.prototype.downloadAuthorBio = function(language, bioFileName) {
    var sourcePath = BookData.SVN_ROOT + '/' + language + '/xml/' + bioFileName + '.inc';
    var targetPath = this.getBookDir() + '/' + bioFileName + '-' + language + '.inc';
    var svnParams = [ 'export' , sourcePath , targetPath ];
    BookData.runSvnCommand( svnParams );
}

/**
 * Get the svn absolute URL for illustrations directory of a given author / language
 */
BookData.prototype.getSvnIllustrationsDir = function( language, author) {
    var booksSet = language == 'en' ? 'lw' : 'ls';
    return BookData.SVN_ROOT + '/' + language + '/png/' + 
        booksSet + '/' + this.getBookCode(language) + '/ill/' + 
        author;
}

/**
 * Download illustrations
 */
BookData.prototype.downloadIllustrations = function(language, author) {
    var sourceSvnDir = this.getSvnIllustrationsDir(language, author);
    var targetDir = this.getBookDir() + '/ill_' + language;
    fs.mkdirSync( targetDir );
    var svnParams = [ '--force', 'export' , sourceSvnDir , targetDir ];
    BookData.runSvnCommand( svnParams );
}

/**
 * Download the book cover
 */
BookData.prototype.downloadCover = function() {

    var coverPath = BookData.SVN_ROOT + '/en/jpeg/lw/' + this.getBookCode('en') +
        '/skins/ebook/cover.jpg';
    var targetPath = this.getBookDir() + '/cover.jpg';
    var svnParams = [ 'export' , coverPath , targetPath ];
    BookData.runSvnCommand( svnParams );
}

BookData.prototype.zipBook = function() {
    // Zip the book
    // Go to books dir
    process.chdir(BookData.TARGET_ROOT);
    var txtBookNumber = this.bookNumber.toString();
    child_process.execFileSync( 'zip' , ['-r' , txtBookNumber + '.zip' , txtBookNumber] , 
        {stdio:[0,1,2]} );
    // Go back
    process.chdir('../../../..');
}

BookData.prototype.downloadBookData = function() {

    fs.mkdirSync( BookData.TARGET_ROOT + '/' + this.bookNumber );

    // Download authors biographies
    this.bookMetadata.biographies.forEach( (authorBio) => {
        this.downloadAuthorBio('en', authorBio);
        this.downloadAuthorBio('es', authorBio);
    });

    this.downloadCover();

    this.downloadXml('en');
    this.downloadXml('es');

    this.illAuthors.forEach( (author) => {
        this.downloadIllustrations('en' , author);
        this.downloadIllustrations('es' , author);
    });

    this.downloadCombatTablesImages('en');
    this.downloadCombatTablesImages('es');

    this.zipBook();
}

BookData.prototype.downloadCombatTablesImages = function(language) {
    var sourceSvnDir = this.getSvnIllustrationsDir(language, 'blake');
    var targetDir = this.getBookDir() + '/ill_' + language;
    BookData.runSvnCommand( [ 'export' , sourceSvnDir + '/crtneg.png' , 
        targetDir + '/crtneg.png' ] );
    BookData.runSvnCommand( [ 'export' , sourceSvnDir + '/crtpos.png' , 
        targetDir + '/crtpos.png' ] );
}

BookData.runSvnCommand = function( params ) {
    console.log( 'svn ' + params.join( ' ' ) );
    child_process.execFileSync( 'svn' , params , {stdio:[0,1,2]} );
}

// Check if we should download only a single book
var bookNumber = 0;
if( process.argv.length >= 3 )
    bookNumber = parseInt( process.argv[2] );

// Recreate the directory
if( !bookNumber )
    fs.removeSync( BookData.TARGET_ROOT );
if( !fs.existsSync(BookData.TARGET_ROOT) )
    fs.mkdirSync( BookData.TARGET_ROOT );

// Download books data
var from, to;
if( bookNumber )
    from = to = bookNumber;
else {
    from = 1;
    to = projectAon.supportedBooks.length;
}
for( var i=from; i <= to; i++ )
    new BookData(i).downloadBookData();
