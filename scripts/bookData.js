
const fs = require('node-fs-extra');
const projectAon = require( '../src/www/js/ts-generated/model/projectAon.js' ).projectAon;
const child_process = require('child_process');

/**
 * Tool to download book data from the Project Aon SVN
 * @param {Number} bookNumber The book number (1-based index)
 */
function BookData( bookNumber ) {

    /** The book number 1-based index */
    this.bookNumber = bookNumber;

    /** Metadata about the book */
    this.bookMetadata = projectAon.supportedBooks[ bookNumber - 1 ];

    /** The english book code */
    this.enCode = this.bookMetadata.code_en;

    /** The spanish book code */
    this.esCode = this.bookMetadata.code_es;

    /** Array with illustrations authors directories names */
    this.illAuthors = this.bookMetadata.illustrators;
}

/** 
  * URL base directory for extra contents for this application. 
  * 
  */
BookData.EXTRA_TONI_CONTENTS_URL = 'https://projectaon.org/staff/toni/extraContent-DONOTREMOVE';

/**
 * Returns the SVN root for this book.
 * See projectAon.ts for an explanation
 */
BookData.prototype.getSvnRoot = function() {
    if( this.bookMetadata.revision == 0 )
        return 'https://www.projectaon.org/data/tags/20151013';
    else
        return 'https://www.projectaon.org/data/trunk';
}

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
 * Get the the book XML file book name
 * @param {string} language The language code (en/es)
 * @returns The book XML file name
 */
BookData.prototype.getBookXmlName = function(language) {
    return this.getBookCode( language )  + '.xml';
}

/**
 * Get the SVN source path for the book XML, as it is configured on projectAon.ts
 * @param {string} language The language code (en/es)
 * @returns The currently used book XML URL at the PAON web site
 */
BookData.prototype.getXmlSvnSourcePath = function(language) {
    return this.getSvnRoot() + '/' + language + '/xml/' + this.getBookXmlName( language );
}

/**
 * Download the book XML for a given language
 * @param {string} language The language code (en/es)
 */
BookData.prototype.downloadXml = function(language) {

    // Download the book XML
    var sourcePath = this.getXmlSvnSourcePath(language);
    var targetPath = this.getBookDir() + '/' + this.getBookXmlName( language );
    var svnParams = [ 'export' , sourcePath , targetPath ];
    this.runSvnCommand( svnParams );

    // Check if there are book patches 
    // Patches are at [ROOT]/src/patches/projectAonPatches/, and they are downloaded by BookData.prototype.downloadPatches
    var patchFileName = this.getBookCode( language ) + '-' + this.bookMetadata.revision + '.diff'
    var patchPath = 'src/patches/projectAonPatches/' + patchFileName;
    if( fs.existsSync( patchPath ) ) {
        console.log( 'Applying patch ' + patchFileName + ' to ' + targetPath );
        // patch [options] [originalfile [patchfile]]
        child_process.execFileSync( 'patch' , [ targetPath , patchPath ] , {stdio:[0,1,2]} );
    }
    
}

/**
 * Download an author biography file
 */
BookData.prototype.downloadAuthorBio = function(language, bioFileName) {
    var sourcePath = this.getSvnRoot() + '/' + language + '/xml/' + bioFileName + '.inc';
    var targetPath = this.getBookDir() + '/' + bioFileName + '-' + language + '.inc';
    var svnParams = [ 'export' , sourcePath , targetPath ];
    this.runSvnCommand( svnParams );
}

/**
 * Get the svn absolute URL for illustrations directory of a given author / language
 */
BookData.prototype.getSvnIllustrationsDir = function( language, author) {
    var booksSet = language == 'en' ? 'lw' : 'ls';
    return this.getSvnRoot() + '/' + language + '/png/' + 
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
    this.runSvnCommand( svnParams );

    if( this.bookNumber == 9 && language == 'en')
        this.book9ObjectIllustrations();
}

/** 
 * Download extra book 9 object illustrations.
 * On book 9, there is a illustrator change (Brian Williams). He did illustrations for objects that
 * exists on previous books. So, include on this book all existing objects illustrations
 */
