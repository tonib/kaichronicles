
/**
 * Objects table handling
 */
var objectsTable = {

    /**
     * Fill an table with object descriptions.
     * @param {Array<string>} objects The objects ids array
     * @param {jQuery} $tableBody The HTML table to fill
     * @param {string} type Table type: 'available': Available objects on section,
     * 'sell': Sell inventory objects, 'inventory': Inventory objects
     */
    objectsList: function(objects, $tableBody, type ) {

        $tableBody.empty();

        // Populate the table
        var html = '';
        for( var i=0; i<objects.length; i++ ) {
            var objectHtml = objectsTable.renderObject( objects[i] , type );
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
     * Render an object to HTML
     * @param {string|object} objectInfo The object to render: The object id, 
     * or an object with properties objectId, price and unlimited (see 
     * SectionState.objects documentation)
     * @returns {string} The object HTML. null if the object should not be rendered
     */
    renderObject: function( objectInfo , type ) {

        // Get the object id and price:
        var objectId, price, unlimited;
        if( typeof(objectInfo) === 'string' ) {
            // The object info is directly the object id
            objectId = objectInfo;
            price = null;
            unlimited = false;
        }
        else {
            // The object info is the info about objects available on the section
            // See SectionState.objects documentation
            objectId = objectInfo.id;
            price = objectInfo.price;
            unlimited = objectInfo.unlimited; 
        }

        // Get the object info
        var o = state.mechanics.getObject(objectId);
        if( !o )
            return null;

        // If it's a sell table, and we don't have the object, do not show it
        if( type == 'sell' && !state.actionChart.hasObject(objectId) )
            return null;

        var html = '<tr><td>';

        // Object operations
        html += objectsTable.operationsHtml( o , type , price , unlimited );

        // Image
        if( o.imageUrl ) {
            html += '<span class="inventoryImgContainer"><img class="inventoryImg" src=' + 
                o.imageUrl + ' /></span>';
        }

        // Name
        var name = o.name;
        if( price )
            name += ' (' + price + ' ' + translations.text('goldCrowns') + ')';

        if( objectId == 'map' )
            // It's the map:
            name = '<a href="#map">' + name + '</a>';
        else if( o.imageUrl )
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
     * @param {Item} o The object
     * @param {string} type Table type: 'available': Available objects on section,
     * 'sell': Sell inventory objects, 'inventory': Inventory objects
     * @param {number} price Object price. Only if type is 'available' or 'sell'
     * @param {boolean} unlimited True if there is an unlimited amount of this object on
     * the section. Only if type is 'available'
     * @returns {string} The operations HTML
     */
    operationsHtml: function(o, type, price, unlimited) {

        if( state.actionChart.currentEndurance <= 0 ) 
            // Player is death: No operations
            return '';

        var html = '<div class="table-op">';
        var link = '<a href="#" data-objectId="' + o.id + 
            '" class="equipment-op btn btn-default" ';

        if( type == 'available' ) {
            // Available object
            var title = translations.text( price ? 'buyObject' : 'pickObject' );
            if( price )
                link += 'data-price="' + price + '" ';
            if( unlimited )
                link += 'data-unlimited="true" ';
            html += link + 'data-op="get" title="' + title + '">' + 
                '<span class="glyphicon glyphicon-plus"></span></a>';
        }
        else if( type == 'sell' ) {
            // Sell inventory object
            link += 'data-price="' + price + '" ';
            html += link + 'data-op="sell" title="' + translations.text('sellObject') + 
                '"><span class="glyphicon glyphicon-share"></span></a> ';
        }
        else {
            // Inventory object
            if( o.usage )
                html += link + 'data-op="use">' + translations.text('use') + '</a> ';
            if( o.isWeapon() && state.actionChart.selectedWeapon != o.id) {
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

                    actionChartController.drop( o.id , false , true );
                    actionChartController.increaseMoney( price );
                    mechanicsEngine.fireInventoryEvents(true, o.id);
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
        var price = $link.attr('data-price');
        if( price ) {
            price = parseInt( price );

            if( state.actionChart.beltPouch < price ) {
                alert( translations.text('noEnoughMoney') );
                return;
            }

            if( !confirm( translations.text('confirmBuy', [price] ) ) )
                return;
                
        }

        if( actionChartController.pick( o.id , true, true) ) {

            var unlimited = $link.attr('data-unlimited');
            if( !unlimited ) {
                // Remove it from the available objects on the section
                state.sectionStates.removeObjectFromSection( o.id );
            }

            if( price ) {
                // Pay the price
                actionChartController.increaseMoney( - price );
            }

            // Refresh the table of available objects
            mechanicsEngine.fireInventoryEvents(true, o.id);

        }
        
    }
};