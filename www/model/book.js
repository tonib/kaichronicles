
/**
 * Constructor
 * @param {number} number The book index number to create
 * @param {string} language The book language ('es' = spanish / 'en' = english ) 
 */
function Book(number, language) {

    /** Book index number */
    this.bookNumber = number;

    /** The book language */
    this.language = language;

    /** The book XML document */
    this.bookXml = null;
}

/**
 * Get the root URL to download book contents
 * @return The base URL 
 */
Book.getBaseUrl = function() {
    //return '/data/tags/20151013/';
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
    xmlText = xmlText.replaceAll('%general.links;', '')
    xmlText = xmlText.replaceAll('%xhtml.links;', '')
    xmlText = xmlText.replaceAll('%general.inclusions;', '')
    xmlText = xmlText.replaceAll('&inclusion.joe.dever.bio.lw;', '')
    xmlText = xmlText.replaceAll('&inclusion.gary.chalk.bio.lw;', '')
    xmlText = xmlText.replaceAll('&inclusion.project.aon.license;', '')
    xmlText = xmlText.replaceAll('&inclusion.joe.dever.endowment;', '')
    xmlText = xmlText.replaceAll('&inclusion.action.chart;', '')
    xmlText = xmlText.replaceAll('&inclusion.combat.results.table;', '')

    /*xmlText = xmlText.replaceAll('&link.project.website;', '')    
    xmlText = xmlText.replaceAll('&link.staff.contact;', '')
    xmlText = xmlText.replaceAll('&link.01hdlo;', '');*/
    // Replace links
    // 12-21 12:37:11.655: E/browser(1884): Console: Uncaught TypeError: Cannot supply flags when constructing one RegExp from another http://10.0.2.2/ls/statskeeper3/model/book.js:51
    //xmlText = xmlText.replace( new RegExp( /\&link\..+?\;/ , 'g' ) , '' );
    var exp = /\&link\..+?\;/g;
    xmlText = xmlText.replace( exp , '' );
    
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

    return xmlText;
};

/**
 * Start the download and fix a game book
 * @return Promise with the download / fix task
 */
Book.prototype.downloadBookXml = function() {

    var self = this;
    return $.ajax({
        url: this.getBookXmlURL(),
        dataType: "text"
    })
    .done(function(xml) {
        xml = Book.fixXml(xml);
        self.bookXml = $.parseXML(xml);
    });
};

/**
 * Get the code name given to the book by the Project Aon
 * @returns The book code name. null if it was not found 
 */
Book.prototype.getProjectAonBookCode = function() {
    if( this.bookNumber == 1 )
        return this.language == 'en' ? '01fftd' : '01hdlo';
    else
        return this.language == 'en' ? '02fotw' : '02fsea';
};

/**
 * Returns the book XML source URL 
 */
Book.prototype.getBookXmlURL = function() {
    /*return Book.getBaseUrl() + this.language + '/xml/' + this.getProjectAonBookCode() +
        '.xml';*/
    return Book.getBaseUrl() + this.bookNumber + '/' + this.getProjectAonBookCode() +
        '.xml';
};

/**
 * Returns the book XHTML root directory, where are stored the book images for HTML format
 */
Book.prototype.getBookImagesDirectoryURL = function() {
    return Book.getBaseUrl() + this.bookNumber + '/ill_' + this.language + '/';
};

/**
 * Returns the book HTML directory on the Project Aon web site
 */
Book.prototype.getBookProjectAonHtmlDir = function() {
    return 'https://projectaon.org/' + this.language + '/xhtml/' +
        ( this.language == 'en' ? 'lw' : 'ls' ) +  '/' + 
        this.getProjectAonBookCode() + '/';
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
    var fakeSection = new Section(this, 'fakeSection');
    var renderer = new SectionRenderer(fakeSection);
    //var selector = 'rights[class="copyrights"]';
    var selector = 'rights[class="license-notification"]';
    // rights class="license-notification"
    return renderer.renderNodeChildren( 
        $(this.bookXml).find(selector) , 0 );
};