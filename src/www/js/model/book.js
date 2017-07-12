/**
 * Class to handle the Project Aon books XML
 */

/**
 * Constructor
 * @param {number} number The book index number to create
 * @param {string} language The book language ('es' = spanish / 'en' = english ) 
 */
function Book(number, language) {

    /** Book index number (1 = first book) */
    this.bookNumber = number;

    /** The book language */
    this.language = language;

    /** The book XML document */
    this.bookXml = null;

    /**
     * Array of 100 positions with the random table number as they appear on the book
     */
    this.bookRandomTable = [];
}

/**
 * Get the root URL to download book contents
 * @return The base URL 
 */
Book.getBaseUrl = function() {
    if( cordovaApp.isRunningApp() )
        // Return the local downloaded books directory
        return state.localBooksLibrary.BOOKS_PATH + '/';
    else
        return 'data/projectAon/';
};

/** Do replacements on original XML to have a valid standalone XML.
 * It removes inclusions and replaces 
 * @param xmlText The original XML
 * @return The fixed XML
 */
Book.fixXml = function(xmlText) {

    // Code taken from Lone Wolf Adventures, by Liquid State Limited.

    // remove general directives
    // TODO: Handle all inclusions with a regex?
    xmlText = xmlText.replaceAll('%general.links;', '');
    xmlText = xmlText.replaceAll('%xhtml.links;', '');
    xmlText = xmlText.replaceAll('%general.inclusions;', '');
    xmlText = xmlText.replaceAll('%xhtml.characters;', '');
    
    xmlText = xmlText.replaceAll('&inclusion.joe.dever.bio.lw;', '');
    xmlText = xmlText.replaceAll('&inclusion.gary.chalk.bio.lw;', '');
    xmlText = xmlText.replaceAll('&inclusion.project.aon.license;', '');
    xmlText = xmlText.replaceAll('&inclusion.joe.dever.endowment;', '');
    xmlText = xmlText.replaceAll('&inclusion.action.chart;', '');
    xmlText = xmlText.replaceAll('&inclusion.combat.results.table;', '');

    /*xmlText = xmlText.replaceAll('&link.project.website;', '')    
    xmlText = xmlText.replaceAll('&link.staff.contact;', '')
    xmlText = xmlText.replaceAll('&link.01hdlo;', '');*/
    // Replace links
    // 12-21 12:37:11.655: E/browser(1884): Console: Uncaught TypeError: Cannot supply flags when constructing one RegExp from another http://10.0.2.2/ls/statskeeper3/model/book.js:51
    //xmlText = xmlText.replace( new RegExp( /\&link\..+?\;/ , 'g' ) , '' );
    var exp = /\&link\..+?\;/g;
    xmlText = xmlText.replace( exp , '' );

    xmlText = xmlText.replaceAll('&copy;', '&amp;copy;' );
    xmlText = xmlText.replaceAll('&endash;', '-' );
    xmlText = xmlText.replaceAll('&lellips;', '&amp;hellip;' );

    // replace non-valid special characters with html special characters
    xmlText = xmlText.replaceAll('<ch.ellips/>', '&amp;hellip;');
    xmlText = xmlText.replaceAll('<ch.lellips/>', '&amp;hellip;');
    xmlText = xmlText.replaceAll('<ch.emdash/>', '&amp;mdash;');
    xmlText = xmlText.replaceAll('<ch.endash/>', '&amp;ndash;');
    xmlText = xmlText.replaceAll('<ch.apos/>', '&amp;rsquo;');
    xmlText = xmlText.replaceAll('<ch.blankline/>', '<br />');
    xmlText = xmlText.replaceAll('<ch.minus/>', '-');
    xmlText = xmlText.replaceAll('<ch.ampersand/>', '&amp;amp;');
    xmlText = xmlText.replaceAll('<ch.thinspace/>', ' ');

    // replace html special characters
    // 12-21 12:42:19.090: E/browser(1884): Console: Uncaught TypeError: Cannot supply flags when constructing one RegExp from another http://10.0.2.2/ls/statskeeper3/model/book.js:68
    //xmlText = xmlText.replace( new RegExp( /<ch\.(.+?)\/>/ , 'g' ) , "&amp;$1;");
    exp = /<ch\.(.+?)\/>/g;
    xmlText = xmlText.replace( exp , "&amp;$1;");

    // On book 4, the discipline id "mndblst" has been changed to "mndblast"
    // This will break the game mechanics, so keep it as "mndblst":
    xmlText = xmlText.replaceAll('"mndblast"', '"mndblst"');

    return xmlText;
};

/**
 * Start the download and fix a game book
 * @return Promise with the download / fix task
 */
Book.prototype.downloadBookXml = function() {

    var self = this;
    var bookXmlUrl = this.getBookXmlURL();
    //console.log( 'Downloading book XML URL: ' + bookXmlUrl);

    return $.ajax({
        url: bookXmlUrl,
        dataType: "text"
    })
    .done(function(xml) {
        try {
            xml = Book.fixXml(xml);
            self.bookXml = $.parseXML(xml);
            self.bookRandomTable = self.getRandomTable();
        }
        catch(e) {
            throw e;
        }
    });
};

/**
 * Get the code name given to the book by the Project Aon
 * @param {string} language The language for the book. If null, the current book language
 * will be used
 * @returns {string} The book code name. null if it was not found 
 */
Book.prototype.getProjectAonBookCode = function(language) {
    if( !language )
        language = this.language;

    var bookMetadata = projectAon.supportedBooks[ this.bookNumber - 1 ];
    if( !bookMetadata )
        return null;

    var languageCode = 'code_' + language;
    var bookCode = bookMetadata[ languageCode ];
    
    if( !bookCode )
        return null;
    return bookCode;
};

