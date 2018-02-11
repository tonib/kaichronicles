
/// <reference path="../external.ts" />

/** Book disciplines table */
interface DisciplinesTable {

    /** Discipline id */
    [disciplineId : string] : { 

        /** Discipline id */
        id : string , 

        /** Discipline translated name */
        name : string ,

        /** Discipline translated description */
        description : string 
    }

}

/**
 * Class to handle the Project Aon books XML
 */
class Book {

    /** Initial books section */
    public static readonly INITIAL_SECTION = 'tssf';

    /** Special unexistent section where to store objects on the Kai monastery */
    public static readonly KAIMONASTERY_SECTION = 'kaimonastery';

    /** Books equipment section */
    public static readonly EQUIPMENT_SECTION = 'equipmnt';

    public static readonly COMBATRULESSUMMARY_SECTION = 'crsumary';
    
    public static readonly KAILEVELS_SECTION = 'levels';

    public static readonly HOWTOCARRY_SECTION = 'howcarry';

    public static readonly HOWTOUSE_SECTION = 'howuse';

    public static readonly LORECIRCLES_SECTION = 'lorecrcl';

    public static readonly IMPROVEDDISCIPLINES_SECTION = 'imprvdsc';
    
    public static readonly DISCIPLINES_SECTION = 'discplnz';

    /** Book index number (1 = first book) */
    public bookNumber : number;

    /** The book language */
    public language : string;

    /** The book XML document */
    public bookXml : any;

    /**
     * Array of 100 positions with the random table numbers as they appear on the book
     */
    public bookRandomTable : Array<number>;

    /** The book title cache, plain text */
    private bookTitle : string = null;

    /** The book copyright text cache, HTML formatted */
    private bookCopyrightHtml : string = null;

    /** The book disciplines cache */
    private disciplines : DisciplinesTable = null;

    /**
     * Constructor
     * @param number The book index number to create
     * @param language The book language ('es' = spanish / 'en' = english ) 
     */
    public constructor(number : number, language : string) {
        this.bookNumber = number;
        this.language = language;
        this.bookXml = null;
        this.bookRandomTable = [];
    }

    /**
     * Get the root URL to download book contents
     * @return The base URL 
     */
    public static getBaseUrl() : string {
        if( cordovaApp.isRunningApp() )
            // Return the local downloaded books directory
            return state.localBooksLibrary.BOOKS_PATH + '/';
        else
            return 'data/projectAon/';
    }

    /** Do replacements on original XML to have a valid standalone XML.
     * It removes inclusions and replaces 
     * @param xmlText The original XML
     * @return The fixed XML
     */
    public static fixXml(xmlText : string) : string {

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
        xmlText = xmlText.replaceAll('&inclusion.action.chart.magnakai;', '');
        xmlText = xmlText.replaceAll('&inclusion.brian.williams.bio.lw;', '');
        
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

        // This code was previously at SectionRenderer.illustration:
        // Fix single quote markup
        xmlText = xmlText.replaceAll('&amp;rsquot;', '&amp;rsquo;');
        xmlText = xmlText.replaceAll('&amp;lsquot;', '&amp;lsquo;');
        // Fix double quote markup
        xmlText = xmlText.replaceAll('&amp;rdquot;', '&amp;rdquo;');
        xmlText = xmlText.replaceAll('&amp;ldquot;', '&amp;ldquo;');

        // On book 4, the discipline id "mndblst" has been changed to "mndblast"
        // This will break the game mechanics, so keep it as "mndblst":
        xmlText = xmlText.replaceAll('"mndblast"', '"mndblst"');

        return xmlText;
    }

    /**
     * Start the download and fix a game book
     * @return Promise with the download / fix task
     */
    public downloadBookXml() : Promise<void> {

        var self = this;
        var bookXmlUrl = this.getBookXmlURL();
        //console.log( 'Downloading book XML URL: ' + bookXmlUrl);

        return $.ajax({
            url: bookXmlUrl,
            dataType: "text"
        })
        .done(function(xml) {
            self.setXml(xml);
        });
    }

    public setXml(xml : string) {
        try {
            xml = Book.fixXml(xml);
            this.bookXml = $.parseXML(xml);
            this.bookRandomTable = this.getRandomTable();
        }
        catch(e) {
            throw e;
        }
    }

    /**
     * Start promises to download authors info
     * Added on v 1.8
     * @returns The download promises. The promises text is the author XML bio, fixed
     */
    public downloadAuthorsBio() : Array<Promise<string>> {

        try {
            let promises : Array<Promise<string>> = [];
            for( let authorId of projectAon.supportedBooks[this.bookNumber - 1].biographies ) {
                promises.push( this.downloadAuthorInfo( authorId ) );
            }

            return promises;
        }
        catch(ex) {
            console.log(ex);
            return null;
        }
    }

    /**
     * Start a promise to download an author info
     * @param authorId The author id (ex. "jdbiolw")
     * @returns The download promise. The promise text is the author XML bio, fixed
     */
    private downloadAuthorInfo( authorId : string ) : Promise<string> {
        const authorFileUrl = Book.getBaseUrl() + this.bookNumber + '/' + authorId + '-' + this.language + '.inc';
        return $.ajax({
            url: authorFileUrl,
            dataType: "text"
        });
    }

    /**
     * Get the code name given to the book by the Project Aon
     * @param language The language for the book. If null, the current book language
     * will be used
     * @returns The book code name. null if it was not found 
     */
    public getProjectAonBookCode(language : string = null) : string {
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
    }

