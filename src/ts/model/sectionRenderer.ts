
/*
 * This file contains code taken from Lone Wolf Adventures,
 * by Liquid State Limited.
 */

 /**
  * Tool to transform the book XML to HTML
  */
class SectionRenderer {

    /**
     * Only illustrations of following authors are rendered (Others are not included on PAON).
     * This covers up to book 9. There are illustrations of authors that are not distributed (ex. JC Alvarez)
     */
    private static toRenderIllAuthors = [ "Gary Chalk" , "Brian Williams" ];

    /** The section to render */
    public sectionToRender: Section;

    /**
     * The footnotes HTML.
     * The key is the foot note id, and the value is the foot note HTML
     */
    private footNotes: Array< { [id: string]: string } > = [];

    /**
     * List of renderend foot note references ids.
     * Needed to avoid render not referenced foot notes
     */
    private renderedFootNotesRefs: string[] = [];

    /** Render text illustration instances for this section?  */
    public renderIllustrationsText = false;

    /**
     * Constructor
     * @param section The section to render
     */
    public constructor(section: Section) {
        this.sectionToRender = section;
    }

    /**
     * Get the HTML for the given book section
     * @return The HTML
     */
    public renderSection(): string {

        // Collect foot notes
        const footNotes = this.sectionToRender.getFootNotesXml();
        if ( footNotes.length > 0 ) {
            this.renderNodeChildren( footNotes , 0 );
        }

        // Render the section body
        let html = this.renderNodeChildren( $(this.sectionToRender.data) , 0 );

        // Render foot notes
        if ( footNotes.length > 0 ) {
            html += '<hr/><div class="footnotes">';
            for (let i = 0, len = this.footNotes.length; i < len; i++) {
                if ( this.renderedFootNotesRefs.contains( this.footNotes[i].id ) ) {
                    html += this.footNotes[i].html;
                } else {
                    console.log( this.sectionToRender.sectionId + ": Footnote " + this.footNotes[i].id +
                        " not rendered because its not referenced" );
                }
            }
            html += "</div>";
        }

        return html;
    }

    /**
     * Get the HTML for children of a given book XML tag
     * @param {jQuery} $tag The XML tag to render
     * @param level The nesting level index of the tag
     * @return The HTML
     */
    public renderNodeChildren($tag: JQuery<Element>, level: number ): string {

        // The HTML to return
        let sectionContent = "";

        // Traverse all child elements, except separated sections
        // var children = $tag.contents().not('section.frontmatter-separate');
        const children = $tag.contents();
        for (const node of children.toArray() ) {
            if ( node.nodeType === 3 ) {
                // Text node
                sectionContent += node.textContent;
                continue;
            }

            if ( node.nodeType !== 1 ) {
                // Not a node, skip it
                continue;
            }

            // Get the tag name
            let tagName = node.tagName.toLowerCase();
            // Replace '-' char by '_' (not valid char for javascript function names)
            tagName = tagName.replaceAll("-" , "_");

            const $node = $(node);

            if ( tagName === "section" && $node.attr("class") === "frontmatter-separate" ) {
                // Ignore separated sections
                continue;
            }

            // Call the function renderer (this class method with the tag name)
            if ( !this[tagName] ) {
                throw this.sectionToRender.sectionId + ": Unkown tag: " + tagName;
            } else {
                try {
                    sectionContent += this[tagName]( $node , level );
                } catch (e) {
                    console.log(e);
                }
            }
        }

        return sectionContent;
    }

    ////////////////////////////////////////////////////////
    // HTML DIRECT RENDERING
    ////////////////////////////////////////////////////////

    /** Render nodes with the same meaning on book XML and HTML */
    private renderHtmlNode($node: JQuery<Element>, level: number): string {
        const name = $node[0].nodeName;
        return "<" + name + ">" + this.renderNodeChildren( $node , level ) +
            "</" + name + ">";
    }

    /** Paragraph renderer  */
    private p($node: JQuery<Element>, level: number): string { return this.renderHtmlNode( $node , level ); }

    /** List item renderer  */
    private li($node: JQuery<Element>, level: number): string { return this.renderHtmlNode( $node , level ); }

    /** blockquote renderer */
    private blockquote($node: JQuery<Element>, level: number): string { return this.renderHtmlNode( $node , level ); }

    /** Line break renderer */
    private br($node: JQuery<Element>, level: number): string { return this.renderHtmlNode( $node , level ); }

    /** Cite renderer */
    private cite($node: JQuery<Element>, level: number): string { return this.renderHtmlNode( $node , level ); }

