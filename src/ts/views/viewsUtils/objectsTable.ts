/// <reference path="../../external.ts" />

/**
 * Kind of objects table
 */
enum ObjectsTableType {
    /** Availabe objects on section (free of for buy ) */
    AVAILABLE,
    /** Sell inventory objects */
    SELL,
    /** Inventory objects */
    INVENTORY
}

/**
 * Item on a objects table to render
 */
class ObjectsTableItem {

    /** The section/inventory context object information */
    private objectInfo : SectionItem;

    /** The object information */
    private item : Item;

    /** The table type */
    private type : ObjectsTableType;

    /**
     * Constructor
     * @param type Table type
     * @param itemInfo Object info. It can be a string with the object id, or a SectionItem with the object info
     * on the section
     */
    constructor( type : ObjectsTableType = ObjectsTableType.AVAILABLE , itemInfo : any = null ) {
        this.type = type;
        this.objectInfo = this.toSectionItem( itemInfo );

        // Get the object info
        if( this.objectInfo )
            this.item = state.mechanics.getObject( this.objectInfo.id );
    }

    public renderItem() : string {
        let html = this.getItemDescription();
        if( !html )
            // Item should not be rendered
            return html;

        return this.getItemOperations() + html;
    }

    /**
     * Returns the object description HTML. 
     * Empty string if the object should not be rendered
     */
    private getItemDescription() : string {

        if( !this.item )
            return null;

        // If it's a sell table, and we don't have the object, do not show it
        if( this.type == ObjectsTableType.SELL  ) {
            if( !state.actionChart.hasObject( this.objectInfo.id ) )
                return '';
            // We don't have enougth arrows to sell, do not show
            if( this.objectInfo.id == 'quiver' && state.actionChart.arrows < this.objectInfo.count )
                return '';
        }

        var html = '';

        // Name
        var name = this.item.name;

        // Number of arrows on the quiver
        if( this.objectInfo.id == 'quiver' && this.objectInfo.count )
            name += ' (' + this.objectInfo.count + ' ' + translations.text('arrows') + ')';

        // Money amount
        if( this.objectInfo.id == 'money' && this.objectInfo.count )
            name += ' (' + this.objectInfo.count + ' ' + translations.text('goldCrowns') + ')';

        // Buy / sell price
        if( this.objectInfo.price )
            name += ' (' + this.objectInfo.price + ' ' + translations.text('goldCrowns') + ')';

        // Objet Image
        var imageUrl = this.item.getImageUrl();
        if( imageUrl ) {
            html += '<span class="inventoryImgContainer"><img class="inventoryImg" src=' + 
                imageUrl + ' /></span>';
        }
        
        // Special
        if( this.objectInfo.id == 'map' )
            // It's the map:
            name = '<a href="#map">' + name + '</a>';
        else if( imageUrl )
            // Add a link to view a larger version of the image
            name = '<a href="#" class="equipment-op" data-op="details" data-objectId="' + 
            this.item.id + '">' + name + '</a>';

        html += '<span><b>' + name + '</b></span>';

        // Description
        if( this.item.description )
            html += '<br/><i><small>' + this.item.description +'</small></i>';

        return html;

    }

    /** 
      * Get HTML for a given object operation 
      * @param operation The operation for the link
      * @param title The tooltip text for the operation. null to do not display
      * @param opDescription The operation description
      * @return The operation HTML
      */
    private getOperationTag(operation : string, title : string = null , opDescription : string ) {
        let link = '<a href="#" data-objectId="' + this.item.id + '" class="equipment-op btn btn-default" ';

        if( this.item.id == 'quiver' || this.item.id == 'money' )
            // Store the number of arrows on the quiver / gold crowns
            link += 'data-count="' + this.objectInfo.count + '" ';

        if( this.objectInfo.price )
            link += 'data-price="' + this.objectInfo.price + '" ';

        if( this.objectInfo.unlimited )
            link += 'data-unlimited="true" ';

        if( this.objectInfo.useOnSection )
            link += 'data-useOnSection="true" ';

        if( title )
            // Tooltip
            link += '"' + title + '" ';

        link += 'data-op="' + operation + '">';

        link += opDescription + '</a>';

        return link;
    }

