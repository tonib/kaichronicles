import { Book, Mechanics, SectionRenderer, Combat, mechanicsEngine } from "..";

/**
 * A book section info
 */
export class Section {

    /** The section id */
    public sectionId: string;

    /** The owner book */
    public book: Book;

    /** The mechanics of the owner book.
     * It can be null
     */
    public mechanics: Mechanics;

    /** The jQuery handler for the section XML */
    public $xmlSection: JQuery<Element>;

    /** The jQuery handler for the XML node for the "data" tag of the section */
    public $data: JQuery<Element>;

    /**
     * Section constructor from the Book XML
     * @param {Book} book The owner Book
     * @param {string} sectionId The section ID to load. If null, no book section will be loaded
     * @param {Mechanics} mechanics The book mechanics. It can be null. In this
     * case, the images will not be translated
     */
    public constructor( book: Book , sectionId: string, mechanics: Mechanics) {

        /** The section id */
        this.sectionId = sectionId;
        this.book = book;
        this.mechanics = mechanics;

        if ( sectionId ) {
            this.$xmlSection = book.getSectionXml( sectionId );
        }

        // There can be nested sections, get the first one (the root)
        if ( this.$xmlSection ) {
            this.$data =  this.$xmlSection.find("data").first();
        }
    }

    /**
     * Create a section from an arbitrary XML tag.
     * It's used to render authors biography
     * @param book The owner book
     * @param $xml The jQuery XML root tag
     * @returns The fake section
     */
    public static createFromXml( book: Book , $xml: any ): Section {
        const s = new Section( book , null , null);
        s.$xmlSection = $xml;
        s.$data = $xml;
        return s;
    }

    /**
     * Return false if the section noes not exists
     */
    public exists(): boolean {
        return this.$xmlSection.length > 0;
    }

    /**
     * Return true if the section has navigation links (previous / next section)
     */
    public hasNavigation(): boolean {
        return this.$xmlSection.find("link[class=next]").length > 0;
    }

    /**
     * Return the section number. null if it has no number
     */
    public getSectionNumber(): number {
        if ( this.$xmlSection.attr("class") !== "numbered" ) {
            return null;
        }
        // Id is "sectXXX"
        return parseInt( this.sectionId.substring(4), 10 );
    }

    /**
     * Returns the next section id
     * @returns The next section id. null if there is no next section
     */
    public getNextSectionId(): string {

        if (this.mechanics && this.sectionId === this.mechanics.getLastSectionId() ) {
            return null;
        }

        const link = this.$xmlSection.find("link[class=next]");
        if ( link.length > 0 ) {
            return link.attr("idref");
        }

        const sNumber = this.getSectionNumber();
        if ( sNumber ) {
            return "sect" + ( sNumber + 1 );
        }

        return null;
    }

    /**
     * Returns the next section id
     * @returns The previous section id. null if there is no next section
     */
    public getPreviousSectionId(): string {

        if (this.sectionId === Book.INITIAL_SECTION ) {
            return null;
        }

        const link = this.$xmlSection.find("link[class=prev]");
        if ( link.length > 0 ) {
            return link.attr("idref");
        }

        const sNumber = this.getSectionNumber();
        if ( sNumber ) {
            if ( sNumber === 1 ) {
                return "kaiwisdm";
            } else {
                return "sect" + ( sNumber - 1 );
            }
        }

        return null;
    }

    /**
     * Returns the section HTML
     * @param renderIllustrationsText True if the illustrations text should be
     * rendered
     */
    public getHtml(renderIllustrationsText: boolean = false): string {
        const sectionRenderer = new SectionRenderer( this );
        sectionRenderer.renderIllustrationsText = renderIllustrationsText;
        return sectionRenderer.renderSection();
    }

    /**
     * Returns an array of Combat objects with the combats on this section
     * @return Combats on this section
     */
    public getCombats(): Combat[] {
        const result = [];
        this.$xmlSection.find("combat").each((index, combat) => {
            const $combat = $(combat);
            result.push( new Combat(
                $combat.find("enemy").text(),
                parseInt( SectionRenderer.getEnemyCombatSkill( $combat ).text(), 10 ),
                parseInt( SectionRenderer.getEnemyEndurance( $combat ).text(), 10 )
            ));
        });
        return result;
    }

    /**
     * Get the title text
     */
    public getTitleText(): string {
        return this.$xmlSection.find("title").first().text().unescapeHtml();
    }

    /**
     * Get the section title HTML
     */
    public getTitleHtml(): string {
        let title = this.$xmlSection.find("title").first().text();
        // Check if the section has a "main title" on the mechanics file (see sect1 on book 4)
        if ( this.mechanics ) {
            const section = this.mechanics.getSection(this.sectionId);
            if ( section ) {
                const mainTitle = mechanicsEngine.getRuleText( section );
                if ( mainTitle ) {
                    title = '<div class="book-section-title">' + mainTitle + "</div>" + title;
                }
            }
        }
        return title;
    }

    /**
     * Returns true if the section contains a anchor target with the given id ("<a id="[id]">)
     */
    public hasTargetLink(id: string): boolean {
        return this.$xmlSection.find("a[id=" + id + "]").length > 0;
    }

    /**
     * Returns the foot notes XML node for this section. null if it was not found
     */
    public getFootNotesXml(): any {
        return this.$xmlSection.find("footnotes").first();
    }

    /**
     * Returns the URL of this section on the project aon web site
     * @param language The book language to get. null to get the current book
     * language
     */
    public getSectionAonPage = function(language: string): string {
        return this.book.getBookProjectAonHtmlDir(language) + this.sectionId + ".htm";
    };

    /**
     * Returns true if the section text contains the given text
     * @param text The text to check
     * @returns true if the section contains the given text
     */
    public containsText(text: string): boolean {
        const sectionText: string = this.$xmlSection.text();
        return sectionText.indexOf(text) > 0;
    }

    /**
     * Get the HTML for the first illustration on the section
     * @returns The illustration HTML. Empty string if there are no illustrations
     */
    public getFirstIllustrationHtml(): string {
        const $illustrations = this.$xmlSection.find( "illustration" );
        if ( $illustrations.length === 0 ) {
            return "";
        }
        const $firstIll = $illustrations.first();
        return SectionRenderer.renderIllustration(this, $firstIll);
    }
}