    /** Emphasized renderer */
    private em($node: JQuery<Element>, level: number): string { return this.renderHtmlNode( $node , level ); }

    /** Strong renderer */
    private strong($node: JQuery<Element>, level: number): string { return this.renderHtmlNode( $node , level ); }

    ////////////////////////////////////////////////////////
    // PLAIN TEXT RENDERING
    ////////////////////////////////////////////////////////

    /** Render node as plain text */
    private renderPlainText = function($node: JQuery<Element>, level: number): string {
        return this.renderNodeChildren( $node , level );
    };

    ////////////////////////////////////////////////////////
    // LISTS RENDERING
    ////////////////////////////////////////////////////////

    /**
     * Unordered list renderer
     * @param $ul List to render
     * @return The HTML
     */
    private ul($ul: JQuery<Element>, level: number): string {
        return '<ul class="list-table">' + this.renderNodeChildren( $ul , level ) + "</ul>";
    }

    /**
     * Ordered list renderer
     * @param $ol List to render
     * @returns The HTML
     */
    private ol($ol: JQuery<Element>, level: number): string {
        return "<ol>" + this.renderNodeChildren( $ol , level ) + "</ol>";
    }

    ////////////////////////////////////////////////////////
    // FOOT NOTES
    ////////////////////////////////////////////////////////

    /**
     *  Store a foot note definition
     * @return Always an empty string (this function is for to collect, not for rendering)
     */
    private footnote($footNote: JQuery<Element>, level: number): string {

        // Note HTML
        let noteHtml = this.renderNodeChildren( $footNote , level );
        // Add the note index to the HTML
        const $html = $("<div>").html( noteHtml );
        $html.find(">:first-child").prepend("[" + (this.footNotes.length + 1) + "] ");
        noteHtml = $html.html();
        // Store the note
        const n = {
            id: $footNote.attr("id"),
            html: noteHtml
        };
        this.footNotes.push( n );
        return "";
    }

    /** Foot reference rendering */
    private footref($footRef: JQuery<Element>, level: number): string {

        // Get the foot note id:
        const id: string = $footRef.attr("idref");

        // Render the reference
        return this.renderNodeChildren( $footRef , level ) + this.getHtmlFootRef(id);
    }

    /**
     * Get the HTML of a footer note id
     * @param id The footer note id to search
     * @return The HTML reference, or an empty string
     */
    private getHtmlFootRef(id: string): string {
        this.renderedFootNotesRefs.push( id );
        for (let i = 0, len = this.footNotes.length; i < len; i++) {
            if ( this.footNotes[i].id === id ) {
                return "<sup>" + (i + 1) + "</sup>";
            }
        }
        return "";
    }

    ////////////////////////////////////////////////////////
    // PUZZLES
    ////////////////////////////////////////////////////////

    private puzzle( $puzzle: JQuery<Element> , level: number ): string {
        return "<p>" + this.renderNodeChildren( $puzzle , level ) + "</p>";
    }

    private choose( $choose: JQuery<Element> , level: number ): string {
        // TODO: To be complete, we should evaluate the expression. Not needed on book 5,
        // TODO: just render the otherwise tag
        return this.renderNodeChildren( $choose.children("otherwise") , level ) ;
    }

    ////////////////////////////////////////////////////////
    // OTHER
    ////////////////////////////////////////////////////////

    /** Render line  */
    private line($line: JQuery<Element> , level: number ): string {
        return this.renderNodeChildren( $line , level ) + "<br />";
    }

    /** Render book reference */
    private bookref($bookref: JQuery<Element> , level: number ): string {
        return '<span class="bookref">' +
            this.renderNodeChildren( $bookref , level ) + "</span>";
    }

    /** Player property text */
    private typ($typ: JQuery<Element> , level: number): string {

        const html = this.renderNodeChildren( $typ , level );
        if ( $typ.attr("class") === "attribute" ) {
            return '<span class="attribute">' + html + "</span>";
        } else {
            return html;
        }
    }

    /** Quote renderer */
    private quote($quote: JQuery<Element>, level: number): string {
        return "&ldquo;" + this.renderNodeChildren( $quote , level ) + "&rdquo;";
    }