BookData.prototype.book9ObjectIllustrations = function() {

    // Already included on book 9: dagger.png, sword.png, mace.png, bow.png, food.png, potion.png, quiver.png, rope.png

    var targetDir = this.getBookDir() + '/ill_en';

    // Not included on book 9, but in later books:
    var williamsIllustrations = {
        'axe.png' : '12tmod/ill/williams/axe.png',
        'spear.png' : '13tplor/ill/williams/spear.png',
        'bsword.png' : '17tdoi/ill/williams/bsword.png',
        'qstaff.png' : '12tmod/ill/williams/qurtstff.png'  // NAME CHANGED!!!
    };
    for( var illName in williamsIllustrations ) {
        var svnSourcePath = this.getSvnRoot() + '/en/png/lw/' + williamsIllustrations[illName];
        var targetPath = targetDir + '/' + illName;
        this.runSvnCommand( [ 'export' , svnSourcePath , targetPath ] );
    }

    // NOT included at any book: ssword.png,  warhammr.png. Added to https://projectaon.org/staff/toni/extraContent-DONOTREMOVE
    williamsIllustrations = [
        BookData.EXTRA_TONI_CONTENTS_URL + '/ssword.png',
        BookData.EXTRA_TONI_CONTENTS_URL + '/warhammr.png'
    ];
    for( var i=0; i<williamsIllustrations.length; i++ )
        BookData.downloadWithWGet( williamsIllustrations[i] , targetDir );
    
}

/** 
 * Download a file with wget
 * @param {string} url File URL to download
 * @param {string} targetDirectory Destination directory
 */
BookData.downloadWithWGet = function( url , targetDirectory ) {
    // wget https://projectaon.org/staff/toni/extraContent-DONOTREMOVE/ssword.png -P targetDirectory/

    var params = [ url , '-P' , targetDirectory ];
    console.log( 'wget ' + params.join( ' ' ) );
    child_process.execFileSync( 'wget' , params , {stdio:[0,1,2]} );
}

/**
 * Download the book cover
 */
BookData.prototype.downloadCover = function() {

    var coverPath = this.getSvnRoot() + '/en/jpeg/lw/' + this.getBookCode('en') +
        '/skins/ebook/cover.jpg';
    var targetPath = this.getBookDir() + '/cover.jpg';
    this.runSvnCommand( [ 'export' , coverPath , targetPath ] );
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
    this.runSvnCommand( [ 'export' , sourceSvnDir + '/crtneg.png' , 
        targetDir + '/crtneg.png' ] );
        this.runSvnCommand( [ 'export' , sourceSvnDir + '/crtpos.png' , 
        targetDir + '/crtpos.png' ] );
}

BookData.prototype.runSvnCommand = function( params ) {

    if( this.bookMetadata.revision ) {
        // Add the revision number
        params = [ '-r' , this.bookMetadata.revision ].concat( params );
    }

    console.log( 'svn ' + params.join( ' ' ) );
    child_process.execFileSync( 'svn' , params , {stdio:[0,1,2]} );
}

/**
 * Download book XML patches from PAON web site
 */
BookData.downloadBooksXmlPatches = function() {
    
    var patchesDirectory = 'src/patches/projectAonPatches';
    if( !fs.existsSync( patchesDirectory ) ) {
        console.log( 'Creating PAON book xml patches directory: ' + patchesDirectory );
        fs.mkdirSync( patchesDirectory );
    }

    var patchFileNames = [ '09ecdm-2655.diff' ];
    for( var i=0; i<patchFileNames.length; i++ ) {
        if( !fs.existsSync( patchesDirectory + '/' + patchFileNames[i] ) )
            this.downloadWithWGet( BookData.EXTRA_TONI_CONTENTS_URL + '/' + patchFileNames[i] , patchesDirectory );
    }
}


// Export BookData, JS insane way
try {
    if (typeof exports !== 'undefined')
        exports.BookData = BookData;
}
catch(e) {
    console.log(e);
}