    /**
     * Returns the book XML source URL 
     */
    public getBookXmlURL() {
        return Book.getBaseUrl() + this.bookNumber + '/' + this.getProjectAonBookCode() +
            '.xml';
    }

    /**
     * Returns an illustration URL
     * @param fileName The illustration file name
     * @param {Mechanics} mechanics The book mechanics. It can be null. In this case,
     * no translated images will be searched
     * @returns The image URL, relative to application root
     */
    public getIllustrationURL(fileName : string, mechanics : any = null) : string {
        var illDirectory;
        if( mechanics && mechanics.imageIsTranslated(fileName) )
            illDirectory = 'ill_' + this.language;
        else
            illDirectory = 'ill_en';
        var illUrl = Book.getBaseUrl() + this.bookNumber + '/' + illDirectory + '/' + 
            fileName;
        //console.log('Image URL: ' + illUrl);
        return illUrl;
    }

    /**
     * Returns the book HTML directory on the Project Aon web site
     * @param language The book language to get. null to get the current book 
     * language
     */
    public getBookProjectAonHtmlDir(language : string) : string {
        if(!language)
            language = this.language;
        return 'https://projectaon.org/' + language + '/xhtml/' +
            ( language == 'en' ? 'lw' : 'ls' ) +  '/' + 
            this.getProjectAonBookCode(language) + '/';
    }

    /**
     * Returns the book title
     * @returns The book title, plain text
     */
    public getBookTitle() : string {
        if( !this.bookTitle )
            this.bookTitle = $( this.bookXml ).find( 'gamebook > meta > title').first().text();
        return this.bookTitle;
    }

    /**
     * Returns a dictionary with the disciplines info
     */
    public getDisciplinesTable() : DisciplinesTable {

        if( !this.disciplines ) {

            this.disciplines = {};
            const self = this;
            // Parse the disciplines section
            $(this.bookXml).find('section[id=discplnz] > data > section')
            .each( function(disciplineSection) {

                const $node = $(this);

                var disciplineId = $node.attr('id');

                let description : string; 
                if( disciplineId == 'psisurge' )
                    // Special case, with useful info on second paragraph
                    description = $node.find('p:not(:last)').text();
                else
                    description = $node.find('p').first().text();

                self.disciplines[disciplineId] = {
                    id: disciplineId,
                    name: $node.find('> meta > title').text(),
                    description: description
                };
            });
        }

        return this.disciplines;
    }

    /**
     * Get the book section with the given id.
     * @param sectionId The section id to get
     * @return {jquery} The related section. An empty selection if the section id was not found
     */
    public getSectionXml(sectionId : string) : any {
        return $(this.bookXml).find('section[id=' + sectionId + ']');
    }

    /**
     * Check if the book contains a section id
     * @param sectionId The section id to search
     * @return True if the book contains the given section
     */
    public hasSection(sectionId : string) : boolean {
        return this.getSectionXml(sectionId).length > 0;
    }

    /**
     * Get the book copyright HTML 
     * @returns The book copyright text, HTML formatted
     */
    public getCopyrightHtml() : string {

        if( !this.bookCopyrightHtml ) {
            var fakeSection = new Section(this, 'fakeSection', null);
            var renderer = new SectionRenderer(fakeSection);
            var selector = 'rights[class="copyrights"]';
            this.bookCopyrightHtml = renderer.renderNodeChildren( $(this.bookXml).find(selector) , 0 );
        }

        return this.bookCopyrightHtml;
    }

    /**
     * Get the Kai title for a given number of disciplines
     * @param nDisciplines Number of disciplines
     * @return The kai title
     */
    public getKaiTitle(nDisciplines : number) : string {

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
    }

    /**
     * Get sections that have a choice to go to some section
     * @param sectionId The destination section
     * @return Section ids that can go to the given section
     */
    public getOriginSections(sectionId : string) : Array<string> {
        var sourceSectionIds = [];
        var sourceSections = $(this.bookXml)
            .find('section[class="numbered"]' )
            .has( 'data > choice[idref="' + sectionId + '"]')
            .each( function(index, section) {
                sourceSectionIds.push( $(section).attr('id') );
            }) ;
        return sourceSectionIds;
    }

    /**
     * Get the book cover image URL
     */
    public getCoverURL() : string {
        return Book.getBaseUrl() + this.bookNumber + '/cover.jpg';
    }

    /**
     * Return an array of 2 positions with the combat tables images
     */
    public getCombatTablesImagesUrls(mechanics) {
        var images = [];
        images.push( this.getIllustrationURL( 'crtpos.png', mechanics) );
        images.push( this.getIllustrationURL( 'crtneg.png', mechanics ) );
        return images;
    }

    /**
     * Get the book random table number
     * @return Array with the 100 numbers of the random table
     */
    public getRandomTable() : Array<number> {
        var $randomCells = $(this.bookXml)
            .find('section[id=random] > data > illustration > instance[class=text]')
            .find('td');
        var numbers = [];
        for(var i=0; i<$randomCells.length; i++) {
            numbers.push( parseInt( $($randomCells[i]).text() ) );
        }
        return numbers;
    }

    /** Is it a book of Kai series (1-5)? */
    public isKaiBook() : boolean { return this.bookNumber <= 5; }

    /** Is it a book of Magnakai series (6-?)? */
    public isMagnakaiBook() : boolean { return this.bookNumber > 5; }

}
