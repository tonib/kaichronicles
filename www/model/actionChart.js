
/**
 * The action chart / player state 
 */
function ActionChart() {

    /** The original combat skill */ 
    this.combatSkill = 0;
    /** The original endurance */
    this.endurance = 0;
    /** The current endurance */
    this.currentEndurance = 0;

    this.weapons = [];
    /** The currently selected weapon  */ 
    this.selectedWeapon = '';

    this.beltPouch = 0;
    /** Number of meals (they count as backpack items) */
    this.meals = 0;
    this.backpackItems = [];
    this.specialItems = [];
    /** The player has a backpack? */
    this.hasBackpack = true;

    this.disciplines = [];
    /** The weapon code for the "wepnskll" discipline */
    this.weaponSkill = '';

    // Debug fast setup:
    if( window.getUrlParameter('debug') ) {
        this.endurance = this.currentEndurance = 25;
        this.combatSkill = 15;
        this.disciplines = [ 'camflage' , 'hunting' , 'sixthsns' , 'healing' , 'wepnskll' ];
        this.weaponSkill = 'axe';
    }
}

/**
 * Pick an object
 * @param o Object to pick
 * @return {boolean} True if the object was really picked
 */
ActionChart.prototype.pick = function(o) {

    if( !o )
        return;

    switch( o.type ) {
        case 'weapon':
            if( this.weapons.length >= 2 )
                throw 'You cannot pick more weapons';
            console.log('Picked weapon ' + o.id);
            this.weapons.push(o.id);
            this.checkCurrentWeapon();
            return true;

        case 'special':
            this.specialItems.push(o.id);
            if(o.isWeapon())
                this.checkCurrentWeapon();
            console.log('Picked special ' + o.id);
            return true;

        case 'object':

            if( o.id == 'backpack' ) {
                // Special case
                if( this.hasBackpack )
                    throw 'You already have a backpack';

                this.hasBackpack = true;
                return true;
            }

            if( !this.hasBackpack )
                throw 'You don\'t have a backpack';
            if( ( this.getNBackpackItems() + o.itemCount ) > 8 )
                throw 'You can have only 8 backpack objects';
            if( o.id == 'meal')
                // Special case
                this.increaseMeals(1);
            else
                this.backpackItems.push(o.id);
            if(o.isWeapon())
                this.checkCurrentWeapon();
            console.log('Picked object ' + o.id);
            return true;
            
        default:
            throw 'Unknown object type: ' + o.type;
    }

};

/**
 * Returns the total number of backpack items 
 */
ActionChart.prototype.getNBackpackItems = function() {
    var count = this.meals;
    for( var i=0; i<this.backpackItems.length; i++) {
        var o = state.mechanics.getObject(this.backpackItems[i]);
        if( o )
            count += o.itemCount;
    }
    return count;
};

/**
 * Increase / decrease the meals number
 * @param count Number to increase. Negative to decrease
 * @return The number of really picked meals 
 */
ActionChart.prototype.increaseMeals = function(count) {
    if( count > 0 ) {

        if( !this.hasBackpack )
            throw 'You don\'t have  a backpack';

        var maxToPick = 8 - this.getNBackpackItems();
        if( maxToPick < 0 )
            count = 0;
        else if( count > maxToPick )
            count = maxToPick; 
    }
    this.meals += count;
    console.log('Picked ' + count + ' meals');
    return count;
};

/**
 * Increase / decrease the money number
 * @param count Number to increase. Negative to decrease 
 */
ActionChart.prototype.increaseMoney = function(count) {
    this.beltPouch += count;
    if( this.beltPouch > 50 )
        this.beltPouch = 50;
    else if( this.beltPouch < 0 )
        this.beltPouch = 0;
    console.log('Picked ' + count + ' crowns');
};

/**
 * Returns true if the player has the object
 * @param {string} objectId The object id to test. "backpack" to check if the player
 * has a backpack
 */
ActionChart.prototype.hasObject = function(objectId) {
    if( objectId == 'backpack' )
        return this.hasBackpack;
        
    return this.backpackItems.contains( objectId ) ||
        this.specialItems.contains( objectId ) ||
        this.weapons.contains( objectId );
};

/**
 * Drop an object
 * @param objectId Object id to drop, or 'meal' to drop one meal, or 'backpack' to drop the 
 * backpack.
 * @return True if player had the object 
 */
ActionChart.prototype.drop = function(objectId) {

    if( objectId == 'meal' ) {
        // Special
        this.increaseMeals(-1);
        return true;
    }

    if( objectId == 'backpack' ) {
        // Special
        if( !this.hasBackpack )
            return false;

        this.hasBackpack = false;
        this.meals = 0;
        this.backpackItems = [];
        this.checkCurrentWeapon();
        return true;
    }

    if( this.backpackItems.removeValue(objectId) || this.specialItems.removeValue(objectId)) {
        this.checkMaxEndurance();
        this.checkCurrentWeapon();
        return true;
    }
    
    if( this.weapons.removeValue(objectId) ) {
        // Check changes on selected weapon
        this.checkCurrentWeapon();
        return true;
    }
    return false;
};

/**
 * Check if the player still has its selected weapon
 */
ActionChart.prototype.checkCurrentWeapon = function() {

    if( this.selectedWeapon && this.hasObject(this.selectedWeapon) )
        // All is ok
        return;

    // Try to set the current weapon
    var weaponObjects = this.getWeaponObjects();
    if( weaponObjects.length == 0 ) {
        // No weapons
        this.selectedWeapon = '';
        return;
    }
    else if( weaponObjects.length >= 1 ) {
        // Get one
        this.selectedWeapon = weaponObjects[0].id;
        return;
    }
};

