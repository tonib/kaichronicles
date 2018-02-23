
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
    pick: function(objectId : string, showError : boolean = false, fromUITable : boolean = false) : boolean {
        try {
            // Get object info
            var o = state.mechanics.getObject(objectId);
            if( o === null )
                return false;

            // Check if the section has restrictions about picking objects
            // This will throw an exception if no more objects can be picked
            if( fromUITable )
                EquipmentSectionMechanics.checkMoreObjectsCanBePicked( objectId );

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
     * or "allweapons" to drop all weapons (it does not drop special items weapons),  
     * or "allweaponlike" to drop all weapons and special items weapons
     * or "backpackcontent" to drop all backpack content, but not the backpack 
     * or "currentweapon" to drop the current weapon,
     * or "allspecial" to drop all the special items
     * or "allmeals" to drop all meals
     * or "all" to drop all (weapons, backpack, special items, and money)
     * or "allobjects" to drop all objects (weapons, backpack content, special items)
     * @param availableOnSection True if the object should be available on 
     * the current section
     * @param fromUI True if the action is fired from the UI
     * @param count Object count (only for quivers. count == n. arrows to drop)
     * @returns True if the object has been dropped
     */
    drop: function( objectId : string, availableOnSection : boolean = false, fromUI : boolean = false, count : number = 0 ) : boolean {

        if( objectId == 'allweapons' ) {
            actionChartController.dropItemsList( state.actionChart.weapons );
            return true;
        }

        if( objectId == 'currentweapon' ) {
            if( state.actionChart.selectedWeapon )
                this.drop( state.actionChart.selectedWeapon );
            return true;
        }

        if( objectId == 'allweaponlike' ) {
            let weaponsIds = [];
            for( let w of state.actionChart.getWeaponObjects(false) )
                weaponsIds.push(w.id);
            actionChartController.dropItemsList( weaponsIds );
            return true;
        }

        if( objectId == 'backpackcontent' ) {
            actionChartController.dropBackpackContent();
            return true;
        }

        if( objectId == 'allspecial') {
            actionChartController.dropItemsList( state.actionChart.specialItems );
            return true;
        }

        if( objectId == 'allmeals' ) {
            actionChartController.increaseMeals( -state.actionChart.meals );
            return true;
        }
        
        if( objectId == 'all' || objectId == 'allobjects' ) {

            if( objectId == 'all' ) {
                actionChartController.drop('backpack');
                actionChartController.increaseMoney( - state.actionChart.beltPouch );
            }
            else {
                // objectId == 'allobjects' => Backpack content, but not the backpack itself
                actionChartController.drop('backpackcontent');
            }

            actionChartController.drop('allweapons');
            actionChartController.drop('allspecial');
            return true;
        }

        var o = state.mechanics.getObject(objectId);
        if( !o )
            return false;
        
        // There is a problem with this: The player clicks "drop" on a quiver with a given number
        // of arrows. You should drop THAT quiver (and no other). So, pass the number of arrows as parameter
        /*
        let count = 0;
        if( objectId == Item.QUIVER ) {
            // Number of arrows on the quiver (to keep it on the dropped object)
            count = state.actionChart.arrows % 6;
            if( count == 0 && state.actionChart.arrows > 0 )
                count = 6;
        }
        */

        const dropped = state.actionChart.drop(objectId, count);
        if( dropped ) {
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
                sectionState.addObjectToSection( objectId , 0 , false , count );

                // Render available objects on this section (game view)
                mechanicsEngine.fireInventoryEvents( fromUI , o );
            }
        }
        return dropped;
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
     * @param arrayOfItems Array of the objects ids to drop.
     */
    dropItemsList: function(arrayOfItems : Array<string>) {
        // arrayOfItems can be a reference to a state.actionChart member, so don't
        // traverse it as is, or we will lose elements
        const elementsToDrop = arrayOfItems.clone();
        for( let objectId of elementsToDrop )
            actionChartController.drop(objectId, false, false);
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
     * @param dropObject True if the object should be droped from the action chart
     */
    use: function(objectId : string, dropObject : boolean = true) {
        // Get the object
        var o = state.mechanics.getObject(objectId);
        if( !o || !o.usage )
            return;

        // Do the usage action:
        if( o.usage.cls == 'endurance' )
            actionChartController.increaseEndurance( o.usage.increment );
        else if( o.usage.cls == 'combatSkill' ) {
            // Combat skill modifiers only apply to the current section combats
            const sectionState = state.sectionStates.getSectionState();
            sectionState.combatSkillUsageModifier( o.usage.increment );
        }
        else if( o.usage.cls == 'special' )
            // Special usage
            SpecialObjectsUse.use( o );

        // Update player statistics
        actionChartView.updateStatistics();
        template.updateStatistics();
        
        // Drop the object, and do not keep it on the section
        if( dropObject )
            actionChartController.drop(objectId, false);

        // Fire mechanics rules
        mechanicsEngine.fireObjectUsed( objectId );
    },

    /**
     * Increase / decrease the meals number
     * @param count Number to increase. Negative to decrease 
     */
    increaseMeals: function(count : number) {
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
     * Increase / decrease the money counter
     * @param count Number to increase. Negative to decrease 
     * @param availableOnSection The dropped money should be available on the current section? Only applies if count < 0
     * @returns Amount really picked.
     */
    increaseMoney: function(count : number, availableOnSection: boolean = false) : number {
        const amountPicked = state.actionChart.increaseMoney(count);
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
        return amountPicked;
    },

    /**
     * Increase / decrease the current endurance
     * @param count Number to increase. Negative to decrease
     * @param noToast True if no message should be show
     * @param permanent True if the increase is permanent (it changes the original endurance)
     */
    increaseEndurance: function( count : number, noToast : boolean = false, permanent : boolean = false ) {
        state.actionChart.increaseEndurance(count, permanent);
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
     * @param showToast True if we should show a "toast" on the UI with the CS increase
     */
    increaseCombatSkill: function(count , showToast : boolean = true ) {
        state.actionChart.combatSkill += count;
        if( showToast ) {
            if( count > 0 )
                toastr.success( translations.text('msgCombatSkill' , ['+' + count]) );
            else if( count < 0 )
                toastr.warning( translations.text('msgCombatSkill' , [count]) );
        }
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

        if( !state.actionChart.hasObject(weaponId) )
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
     * This does not replace the current inventory, just append objects to the current.
     * @param inventoryState Inventory to recover. Objects restored will be removed from the state
     * @param recoverWeapons Should we recover weapons (includes special items)?
     */
    restoreInventoryState: function(inventoryState : InventoryState, recoverWeapons : boolean) {

        if( !state.actionChart.hasBackpack && inventoryState.hasBackpack )
            actionChartController.pick( Item.BACKPACK, false, false);
        inventoryState.hasBackpack = false;

        actionChartController.increaseMoney( inventoryState.beltPouch );
        inventoryState.beltPouch = 0;

        actionChartController.increaseMeals( inventoryState.meals );
        inventoryState.meals = 0;

        actionChartController.pickItemsList( inventoryState.backpackItems );
        inventoryState.backpackItems = [];

        if( recoverWeapons ) {
            actionChartController.pickItemsList( inventoryState.weapons );
            inventoryState.weapons = [];
        }

        if( recoverWeapons ) {
            actionChartController.pickItemsList( inventoryState.specialItems );
            inventoryState.specialItems = [];
        }
        else {
            // Recover only non-weapon special items
            let toRecover : Array<string> = [];
            for(let itemId of inventoryState.specialItems) {
                const i = state.mechanics.getObject( itemId );
                if( i && !i.isWeapon() )
                    toRecover.push( itemId );
            }
            actionChartController.pickItemsList( toRecover );

            // Remove recovered items
            for( let itemId of toRecover)
                inventoryState.specialItems.removeValue( itemId );
        }

        // This must be done after picking quivers (special items)
        actionChartController.increaseArrows( inventoryState.arrows );
        inventoryState.arrows = 0;
    },

    /**
     * Increase the number of arrows of the player
     * @param increment N. of arrows to increment. Negative to decrement
     * @returns Number of really increased arrows. Arrows number on action chart is limited by the number of quivers
     */
    increaseArrows : function(increment : number) : number {
        const realIncrement = state.actionChart.increaseArrows(increment);
        const o = state.mechanics.getObject('arrow');

        if( realIncrement > 0 )
            actionChartView.showInventoryMsg('pick' , o , 
                translations.text( 'msgGetArrows' , [realIncrement] ) );
        // If increment is negative, show always the original amount, not the real (useful for debugging)
        else if( increment < 0 )
            actionChartView.showInventoryMsg('drop' , o , 
                translations.text( 'msgDropArrows' , [-increment] ) );
        else if( increment > 0 && realIncrement == 0 ) {
            // You cannot pick more arrows (not quivers enough)
            toastr.error( translations.text( 'noQuiversEnough' ) );
        }

        return realIncrement;
    },

    /** Return page */
    getBackController: function() { return 'game'; },

};
