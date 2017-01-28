
var combatMechanics = {

    /**
     * Render section combats
     */
    renderCombats: function() {

        // Get combats to render
        var sectionState = state.sectionStates.getSectionState();
        if( sectionState.combats.length == 0 )
            return;

        // Combat UI template:
        var $template = mechanicsEngine.$mechanicsUI.find('#mechanics-combat').clone();
        $template.attr('id', null);
        
        // Populate combats
        $.each(sectionState.combats, function(index, combat) {
            var $combatUI = $template.clone();
            // Set the combat index
            $combatUI.attr('data-combatIdx', index);

            // Add combats UI
            var $combatOriginal = $('.combat:eq(' + index + ')'); 
            
            $combatOriginal.append( $combatUI )
            .find('.mechanics-playTurn').click(function(e) {
                // Play turn button click
                e.preventDefault();
                combatMechanics.runCombatTurn( $(this).parents('.mechanics-combatUI').first() , 
                    false );
            });

            $combatOriginal.find('.mechanics-elude').click(function(e) {
                // Elude combat button click
                e.preventDefault();
                combatMechanics.runCombatTurn( $(this).parents('.mechanics-combatUI').first() , 
                    true );
            });

            // Set enemy name on table
            $combatUI.find('.mechanics-enemyName').html( combat.enemy );
            // Set combat ratio:
            combatMechanics.updateCombatRatio( $combatUI, combat );
            
            // Add already played turns
            if( combat.turns.length > 0 ) {
                // Add already played turns
                var $turnsTable = $combatUI.find( 'table' );
                $turnsTable.show();
                var $turnsTableBody = $turnsTable.find( '> tbody' );
                $.each( combat.turns, function(index, turn) {
                    combatMechanics.renderCombatTurn( $turnsTableBody , turn );
                });
                // Update enemy current endurance
                combatMechanics.updateEnemyEndurance( $combatUI , combat , true );
            }

            if( sectionState.combatEluded || combat.isFinished() || combat.disabled )
                // Hide button to run more turns
                combatMechanics.hideCombatButtons( $combatUI );
            else if( combat.canBeEluded() )
                // The combat can be eluded
                $combatUI.find('.mechanics-elude').show();

        });

    },

    updateEnemyEndurance: function( $combatUI , combat , doNotAnimate ) {
        gameView.animateValueChange( $combatUI.parent().find( '.enemy-current-endurance' ) , 
            combat.endurance , doNotAnimate , combat.endurance > 0 ? null : 'red' );
    },

    updateCombatRatio: function( $combatUI , combat ) {
        // Set combat ratio:
        $combatUI.find('.mechanics-combatRatio').text( combat.getCombatRatio() );
    },

    /**
     * Update all combats ratio on UI
     */
    updateCombats: function() {
        // Get combats to render
        var sectionState = state.sectionStates.getSectionState();
        if( sectionState.combats.length == 0 )
            return;
        $.each(sectionState.combats, function(index, combat) {
            var $combatUI = $('.mechanics-combatUI:eq(' + index + ')');
            combatMechanics.updateCombatRatio( $combatUI , combat);
        });
    },

    /**
     * Hide combat UI buttons
     * @param {jquery} $combatUI The combat UI where disable buttons. If it's null, all
     * combats buttons on the section will be hidden
     */
    hideCombatButtons: function( $combatUI ) {
        if( !$combatUI )
            // Disable all combats
            $combatUI = $('.mechanics-combatUI');

        $combatUI.find('.mechanics-playTurn').hide();
        $combatUI.find('.mechanics-elude').hide();
    },

    /**
     * Run a combat turn
     * @param {jquery} $combatUI The combat UI
     * @param {boolean} elude True if the player is eluding the combat
     */
    runCombatTurn: function( $combatUI , elude ) {
        // Get the combat info:
        var combatIndex = parseInt( $combatUI.attr( 'data-combatIdx' ) );
        var sectionState = state.sectionStates.getSectionState();
        var combat = sectionState.combats[ combatIndex ];
        var turn = combat.nextTurn( elude );
        
        // Apply turn combat losses
        combat.applyTurn(turn);

        // Combat has been eluded?
        sectionState.combatEluded = elude;

        // Update player statistics:
        template.updateStatistics();
        
        // Render new turn
        var $turnsTable = $combatUI.find( 'table' ).first(); 
        $turnsTable.show();
        combatMechanics.renderCombatTurn( $turnsTable.find( '> tbody' ), turn );
        
        // Update enemy current endurance
        combatMechanics.updateEnemyEndurance( $combatUI , combat , false );

        if( sectionState.combatEluded || combat.isFinished() ) {
            // Combat finished

            // Hide button to run more turns
            combatMechanics.hideCombatButtons( $combatUI );

            // Test player death
            mechanicsEngine.testDeath();

            // Fire turn events:
            mechanicsEngine.fireAfterCombatTurn(combat);

            // Post combat rules execution:
            var combatsResult = sectionState.areAllCombatsFinished(state.actionChart);
            if( combatsResult == 'finished' && mechanicsEngine.onAfterCombatsRule )
                // Fire "afterCombats" rule
                mechanicsEngine.runChildRules( $(mechanicsEngine.onAfterCombatsRule) );
            if( combatsResult == 'eluded' && mechanicsEngine.onEludeCombatsRule )
                // Fire "afterElude" rule
                mechanicsEngine.runChildRules( $(mechanicsEngine.onEludeCombatsRule) );

        }
        else {
            // Combat continues
            
            if( combat.canBeEluded() )
                // The combat can be eluded after this turn
                $combatUI.find('.mechanics-elude').show();

            // Fire turn events:
            mechanicsEngine.fireAfterCombatTurn(combat);

            // Update combat ratio (it can be changed by combat turn rules):
            combatMechanics.updateCombatRatio( $combatUI , combat );
        }

        // Combat has been eluded?
        if( elude )
            // Disable other combats
            combatMechanics.hideCombatButtons( null );

    },

    /**
     * Render a combat turn
     * @param {jquery} $combatTable Table where to append the turn
     * @param turn The turn to render
     */
    renderCombatTurn: function( $combatTableBody , turn ) {
        $combatTableBody.append(
            '<tr><td>' + turn.turnNumber + '</td><td>' + turn.randomValue + 
            '</td><td>' + turn.getPlayerLossText() + '</td><td>' + 
            turn.getEnemyLossText() + '</td></tr>'
        );
    }

};
