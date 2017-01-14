
/**
 * The game mechanics
 * @param book The Book where to apply the mechanics 
 */
function Mechanics(book) {
    this.book = book;
    this.mechanicsXml = null;
    this.objectsXml = null;
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
    return $section.length == 0 ? null : $section;
};

/**
 * Returns a JS object with the object properties. null if it was not found
 */
Mechanics.prototype.getObject = function(objectId) {

    var $o = $(this.objectsXml).find('*[id=' + objectId + ']');
    if( $o.length == 0 ) {
        console.log("Object " + objectId + " not found");
        return null;
    }

    return new Item(this.book, $o, objectId);
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

