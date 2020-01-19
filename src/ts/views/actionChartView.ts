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

        // Bind drop money events
        actionChartView.bindDropMoneyEvents();

        // Disciplines.
        actionChartView.fillDisciplines(actionChart);

        // Fill the chart objects lists
        actionChartView.updateObjectsLists();

        // Bind event for drop meals
        ObjectsTable.bindTableEquipmentEvents( $('#achart-dropmeal') , ObjectsTableType.INVENTORY );

        // Bind restore 20 EP (Curing)
        actionChartView.bindRestore20EP();

        // Bind "Fight unarmed"
        $('#achart-fightUnarmed').click( function(e : Event) {
            actionChartController.setFightUnarmed( $(this).prop('checked') ? true : false );
        });

        // Annotations
        $('#achart-annotations').val( actionChart.annotations );
        $('#achart-annotations').off();
        $('#achart-annotations').on('input', function() {
            state.actionChart.annotations = $(this).val();
        });
    },

    /**
     * Hide / disable the restore 20 EP button if needed
     */
    updateRestore20EPState: function() {
        let $restoreButton = null;
        if(state.book.isGrandMasterBook()) {
            $restoreButton = $('#grdmast-restore20Ep');
            $('#achart-restore20Ep').hide();
        } else {
            $restoreButton = $('#achart-restore20Ep');
            $('#grdmast-restore20Ep').hide();
        }
        if( !state.actionChart.canUse20EPRestoreOnThisBook() )
            $restoreButton.hide();
        if( !state.actionChart.canUse20EPRestoreNow() )
            $restoreButton.prop( 'disabled', true );
    },

    /**
     * Bind events to restore 20 EP (Curing)
     */
    bindRestore20EP: function() {
        const $restoreButton = state.book.isGrandMasterBook() ? $('#grdmast-restore20Ep') : $('#achart-restore20Ep');
        actionChartView.updateRestore20EPState();
        $restoreButton.click( function(e: Event) {
            e.preventDefault();
            if( !confirm( translations.text(state.book.isGrandMasterBook() ? 'confirm20EPGrdMaster' : 'confirm20EP') ) )
                return;
            actionChartController.use20EPRestore();
            actionChartView.updateRestore20EPState();
        });
    },

    /**
     * Bind events for drop money UI
     */
    bindDropMoneyEvents: function() {
        // Bind drop money button event
        $('#achart-dropmoneybutton').click( function(e: Event) {
            e.preventDefault();
            MoneyDialog.show( true );
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

        // Lore circles:
        if( state.book.bookNumber <= 5 )
            // Only for magnakai books
            $('#achart-circles').hide();
        else {
            const circles = actionChart.getLoreCircles();
            if( circles.length == 0 )
                $('#achart-currentCircles').html( '<i>' + translations.text('noneMasculine') + '</i>' );
            else {
                let circlesNames : Array<string> = [];
                for( let c of actionChart.getLoreCircles() )
                    circlesNames.push( c.getDescription() );
                $('#achart-currentCircles').html( circlesNames.join( ', ') );
            }
        }

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
        // Disable if the player has no money or it's death
        $('#achart-dropmoneybutton').prop( 'disabled', state.actionChart.beltPouch <= 0 || state.actionChart.currentEndurance <= 0 );
    },

    /**
     * Update meals count
     */
    updateMeals: function() {
        $('#achart-meals').val( state.actionChart.meals );
        // Disable if the player has no meals or it's death
        $('#achart-dropmeal').prop( 'disabled', state.actionChart.meals <= 0 || state.actionChart.currentEndurance <= 0 );
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
        new ObjectsTable( state.actionChart.weapons , $('#achart-weapons > tbody') , ObjectsTableType.INVENTORY )
            .renderTable();

        // Current weapon:
        const current : Item = state.actionChart.getSelectedWeaponItem();
        $('#achart-currentWeapon').html( current ? current.name : '<i>' + translations.text('noneFemenine') + '</i>' );

        // Fight unarmed?
        const $fightUnarmed = $('#achart-fightUnarmed');
        $fightUnarmed.prop( 'checked' , state.actionChart.fightUnarmed );

        // If the player has no weapons, or has died, disable the option "Fight unarmed"
        let noWeapon = ( !state.actionChart.fightUnarmed && !state.actionChart.getSelectedWeapon() );
        if( state.actionChart.currentEndurance <= 0 ) 
            noWeapon = true;
        $fightUnarmed.prop( 'disabled' , noWeapon );
    },

    /**
     * Update the chart objects lists
     */
    updateObjectsLists: function() {

        // Weapons
        actionChartView.updateWeapons();

        // Backpack items
        if( state.actionChart.hasBackpack )
            new ObjectsTable( state.actionChart.backpackItems , $('#achart-backpack > tbody') , ObjectsTableType.INVENTORY )
                .renderTable();
        else
            $('#achart-backpack-content').html('<i>' + translations.text('backpackLost') + '</i>');
            
        // Special items
        new ObjectsTable( state.actionChart.specialItems , $('#achart-special > tbody') , ObjectsTableType.INVENTORY )
            .renderTable();

        // Meals
        actionChartView.updateMeals();

        // Total number of backpack / special objects
        $('#achart-backpacktotal').text('(' + state.actionChart.getNBackpackItems() + ')');
        $('#achart-specialtotal').text('(' + state.actionChart.getNSpecialItems() + ')');
    },

    showInventoryMsg: function(action : string, object : Item, msg : string) {
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
