
/**
 * The action chart controller
 */
const actionChartController = {

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
     * @param showError True we should show a toast if the player
     * cannot pick the object
     * @param fromUITable True if we are picking the object from the UI
     * @return True if the object has been get. False if the object cannot be get
     */
    pick: function(objectId : string, showError : boolean, fromUITable : boolean ) : boolean {
        try {
            // Get object info
            var o = state.mechanics.getObject(objectId);
            if( o === null )
                return false;

            // Check if the section has restrictions about picking objects
            // This will throw an exception if no more objects can be picked
            if( fromUITable )
                mechanicsEngine.checkMoreObjectsCanBePicked( objectId );

            // Try to pick the object
            if( !state.actionChart.pick( o ) )
                return false;

            // Show toast
            actionChartView.showInventoryMsg('pick', o , 
                translations.text( 'msgGetObject' , [o.name] ) );

            // Update player statistics (for objects with effects)
            actionChartView.updateStatistics();
            template.updateStatistics();

            return true;
        }
        catch(e) {
            // Error picking
            if( showError )
                toastr.error(e);
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
     * or "allmeals" to drop all meals
     * or "all" to drop all (weapons, backpack, special items, and money)
     * @param availableOnSection True if the object should be available on 
     * the current section
     * @param fromUI True if the action is fired from the UI
     */
    drop: function( objectId : string, availableOnSection : boolean = false, fromUI : boolean = false ) {

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

        if( objectId == 'allmeals' ) {
            actionChartController.increaseMeals( -state.actionChart.meals );
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
        
        // Number of arrows on the quiver (to keep it on the dropped object)
        const arrows = ( objectId == 'quiver' ? state.actionChart.arrows : 0 );

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
                var sectionState = state.sectionStates.getSectionState();
                sectionState.addObjectToSection( objectId , 0 , false , arrows );

                // Render available objects on this section (game view)
                mechanicsEngine.fireInventoryEvents( fromUI , o );
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
            actionChartController.drop(arrayOfItems[0], false, false);
    },

    /**
     * Drop all weapons
     */
    dropAllWeapons: function() {
        while( state.actionChart.weapons.length > 0 )
            actionChartController.drop(state.actionChart.weapons[0], false, false);
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
            actionChartController.increaseEndurance( o.usage.increment );
        else if( o.usage.cls == 'combatSkill' )
            // Combat skill modifiers only apply to the current section combats
            state.sectionStates.combatSkillUsageModifier( o.usage.increment );
            
        // Update player statistics
        actionChartView.updateStatistics();
        template.updateStatistics();
        
        // Drop the object, and do not keep it on the section
        actionChartController.drop(objectId, false);

        // Fire mechanics rules
        mechanicsEngine.fireObjectUsed( objectId );
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
            toastr.error(e);
        }
    },

    /**
     * Increase / decrease the money number
     * @param count Number to increase. Negative to decrease 
     * @param availableOnSection The dropped money should be available on the current section? Only applies if count < 0
     */
    increaseMoney: function(count : number, availableOnSection: boolean = false) {
        state.actionChart.increaseMoney(count);
        const o = state.mechanics.getObject('money');
        if( count > 0 )
            actionChartView.showInventoryMsg('pick' , o , 
                translations.text( 'msgGetMoney' , [count] ) );
        else if( count < 0 ) {
            actionChartView.showInventoryMsg('drop' , o , translations.text( 'msgDropMoney' , [-count] ) );
            if( availableOnSection && count < 0 ) {
                // Add the droped money as available on the current section
                const sectionState = state.sectionStates.getSectionState();
                sectionState.addObjectToSection( 'money' , 0 , false , -count );
            }
        }
        actionChartView.updateMoney();
    },

    /**
     * Increase / decrease the current endurance
     * @param count Number to increase. Negative to decrease
     * @param {boolean} noToast True if no message should be show
     */
    increaseEndurance: function( count : number, noToast : boolean = false) {
        state.actionChart.increaseEndurance(count);
        if( count > 0 ) {
            if( !noToast )
                toastr.success( translations.text('msgEndurance' , ['+' + count] ) );
        }
        else if( count < 0 ) {
            if( !noToast )
                toastr.warning( translations.text('msgEndurance' , [count] ) );
            mechanicsEngine.testDeath();
            // Check if the Psi-surge should be disabled
            combatMechanics.checkPsiSurgeEnabled();
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
            toastr.success( translations.text('msgCombatSkill' , ['+' + count]) );
        else if( count < 0 )
            toastr.warning( translations.text('msgCombatSkill' , [count]) );
        template.updateStatistics();
    },

    /**
     * Set the current weapon
     * @param weaponId The weapon id to set selected
     * @param showToast True if we should show a message to the user   
     */
    setSelectedWeapon: function( weaponId : string , showToast : boolean = false ) {
        if( state.actionChart.selectedWeapon == weaponId )
            return;

        state.actionChart.selectedWeapon = weaponId;
        actionChartView.updateWeapons();
        // There can be weapons on backpack / special items:
        actionChartView.updateObjectsLists();
        actionChartView.updateStatistics();
        template.updateStatistics();
        if( showToast ) {
            var o = state.mechanics.getObject( weaponId );
            toastr.info( translations.text( 'msgCurrentWeapon' , [o.name] ) );
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
        var sectionState = state.sectionStates.getSectionState();
        for(var i=0; i<arrayOfItems.length; i++) {
            if( !actionChartController.pick( arrayOfItems[i] , true , false ) ) {
                // Object cannot be picked. Add the object as available on the current section
                sectionState.addObjectToSection( arrayOfItems[i] );
                renderAvailableObjects = true;
            }
        }
        if( renderAvailableObjects )
            // Render available objects on this section (game view)
            mechanicsEngine.fireInventoryEvents();
    },

    /**
     * Restore the inventory from an object generated with ActionChart.getInventoryState.
     * This does not replace the current inventory, just append objects to the current
     */
    restoreInventoryState: function(inventoryState) {
        if( !state.actionChart.hasBackpack && inventoryState.hasBackpack )
            actionChartController.pick('backpack', false, false);
        actionChartController.pickItemsList( inventoryState.weapons );
        actionChartController.pickItemsList( inventoryState.backpackItems );
        actionChartController.pickItemsList( inventoryState.specialItems );
        actionChartController.increaseMoney( inventoryState.beltPouch );
        actionChartController.increaseMeals( inventoryState.meals );
    },

    /**
     * Increase the number of arrows of the player
     * @param increment N. of arrows to increment. Negative to decrement
     */
    increaseArrows : function(increment : number) {
        state.actionChart.increaseArrows(increment);
        var o = state.mechanics.getObject('arrow');
        if( increment > 0 )
            actionChartView.showInventoryMsg('pick' , o , 
                translations.text( 'msgGetArrows' , [increment] ) );
        else if( increment < 0 )
            actionChartView.showInventoryMsg('drop' , o , 
                translations.text( 'msgDropArrows' , [-increment] ) );
    },

    /** Return page */
    getBackController: function() { return 'game'; },

};