/**
 * Checks if the current endurance if bigger than the maximum.
 * This can happens if an object that has effects (increase endurance) has ben dropped
 */
ActionChart.prototype.checkMaxEndurance = function() {
    var max = this.getMaxEndurance();
    if( this.currentEndurance > max )
        this.currentEndurance = max;
};

/**
 * Increase / decrease the current endurance
 * @param count Number to increase. Negative to decrease 
 */
ActionChart.prototype.increaseEndurance = function(count) {
    this.currentEndurance += count;
    this.checkMaxEndurance();
    if( this.currentEndurance < 0 )
        this.currentEndurance = 0;
};

/**
 * Get the current combat skill.
 * @param {boolean} noMindblast If true, the Mindblast discipline bonus is not added 
 * @param {boolean} noWeapon If true, the combat skill for combat without weapons.
 * If false, the combat skill for the current selected weapon
 * @return The current combat skill. It includes bonuses for weapons and mindblast
 * discipline
 */
ActionChart.prototype.getCurrentCombatSkill = function(noMindblast, noWeapon) {
    
    var cs = this.combatSkill;
    var bonuses = this.getCurrentCombatSkillBonuses(noMindblast, noWeapon);
    for(var i=0; i<bonuses.length; i++)
        cs += bonuses[i].increment;

    return cs;
};

/**
 * Return true if the Weaponskill is active with the selected weapon
 * @param {Item} currentWeapon The selected weapon. null if the is player has no weapon
 * @return {boolean} True if Weaponskill is active
 */
ActionChart.prototype.isWeaponskillActive = function(currentWeapon) {
    if( !currentWeapon )
        return false;

    return this.disciplines.contains( 'wepnskll' ) &&
        currentWeapon.isWeaponType(this.weaponSkill);
};

/**
 * Get the selected weapon info
 * @return {Item} The current weapon info. null if the is player has no weapon
 */
ActionChart.prototype.getselectedWeaponItem = function() {
    return this.selectedWeapon ? state.mechanics.getObject(this.selectedWeapon) : null;
};

/**
 * Get the current bonuses for combat skill
 * @param {boolean} noMindblast If true, the Mindblast discipline bonus is not added 
 * @param {boolean} noWeapon If true, the combat skill for combat without weapons.
 * If false, the combat skill for the current selected weapon
 * @return {Array} Array of objects with the bonuses concepts
 */
ActionChart.prototype.getCurrentCombatSkillBonuses = function(noMindblast, noWeapon) {
    var bonuses = [];

    var currentWeapon = this.getselectedWeaponItem();

    // Weapons
    if( noWeapon || !currentWeapon ) {
        // No weapon:
        bonuses.push( {
            concept: 'No weapon',
            increment: -4
        });
    }
    else if( this.isWeaponskillActive(currentWeapon) ) {       
        // Weapon skill bonus
        bonuses.push( {
            concept: 'Weaponskill',
            increment: +2
        });
    }

    // Check weapon bonuses
    if( currentWeapon && currentWeapon.effect && currentWeapon.effect.cls == 'combatSkill' ) {
        bonuses.push( {
            concept: currentWeapon.name,
            increment: currentWeapon.effect.increment
        });
    }

    // Mindblast
    if( !noMindblast && this.disciplines.contains( 'mndblst' ) ) {
        bonuses.push( {
            concept: 'Mindblast',
            increment: +2
        });
    }

    // Objects (not weapons. Ex. shield)
    this.enumerateObjects( function(o) {
        if( !o.isWeapon() && o.effect && o.effect.cls == 'combatSkill' ) {
            bonuses.push( {
                concept: o.name,
                increment: o.effect.increment 
            });
        }
    });

    return bonuses;
}

/**
 * Function to enumerate backpack objects and special items
 * @param {function} callback Function to be called for each object
 */
ActionChart.prototype.enumerateObjects = function( callback ) {

    var enumerateFunction = function(index, objectId) {
        var o = state.mechanics.getObject(objectId);
        if( !o )
            return;
        callback(o);
    };

    // Check objects:
    $.each( this.backpackItems , enumerateFunction );
    $.each( this.specialItems , enumerateFunction );
};

/**
 * Returns the maximum endurance of the player
 */
ActionChart.prototype.getMaxEndurance = function() {

    var e = this.endurance;
    var bonuses = this.getEnduranceBonuses();
    for(var i=0; i<bonuses.length; i++)
        e += bonuses[i].increment;
    return e;
};

/**
 * Get the current bonuses for endurance
 * @return {Array} Array of objects with the bonuses concepts
 */
ActionChart.prototype.getEnduranceBonuses = function() {

    var bonuses = [];
    this.enumerateObjects( function(o) {
        if( o.effect && o.effect.cls == 'endurance' ) {
            bonuses.push( {
                concept: o.name,
                increment: o.effect.increment 
            });
        }
    });
    return bonuses;
};

/**
 * Returns the backpack objects and special items that are meals too
 * @return {Array<string>} Meal-like objects on backpack
 */
ActionChart.prototype.getMealObjects = function() {

    var result = [];
    this.enumerateObjects( function(o) {
        if( o.isMeal && !result.contains(o.id) )
            result.push(o.id);
    });
    return result;
};

/**
 * Returns all weapons and backpack / special item objects that can be
 * used as weapons
 * @return {Array<Item>} All weapon objects
 */
ActionChart.prototype.getWeaponObjects = function() {

    // Weapons
    var result = [];
    for( var i=0; i<this.weapons.length; i++) {
        var o = state.mechanics.getObject(this.weapons[i]);
        if( o )
            result.push(o);
    }

    // Weapon-like objects
    this.enumerateObjects( function(o) {
        if( o.isWeapon() )
            result.push(o);
    });
    return result;
};