    /** Links renderer */
    private a($a: JQuery<Element>, level: number): string {

        // Check if it's a anchor target id
        if ( $a.attr("id") ) {
            // Check if its a foot note target
            if ( $a.attr("class") === "footnote" ) {
                // It is. Render its content and the reference to the foot note
                return this.renderNodeChildren( $a , level ) + this.getHtmlFootRef( $a.attr("idref") );
            }

            // Ignore
            return this.renderNodeChildren( $a , level );
        }

        // Check external links (See book 13 > gamerulz)
        const href = $a.attr("href");
        if (href) {
            return '<a href="' + href + '" target="_blank">' + this.renderNodeChildren( $a , level ) + "</a>";
        }

        let open = "";
        let close = "</a>";
        let idRef = $a.attr("idref");
        if ( !idRef ) {
            // Removed link by Book.fixXml. Render as plain text
            idRef = "plaintext";
        }

        switch ( idRef ) {
            case "action":
                // Link to action chart
                open = '<a href="#actionChart">';
                break;
            case "random":
                // Link to random table
                open = '<span class="random">';
                close = "</span>";
                break;
            case "map":
                // Link to map
                open = '<a href="#map">';
                break;
            case "license":
                // Project Aon license link
                open = '<a href="#projectAonLicense">';
                break;
            case "crtable":
                // Combats result table (do not link)
                open = '<a href="#" class="crtable">';
                close = "</a>";
                break;
            case "plaintext":
                // Plain text
                open = "<span>";
                close = "</span>";
                break;
            case "lorecrcl":
                // Lore circles info. Link to "Game rules", specifically to the "Lore circles" section
                open = '<a href="#gameRules?section=lorecrcl">';
                close = "</a>";
                break;
            case "err230":
                // Book 12, sect230: Link to erratas (Plain text)
                open = "<span>";
                close = "</span>";
                break;
            default:
                if ( this.sectionToRender.book.hasSection( idRef ) ) {
                    // Link to other section (ignore)
                    return this.renderNodeChildren( $a , level );
                } else if ( this.sectionToRender.hasTargetLink( idRef ) ) {
                    // Link to anchor on this section. Ignore
                    return this.renderNodeChildren( $a , level );
                } else {
                    throw "a tag: Unknown idref type: " + $a.attr("idref");
                }
        }
        return open + this.renderNodeChildren( $a , level ) + close;
    }

    /**
     * Definition list renderer
     * @param $dl List to render
     * @returns The HTML
     */
    private dl($dl: JQuery<Element>, level: number): string {
        let definitionContent = "";
        const self = this;

        for ( const element of $dl.find("> dt, > dd").toArray() ) {
            const $this = $(element);
            const content = self.renderNodeChildren( $this , level );
            if ( $this.is("dt") ) {
                definitionContent += "<tr><td><dl><dt>" + content + "</dt>";
            } else if ( $this.is("dd") ) {
                definitionContent += "<dd>" + content + "</dd></dl></td></tr>";
 }
        }

        return '<table class="table table-striped table-bordered table-dl"><tbody>' +
            definitionContent + "</tbody></table>";

    }

    /** Choice links renderer */
    private link_text($linkText: JQuery<Element>, level: number): string {
        const section = $linkText.parent().attr("idref");
        return '<a href="#" class="action choice-link" data-section="' + section +
            '">' + this.renderNodeChildren( $linkText , level ) + "</a>";
    }

    /**
     * Choice renderer
     * @param $choice Choice to render
     * @returns The HTML
     */
    private choice($choice: JQuery<Element>, level: number): string {

        return '<p class="choice"><span class="glyphicon glyphicon-chevron-right"></span> ' +
            this.renderNodeChildren( $choice , level ) + "</p>";
    }

    /**
     * Render an illustration
     * @param section The ill. Section owner
     * @param $illustration Illustration to render (jQuery)
     * @returns The illustration HTML
     */
    public static renderIllustration(section: Section, $illustration: any ): string {
        const renderer = new SectionRenderer(section);
        return renderer.illustration($illustration, 0);
    }

    /**
     * Illustration renderer
     * @param $illustration Illustration to render
     * @returns The HTML
     */
    private illustration($illustration: JQuery<Element>, level: number): string {

        const creator: string = $illustration.find("> meta > creator").text();
        if ( !SectionRenderer.toRenderIllAuthors.contains( creator ) ) {
            // Author images not distributed
            console.log( "Illustration of " + creator + " author not rendered");
            return "";
        }

        let illustrationContent = "";
        const description = $illustration.find("> meta > description").text();

        const fileName: string = $illustration.find("> instance.html").attr("src");
        // Get the translated image URL:
        const source = this.sectionToRender.book.getIllustrationURL(fileName,
            this.sectionToRender.mechanics);

        const isLargeIllustration = (fileName.indexOf("ill") === 0);
        illustrationContent += '<div class="illustration' +
            (isLargeIllustration ? " ill" : "") +
            '"><img src="' + source + '" alt="' + description +
            '" title="' + description + '"></div><p class="illustration-label">' +
            description + "</p>";

        if ( this.renderIllustrationsText ) {
            // Render the text instance too
            const $textInstance = $illustration.find("> instance.text");
            if ( $textInstance ) {
                illustrationContent += this.renderNodeChildren( $textInstance , level );
            }
        }

        return illustrationContent;
    }

