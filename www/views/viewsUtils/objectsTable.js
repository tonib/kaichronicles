
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
        
        var someObjectAdded = false;

        // Populate the table
        $.each( objects , function(index, objectInfo) {

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
                return;

            var html = '<tr><td>';

            // Operations (only if player is not death)
            if( state.actionChart.currentEndurance > 0 ) {
                html += '<div class="table-op">';
                var link = '<a href="#" data-objectId="' + objectId + 
                    '" class="equipment-op btn btn-default" ';

                if( type == 'available' ) {
                    // Available object
                    var title = ( price ? 'Buy object' : 'Pick object' );
                    if( price )
                        link += 'data-price="' + price + '" ';
                    if( unlimited )
                        link += 'data-unlimited="true" ';
                    html += link + 'data-op="get" title="' + title + '">' + 
                        '<span class="glyphicon glyphicon-plus"></span></a>';
                }
                else if( type == 'sell' ) {
                    // Sell inventory object
                    // If we dont have the object, do not show it
                    if( !state.actionChart.hasObject(objectId) )
                        return;
                    link += 'data-price="' + price + '" ';
                    html += link + 'data-op="sell" title="Sell object"><span class="glyphicon glyphicon-share"></span></a> ';
                }
                else {
                    // Inventory object
                    if( o.usage )
                        html += link + 'data-op="use">Use</a> ';
                    if( o.isWeapon() && state.actionChart.selectedWeapon != objectId) {
                        html += link + 'data-op="currentWeapon" title="Set as current weapon">' + 
                            '<span class="glyphicon glyphicon-hand-left">' + 
                        '</span></a> ';
                    }
                    if( o.droppable )
                        // Object can be dropped:
                        html += link + 'data-op="drop" title="Drop object"><span class="glyphicon glyphicon-remove"></span></a> ';
                }
                html += '</div>';
            }
            
            // Image
            if( o.imageUrl ) {
                html += '<span class="inventoryImgContainer"><img class="inventoryImg" src=' + o.imageUrl + ' /></span>';
            }

            // Name
            var name = o.name;
            if( price )
                name += ' (' + price + ' Golden Crowns)';

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
            $tableBody.append( html );
            someObjectAdded = true;
        });

        if( !someObjectAdded )
            $tableBody.append( '<tr><td><i>(None)</i></td></tr>' );

        // Bind events:
        objectsTable.bindEquipmentEvents( $tableBody );
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
            if( o == null )
                return;

            switch(op) {
                case 'get':
                    // Pick the object

                    // Check if it's a buy
                    var price = $(this).attr('data-price');
                    if( price ) {
                        price = parseInt( price );

                        if( state.actionChart.beltPouch < price ) {
                            alert("You don't have enough money" );
                            return;
                        }

                        if( !confirm('Are you sure you want to buy the object by ' + price +  
                            ' Golden Crowns?') )
                            return;
                            
                    }

                    if( actionChartController.pick( o.id ) ) {

                        var unlimited = $(this).attr('data-unlimited');
                        if( !unlimited ) {
                            // Remove it from the available objects on the section
                            state.sectionStates.removeObjectFromSection( o.id );
                        }
                        
                        // Refresh the table of available objects
                        mechanicsEngine.showAvailableObjects();
                        mechanicsEngine.showSellObjects();

                        if( price ) {
                            // Pay the price
                            actionChartController.increaseMoney( - price );
                        }
                    }
                    break;

                case 'sell':
                    var price = parseInt( $(this).attr('data-price') );
                    if( !confirm('Are you sure you want to sell the object by ' + price +  
                        ' Golden Crowns?') )
                        return;

                    actionChartController.drop( o.id , false );
                    actionChartController.increaseMoney( price );
                    mechanicsEngine.showSellObjects();
                    break;

                case 'use':
                    if( confirm('Are you sure you want to use "' + o.name + '"?') )
                        actionChartController.use( o.id );
                    break;

                case 'drop':
                    if( confirm('Are you sure you want to drop "' + o.name + '"?') )
                        actionChartController.drop( o.id , true );
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

}