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
        actionChartView.fillDisciplines(actionChart);

        // Fill the chart objects lists
        actionChartView.updateObjectsLists();

        // Bind event for drop meals
        objectsTable.bindEquipmentEvents( $('#achart-dropmeal') );

        // Bind drop money event
        $('#achart-dropmoney' ).click(function() {
            if( state.actionChart.beltPouch <= 0 )
                return;
            if( !confirm('Are you sure you want to drop 1 Golden Crown?') )
                return;
            actionChartController.increaseMoney(-1);
        });
    },

    /**
     * Render the disciplines table
     * @param {ActionChart} actionChart The action chart
     */
    fillDisciplines: function(actionChart) {
        // Kai title:
        $('#achart-kaititle')
            .text( state.book.getKaiTitle( actionChart.disciplines.length ) );

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
        objectsTable.objectsList( state.actionChart.weapons , 
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
            objectsTable.objectsList( state.actionChart.backpackItems , 
                $('#achart-backpack > tbody') );
        else
            $('#achart-backpack-content').html('<i>You have lost your backpack</i>');
            
        // Special items
        objectsTable.objectsList( state.actionChart.specialItems , 
            $('#achart-special > tbody') );

        // Meals
        actionChartView.updateMeals();

        // Total number of backpack objects
        $('#achart-backpacktotal').text('(' + state.actionChart.getNBackpackItems() + ')');
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
