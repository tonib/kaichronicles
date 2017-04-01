/*
 * This file contains code taken from Lone Wolf Adventures, 
 * by Liquid State Limited.
 */

/**
 * Tool to transform the book XML to HTML
 * @param {Section} section The Section to render 
 */
function SectionRenderer(section) {
    /** {Section} The section to render */
    this.sectionToRender = section;
    /** {Array<{{ {string} id : {string} html }}>} The footnotes HTML */
    this.footNotes = [];
    /** Render text illustration instances for this section?  */
    this.renderIllustrationsText = false;
}

/**
 * Get the HTML for the given book section
 * @return The HTML 
 */
SectionRenderer.prototype.renderSection = function() {

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
            html += this.footNotes[i].html;
        }
        html += "</div>";
    }

    return html;
};

/**
 * Get the HTML for children of a given book XML tag
 * @param {jquery} $tag The XML tag to render
 * @param {number} level The nesting level index of the tag
 * @return {string} The HTML 
 */
SectionRenderer.prototype.renderNodeChildren = function($tag, level) {
    
    
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
};


////////////////////////////////////////////////////////
// HTML DIRECT RENDERING
////////////////////////////////////////////////////////

/** Render nodes with the same meaning on book XML and HTML */
SectionRenderer.prototype.renderHtmlNode = function($node, level) {
    var name = $node[0].nodeName;
    return '<' + name + '>' + this.renderNodeChildren( $node , level ) + 
        '</' + name + '>';
};
/** Paragraph renderer  */
SectionRenderer.prototype.p = SectionRenderer.prototype.renderHtmlNode;
/** List item renderer  */
SectionRenderer.prototype.li = SectionRenderer.prototype.renderHtmlNode;
/** blockquote renderer */
SectionRenderer.prototype.blockquote = SectionRenderer.prototype.renderHtmlNode;
/** Line break renderer */
SectionRenderer.prototype.br = SectionRenderer.prototype.renderHtmlNode;
/** Cite renderer */
SectionRenderer.prototype.cite = SectionRenderer.prototype.renderHtmlNode;
/** Emphasized renderer */
SectionRenderer.prototype.em = SectionRenderer.prototype.renderHtmlNode;
/** Strong renderer */
SectionRenderer.prototype.strong = SectionRenderer.prototype.renderHtmlNode;

////////////////////////////////////////////////////////
// PLAIN TEXT RENDERING
////////////////////////////////////////////////////////

