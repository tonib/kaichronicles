
/**
 * Section constructor from the Book XML
 * @param {Book} book The owner Book
 * @param {string} sectionId The section ID to load 
 */
function Section(book, sectionId) {
    
    /** The section id */
    this.sectionId = sectionId;
    this.book = book;
    this.$xmlSection = book.getSectionXml( sectionId);
    // There can be nested sections, get the first one (the root)
    this.data =  this.$xmlSection.find('data').first();
}

/**
 * Return false if the section noes not exists 
 */
Section.prototype.exists = function() {
    return this.$xmlSection.length > 0;
} 

/**
 * Return true if the section has navigation links 
 */
Section.prototype.hasNavigation = function() {
    return this.$xmlSection.find('link[class=next]').length > 0;
} 

/**
 * Return the section number. null if it has no number 
 */
Section.prototype.getSectionNumber = function() {
    if( this.$xmlSection.attr('class') != 'numbered' )
        return null;
    // Id is "sectXXX"
    return parseInt( this.sectionId.substring(4) );
}

/**
 * Returns the previous section id
 */
Section.prototype.getNextSectionId = function() {
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
Section.prototype.getPreviousSectionId = function() {
    var link = this.$xmlSection.find('link[class=prev]');
    if( link.length > 0 )
        return link.attr('idref');

    var sNumber = this.getSectionNumber();
    if( sNumber ) {
        if( sNumber == 1 )
            return 'kaiwisdm'
        else
            return 'sect' + ( sNumber - 1 );
    }

    return null; 
}

/**
 * Returns the section HTML
 */
Section.prototype.getHtml = function() {
    return new SectionRenderer( this ).renderSection(); 
};

/**
 * Returns an array of Combat objects with the combats on this section
 * @return {Array<Combat>} Combats on this section
 */
Section.prototype.getCombats = function() {
    var result = [];
    this.$xmlSection.find('combat').each(function(index, combat) {
        result.push( new Combat(  
            $(combat).find('enemy').text(), 
            parseInt( $(combat).find('enemy-attribute[class=combatskill]').text() ),
            parseInt( $(combat).find('enemy-attribute[class=endurance]').text() )
        ));
    });
    return result;
};

/**
 * Get the title text
 */
Section.prototype.getTitleText = function() {
    return this.$xmlSection.find('title').first().text().unescapeHtml();
};

/**
 * Get the title HTML
 */
Section.prototype.getTitleHtml = function() {
    return this.$xmlSection.find('title').first().text();
};

/**
 * Returns true if the section contains a anchor target with the given id ("<a id="[id]">)
 */
Section.prototype.hasTargetLink = function(id) {
    return this.$xmlSection.find('a[id=' + id + ']').length > 0;
};

/**
 * Returns the foot notes XML node for this section. null if it was not found
 */
Section.prototype.getFootNotesXml = function() {
    return this.$xmlSection.find('footnotes').first();
};

/**
 * Returns the URL of this section on the project aon web site
 */
Section.prototype.getSectionAonPage = function() {
    return this.book.getBookProjectAonHtmlDir() + this.sectionId + ".htm";
};

