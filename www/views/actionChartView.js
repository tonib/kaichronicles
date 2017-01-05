/**
 * The action chart view API
 */
var actionChartView = {

    /**
     * Fill the action chart with the player state
     * @param actionChart The ActionChart
     */
    fill: function(actionChart) {

        document.title = 'Action chart';

        // Show endurance / combat skills.
        actionChartView.updateStatistics();

        // Show money
        actionChartView.updateMoney();

        // Disciplines.
        // TODO: Display the discipline "quote" tag instead the name
        var $displines = $('#achart-disciplines > tbody');
        if( actionChart.disciplines.length == 0 ) {
            $displines.append( '<tr><td>(None)</td></tr>' );
        }
        else {
            var bookDisciplines = state.book.getDisciplinesTable();
            // Enumerate disciplines
            $.each( actionChart.disciplines , function(index, disciplineId) {
                var dInfo = bookDisciplines[disciplineId];
                var name = dInfo.name;
                var isWeaponSkill = ( disciplineId == 'wepnskll' );
                if( isWeaponSkill ) {
                    var o = state.mechanics.getObject( actionChart.weaponSkill );
                    name += ' (' + o.name + ')';
                }
                // Unescape the HTML description:
                var descriptionHtml = $('<div />').html(dInfo.description).text();
                $displines.append( '<tr><td>' +
                    '<button class="btn btn-default table-op" title="Discipline description">' + 
                        '<span class="glyphicon glyphicon-question-sign"></span>' + 
                    '</button>' + 
                    '<b>' + name + '</b><br/><i style="display:none"><small>' + 
                    descriptionHtml +
                    '</small></i></td></tr>' );
            });
            // Bind help button events
            $displines.find('button').click(function(e) {
                $(this).parent().find('i').toggle();
            });
        }

        // Fill the chart objects lists
        actionChartView.updateObjectsLists();

        // Bind event for drop meals
        actionChartView.bindEquipmentEvents( $('#achart-dropmeal') );

        // Bind drop money event
        $('#achart-dropmoney' ).click(function() {
            if( state.actionChart.beltPouch <= 0 )
                return;
            if( !confirm('Are you sure you want to drop 1 Golden Crown?') )
                return;
            actionChartController.increaseMoney(-1);
        });
    },

    updateMoney: function() {
        $('#achart-beltPouch').val( state.actionChart.beltPouch + ' Gold Crowns');
        $('#achart-dropmoney').prop( 'disabled', state.actionChart.beltPouch <= 0 );
    },

    /**
     * Update meals count
     */
    updateMeals: function() {
        $('#achart-meals').val( state.actionChart.meals );
        $('#achart-dropmeal').prop( 'disabled', state.actionChart.meals <= 0 );
    },

    /**
     * Update the player statistics
     */
    updateStatistics: function() {

        // Combat skill
        $('#achart-combatSkills').val( 
            "Current: " + 
            state.actionChart.getCurrentCombatSkill() + 
            " / Original: " + state.actionChart.combatSkill );
        $('#achart-cs-bonuses').text( 
            actionChartController.getBonusesText( state.actionChart.getCurrentCombatSkillBonuses() ) );

        // Endurance
        var txtEndurance = "Current: " + state.actionChart.currentEndurance;
        var max = state.actionChart.getMaxEndurance();
        if( max != state.actionChart.endurance )
            txtEndurance += ' / Max.: ' + max;
        txtEndurance += " / Original: " + state.actionChart.endurance;
 
        $('#achart-endurance').val( txtEndurance ); 
        $('#achart-endurance-bonuses').text( 
            actionChartController.getBonusesText( state.actionChart.getEnduranceBonuses() ) );
    },

    /**
     * Update weapons
     */
    updateWeapons: function() {

        // Weapons list
        actionChartView.objectsList( state.actionChart.weapons , 
            $('#achart-weapons > tbody') );

        // Current weapon:
        var current = state.actionChart.selectedWeapon;
        if( current )
            current = state.mechanics.getObject( current );
        $('#achart-currentWeapon').html( current ? current.name : '<i>None</i>');
    },

    /**
     * Update the chart objects lists
     */
    updateObjectsLists: function() {

        // Weapons
        actionChartView.updateWeapons();

        // Backpack items
        if( state.actionChart.hasBackpack )
            actionChartView.objectsList( state.actionChart.backpackItems , 
                $('#achart-backpack > tbody') );
        else
            $('#achart-backpack-content').html('<i>You have lost your backpack</i>');
            
        // Special items
        actionChartView.objectsList( state.actionChart.specialItems , 
            $('#achart-special > tbody') );

        // Meals
        actionChartView.updateMeals();

        // Total number of backpack objects
        $('#achart-backpacktotal').text('(' + state.actionChart.getNBackpackItems() + ')');
    },

    /**
     * Fill an table with object descriptions
     * @param objects The objects ids array
     * @param $tableBody The HTML table to fill
     * @param available {boolean} True if the objects are available to get. 
     * False if the object are owned by the player
     * @param shell {boolean} True if they are objects to shell 
     */
    objectsList: function(objects, $tableBody, available, shell) {

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

                if( available ) {
                    // Available object
                    var title = ( price ? 'Buy object' : 'Pick object' );
                    if( price )
                        link += 'data-price="' + price + '" ';
                    if( unlimited )
                        link += 'data-unlimited="true" ';
                    html += link + 'data-op="get" title="' + title + '">' + 
                        '<span class="glyphicon glyphicon-plus"></span></a>';
                }
                else if(shell) {
                    // Shell inventory object
                    // If we dont have the object, do not show it
                    if( !state.actionChart.hasObject(objectId) )
                        return;
                    link += 'data-price="' + price + '" ';
                    html += link + 'data-op="shell" title="Shell object"><span class="glyphicon glyphicon-share"></span></a> ';
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
            html += '<span><b>' + name + '</b>';

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
        actionChartView.bindEquipmentEvents( $tableBody );
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
                        mechanicsEngine.showShellObjects();

                        if( price ) {
                            // Pay the price
                            actionChartController.increaseMoney( - price );
                        }
                    }
                    break;

                case 'shell':
                    var price = parseInt( $(this).attr('data-price') );
                    if( !confirm('Are you sure you want to shell the object by ' + price +  
                        ' Golden Crowns?') )
                        return;

                    actionChartController.drop( o.id , false );
                    actionChartController.increaseMoney( price );
                    mechanicsEngine.showShellObjects();
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
            }
        });
    },

    showInventoryMsg: function(action, object, msg) {
        var toastType = ( action == 'pick' ? 'success' : 'warning' );
        var html = '';
        if( object && object.imageUrl)
            html += '<img class="inventoryImg" src="' + object.imageUrl + '" /> ';
        html += msg;
        html = '<div>' + html + '</div>';
        
        toastr[toastType]( html );
    }
};