/**
 * Returns the book XML source URL 
 */
Book.prototype.getBookXmlURL = function() {
    return Book.getBaseUrl() + this.bookNumber + '/' + this.getProjectAonBookCode() +
        '.xml';
};

/**
 * Returns an illustration URL
 * @param {string} fileName The illustration file name
 * @param {Mechanics} mechanics The book mechanics. It can be null. In this case,
 * no translated images will be searched
 */
Book.prototype.getIllustrationURL = function(fileName, mechanics) {
    var illDirectory;
    if( mechanics && mechanics.imageIsTranslated(fileName) )
        illDirectory = 'ill_' + this.language;
    else
        illDirectory = 'ill_en';
    var illUrl = Book.getBaseUrl() + this.bookNumber + '/' + illDirectory + '/' + 
        fileName;
    //console.log('Image URL: ' + illUrl);
    return illUrl;
};

/**
 * Returns the book HTML directory on the Project Aon web site
 * @param {string} language The book language to get. null to get the current book 
 * language
 */
Book.prototype.getBookProjectAonHtmlDir = function(language) {
    if(!language)
        language = this.language;
    return 'https://projectaon.org/' + language + '/xhtml/' +
        ( language == 'en' ? 'lw' : 'ls' ) +  '/' + 
        this.getProjectAonBookCode(language) + '/';
};

/**
 * Returns the book title
 */
Book.prototype.getBookTitle = function() {
    return $( this.bookXml ).find( 'gamebook > meta > title').first().text();
};

/**
 * Returns a dictionary with the disciplines info
 */
Book.prototype.getDisciplinesTable = function() {
    var result = {};
    // Parse the disciplines section
    $(this.bookXml).find('section[id=discplnz] > data > section')
    .each( function(disciplineSection) {
        var disciplineId = $(this).attr('id'); 
        result[disciplineId] = {
            id: disciplineId,
            name: $(this).find('> meta > title').text(),
            description: $(this).find('p').first().text()
        };
    });

    return result;
};

/**
 * Get the book section with the given id.
 * @param {string} sectionId The section id to get
 * @return {jquery} The related section. An empty selection if the section id was not found
 */
Book.prototype.getSectionXml = function(sectionId) {
    return $(this.bookXml).find('section[id=' + sectionId + ']');
};

/**
 * Check if the book contains a section id
 * @param {string} sectionId The section id to search
 * @return {boolean} True if the book contains the given section
 */
Book.prototype.hasSection = function(sectionId) {
    return this.getSectionXml(sectionId).length > 0;
};

/**
 * Get the book copyright HTML
 */
Book.prototype.getCopyrightHtml = function() {
    var fakeSection = new Section(this, 'fakeSection', null);
    var renderer = new SectionRenderer(fakeSection);
    //var selector = 'rights[class="copyrights"]';
    var selector = 'rights[class="copyrights"]';
    // rights class="license-notification"
    return renderer.renderNodeChildren( 
        $(this.bookXml).find(selector) , 0 );
};

/**
 * Get the Kai title for a given number of disciplines
 * @param {number} nDisciplines Number of disciplines
 * @return {string} The kai title
 */
Book.prototype.getKaiTitle = function(nDisciplines) {

    // Normalize
    if( nDisciplines < 1 )
        nDisciplines = 1;
    else if( nDisciplines > 10 )
        nDisciplines = 10;
    
    // Get the title
    var title = $(this.bookXml)
        .find('section[id="levels"] > data > ol > li:eq(' + (nDisciplines-1) + ')')
        .text();
    if( !title )
        title = 'Unknown';

    // For the level 5, there is an extra explanation to remove:
    // &mdash;You begin the Lone Wolf adventures with this level of Kai training
    var idx = title.indexOf( '&mdash;');
    if( idx >= 0 )
        title = title.substr(0, idx).trim();
    // On book 6 (spanish), there is a parenthesis: Maestro Superior del Kai (con este...
    idx = title.indexOf( '(');
    if( idx >= 0 )
        title = title.substr(0, idx).trim();
    
    return title;
};

/**
 * Get sections that have a choice to go to some section
 * @param {string} sectionId The destination section
 * @return {Array<string>} Section ids that can go to the given section
 */
Book.prototype.getOriginSections = function(sectionId) {
    var sourceSectionIds = [];
    var sourceSections = $(this.bookXml)
        .find('section[class="numbered"]' )
        .has( 'data > choice[idref="' + sectionId + '"]')
        .each( function(index, section) {
            sourceSectionIds.push( $(section).attr('id') );
        }) ;
    return sourceSectionIds;
};

/**
 * Get the book cover image URL
 */
Book.prototype.getCoverURL = function() {
    return Book.getBaseUrl() + this.bookNumber + '/cover.jpg';
};

/**
 * Return an array of 2 positions with the combat tables images
 */
Book.prototype.getCombatTablesImagesUrls = function(mechanics) {
    var images = [];
    images.push( this.getIllustrationURL( 'crtpos.png', mechanics) );
    images.push( this.getIllustrationURL( 'crtneg.png', mechanics ) );
    return images;
};

/**
 * Get the book random table number
 * @return {Arrray<number>} Array with the 100 numbers of the random table
 */
Book.prototype.getRandomTable = function(mechanics) {
    var $randomCells = $(this.bookXml)
        .find('section[id=random] > data > illustration > instance[class=text]')
        .find('td');
    var numbers = [];
    for(var i=0; i<$randomCells.length; i++) {
        numbers.push( parseInt( $($randomCells[i]).text() ) );
    }
    return numbers;
};