    /**
     * Dead end renderer
     * @param $deadend Dead end to render
     * @returns The HTML
     */
    private deadend( $deadend: JQuery<Element>, level: number ): string {
        /*return '<ul class="list-table deadend"><li class="title">' +
            this.renderNodeChildren( $deadend , level ) + '</li></ul>'*/
        return "<p>" + this.renderNodeChildren( $deadend , level ) + "</p>";
    }

    /** Onomatopoeia renderer */
    private onomatopoeia( $onomatopoeia: JQuery<Element> , level: number ): string {
        return "<i>" + this.renderNodeChildren( $onomatopoeia , level ) + "</i>";
    }

    /** Foreign language renderer */
    private foreign( $foreign: JQuery<Element> , level: number ): string {
        return "<i>" + this.renderNodeChildren( $foreign , level ) + "</i>";
    }

    /** Spell language renderer */
    private spell( $spell: JQuery<Element> , level: number ): string {
        return "<i>" + this.renderNodeChildren( $spell , level ) + "</i>";
    }

    public static getEnemyEndurance( $combat: JQuery<Element> ): any {
        let $enduranceAttr = $combat.find("enemy-attribute[class=endurance]");
        if ( $enduranceAttr.length === 0 ) {
            // Book 6 / sect26: The endurance attribute is "target"
            $enduranceAttr = $combat.find("enemy-attribute[class=target]");
        }
        if ( $enduranceAttr.length === 0 ) {
            // Book 6 / sect156: The endurance attribute is "resistance"
            $enduranceAttr = $combat.find("enemy-attribute[class=resistance]");
        }
        if ( $enduranceAttr.length === 0 ) {
            // Book 9 / sect3 (Spanish version bug)
            $enduranceAttr = $combat.find("enemy-attribute[class=RESISTENCIA]");
        }
        return $enduranceAttr;
    }

    public static getEnemyCombatSkill( $combat: JQuery<Element> ): any {
        let $cs = $combat.find(".combatskill");
        if ( $cs.length === 0 ) {
            // Book 9 / sect3 (Spanish version bug)
            $cs = $combat.find('enemy-attribute[class="DESTREZA EN EL COMBATE"]');
        }
        return $cs;
    }

    /**
     * Combat renderer
     * @param $combat Combat to render
     * @returns The HTML
     */
    private combat( $combat: JQuery<Element> , level: number ): string {
        const enemyHtml = this.renderNodeChildren( $combat.find("enemy") , level );
        const combatSkill = SectionRenderer.getEnemyCombatSkill( $combat ).text();
        const endurance = SectionRenderer.getEnemyEndurance( $combat ).text();
        return '<div class="combat well"><b>' + enemyHtml + "</b><br />" +
            '<span class="attribute">' + translations.text("combatSkillUpper") + "</span>: " +
            combatSkill +
            ' &nbsp;&nbsp; <span class="attribute">' + translations.text("enduranceUpper") + "</span>: " +
            '<span class="enemy-current-endurance">' + endurance +
            "</span> / " +
            endurance + "</div>";
    }

    /**
     * Inner sections renderer
     * @param $section Inner section to render
     * @returns The HTML
     */
    private section( $section: JQuery<Element> , level: number ): string {
        const sectionId = $section.attr("id");
        const innerSectionData = $section.find("data").first();
        const headingLevel = level + 1;
        let sectionContent = '<div class="subsection" id="' + sectionId +
            '"><h4 class="subsectionTitle">' +
            $section.find( "> meta > title").text() + "</h4>";
        sectionContent += this.renderNodeChildren(innerSectionData, level + 1);
        sectionContent += "</div>";
        return sectionContent;
    }

    private signpost( $signpost: JQuery<Element> , level: number ): string {
        return '<div class="signpost">' +  this.renderNodeChildren( $signpost , level ) +
            "</div>";
    }

    private poetry( $poetry: JQuery<Element> , level: number ): string {
        return '<blockquote class="poetry">' + this.renderNodeChildren( $poetry , level ) +
            "</blockquote>";
    }

    private thought( $thought: JQuery<Element> , level: number ): string {
        return "<i>" + this.renderNodeChildren( $thought , level ) + "</i>";
    }
}
