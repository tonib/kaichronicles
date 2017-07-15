/// <reference path="../external.ts" />

/**
 * A book section info
 */
class Section {

    /** The section id */
    public sectionId : string;

    /** The owner book */
    public book : Book;

    /** The mechanics of the owner book.
      * It can be null
      */
    public mechanics : Mechanics;

    /** The jQuery handler for the section XML */
    public $xmlSection : any;

    /** The XML node for the "data" tag of the section */
    public data : any;

    /**
     * Section constructor from the Book XML
     * @param {Book} book The owner Book
     * @param {string} sectionId The section ID to load 
     * @param {Mechanics} mechanics The book mechanics. It can be null. In this
     * case, the images will not be translated
     */
    public constructor( book : Book , sectionId : string, mechanics : Mechanics) {
        
        /** The section id */
        this.sectionId = sectionId;
        this.book = book;
        this.mechanics = mechanics;
        this.$xmlSection = book.getSectionXml( sectionId );
        // There can be nested sections, get the first one (the root)
        this.data =  this.$xmlSection.find('data').first();
    }

    /**
     * Return false if the section noes not exists 
     */
    public exists() : boolean {
        return this.$xmlSection.length > 0;
    }

    /**
     * Return true if the section has navigation links (previous / next section)
     */
    public hasNavigation() : boolean {
        return this.$xmlSection.find('link[class=next]').length > 0;
    }

    /**
     * Return the section number. null if it has no number 
     */
    public getSectionNumber() : number {
        if( this.$xmlSection.attr('class') != 'numbered' )
            return null;
        // Id is "sectXXX"
        return parseInt( this.sectionId.substring(4) );
    }

    /**
     * Returns the previous section id
     */
    public getNextSectionId() : string {
        var link = this.$xmlSection.find('link[class=next]');
        if( link.length > 0 )
            return link.attr('idref');
        
        var sNumber = this.getSectionNumber();
        if( sNumber )
            return 'sect' + ( sNumber + 1 );

        return null; 
    }

    /**
     * Returns the next section id
     */
    public getPreviousSectionId() : string {
        var link = this.$xmlSection.find('link[class=prev]');
        if( link.length > 0 )
            return link.attr('idref');

        var sNumber = this.getSectionNumber();
        if( sNumber ) {
            if( sNumber == 1 )
                return 'kaiwisdm';
            else
                return 'sect' + ( sNumber - 1 );
        }

        return null; 
    }

    /**
     * Returns the section HTML
     * @param renderIllustrationsText True if the illustrations text should be 
     * rendered
     */
    public getHtml(renderIllustrationsText : boolean ) : string {
        var sectionRenderer = new SectionRenderer( this );
        sectionRenderer.renderIllustrationsText = renderIllustrationsText;
        return sectionRenderer.renderSection(); 
    }

    /**
     * Returns an array of Combat objects with the combats on this section
     * @return {Array<Combat>} Combats on this section
     */
    public getCombats() {
        var result = [];
        this.$xmlSection.find('combat').each(function(index, combat) {
            result.push( new Combat(  
                $(combat).find('enemy').text(), 
                parseInt( $(combat).find('enemy-attribute[class=combatskill]').text() ),
                parseInt( $(combat).find('enemy-attribute[class=endurance]').text() )
            ));
        });
        return result;
    }

    /**
     * Get the title text
     */
    public getTitleText() : string {
        return this.$xmlSection.find('title').first().text().unescapeHtml();
    }

    /**
     * Get the section title HTML
     */
    public getTitleHtml() : string {
        var title = this.$xmlSection.find('title').first().text();
        // Check if the section has a "main title" on the mechanics file (see sect1 on book 4)
        if( this.mechanics ) {
            var section = this.mechanics.getSection(this.sectionId);
            if( section ) {
                var mainTitle = mechanicsEngine.getRuleText( section );
                if( mainTitle )
                    title = '<div class="book-section-title">' + mainTitle + '</div>' + title;
            }
        }
        return title;
    }

    /**
     * Returns true if the section contains a anchor target with the given id ("<a id="[id]">)
     */
    public hasTargetLink(id : string) : boolean {
        return this.$xmlSection.find('a[id=' + id + ']').length > 0;
    }

    /**
     * Returns the foot notes XML node for this section. null if it was not found
     */
    public getFootNotesXml() : any {
        return this.$xmlSection.find('footnotes').first();
    }

    /**
     * Returns the URL of this section on the project aon web site
     * @param language The book language to get. null to get the current book 
     * language
     */
    public getSectionAonPage = function(language : string) : string {
        return this.book.getBookProjectAonHtmlDir(language) + this.sectionId + ".htm";
    }
}


