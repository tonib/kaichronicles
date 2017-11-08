/// <reference path="../external.ts" />

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
    private static toRenderIllAuthors = [ 'Gary Chalk' , 'Brian Williams' ];

    /** The section to render */
    public sectionToRender : Section;

    /** 
     * The footnotes HTML.
     * The key is the foot note id, and the value is the foot note HTML
     * */
    private footNotes : Array< { [id : string] : string } > = [];

    /**
     * List of renderend foot note references ids.
     * Needed to avoid render not referenced foot notes
     */
    private renderedFootNotesRefs : Array <string> = [];

    /** Render text illustration instances for this section?  */
    public renderIllustrationsText = false;

    /**
     * Constructor
     * @param section The section to render
     */
    public constructor(section : Section) {
        this.sectionToRender = section;
    }

    /**
     * Get the HTML for the given book section
     * @return The HTML 
     */
    public renderSection() : string {

        // Collect foot notes
        var footNotes = this.sectionToRender.getFootNotesXml();
        if( footNotes.length > 0 )
            this.renderNodeChildren( footNotes , 0 );

        // Render the section body
        var html = this.renderNodeChildren( $(this.sectionToRender.data) , 0 );

        // Render foot notes
        if( footNotes.length > 0 ) {
            html += '<hr/><div class="footnotes">';
            for (var i = 0, len = this.footNotes.length; i < len; i++) {
                if( this.renderedFootNotesRefs.contains( this.footNotes[i].id ) )
                    html += this.footNotes[i].html;
                else
                    console.log( this.sectionToRender.sectionId + ': Footnote ' + this.footNotes[i].id + 
                        ' not rendered because its not referenced' );
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
    public renderNodeChildren($tag : any, level : number ) : string {
        
        
        // The HTML to return
        var sectionContent = '';

        // Traverse all child elements, except separated sections
        //var children = $tag.contents().not('section.frontmatter-separate');
        var children = $tag.contents();
        for( var i=0; i<children.length; i++ ) {
            var node = children[i];
            
            if( node.nodeType == 3 ) {
                // Text node
                sectionContent += node.textContent;
                continue;
            }

            if( node.nodeType != 1 )
                // Not a node, skip it
                continue;

            // Get the tag name
            var tagName = node.tagName.toLowerCase();
            // Replace '-' char by '_' (not valid char for javascript function names)
            tagName = tagName.replaceAll('-' , '_');

            var $node = $(node);

            if( tagName == 'section' && $node.attr('class') == 'frontmatter-separate' )
                // Ignore separated sections
                continue;

            // Call the function renderer (this class method with the tag name)
            if( !this[tagName] )
                throw this.sectionToRender.sectionId + ': Unkown tag: ' + tagName;
            else {
                try {
                    sectionContent += this[tagName]( $node , level );
                }
                catch(e) {
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
    private renderHtmlNode($node : any, level : number) : string {
        var name = $node[0].nodeName;
        return '<' + name + '>' + this.renderNodeChildren( $node , level ) + 
            '</' + name + '>';
    }
        
    /** Paragraph renderer  */
    private p($node : any, level : number) : string { return this.renderHtmlNode( $node , level ); }

    /** List item renderer  */
    private li($node : any, level : number) : string { return this.renderHtmlNode( $node , level ); }

    /** blockquote renderer */
    private blockquote($node : any, level : number) : string { return this.renderHtmlNode( $node , level ); }

    /** Line break renderer */
    private br($node : any, level : number) : string { return this.renderHtmlNode( $node , level ); }

    /** Cite renderer */
    private cite($node : any, level : number) : string { return this.renderHtmlNode( $node , level ); }

    /** Emphasized renderer */
    private em($node : any, level : number) : string { return this.renderHtmlNode( $node , level ); }

    /** Strong renderer */
    private strong($node : any, level : number) : string { return this.renderHtmlNode( $node , level ); }

    ////////////////////////////////////////////////////////
    // PLAIN TEXT RENDERING
    ////////////////////////////////////////////////////////

    /** Render node as plain text*/
    private renderPlainText = function($node : any, level : number) : string {
        return this.renderNodeChildren( $node , level );
    }

    ////////////////////////////////////////////////////////
    // LISTS RENDERING
    ////////////////////////////////////////////////////////

    /**
     * Unordered list renderer
     * @param $ul List to render
     * @return The HTML
     */
    private ul($ul : any, level : number) : string {
        return '<ul class="list-table">' + this.renderNodeChildren( $ul , level ) + '</ul>';
    }

    /**
     * Ordered list renderer
     * @param $ol List to render
     * @returns The HTML
     */
    private ol($ol : any, level : number) : string {
        return '<ol>' + this.renderNodeChildren( $ol , level ) + '</ol>';
    }

    ////////////////////////////////////////////////////////
    // FOOT NOTES
    ////////////////////////////////////////////////////////

    /** 
     *  Store a foot note definition
     * @return Always an empty string (this function is for to collect, not for rendering) 
     */
    private footnote($footNote : any, level : number) : string {
        
        // Note HTML
        var noteHtml = this.renderNodeChildren( $footNote , level );
        // Add the note index to the HTML
        var $html = $('<div>').html( noteHtml );
        $html.find(">:first-child").prepend('[' + (this.footNotes.length + 1) + '] ');
        noteHtml = $html.html();
        // Store the note
        var n = {
            id: $footNote.attr('id'),
            html: noteHtml
        };
        this.footNotes.push( n );
        return '';
    }

    /** Foot reference rendering */
    private footref($footRef : any, level : number) : string {

        // Get the foot note id:
        const id : string = $footRef.attr('idref');

        // Render the reference
        return this.renderNodeChildren( $footRef , level ) + this.getHtmlFootRef(id);
    }

    /**
     * Get the HTML of a footer note id
     * @param id The footer note id to search
     * @return The HTML reference, or an empty string
     */
    private getHtmlFootRef(id : string ) : string {
        this.renderedFootNotesRefs.push( id );
        for (var i = 0, len = this.footNotes.length; i < len; i++) {
            if( this.footNotes[i].id == id )
                return '<sup>' + (i + 1) + '</sup>';
        }
        return '';
    }

    ////////////////////////////////////////////////////////
    // PUZZLES
    ////////////////////////////////////////////////////////

    private puzzle( $puzzle : any , level : number ) : string {
        return '<p>' + this.renderNodeChildren( $puzzle , level ) + '</p>';
    }

    private choose( $choose : any , level : number ) : string {
        // TODO: To be complete, we should evaluate the expression. Not needed on book 5,
        // TODO: just render the otherwise tag
        return this.renderNodeChildren( $choose.children('otherwise') , level ) ;
    }

    ////////////////////////////////////////////////////////
    // OTHER
    ////////////////////////////////////////////////////////

    /** Render line  */
    private line($line : any , level : number ) : string {
        return this.renderNodeChildren( $line , level ) + '<br />';
    }

    /** Render book reference */
    private bookref($bookref : any , level : number ) : string {
        return '<span class="bookref">' + 
            this.renderNodeChildren( $bookref , level ) + '</span>';
    }

    /** Player property text */
    private typ($typ : any , level : number) : string {

        var html = this.renderNodeChildren( $typ , level );
        if( $typ.attr('class') == 'attribute' )
            return '<span class="attribute">' + html + '</span>';
        else
            return html;
    }

    /** Quote renderer */
    private quote($quote : any, level : number) : string {
        return '&ldquo;' + this.renderNodeChildren( $quote , level ) + '&rdquo;';
    }

    /** Links renderer */
    private a($a : any, level: number) : string {

        // Check if it's a anchor target id
        if( $a.attr('id') ) {
            // Check if its a foot note target
            if( $a.attr('class') == 'footnote' ) {
                // It is. Render its content and the reference to the foot note
                return this.renderNodeChildren( $a , level ) + this.getHtmlFootRef( $a.attr('idref') );
            }

            // Ignore
            return this.renderNodeChildren( $a , level );
        }

        var open = '', close="</a>";
        var idRef = $a.attr('idref');
        if( !idRef )
            // Removed link by Book.fixXml. Render as plain text
            idRef = 'plaintext';
            
        switch( idRef ) {
            case 'action':
                // Link to action chart
                open = '<a href="#actionChart">';
                break;
            case 'random':
                // Link to random table
                open = '<span class="random">';
                close = '</span>';
                break;           
            case 'map':
                // Link to map
                open = '<a href="#map">';
                break;
            case 'license':
                // Project Aon license link
                open = '<a href="#projectAonLicense">';
                break;
            case 'crtable':
                // Combats result table (do not link)
                open = '<a href="#" class="crtable">';
                close = '</a>';
                break;
            case 'plaintext':
                // Plain text
                open = '<span>';
                close = '</span>';
                break;
            case 'lorecrcl':
                // Lore circles info. Link to "Game rules", specifically to the "Lore circles" section
                open = '<a href="#gameRules?section=lorecrcl">';
                close = '</a>';
                break;
            default:
                if( this.sectionToRender.book.hasSection( idRef ) )
                    // Link to other section (ignore)
                    return this.renderNodeChildren( $a , level );
                else if( this.sectionToRender.hasTargetLink( idRef ) )
                    // Link to anchor on this section. Ignore
                    return this.renderNodeChildren( $a , level );
                else 
                    throw 'a tag: Unknown idref type: ' + $a.attr('idref');
        }
        return open + this.renderNodeChildren( $a , level ) + close;
    }

    /**
     * Definition list renderer
     * @param $dl List to render
     * @returns The HTML
     */
    private dl($dl : any, level : number) : string {
        var definitionContent = '';
        var self = this;
        $dl.find('> dt, > dd').each(function() {
            var content = self.renderNodeChildren( $(this) , level );
            if ($(this).is('dt')) {
                definitionContent += '<tr><th>' + content + '</th>';
            } else if ($(this).is('dd')) {
                definitionContent += '<td>' + content + '</tr></td>';
            }
        });
        return '<table class="table table-striped table-bordered"><tbody>' + 
            definitionContent + '</tbody></table>';

    }

    /** Choice links renderer */
    private link_text($linkText : any, level : number) : string {
        var section = $linkText.parent().attr('idref');
        return '<a href="#" class="action choice-link" data-section="'+ section + 
            '">' + this.renderNodeChildren( $linkText , level ) + '</a>';
    }

    /**
     * Choice renderer
     * @param $choice Choice to render
     * @returns The HTML
     */
    private choice($choice : any, level : number) : string {

        return '<p class="choice"><span class="glyphicon glyphicon-chevron-right"></span> ' + 
            this.renderNodeChildren( $choice , level ) + '</p>';
    }


    /**
     * Illustration renderer
     * @param $illustration Illustration to render
     * @returns The HTML
     */
    private illustration($illustration : any, level : number) : string {
        
        const creator : string = $illustration.find('> meta > creator').text();
        if( !SectionRenderer.toRenderIllAuthors.contains( creator ) ) {
            // Author images not distributed
            console.log( 'Illustration of ' + creator + ' author not rendered');
            return '';
        }

        var illustrationContent = '';
        var description = $illustration.find('> meta > description').text();

        const fileName : string = $illustration.find('> instance.html').attr('src');
        // Get the translated image URL:
        var source = this.sectionToRender.book.getIllustrationURL(fileName, 
            this.sectionToRender.mechanics);

        var isLargeIllustration = (fileName.indexOf('ill') === 0);
        illustrationContent += '<div class="illustration' + 
            (isLargeIllustration ? ' ill' : '') + 
            '"><img src="' + source + '" alt="' + description + 
            '" title="' + description + '"></div><p class="illustration-label">' + 
            description + '</p>';
        
        if( this.renderIllustrationsText ) {
            // Render the text instance too
            var $textInstance = $illustration.find('> instance.text');
            if( $textInstance )
                illustrationContent += this.renderNodeChildren( $textInstance , level );
        }

        return illustrationContent;
    }

    /**
     * Dead end renderer
     * @param $deadend Dead end to render
     * @returns The HTML
     */
    private deadend( $deadend : any, level : number ) : string {
        /*return '<ul class="list-table deadend"><li class="title">' +
            this.renderNodeChildren( $deadend , level ) + '</li></ul>'*/
        return '<p>' + this.renderNodeChildren( $deadend , level ) + '</p>';
    }

    /** Onomatopoeia renderer */
    private onomatopoeia( $onomatopoeia : any , level : number ) : string {
        return '<i>' + this.renderNodeChildren( $onomatopoeia , level ) + '</i>';
    }

    /** Foreign language renderer */
    private foreign( $foreign : any , level : number ) : string {
        return '<i>' + this.renderNodeChildren( $foreign , level ) + '</i>';    
    }

    public static getEnemyEndurance( $combat : any ) : any {
        var $enduranceAttr = $combat.find('enemy-attribute[class=endurance]');
        if( $enduranceAttr.length == 0 )
            // Book 6 / sect26: The endurance attribute is "target"
            $enduranceAttr = $combat.find('enemy-attribute[class=target]');
        if( $enduranceAttr.length == 0 )
            // Book 6 / sect156: The endurance attribute is "resistance"
            $enduranceAttr = $combat.find('enemy-attribute[class=resistance]');
        return $enduranceAttr;
    }

    /**
     * Combat renderer
     * @param $combat Combat to render
     * @returns The HTML
     */
    private combat( $combat : any , level : number ) : string {
        let enemyHtml = this.renderNodeChildren( $combat.find('enemy') , level );
        var combatSkill = $combat.find('.combatskill').text();
        var endurance = SectionRenderer.getEnemyEndurance( $combat ).text();
        return '<div class="combat well"><b>' + enemyHtml + '</b><br />' + 
            '<span class="attribute">' + translations.text('combatSkillUpper') + '</span>: ' + 
            combatSkill + 
            ' &nbsp;&nbsp; <span class="attribute">' + translations.text('enduranceUpper') + '</span>: ' + 
            '<span class="enemy-current-endurance">' + endurance + 
            '</span> / ' + 
            endurance + '</div>';
    }
    
    /**
     * Inner sections renderer
     * @param $section Inner section to render
     * @returns The HTML
     */
    private section( $section : any , level : number ) : string {
        var sectionId = $section.attr('id');
        var innerSectionData = $section.find('data').first();
        var headingLevel = level + 1;
        var sectionContent = '<div class="subsection" id="' + sectionId + 
            '"><h4 class="subsectionTitle">' + 
            $section.find( '> meta > title').text() + '</h4>';
        sectionContent += this.renderNodeChildren(innerSectionData, level + 1);
        sectionContent += '</div>';
        return sectionContent;
    }

    private signpost( $signpost : any , level : number ) : string {
        return '<div class="signpost">' +  this.renderNodeChildren( $signpost , level ) + 
            '</div>';
    }

    private poetry( $poetry : any , level : number ) : string {
        return '<blockquote class="poetry">' + this.renderNodeChildren( $poetry , level ) + 
            '</blockquote>';
    }

    private thought( $thought : any , level : number ) : string {
        return '<i>' + this.renderNodeChildren( $thought , level ) + '</i>';
    }
}