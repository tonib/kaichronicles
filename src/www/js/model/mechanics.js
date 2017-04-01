
/**
 * The game mechanics
 * @param book The Book where to apply the mechanics 
 */
function Mechanics(book) {
    this.book = book;
    this.mechanicsXml = null;
    this.objectsXml = null;
    /**
     * Cache of book objects. Key is the object id. Value is the object Item 
     */
    this.objectsCache = {};
}

/**
 * Start the download of the mechanics XML
 * @return Promise with the download
 */
Mechanics.prototype.downloadXml = function() {

    var self = this;
    return $.ajax({
        url: this.getXmlURL(),
        dataType: "xml"
    })
    .done(function(xml) {
        self.mechanicsXml = xml;
    });
};

/**
 * Returns the book XML URL
 */
Mechanics.prototype.getXmlURL = function() {
    return "data/mechanics-" + this.book.bookNumber + ".xml";
};

/**
 * Start the download of the objects XML
 * @return Promise with the download
 */
Mechanics.prototype.downloadObjectsXml = function() {

    var self = this;
    return $.ajax({
        url: this.getObjectsXmlURL(),
        dataType: "xml"
    })
    .done(function(xml) {
        self.objectsXml = xml;
    });
};

/**
 * Returns the objects XML URL
 */
Mechanics.prototype.getObjectsXmlURL = function() {
    return "data/objects.xml";
};

/**
 * Returns an jquery object with the section mechanics XML. null if there are no mechanics
 */
Mechanics.prototype.getSection = function(sectionId) {
    var $section = $(this.mechanicsXml)
        .find('mechanics > sections > section[id=' + sectionId + ']');
    return $section.length === 0 ? null : $section;
};

/**
 * Returns a JS object with the object properties. null if it was not found
 */
Mechanics.prototype.getObject = function(objectId) {

    // Try to get the object from the cache:
    var o = this.objectsCache[objectId];
    if( o )
        return o;

    var $o = $(this.objectsXml).find('*[id=' + objectId + ']');
    if( $o.length === 0 ) {
        console.log("Object " + objectId + " not found");
        return null;
    }

    // Parse the object info, and store it on the cache
    o = new Item(this.book, $o, objectId);
    this.objectsCache[objectId] = o;

    return o;
};

/**
 * Clear the objects cache (due to a book language change)
 */
Mechanics.prototype.clearObjectsCache = function() {
    this.objectsCache = {};
};

/**
 * Get a jquery selector for a give rule, relative to the "section" parent
 * @return {string} The jquery selector for the rule inside the section  
 */
Mechanics.getRuleSelector = function(rule) {

    // Get nodes from the section rule to the given rule
    //var $path = $( $(rule).parentsUntil( 'section' ).andSelf().get().reverse() );
    var $path = $(rule).parentsUntil( 'section' ).andSelf();

    // Build the jquery selector:
    return $path
        .map(function( index , node ) {
            var txt = node.nodeName;
            $.each( node.attributes , function( index , attribute ) {
                txt += '[' + attribute.name + "='" + attribute.value + "']";
            } );
            return txt;
        })
        .get()
        .join( ' > ' );
};

/**
 * Check if a image is translated
 * @param {string} fileName The image file name
 * @return true if the image is translated
 */
Mechanics.prototype.imageIsTranslated = function(fileName) {

    return $(this.mechanicsXml)
        .find('translated-images > image:contains("' + fileName + '")')
        .length > 0;
};

/**
 * Search a "registerGlobalRule" tag by its id
 * @param {string} id The global rule container id to return
 * @return {object} The XML tag found
 */
Mechanics.prototype.getGlobalRule = function(id) {
    return $(this.mechanicsXml).find('registerGlobalRule[id=' + id + ']').first();
};

/**
 * Return the number of numbered secions on the book
 */
Mechanics.prototype.getSectionsCount = function() {
    var $sections = $(this.mechanicsXml).find('mechanics > sections');
    var count = $sections.attr('count');
    if(!count)
        // Default is 350
        count = '350';
    return parseInt(count);
};

/**
 * Return the id of the book last section
 */
Mechanics.prototype.getLastSectionId = function() {
    return 'sect' + this.getSectionsCount();
};