/** Render node as plain text*/
SectionRenderer.prototype.renderPlainText = function($node, level) {
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
SectionRenderer.prototype.ul = function($ul, level) {
    return '<ul class="list-table">' + this.renderNodeChildren( $ul , level ) + '</ul>';
};

/**
 * Ordered list renderer
 * @param $ol List to render
 * @returns The HTML
 */
SectionRenderer.prototype.ol = function($ol, level) {
    return '<ol>' + this.renderNodeChildren( $ol , level ) + '</ol>';
};

////////////////////////////////////////////////////////
// FOOT NOTES
////////////////////////////////////////////////////////

/** 
 *  Store a foot note definition
 * @return Always an empty string (this function is for to collect, not for rendering) 
 */
SectionRenderer.prototype.footnote =  function($footNote , level) {
    
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
};

/** Foot reference rendering */
SectionRenderer.prototype.footref = function($footRef, level) {

    // Get the foot note id:
    var id = $footRef.attr('idref');
    // Render the reference
    return this.renderNodeChildren( $footRef , level ) + this.getHtmlFootRef(id);
};

/**
 * Get the HTML of a footer note id
 * @param {string} id The footer note id to search
 * @return The HTML reference, or an empty string
 */
SectionRenderer.prototype.getHtmlFootRef = function(id) {
    for (var i = 0, len = this.footNotes.length; i < len; i++) {
        if( this.footNotes[i].id == id )
            return '<sup>' + (i + 1) + '</sup>';
    }
    return '';
};

////////////////////////////////////////////////////////
// PUZZLES
////////////////////////////////////////////////////////

SectionRenderer.prototype.puzzle = function( $puzzle , level ) {
    return '<p>' + this.renderNodeChildren( $puzzle , level ) + '</p>';
};

SectionRenderer.prototype.choose = function( $choose , level ) {
    // TODO: To be complete, we should evaluate the expression. Not needed on book 5,
    // TODO: just render the otherwise tag
    return this.renderNodeChildren( $choose.children('otherwise') , level ) ;
};

////////////////////////////////////////////////////////
// OTHER
////////////////////////////////////////////////////////

/** Render line  */
SectionRenderer.prototype.line = function($line, level) {
    return this.renderNodeChildren( $line , level ) + '<br />';
};

/** Render book reference */
SectionRenderer.prototype.bookref = function($bookref, level) {
    return '<span class="bookref">' + 
        this.renderNodeChildren( $bookref , level ) + '</span>';
};

/** Player property text */
SectionRenderer.prototype.typ = function($typ, level) {

    var html = this.renderNodeChildren( $typ , level );
    if( $typ.attr('class') == 'attribute' )
        return '<span class="attribute">' + html + '</span>';
    else
        return html;
};

/** Quote renderer */
SectionRenderer.prototype.quote = function($quote, level) {
    return '&ldquo;' + this.renderNodeChildren( $quote , level ) + '&rdquo;';
};

/** Links renderer */
SectionRenderer.prototype.a = function($a, level) {

    // Check if it's a anchor target id
    if( $a.attr('id') ) {
        // Check if its a foot note target
        if( $a.attr('class') == 'footnote' )
            return this.getHtmlFootRef( $a.attr('idref') );

        // Ignore
        return this.renderNodeChildren( $a , level );
    }

    var open, close="</a>";
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
};

/**
 * Definition list renderer
 * @param $dl List to render
 * @returns The HTML
 */
SectionRenderer.prototype.dl = function($dl, level) {
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

};

/** Choice links renderer */
SectionRenderer.prototype.link_text = function($linkText, level) {
    var section = $linkText.parent().attr('idref');
    return '<a href="#" class="action choice-link" data-section="'+ section + 
        '">' + this.renderNodeChildren( $linkText , level ) + '</a>';
};

/**
 * Choice renderer
 * @param $choice Choice to render
 * @returns The HTML
 */
SectionRenderer.prototype.choice = function($choice, level) {

    return '<p class="choice"><span class="glyphicon glyphicon-chevron-right"></span> ' + 
        this.renderNodeChildren( $choice , level ) + '</p>';
};

/**
 * Illustration renderer
 * @param $illustration Illustration to render
 * @returns The HTML
 */
SectionRenderer.prototype.illustration = function($illustration, level) {
    
    var illustrationContent = '';
    var creator = $illustration.find('> meta > creator').text();
    var description = $illustration.find('> meta > description').text();
    // Fix single quote markup
    description = description.replace('&rsquot;', '&rsquo;');
    description = description.replace('&lsquot;', '&lsquo;');
    // Fix double quote markup
    description = description.replace('&rdquot;', '&rdquo;');
    description = description.replace('&ldquot;', '&ldquo;');

    if (creator == 'Gary Chalk') { 
        // This app is only for the first 5 books and gives credit to only this 
        // illustrator in the footer, so only use his work (other illustrators images
        // are not stored on the SVN repository)
        var fileName = $illustration.find('> instance.html').attr('src');
        // Get the translated image URL:
        var source = this.sectionToRender.book.getIllustrationURL(fileName, 
            this.sectionToRender.mechanics);

        var isLargeIllustration = (fileName.indexOf('ill') === 0);
        illustrationContent += '<div class="illustration' + 
            (isLargeIllustration ? ' ill' : '') + 
            '"><img src="' + source + '" alt="' + description + 
            '" title="' + description + '"></div><p class="illustration-label">' + 
            description + '</p>';
    }
    
    if( this.renderIllustrationsText ) {
        // Render the text instance too
        var $textInstance = $illustration.find('> instance.text');
        if( $textInstance )
            illustrationContent += this.renderNodeChildren( $textInstance , level );
    }

    return illustrationContent;
    
};


/**
 * Dead end renderer
 * @param $deadend Dead end to render
 * @returns The HTML
 */
SectionRenderer.prototype.deadend = function( $deadend, level ) {
    /*return '<ul class="list-table deadend"><li class="title">' +
        this.renderNodeChildren( $deadend , level ) + '</li></ul>'*/
    return '<p>' + this.renderNodeChildren( $deadend , level ) + '</p>';
};

/** Onomatopoeia renderer */
SectionRenderer.prototype.onomatopoeia = function( $onomatopoeia, level ) {
    return '<i>' + this.renderNodeChildren( $onomatopoeia , level ) + '</i>';
};

/** Foreign language renderer */
SectionRenderer.prototype.foreign = function( $foreign , level ) {
    return '<i>' + this.renderNodeChildren( $foreign , level ) + '</i>';    
};

/**
 * Combat renderer
 * @param $combat Combat to render
 * @returns The HTML
 */
SectionRenderer.prototype.combat = function( $combat , level ) {
    var enemy = $combat.find('enemy').text();
    var combatSkill = $combat.find('.combatskill').text();
    var endurance = $combat.find('.endurance').text();
    return '<div class="combat well"><b>' + enemy + '</b><br />' + 
        '<span class="attribute">' + translations.text('combatSkillUpper') + '</span>: ' + 
        combatSkill + 
        ' &nbsp;&nbsp; <span class="attribute">' + translations.text('enduranceUpper') + '</span>: ' + 
        '<span class="enemy-current-endurance">' + endurance + 
        '</span> / ' + 
        endurance + '</div>';
};

/**
 * Inner sections renderer
 * @param $section Inner section to render
 * @returns The HTML
 */
SectionRenderer.prototype.section = function( $section , level ) {
    var sectionId = $section.attr('id');
    var innerSectionData = $section.find('data').first();
    var headingLevel = level + 1;
    var sectionContent = '<div class="subsection" id="' + sectionId + 
        '"><h4 class="subsectionTitle">' + 
        $section.find( '> meta > title').text() + '</h4>';
    sectionContent += this.renderNodeChildren(innerSectionData, level + 1);
    sectionContent += '</div>';
    return sectionContent;
};

SectionRenderer.prototype.signpost = function( $signpost , level ) {
    return '<div class="signpost">' +  this.renderNodeChildren( $signpost , level ) + 
        '</div>';
};

SectionRenderer.prototype.poetry = function( $poetry , level ) {
    return '<blockquote class="poetry">' + this.renderNodeChildren( $poetry , level ) + 
        '</blockquote>';
};
