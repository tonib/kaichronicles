/// <reference path="../external.ts" />

/**
 * The action chart view API
 */
const actionChartView = {

    /**
     * Fill the action chart with the player state
     * @param actionChart The ActionChart
     */
    fill: function(actionChart : ActionChart) {

        document.title = translations.text( 'actionChart' );

        // Show endurance / combat skills.
        actionChartView.updateStatistics();

        // Show money
        actionChartView.updateMoney();

        // Disciplines.
        actionChartView.fillDisciplines(actionChart);

        // Fill the chart objects lists
        actionChartView.updateObjectsLists();

        // Bind event for drop meals
        objectsTable.bindEquipmentEvents( $('#achart-dropmeal') );

        // Annotations
        $('#achart-annotations').val( actionChart.annotations );
        $('#achart-annotations').off();
        $('#achart-annotations').on('input', function() {
            state.actionChart.annotations = $(this).val();
        });
    },

    /**
     * Render the disciplines table
     * @param {ActionChart} actionChart The action chart
     */
    fillDisciplines: function(actionChart : ActionChart) {
        // Kai title:
        $('#achart-kaititle')
            .text( state.book.getKaiTitle( actionChart.disciplines.length ) );

        // TODO: Display the discipline "quote" tag instead the name
        var $displines = $('#achart-disciplines > tbody');
        if( actionChart.disciplines.length === 0 ) {
            $displines.append( '<tr><td>(' + translations.text('noneFemenine') + ')</td></tr>' );
        }
        else {
            var bookDisciplines = state.book.getDisciplinesTable();
            // Enumerate disciplines
            $.each( actionChart.disciplines , function(index, disciplineId : string) {
                var dInfo = bookDisciplines[disciplineId];
                var name = dInfo.name;

                if( disciplineId == 'wepnskll' || disciplineId == 'wpnmstry' ) {
                    // Show selected weapons description
                    let weapons : Array<string> = [];
                    for(let i=0; i<actionChart.weaponSkill.length; i++)
                        weapons.push( state.mechanics.getObject( actionChart.weaponSkill[i] ).name );
                    if( weapons.length > 0 )
                        name += ' (' + weapons.join(', ') + ')';
                }

                // Unescape the HTML description:
                var descriptionHtml = $('<div />').html(dInfo.description).text();
                $displines.append( '<tr><td>' +
                    '<button class="btn btn-default table-op" title="' + 
                    translations.text('disciplineDescription') +
                    '">' + 
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
    },

    updateMoney: function() {
        $('#achart-beltPouch').val( state.actionChart.beltPouch + ' ' + translations.text('goldCrowns') );
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

        var txtCurrent = translations.text('current') + ': ';
        // Combat skill
        $('#achart-combatSkills').val( 
            txtCurrent +  
            state.actionChart.getCurrentCombatSkill() + 
            " / Original: " + state.actionChart.combatSkill );
        $('#achart-cs-bonuses').text( 
            actionChartController.getBonusesText( state.actionChart.getCurrentCombatSkillBonuses() ) );

        // Endurance
        var txtEndurance = txtCurrent + state.actionChart.currentEndurance;
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
        objectsTable.objectsList( state.actionChart.weapons , 
            $('#achart-weapons > tbody') , 'inventory' );

        // Current weapon:
        var current = state.actionChart.selectedWeapon;
        if( current )
            current = state.mechanics.getObject( current );
        $('#achart-currentWeapon').html( current ? current.name : '<i>' + translations.text('noneFemenine') + '</i>');
    },

    /**
     * Update the chart objects lists
     */
    updateObjectsLists: function() {

        // Weapons
        actionChartView.updateWeapons();

        // Backpack items
        if( state.actionChart.hasBackpack )
            objectsTable.objectsList( state.actionChart.backpackItems , 
                $('#achart-backpack > tbody') , 'inventory' );
        else
            $('#achart-backpack-content').html('<i>' + translations.text('backpackLost') + '</i>');
            
        // Special items
        objectsTable.objectsList( state.actionChart.specialItems , 
            $('#achart-special > tbody') , 'inventory' );

        // Meals
        actionChartView.updateMeals();

        // Total number of backpack objects
        $('#achart-backpacktotal').text('(' + state.actionChart.getNBackpackItems() + ')');
    },

    showInventoryMsg: function(action, object, msg) {
        var toastType = ( action == 'pick' ? 'success' : 'warning' );
        var html = '';

        // Check if the object has an image
        if( object) {
            var imageUrl = object.getImageUrl();
            if( imageUrl )
                html += '<img class="inventoryImg" src="' + imageUrl + '" /> ';
        }

        html += msg;
        html = '<div>' + html + '</div>';
        
        toastr[toastType]( html );
    }
};