    /**
     * Render available objects operations
     * @return The HTML. Empty string if there are no avaliable operations
     */
    private getItemOperations() : string {

        
        if( state.actionChart.currentEndurance <= 0 ) 
            // Player is death: No operations
            return '';

        const objectDescription = this.getItemDescription();
        if( !objectDescription )
            // Object should not be rendered
            return '';

        let html = '';

        if( this.type == ObjectsTableType.AVAILABLE ) {
            // Avaiable object (free) / buy object: Get it / Buy it
            const title = translations.text( this.objectInfo.price ? 'buyObject' : 'pickObject' );
            html += this.getOperationTag( 'get' , title , '<span class="glyphicon glyphicon-plus"></span>' );
        }
        else if( this.type == ObjectsTableType.SELL ) {
            // Shell object operation link
            const title = translations.text( 'sellObject' );
            html += this.getOperationTag( 'sell' , title , '<span class="glyphicon glyphicon-share"></span>' );
        }
        else if( this.type == ObjectsTableType.INVENTORY ) {

            if( this.item.usage ) {
                // Use object operation
                const title = translations.text('use');
                html += this.getOperationTag( 'use' , title , title );
            }

            if( this.item.isHandToHandWeapon() && state.actionChart.selectedWeapon != this.item.id ) {
                // Op to set the weapon as current
                const title = translations.text('currentWeapon');
                html += this.getOperationTag( 'setCurrentWeapon' , title , '<span class="glyphicon glyphicon-hand-left"></span>' );
            }

            if( this.item.droppable ) {
                // Object can be dropped:
                const title = translations.text('dropObject');
                html += this.getOperationTag( 'dropObject' , title , '<span class="glyphicon glyphicon-remove"></span>' );
            }

        }

        if( html ) 
            // Wrap the operations HTML
            html = '<div class="table-op">' + html + '</div>';
        
        return html;

    }

    /**
     * Convert, if needed, the string object id to a SectionItem
     * @param objectInfo A string with the object id, or a SectionItem with the object info
     * @return A SectionItem with the object info
     */
    private toSectionItem( info : any ) : SectionItem {
        if( typeof(info) === 'string' ) {

            let count = 0;
            if( this.type == ObjectsTableType.INVENTORY && info == 'quiver' )
                // The current number of arrows on the quiver:
                count = state.actionChart.arrows;

            return { 
                // The object info is directly the object id
                id : info,
                price : 0,
                unlimited : false,
                count : count,
                useOnSection : false
            }
        }
        else if( info.id ) {
            // The object info is the info about objects available on the section
            // See SectionState.objects documentation
            return info as SectionItem;
        }
        else 
            return null;
        
    }

}

/**
 * An objects table renderer
 */
class ObjectsTable {

    /** The table type */
    private type : ObjectsTableType;

    /** The jQuery for the objects table tag */
    private $tableBody : any;

    /** The objects to render */
    private objects : Array<ObjectsTableItem> = [];

    /**
     * Fill table with object descriptions.
     * @param {Array<string>} objects Array with objects ids (string) OR SectionItem's
     * @param {jQuery} $tableBody The HTML table to fill
     * @param type Table type: 'available': Available objects on section,
     * 'sell': Sell inventory objects, 'inventory': Inventory objects
     */
    constructor(objects : Array<any> , $tableBody : any, type : ObjectsTableType ) {

        this.type = type;
        for( let o of objects )
            this.objects.push( new ObjectsTableItem(o, type) );

    }

    /**
     * Fills the table and binds events
     */
    public renderTable() {

        this.$tableBody.empty();

        // Populate the table
        var html = '';
        for( let o of this.objects ) {
            
            const objectHtml = o.renderItem();
            if( objectHtml )
                html += '<tr><td>' + objectHtml + '</td></tr>';
        }

        if( !html )
            html = '<tr><td><i>(' + translations.text('noneMasculine') + ')</i></td></tr>';

        this.$tableBody.append( html );

        // Bind events:
        this.bindEquipmentEvents();
    }

    // TODO:
    private bindEquipmentEvents() {

    }

}


/**
 * Objects table handling
 */
