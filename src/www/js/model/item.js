
/**
 * Game object information
 * @param {Book} book The owner book
 * @param {jquery} $o The XML tag with the object info
 * @param {string} objectId The object identifier 
 */
function Item(book, $o, objectId) {

    /** The object type ('special', 'object' or 'weapon' ) */
    this.type = $o.prop("tagName");
    /** The object id */
    this.id = objectId;
    /** The translated object name */
    this.name = $o.find('name[lang=' + book.language + ']').text();
    /** True if the object is a meal */
    this.isMeal = $o.attr('isMeal') == 'true';
    /** True if the object can be dropped */
    this.droppable = $o.attr('droppable') != 'false';

    /** Number of items the object it occupies on the backpack */
    this.itemCount = $o.attr('itemCount');
    this.itemCount = this.itemCount ? parseInt( this.itemCount ) : 1;

    /** The translated object description */
    this.description = $o.find('description[lang=' + book.language + ']').text();
    if( this.itemCount > 1 ) {
        // Add description of the size used 
        if( this.description )
            this.description += ' ';
        this.description += translations.text( 'countAsObjects' , [this.itemCount] );
    }
        

    /** 
     * The weapon type. Only for special and object types. It is the kind of weapon.
     * If it can be handled as more than one weapon type, separate the with a '|'.
     * Ex. 'sword|shortsword'
     */
    this.weaponType = $o.attr('weaponType');

    // Object image
    var $image = $o.find('image');
    if( $image.length > 0 ) {
        var bookNumber = parseInt( $image.attr('book') );
        var imageBook = new Book( bookNumber , state.book.language );
        // Get the object image URL, untranslated
        this.imageUrl = imageBook.getIllustrationURL( $image.attr('name') );
        /** 
         * The referenced book. Needed to check if the book has been downloaded on the Cordova app
         */
        this.imageBookNumber = bookNumber;
    }

    // Usage (only one use, and then the object is dropped)
    var $usage = $o.find('usage');
    if( $usage.length > 0 ) {
        this.usage = {
            cls: $usage.attr('class'),
            increment: parseInt( $usage.attr('increment') ) 
        };
    }

    // Effect (when the player carry the object)
    var $effect = $o.find('effect');
    if( $effect.length > 0 ) {
        this.effect = {
            cls: $effect.attr('class'),
            increment: parseInt( $effect.attr('increment') ) 
        };
    }

    // Incompatibilities
    this.incompatibleWith = $o.attr('incompatibleWith');

    // If it's the map, add description from the book:
    if( objectId == 'map' ) {
        var mapSection = new Section( book , 'map', null);
        if( mapSection.exists() )
            this.description = mapSection.getTitleText();
    }

}

/** Returns true if the object is a weapon */
Item.prototype.isWeapon = function() {
    return this.type == 'weapon' || this.weaponType; 
};

/**
 * Returns true if the object is a weapon of a given type
 * @param {string} weaponType The weapon type to check
 * @return True if the object is a weapon of the given type
 */
Item.prototype.isWeaponType = function(weaponType) {
    if( this.id == weaponType )
        return true;
    if( this.weaponType )
        return this.weaponType.split('|').contains( weaponType ); 
    return false;
};

/**
 * Get the object image URL.
 * @return {string} The object image URL. null if the object has no image or we are
 * running the Cordova app and the book for the image is not downloaded
 */
Item.prototype.getImageUrl = function() {

    if( !this.imageUrl )
        return null;

    // Cordova app: Check if the book where is the image is downloaded
    if( !state.localBooksLibrary.isBookDownloaded( this.imageBookNumber ) )
        return null;
    
    return this.imageUrl;
};
