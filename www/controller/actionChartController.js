
/**
 * The action chart controller
 */
var actionChartController = {

    /**
     * Render the action chart
     */
    index: function() {

        if( !setupController.checkBook() )
            return;
        
        views.loadView('actionChart.html')
        .then(function() {
            actionChartView.fill( state.actionChart );
        });
    },

    /**
     * Pick an object
     * @param objectId The object to pick, or "meal", to pick one meal
     * @return True if the object has been get. False if the object cannot be get
     */
    pick: function(objectId) {
        try {
            // Pick the object
            var o = state.mechanics.getObject(objectId);
            if( o == null )
                return false;
            
            if( !state.actionChart.pick( o ) )
                return false;
                
            actionChartView.showInventoryMsg('pick', o , 'You get "' + o.name + '"' );

            // Update player statistics (for objects with effects)
            actionChartView.updateStatistics();
            template.updateStatistics();

            return true;
        }
        catch(e) {
            // Error picking
            toastr["error"](e);
            console.log(e);
            return false;
        }
    }, 
    
    /**
     * Drop an object
     * @param objectId The object to drop, or "allweapons" to drop all weapons, 
     * or "backpackcontent" to drop all backpack content
     * @param availableOnSection True if the object should be available on the current section
     */
    drop: function(objectId, availableOnSection) {

        if( objectId == 'allweapons' ) {
            actionChartController.dropAllWeapons();
            return;
        }

        if( objectId == 'backpackcontent' ) {
            actionChartController.dropBackpackContent();
            return;
        }

        var o = state.mechanics.getObject(objectId);
        if( !o )
            return;
        
        if( state.actionChart.drop(objectId) ) {
            actionChartView.showInventoryMsg('drop', o , 'You drop "' + o.name + '"' );

            // Update the action chart view
            actionChartView.updateObjectsLists();

            // Update player statistics (for objects with effects)
            actionChartView.updateStatistics();
            template.updateStatistics();

            if( availableOnSection ) {
                // Add the droped object as available on the current section
                state.sectionStates.addObjectToSection( objectId );

                // Render available objects on this section (game view)
                mechanicsEngine.showAvailableObjects();
            }

        }
    },

    /**
     * Drop all backpack content
     */
    dropBackpackContent: function() {
        actionChartController.increaseMeals( -state.actionChart.meals );
        while( state.actionChart.backpackItems.length > 0 )
            actionChartController.drop(state.actionChart.backpackItems[0], false);
    },

    /**
     * Drop all weapons
     */
    dropAllWeapons: function() {
        while( state.actionChart.weapons.length > 0 )
            actionChartController.drop(state.actionChart.weapons[0], false);
    },

    /**
     * Use an object
     * @param objectId The object to use
     */
    use: function(objectId) {
        // Get the object
        var o = state.mechanics.getObject(objectId);
        if( !o || !o.usage )
            return;

        // Do the usage action:
        if( o.usage.cls == 'endurance' )
            actionChartController.increaseEndurance( o.usage.increment )
        else if( o.usage.cls == 'combatSkill' )
            // Combat skill modifiers only apply to the current section combats
            state.sectionStates.combatSkillUsageModifier( o.usage.increment );
            
        // Update player statistics
        actionChartView.updateStatistics();
        template.updateStatistics();
        
        // Drop the object, and do not keep it on the section
        actionChartController.drop(objectId, false);
    },

    /**
     * Increase / decrease the meals number
     * @param count Number to increase. Negative to decrease 
     */
    increaseMeals: function(count) {
        try {
            state.actionChart.increaseMeals(count);
            var o = state.mechanics.getObject('meal');
            if( count > 0 )
                actionChartView.showInventoryMsg('pick' , o , 'You get ' + count + ' meals' );
            else if( count < 0 )
                actionChartView.showInventoryMsg('drop' , o , 'You drop ' + ( - count )+ ' meals' );
        }
        catch(e) {
            toastr["error"](e);
        }
    },

    /**
     * Increase / decrease the money number
     * @param count Number to increase. Negative to decrease 
     */
    increaseMoney: function(count) {
        state.actionChart.increaseMoney(count);
        var o = state.mechanics.getObject('money');
        if( count > 0 )
            actionChartView.showInventoryMsg('pick' , o , 'You get ' + count + ' crowns' );
        else if( count < 0 )
            actionChartView.showInventoryMsg('drop' , o , 'You lost ' + ( - count ) + ' crowns' );
        actionChartView.updateMoney();
    },

    /**
     * Increase / decrease the current endurance
     * @param {number} count Number to increase. Negative to decrease
     * @param {boolean} noToast True if no message should be show
     */
    increaseEndurance: function(count, noToast) {
        state.actionChart.increaseEndurance(count);
        if( count > 0 ) {
            if( !noToast )
                toastr["success"]('+' + count + ' endurance points' );
        }
        else if( count < 0 ) {
            if( !noToast )
                toastr["warning"]( count + ' endurance points' );
            mechanicsEngine.testDeath();
        }
        template.updateStatistics();
    },

    /**
     * Increase / decrease the combat skill permanently
     * @param count Number to increase. Negative to decrease 
     */
    increaseCombatSkill: function(count) {
        state.actionChart.combatSkill += count;
        if( count > 0 )
            toastr["success"]('+' + count + ' combat skill (permanent)' );
        else if( count < 0 )
            toastr["warning"]( count + ' combat skill (permanent)' );
        template.updateStatistics();
    },

    /**
     * Set the current weapon
     * @param {string} weaponId The weapon id to set selected
     * @param {boolean} showToast True if we should show a message to the user   
     */
    setSelectedWeapon: function( weaponId , showToast ) {
        if( state.actionChart.selectedWeapon == weaponId )
            return;

        state.actionChart.selectedWeapon = weaponId;
        actionChartView.updateWeapons();
        // There can be weapons on backpack / special items:
        actionChartView.updateObjectsLists();
        actionChartView.updateStatistics();
        template.updateStatistics();
        if( showToast ) {
            var o = state.mechanics.getObject( weaponId )
            toastr["info"]( 'Your current weapon is now "' + o.name + '"');
        }
    },

    /** 
     * Returns a string with a set of bonuses
     * @param {Array} Bonuses to render
     * @return {string} The bonuses text 
     */
    getBonusesText: function(bonuses) {
        var txt = [];
        for( var i=0; i<bonuses.length; i++ ) {
            var txtInc = bonuses[i].increment.toString();
            if( bonuses[i].increment > 0 )
                txtInc = "+" + txtInc;
            
            txt.push( bonuses[i].concept + ": " + txtInc );
        }
        return txt.join(", ");
    },

    /** Return page */
    getBackController: function() { return 'game'; }
    
};