const objectsTable = {

    /**
     * Fill table with object descriptions.
     * @param {Array<string>} objects Array with objects ids OR SectionItem
     * @param {jQuery} $tableBody The HTML table to fill
     * @param {string} type Table type: 'available': Available objects on section,
     * 'sell': Sell inventory objects, 'inventory': Inventory objects
     */
    objectsList: function(objects : Array<any> , $tableBody : any, type : string ) {

        $tableBody.empty();

        // Populate the table
        var html = '';
        for( var i=0; i<objects.length; i++ ) {
            
            var objectHtml = objectsTable.renderObject( objectsTable.toSectionItem( objects[i] , type ) , type );
            if( objectHtml )
                html += objectHtml;
        }

        if( !html )
            html = '<tr><td><i>(' + translations.text('noneMasculine') + ')</i></td></tr>';

        $tableBody.append( html );

        // Bind events:
        objectsTable.bindEquipmentEvents( $tableBody );
    },

    /**
     * Convert, if needed, the object id to a SectionItem
     * @param objectInfo A string with the object id, or a SectionItem with the object info
     * @param type The currently rendering table type: 'available': Available objects on section,
     * 'sell': Sell inventory objects, 'inventory': Inventory objects
     * @return A SectionItem with the object info
     */
    toSectionItem: function( objectInfo : any , type : string ) : SectionItem {
        if( typeof(objectInfo) === 'string' ) {
            let count = 0;
            if( type == 'inventory' && objectInfo == 'quiver' )
                // The number of arrows on the quiver:
                count = state.actionChart.arrows;

            return { 
                // The object info is directly the object id
                id : objectInfo,
                price : 0,
                unlimited : false,
                count : count,
                useOnSection : false
            }
        }
        else {
            // The object info is the info about objects available on the section
            // See SectionState.objects documentation
            return objectInfo;
        }
    },

    /**
     * Render an object to HTML
     * @param objectInfo The object to render: The object id, 
     * or an object with properties objectId, price and unlimited (see 
     * SectionState.objects documentation)
     * @returns The object HTML. null if the object should not be rendered
     */
    renderObject: function( objectInfo : SectionItem , type : string) : string {

        // Get the object info
        const o = state.mechanics.getObject( objectInfo.id );
        if( !o )
            return null;

        // If it's a sell table, and we don't have the object, do not show it
        if( type == 'sell' ) {
            if( !state.actionChart.hasObject( objectInfo.id ) )
                return null;
            // We don't have enougth arrows to sell, do not show
            if( objectInfo.id == 'quiver' && state.actionChart.arrows < objectInfo.count )
                return null;
        }

        var html = '<tr><td>';

        // Object operations
        html += objectsTable.operationsHtml( o , type , objectInfo );

        // Objet Image
        var imageUrl = o.getImageUrl();
        if( imageUrl ) {
            html += '<span class="inventoryImgContainer"><img class="inventoryImg" src=' + 
                imageUrl + ' /></span>';
        }

        // Name
        var name = o.name;

        // Number of arrows on the quiver
        if( objectInfo.id == 'quiver' && objectInfo.count )
            name += ' (' + objectInfo.count + ' ' + translations.text('arrows') + ')';

        // Money amount
        if( objectInfo.id == 'money' && objectInfo.count )
            name += ' (' + objectInfo.count + ' ' + translations.text('goldCrowns') + ')';

        // Buy / sell price
        if( objectInfo.price )
            name += ' (' + objectInfo.price + ' ' + translations.text('goldCrowns') + ')';

        if( objectInfo.id == 'map' )
            // It's the map:
            name = '<a href="#map">' + name + '</a>';
        else if( imageUrl )
            // Add a link to view a larger version of the image
            name = '<a href="#" class="equipment-op" data-op="details" data-objectId="' + 
            o.id + '">' + name + '</a>';
        html += '<span><b>' + name + '</b></span>';

        // Description
        if( o.description )
            html += '<br/><i><small>' + o.description +'</small></i>';

        html += '</td></tr>';
        return html;
    },

    /**
     * Get the available operations HTML for a given object
     * @param o The object
     * @param type Table type: 'available': Available objects on section,
     * 'sell': Sell inventory objects, 'inventory': Inventory objects
     * @param objectInfo The object info in the section
     * @returns {string} The operations HTML
     */
    operationsHtml: function(o : Item, type : string, objectInfo : SectionItem ) : string {

        if( state.actionChart.currentEndurance <= 0 ) 
            // Player is death: No operations
            return '';

        var html = '<div class="table-op">';
        var link = '<a href="#" data-objectId="' + o.id + 
            '" class="equipment-op btn btn-default" ';

        if( o.id == 'quiver' || o.id == 'money' )
            // Store the number of arrows on the quiver / gold crowns
            link += 'data-count="' + objectInfo.count + '" ';

        if( type == 'available' ) {
            // Available object
            var title = translations.text( objectInfo.price ? 'buyObject' : 'pickObject' );
            if( objectInfo.price )
                link += 'data-price="' + objectInfo.price + '" ';
            if( objectInfo.unlimited )
                link += 'data-unlimited="true" ';
            html += link + 'data-op="get" title="' + title + '">' + 
                '<span class="glyphicon glyphicon-plus"></span></a>';
        }
        else if( type == 'sell' ) {
            // Sell inventory object
            link += 'data-price="' + objectInfo.price + '" ';
            html += link + 'data-op="sell" title="' + translations.text('sellObject') + 
                '"><span class="glyphicon glyphicon-share"></span></a> ';
        }
        else {
            // Inventory object
            if( o.usage )
                html += link + 'data-op="use">' + translations.text('use') + '</a> ';
            if( o.isHandToHandWeapon() && state.actionChart.selectedWeapon != o.id ) {
                // Op to set the weapon as current
                html += link + 'data-op="currentWeapon" title="' + 
                    translations.text('setCurrentWeapon') + '">' + 
                    '<span class="glyphicon glyphicon-hand-left"></span></a> ';
            }
            if( o.droppable )
                // Object can be dropped:
                html += link + 'data-op="drop" title="' + translations.text('dropObject') + 
                    '"><span class="glyphicon glyphicon-remove"></span></a> ';
        }
        html += '</div>';
        return html;
    },

    /**
     * Bind events of equipment on a DOM element
     */
    bindEquipmentEvents: function($element) {
        $element
        .find('.equipment-op')
        // Include the $element itself too
        .addBack('.equipment-op')
        .click(function(e) {
            e.preventDefault();

            var op = $(this).attr('data-op');
            var o = state.mechanics.getObject( $(this).attr('data-objectId') );
            if( o === null )
                return;

            switch(op) {
                case 'get':
                    // Pick the object
                    objectsTable.onGetObjectClicked( $(this) , o );
                    break;

                case 'sell':
                    var price = parseInt( $(this).attr('data-price') );
                    if( !confirm( translations.text( 'confirmSell' , [ price ] ) ) )
                        return;

                    let txtCount : string = $(this).attr('data-count');
                    let count = ( txtCount ? parseInt( txtCount ) : 0 );
                    if( o.id == 'quiver' && count > 0 )
                        // Drop arrows
                        actionChartController.increaseArrows( -count );
                    else
                        actionChartController.drop( o.id , false , true );
                    actionChartController.increaseMoney( price );
                    mechanicsEngine.fireInventoryEvents(true, o);
                    break;

                case 'use':
                    if( confirm( translations.text( 'confirmUse' , [o.name] ) ) )
                        actionChartController.use( o.id );
                    break;

                case 'drop':
                    if( confirm( translations.text( 'confirmDrop' , [o.name] ) ) )
                        actionChartController.drop( o.id , true , true );
                    break;

                case 'currentWeapon':
                    // Set the active weapon
                    actionChartController.setSelectedWeapon( o.id );
                    break;

                case 'details':
                    // Show details
                    template.showObjectDetails(o);
                    break;
            }
        });
    },

    /**
     * Link to get an object clicked event handler
     * @param {jQuery} $link The link clicked
     * @param {Item} o The object to get
     */
    onGetObjectClicked: function( $link , o ) {

        // Check if it's a buy
        const txtPrice : string = $link.attr('data-price');
        const price : number = ( txtPrice ? parseInt( txtPrice ) : 0 );
        if( price ) {
            if( state.actionChart.beltPouch < price ) {
                alert( translations.text('noEnoughMoney') );
                return;
            }

            if( !confirm( translations.text('confirmBuy', [price] ) ) )
                return;
                
        }

        let objectPicked : boolean;
        if( o.id == 'quiver' && state.actionChart.hasObject(o.id) )
            // Do not pick two quivers
            objectPicked = true;
        else if( o.id == 'money' )
            // Not really an object
            objectPicked = true;
        else
            objectPicked = actionChartController.pick( o.id , true, true);

        if( objectPicked ) {

            let txtCount : string = $link.attr('data-count');
            let count = ( txtCount ? parseInt( txtCount ) : 0 );

            if( o.id == 'quiver' )
                // Increase the number of arrows on the quiver
                actionChartController.increaseArrows( count );

            if( o.id == 'money' )
                // Pick the money
                actionChartController.increaseMoney( count );

            var unlimited = $link.attr('data-unlimited');
            if( !unlimited ) {
                // Remove it from the available objects on the section
                const sectionState = state.sectionStates.getSectionState();
                sectionState.removeObjectFromSection( o.id , price );
            }

            if( price ) {
                // Pay the price
                actionChartController.increaseMoney( - price );
            }

            // Refresh the table of available objects
            mechanicsEngine.fireInventoryEvents(true, o);

        }
        
    }
};
