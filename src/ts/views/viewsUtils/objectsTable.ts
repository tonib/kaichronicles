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
     * @param itemInfo Object info as a SectionItem
     * on the section
     * @param type Table type
     */
    constructor( itemInfo : SectionItem , type : ObjectsTableType ) {
        this.type = type;
        this.objectInfo = itemInfo;

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
            return '';

        // If it's a sell table, and we don't have the object, do not show it
        if( this.type == ObjectsTableType.SELL  ) {
            if( this.objectInfo.id != 'arrow' && !state.actionChart.hasObject( this.objectInfo.id ) )
                return '';
            // We don't have enough arrows to sell, do not show
            if( this.objectInfo.id == 'arrow' && state.actionChart.arrows < this.objectInfo.count )
                return '';
        }

        var html = '';

        // Name
        var name = this.item.name;

        // Number of arrows on the quiver
        if( this.objectInfo.id == Item.QUIVER ) {
            // Be sure count is not null
            const count = ( this.objectInfo.count ? this.objectInfo.count : 0 );
            name += ' (' + count + ' ' + translations.text('arrows') + ')';
        }

        // Arrow amount
        if( this.objectInfo.id == Item.ARROW && this.objectInfo.count ) {
            name = this.objectInfo.count + ' ' + name;
        }

        // Money amount
        if( this.objectInfo.id == Item.MONEY && this.objectInfo.count )
            name += ' (' + this.objectInfo.count + ' ' + translations.text('goldCrowns') + ')';

        // Buy / sell price
        if( this.objectInfo.price )
            name += ' (' + this.objectInfo.price + ' ' + translations.text('goldCrowns') + ')';

        // Buy X objects for a given price
        if( this.objectInfo.id != Item.MONEY && this.objectInfo.id != Item.ARROW && this.objectInfo.id != Item.QUIVER &&
            this.objectInfo.price > 0 && this.objectInfo.count > 1 )
            name = this.objectInfo.count + " x " + name;

        // Object Image
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

        if( this.item.id == Item.QUIVER || this.item.id == Item.ARROW || this.item.id == Item.MONEY || 
            ( this.objectInfo.price > 0 && this.objectInfo.count > 0 ) )
            // Store the number of arrows on the quiver / gold crowns / number of items to buy by the given price
            link += 'data-count="' + this.objectInfo.count + '" ';

        if( this.objectInfo.price )
            link += 'data-price="' + this.objectInfo.price + '" ';

        if( this.objectInfo.unlimited )
            link += 'data-unlimited="true" ';

        if( this.objectInfo.useOnSection )
            link += 'data-useonsection="true" ';

        if( title )
            // Tooltip
            link += 'title="' + title + '" ';

        link += 'data-op="' + operation + '">';

        link += opDescription + '</a> ';

        return link;
    }

    /** Get HTML for 'use' operation */
    private getUseOperation() : string {
        const title = translations.text('use');
        return this.getOperationTag( 'use' , title , title );
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
            // Avaiable object (free) / buy object: 

            if( this.objectInfo.price == 0 && this.objectInfo.useOnSection )
                // Allow to use the object from the section, without picking it
                html += this.getUseOperation();

            // Get it / Buy it
            const title = translations.text( this.objectInfo.price ? 'buyObject' : 'pickObject' );
            html += this.getOperationTag( 'get' , title , '<span class="glyphicon glyphicon-plus"></span>' );
        }
        else if( this.type == ObjectsTableType.SELL ) {
            // Shell object operation link
            const title = translations.text( 'sellObject' );
            html += this.getOperationTag( 'sell' , title , '<span class="glyphicon glyphicon-share"></span>' );
        }
        else if( this.type == ObjectsTableType.INVENTORY ) {

            if( this.item.usage )
                // Use object operation
                html += this.getUseOperation();

            if( this.item.isHandToHandWeapon() && state.actionChart.selectedWeapon != this.item.id ) {
                // Op to set the weapon as current
                const title = translations.text('setCurrentWeapon');
                html += this.getOperationTag( 'currentWeapon' , title , '<span class="glyphicon glyphicon-hand-left"></span>' );
            }

            if( this.item.droppable ) {
                // Object can be dropped:
                const title = translations.text('dropObject');
                html += this.getOperationTag( 'drop' , title , '<span class="glyphicon glyphicon-remove"></span>' );
            }

        }

        if( html ) 
            // Wrap the operations HTML
            html = '<div class="table-op">' + html + '</div>';
        
        return html;

    }

    public static restoreFromLink( $link : any , tableType : ObjectsTableType ) : ObjectsTableItem {
        
        let objectInfo : SectionItem = {
            id : null,
            price : 0,
            unlimited : false,
            count : 0,
            useOnSection : false
        };

        objectInfo.id = $link.attr('data-objectId');
        if( !objectInfo.id )
            return null;

        const txtPrice : string = $link.attr('data-price');
        if( txtPrice )
            objectInfo.price = parseInt( txtPrice );

        if( $link.attr( 'data-unlimited' ) == 'true' )
            objectInfo.unlimited = true;

        const txtCount : string = $link.attr('data-count');
        if( txtCount )
            objectInfo.count = parseInt( txtCount );

        if( $link.attr( 'data-useonsection' ) == 'true' )
            objectInfo.useOnSection = true;

        return new ObjectsTableItem( objectInfo , tableType );
    }

    ///////////////////////////////////////////////////////////////////////
    // OPERATIONS
    ///////////////////////////////////////////////////////////////////////

    public runOperation( op : string ) {
        if( !this[op] )
            throw "Unknown operation: " + op ;
        else
            this[op]();
    }

    /** Pick / buy object operation */
    private get() {

        // Special case. On kai monastery, ask the money amount to pick
        if( this.objectInfo.id == Item.MONEY && routing.getControllerName() == kaimonasteryController.NAME ) {
            MoneyDialog.show(false);
            return;
        }

        // Check if it's a buy
        if( this.objectInfo.price ) {

            if( state.actionChart.beltPouch < this.objectInfo.price ) {
                alert( translations.text('noEnoughMoney') );
                return;
            }

            if( this.item.id == Item.ARROW && state.actionChart.arrows >= state.actionChart.getMaxArrowCount() ) {
                // Don't let spend money on arrows you can't carry
                alert( translations.text('noQuiversEnough') );
                return;
            }

            if( !confirm( translations.text('confirmBuy', [this.objectInfo.price] ) ) )
                return;
        }

        let objectPicked : boolean;
        if( this.item.id == Item.MONEY || this.item.id == Item.ARROW )
            // Not really an object
            objectPicked = true;
        else {

            // A count == 0 means one object
            // "Count" for quivers means "count of arrows", not "count of quivers" 
            let nItems = this.objectInfo.count;
            if( !nItems || this.item.id == Item.QUIVER )
                nItems = 1;
            
            for(let i=0; i<nItems; i++) {
                 if( actionChartController.pick( this.item.id , true, true) )
                    objectPicked = true;
            }
        }

        if( objectPicked ) {

            let countPicked = this.objectInfo.count;

            if( this.item.id == Item.QUIVER || this.item.id == Item.ARROW ) {
                // Increase the number of arrows on the action chart
                const realIncrement = actionChartController.increaseArrows( this.objectInfo.count );
                if( this.item.id == Item.ARROW )
                    // Track real number of arrows picked
                    countPicked = realIncrement;
            }

            if( this.item.id == Item.MONEY )
                // Pick the money
                countPicked = actionChartController.increaseMoney( this.objectInfo.count );

            if( !this.objectInfo.unlimited ) {
                // Remove it from the available objects on the section
                const sectionState = state.sectionStates.getSectionState();
                sectionState.removeObjectFromSection( this.item.id , this.objectInfo.price , countPicked );
            }

            if( this.objectInfo.price ) {
                // Pay the price
                actionChartController.increaseMoney( - this.objectInfo.price );
            }

            // Refresh the table of available objects
            mechanicsEngine.fireInventoryEvents(true, this.item);
        }
    }

    /** Sell object operation */
    private sell() {
        if( !confirm( translations.text( 'confirmSell' , [ this.objectInfo.price ] ) ) )
            return;

        if( this.item.id == 'arrow' && this.objectInfo.count > 0 )
            // Drop arrows
            actionChartController.increaseArrows( -this.objectInfo.count );
        else
            actionChartController.drop( this.item.id , false , true );
        actionChartController.increaseMoney( this.objectInfo.price );
        mechanicsEngine.fireInventoryEvents(true, this.item);
    }

    /** Use object operation */
    private use() {

        if( !confirm( translations.text( 'confirmUse' , [this.item.name] ) ) )
            return;

        // Use the object
        const dropObject = ( this.type == ObjectsTableType.INVENTORY );
        actionChartController.use( this.item.id , dropObject );

        // If the object was used from the section, remove it
        if( this.type == ObjectsTableType.AVAILABLE && !this.objectInfo.unlimited ) {
            const sectionState = state.sectionStates.getSectionState();
            sectionState.removeObjectFromSection( this.item.id , this.objectInfo.price );
            // Refresh the table of available objects
            mechanicsEngine.fireInventoryEvents(true, this.item);
        }
    }

    private drop() {
        if( confirm( translations.text( 'confirmDrop' , [this.item.name] ) ) )
            actionChartController.drop( this.item.id , true , true , this.objectInfo.count );
    }

    private currentWeapon() {
        // Set the active weapon
        actionChartController.setSelectedWeapon( this.item.id );
    }

    private details() {
        // Show details
        template.showObjectDetails( this.item );
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
        this.$tableBody = $tableBody;

        this.fillObjectsList( objects );
    }

    /**
     * Converts the provided array of either strings or SectionItems to
     * a proper array of ObjectsTableItems.
     */
    public fillObjectsList( objects : Array<any> ) {
        let arrows = ( this.type == ObjectsTableType.INVENTORY ) ? state.actionChart.arrows : 0;

        for( let obj of objects ) {
            let info = obj;

            if( typeof(obj) === 'string' ) {
                let count = 0;

                if( obj == Item.QUIVER ) {
                    count = Math.min( 6, arrows );
                    arrows -= count;
                }

                info = {
                    id : obj,
                    price : 0,
                    unlimited : false,
                    count : count,
                    useOnSection : false
                }
            }

            this.objects.push( new ObjectsTableItem( info, this.type ) );
        }
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
        ObjectsTable.bindTableEquipmentEvents( this.$tableBody , this.type );
    }

    public static bindTableEquipmentEvents( $tableBody : any , type : ObjectsTableType) {

        $tableBody
        .find('.equipment-op')
        // Include the $element itself too
        .addBack('.equipment-op')
        .click(function(e : Event) {
            e.preventDefault();
            const $link = $(this);

            var op : string = $link.attr('data-op');
            if( !op )
                return;
            let i = ObjectsTableItem.restoreFromLink( $link , type );
            if( !i )
                return;

            i.runOperation( op );
        });
    }

}
