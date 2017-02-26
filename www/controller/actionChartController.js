
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
     * @param {string} objectId The object to pick, or "meal", to pick one meal
     * @param {boolean} doNotShowError True we should do not show a toast if the player
     * cannot pick the object
     * @return True if the object has been get. False if the object cannot be get
     */
    pick: function(objectId, doNotShowError) {
        try {
            // Pick the object
            var o = state.mechanics.getObject(objectId);
            if( o == null )
                return false;
            
            if( !state.actionChart.pick( o ) )
                return false;
                
            actionChartView.showInventoryMsg('pick', o , 
                translations.text( 'msgGetObject' , [o.name] ) );

            // Update player statistics (for objects with effects)
            actionChartView.updateStatistics();
            template.updateStatistics();

            return true;
        }
        catch(e) {
            // Error picking
            if( !doNotShowError )
                toastr["error"](e);
            console.log(e);
            return false;
        }
    }, 
    
    /**
     * Drop an object
     * @param objectId The object to drop, 
     * or "allweapons" to drop all weapons, 
     * or "backpackcontent" to drop all backpack content, 
     * or "currentweapon" to drop the current weapon,
     * or "allspecial" to drop all the special items
     * or "all" to drop all (weapons, backpack, special items, and money)
     * @param availableOnSection True if the object should be available on the current section
     */
    drop: function(objectId, availableOnSection) {

        if( objectId == 'allweapons' ) {
            actionChartController.dropItemsList( state.actionChart.weapons );
            return;
        }

        if( objectId == 'currentweapon' ) {
            if( state.actionChart.selectedWeapon )
                this.drop( state.actionChart.selectedWeapon );
            return;
        }

        if( objectId == 'backpackcontent' ) {
            actionChartController.dropBackpackContent();
            return;
        }

        if( objectId == 'allspecial') {
            actionChartController.dropItemsList( state.actionChart.specialItems );
            return;
        }

        if( objectId == 'all' ) {
            actionChartController.drop('backpack');
            actionChartController.drop('allweapons');
            actionChartController.drop('allspecial');
            actionChartController.increaseMoney( - state.actionChart.beltPouch );
            return;
        }

        var o = state.mechanics.getObject(objectId);
        if( !o )
            return;
        
        if( state.actionChart.drop(objectId) ) {
            actionChartView.showInventoryMsg('drop', o , 
                translations.text('msgDropObject' , [o.name] ) );

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
        actionChartController.dropItemsList( state.actionChart.backpackItems );
    },

    /**
     * Drop an array of objects
     * @param {Array<string>} arrayOfItems Array of the objects to drop. It must to be
     * an array owned by the action chart
     */
    dropItemsList: function(arrayOfItems) {
        while( arrayOfItems.length > 0 )
            actionChartController.drop(arrayOfItems[0], false);
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
                actionChartView.showInventoryMsg('pick' , o , 
                    translations.text( 'msgGetMeal' , [count] ) );
            else if( count < 0 )
                actionChartView.showInventoryMsg('drop' , o , 
                    translations.text( 'msgDropMeal' , [-count] ) );
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
            actionChartView.showInventoryMsg('pick' , o , 
                translations.text( 'msgGetMoney' , [count] ) );
        else if( count < 0 )
            actionChartView.showInventoryMsg('drop' , o , 
                translations.text( 'msgDropMoney' , [-count] ) );
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
                toastr["success"]( translations.text('msgEndurance' , ['+' + count] ) );
        }
        else if( count < 0 ) {
            if( !noToast )
                toastr["warning"]( translations.text('msgEndurance' , [count] ) );
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
            toastr["success"]( translations.text('msgCombatSkill' , ['+' + count]) );
        else if( count < 0 )
            toastr["warning"]( translations.text('msgCombatSkill' , [count]) );
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
            toastr["info"]( translations.text( 'msgCurrentWeapon' , [o.name] ) );
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

    pickItemsList: function(arrayOfItems) {
        var renderAvailableObjects = false;
        for(var i=0; i<arrayOfItems.length; i++) {
            if( !actionChartController.pick( arrayOfItems[i] ) ) {
                // Add the object as available on the current section
                state.sectionStates.addObjectToSection( arrayOfItems[i] );
                renderAvailableObjects = true;
            }
        }
        if( renderAvailableObjects )
            // Render available objects on this section (game view)
            mechanicsEngine.showAvailableObjects();
    },

    /**
     * Restore the inventory from an object generated with ActionChart.getInventoryState.
     * This does not replace the current inventory, just append objects to the current
     */
    restoreInventoryState: function(inventoryState) {
        if( !state.actionChart.hasBackpack && inventoryState.hasBackpack )
            actionChartController.pick('backpack');
        actionChartController.pickItemsList( inventoryState.weapons );
        actionChartController.pickItemsList( inventoryState.backpackItems );
        actionChartController.pickItemsList( inventoryState.specialItems );
        actionChartController.increaseMoney( inventoryState.beltPouch );
        actionChartController.increaseMeals( inventoryState.meals );
    },

    /** Return page */
    getBackController: function() { return 'game'; },

};