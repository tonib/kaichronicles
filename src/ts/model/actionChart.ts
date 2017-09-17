
/// <reference path="../external.ts" />

/**
 * Bonus for CS/EP definition
 */
interface Bonus {
    /** The bonus description */
    concept : string;
    /** The increment / decrement of the CS/EP */
    increment : number;
}

/**
 * Inventory state on a given moment
 */
interface InventoryState {
    weapons: Array<string>;
    hasBackpack: boolean;
    backpackItems: Array<string>;
    specialItems: Array<string>;
    beltPouch: number;
    meals: number;
}

/**
 * The action chart / player state 
 */
class ActionChart {

    /** The original combat skill */ 
    public combatSkill = 0;

    /** The original endurance */
    public endurance = 0;

    /** The current endurance */
    public currentEndurance = 0;

    /** The player weapons (up to 2) */
    public weapons : Array<string> = [];

    /** The currently selected weapon  */ 
    public selectedWeapon = '';

    /** Money amount */
    public beltPouch = 0;

    /** Number of meals (they count as backpack items) */
    public meals = 0;

    /** Backpack items ids (up to 8) */
    public backpackItems : Array<string> = [];

    /** Special items ids */
    public specialItems = [];

    /** The player has a backpack? */
    public hasBackpack = true;

    /** Disciplines ids */
    public disciplines : Array<string> = [];
    
    /** 
     * The weapon codes for the "wepnskll" / "wpnmstry" disciplines.
     * On kai series, it's a single weapon. On magnakai, they are 3 or more
     */
    public weaponSkill : Array<string> = [];

    /** Player annotations */
    public annotations = '';

    /** Use manual random table? */
    public manualRandomTable = false;

    /** The latests scroll position on the game section */
    public yScrollPosition = 0;

    /** Number of arrows on the quiver. This MUST to be zero if the player has no quiver. */
    public arrows = 0;

    /** The player has used adgana previously? (see "pouchadgana" object) */
    public adganaUsed = false;

    constructor() {
        // Debug fast setup:
        if( window.getUrlParameter('debug') ) {
            this.endurance = this.currentEndurance = 25;
            this.combatSkill = 15;
            this.manualRandomTable = true;
            if( state.book.bookNumber <= 5 ) {
                // debug data for kai series
                this.disciplines = [ 'camflage' , 'hunting' , 'sixthsns' , 'healing' , 'wepnskll' ];
                this.weaponSkill = [ 'axe' ];
            }
            else {
                // debug data for magnakai
                this.disciplines = [ 'wpnmstry' , 'curing' , 'hntmstry' ];
                this.weaponSkill = [ 'axe' , 'sword' , 'bow' ];
            }
        }
    }

    /**
     * Pick an object
     * @param {Item} o Object to pick
     * @return {boolean} True if the object was really picked
     */
    public pick(o) {

        if( !o )
            return;

        // Check incompatibilities
        if( o.incompatibleWith && this.hasObject(o.incompatibleWith) ) {
            var incombatibleObject = state.mechanics.getObject(o.incompatibleWith);
            throw translations.text( 'msgIncompatible' , [incombatibleObject.name] );
        }

        switch( o.type ) {
            case 'weapon':
                if( this.weapons.length >= 2 )
                    throw translations.text('msgNoMoreWeapons');
                //console.log('Picked weapon ' + o.id);
                this.weapons.push(o.id);
                this.checkCurrentWeapon();
                return true;

            case 'special':
                this.specialItems.push(o.id);
                if(o.isWeapon())
                    this.checkCurrentWeapon();
                return true;

            case 'object':

                if( o.id == 'backpack' ) {
                    // Special case
                    if( this.hasBackpack )
                        throw translations.text( 'msgAlreadyBackpack' );

                    this.hasBackpack = true;
                    return true;
                }

                if( !this.hasBackpack )
                    throw translations.text( 'backpackLost' );
                if( ( this.getNBackpackItems() + o.itemCount ) > 8 )
                    throw translations.text( 'msgNoMoreBackpackItems' );
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

    }

    /**
     * Returns the total number of backpack items 
     */
    public getNBackpackItems() : number {
        var count = this.meals;
        for( var i=0; i<this.backpackItems.length; i++) {
            var o = state.mechanics.getObject(this.backpackItems[i]);
            if( o )
                count += o.itemCount;
        }
        return count;
    }

    /**
     * Increase / decrease the meals number
     * @param count Number to increase. Negative to decrease
     * @return The number of really picked meals 
     */
    public increaseMeals(count : number) : number {
        if( count > 0 ) {

            if( !this.hasBackpack )
                throw translations.text( 'backpackLost' );

            var maxToPick = 8 - this.getNBackpackItems();
            if( maxToPick < 0 )
                count = 0;
            else if( count > maxToPick )
                count = maxToPick; 
        }
        this.meals += count;
        //console.log('Picked ' + count + ' meals');
        return count;
    }

    /**
     * Increase / decrease the money number
     * @param count Number to increase. Negative to decrease 
     */
    public increaseMoney(count : number) {
        this.beltPouch += count;
        if( this.beltPouch > 50 )
            this.beltPouch = 50;
        else if( this.beltPouch < 0 )
            this.beltPouch = 0;
        //console.log('Picked ' + count + ' crowns');
    }

    /**
     * Returns true if the player has the object
     * @param {string} objectId The object id to test. "backpack" to check if the player
     * has a backpack
     */
    public hasObject = function(objectId : string) : boolean {
        if( objectId == 'backpack' )
            return this.hasBackpack;
            
        return this.backpackItems.contains( objectId ) ||
            this.specialItems.contains( objectId ) ||
            this.weapons.contains( objectId );
    }

    /**
     * Drop an object
     * @param objectId Object id to drop, or 'meal' to drop one meal, or 'backpack' to drop the 
     * backpack.
     * @return True if player had the object 
     */
    public drop(objectId : string) : boolean {

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
            if( objectId == 'quiver' )
                this.arrows = 0;
            return true;
        }
        
        if( this.weapons.removeValue(objectId) ) {
            // Check changes on selected weapon
            this.checkCurrentWeapon();
            return true;
        }
        return false;
    }

    /**
     * Check if the player still has its selected weapon
     */
    private checkCurrentWeapon() {

        if( this.selectedWeapon && this.hasObject(this.selectedWeapon) )
            // All is ok
            return;

        // Try to set the current weapon, only hand-to-hand weapons
        var weaponObjects = this.getWeaponObjects(true);
        if( weaponObjects.length === 0 ) {
            // No weapons
            this.selectedWeapon = '';
            return;
        }
        else if( weaponObjects.length >= 1 ) {
            // Get one
            this.selectedWeapon = weaponObjects[0].id;
            return;
        }
    }

    /**
     * Checks if the current endurance if bigger than the maximum.
     * This can happens if an object that has effects (increase endurance) has ben dropped
     */
    private checkMaxEndurance() {
        var max = this.getMaxEndurance();
        if( this.currentEndurance > max )
            this.currentEndurance = max;
    }

    /**
     * Increase / decrease the current endurance
     * @param count Number to increase. Negative to decrease 
     * @param permanent True if the increase is permanent (it changes the original endurance)
     */
    public increaseEndurance = function(count : number, permanent : boolean = false) {
        if( permanent )
            this.endurance += count;
        this.currentEndurance += count;
        this.checkMaxEndurance();
        if( this.currentEndurance < 0 )
            this.currentEndurance = 0;
    }

    /**
     * Get the current combat skill.
     * @param combat The current combat. null to check default bonuses
     * @return The current combat skill. It includes bonuses for weapons and mindblast
     * discipline
     */
    public getCurrentCombatSkill( combat : Combat = null ) : number {
        
        var cs = this.combatSkill;
        var bonuses = this.getCurrentCombatSkillBonuses(combat);
        for(var i=0; i<bonuses.length; i++)
            cs += bonuses[i].increment;

        return cs;
    }

    /**
     * Return true if the Weaponskill is active with the selected weapon
     * @return True if Weaponskill is active
     */
    public isWeaponskillActive( bow : boolean = false ) : boolean {

        if( !this.disciplines.contains( 'wepnskll' ) && !this.disciplines.contains( 'wpnmstry' ) )
            // Player has no Weaponskill
            return false;

        const currentWeapon = this.getselectedWeaponItem( bow );
        if( !currentWeapon )
            // Player has no weapon
            return false;
            
        for(let i=0; i< this.weaponSkill.length; i++ ) {
            if( currentWeapon.isWeaponType( this.weaponSkill[i] ) )
                return true;
        }
    }

    /**
     * Check if the player has weaponskill with a given type of weapon
     * @param weaponType Weapon type to check
     * @return True if the player has weaponskill with that weapon
     */
    public hasWeaponskillWith( weaponType : string ) : boolean {
        if( !this.disciplines.contains( 'wepnskll' ) && !this.disciplines.contains( 'wpnmstry' ) )
            // Player has no Weaponskill
            return false;

        for( let w of this.weaponSkill )
            if( w == weaponType )
                return true;

        return false;
    }

    /**
     * Get the selected weapon info
     * @return {Item} The current weapon info. null if the is player has no weapon
     */
    public getselectedWeaponItem( bow : boolean = false ) : Item {

        if( bow )
            return this.getSelectedBow();
        
        return this.selectedWeapon ? state.mechanics.getObject(this.selectedWeapon) : null;
    }

    /**
     * Get bonuses for the selected weapon
     * @param noWeapon True if the combat is with no weapons
     * @param bowCombat True if it's a combat with bow
     * @param disabledObjectsIds Objects ids that cannot be used on this combat
     */
    private getWeaponCombatSkillBonuses( noWeapon : boolean , bowCombat : boolean , disabledObjectsIds : Array<string> ) 
    : Array<Bonus> {

        var bonuses = [];
        var currentWeapon = this.getselectedWeaponItem( bowCombat );

        // Check if the current weapon is disabled
        if( disabledObjectsIds.length > 0 && currentWeapon ) {
            if( disabledObjectsIds.contains( currentWeapon.id ) )
                // Disabled
                currentWeapon = null;
            else if( currentWeapon.weaponType && disabledObjectsIds.contains( currentWeapon.weaponType ) ) {
                // Base weapon disabled
                currentWeapon = null;
            }
        }

        // Weapons
        if( noWeapon || !currentWeapon ) {
            // No weapon:
            let modifier = -4;
            if( this.disciplines.contains( 'wpnmstry' ) && this.disciplines.length >= 5 )
                modifier = -2; // Tutelaries with Weaponmastery are better at unarmed combat
            bonuses.push( {
                concept: translations.text('noWeapon'),
                increment: modifier
            });
        }
        else if( this.isWeaponskillActive( bowCombat ) ) {
            // Weapon skill bonus
            if( state.book.bookNumber <= 5 )
                // Kai book:
                bonuses.push( {
                    concept: translations.text( 'weaponskill' ),
                    increment: +2
                });
            else
                // Magnakai book
                bonuses.push( {
                    concept: translations.text( 'weaponmastery' ),
                    increment: +3
                });
        }

        // Check current weapon bonuses
        if( !noWeapon && currentWeapon && currentWeapon.effect && currentWeapon.effect.cls == 'combatSkill' ) {
            bonuses.push( {
                concept: currentWeapon.name,
                increment: currentWeapon.effect.increment
            });
        }

        return bonuses;
    }

    public getBowBonus() : number {
        let bonus = 0
        for( let b of this.getWeaponCombatSkillBonuses(false, true, []) )
            bonus += b.increment;
        return bonus;
    }

    /**
     * Get the current bonuses for combat skill
     * @param combat The current combat. null to check default bonuses
     * @return Array of objects with the bonuses concepts
     */
    public getCurrentCombatSkillBonuses(combat : Combat = null) : Array<Bonus> {

        if( !combat )
            // Create a fake combat with the default values
            combat = new Combat('Fake enemy' , 0 , 0 );

        var bonuses = [];

        var currentWeapon = this.getselectedWeaponItem( combat.bowCombat );

        // Current weapon bonuses
        if ( !combat.mentalOnly ) {
            for( let b of this.getWeaponCombatSkillBonuses( combat.noWeapon , combat.bowCombat , combat.disabledObjects ) )
                bonuses.push( b );
        }

        // Mindblast / Psi-surge
        if( combat.psiSurge ) {
            bonuses.push( {
                concept: translations.text( 'psisurge' ),
                increment: +4 * combat.mindblastMultiplier
            });
        }
        else if( !combat.noMindblast && ( this.disciplines.contains( 'mndblst' ) || this.disciplines.contains( 'psisurge' ) ) ) {
            bonuses.push( {
                concept: translations.text( 'mindblast' ),
                increment: (combat.mindblastBonus ? combat.mindblastBonus : +2) * combat.mindblastMultiplier
            });
        }

        // Other objects (not weapons). Ex. shield. They are not applied for bow combats
        if( !combat.mentalOnly && !combat.bowCombat ) {
            this.enumerateObjects( function(o) {
                if( !o.isWeapon() && o.effect && o.effect.cls == 'combatSkill' && !combat.disabledObjects.contains(o.id) ) {
                    bonuses.push( {
                        concept: o.name,
                        increment: o.effect.increment 
                    });
                }
            });
        }
        
        // Lore-circles bonuses
        // We disable these in a mental combat, but flavor-wise, we should
        // arguably still allow the Spirit circle. Although the game rules are
        // not that detailed.
        if ( !combat.mentalOnly ) {
            const circlesBonuses = LoreCircle.getCirclesBonuses( this.disciplines , 'CS' );
            for( let c of circlesBonuses )
                bonuses.push(c);
        }

        return bonuses;
    }

    /**
     * Function to enumerate backpack objects and special items
     * @param {function} callback Function to be called for each object
     */
    private enumerateObjects( callback ) {

        var enumerateFunction = function(index, objectId) {
            var o = state.mechanics.getObject(objectId);
            if( !o )
                return;
            callback(o);
        };

        // Check objects:
        $.each( this.backpackItems , enumerateFunction );
        $.each( this.specialItems , enumerateFunction );
    }

    /**
     * Returns the maximum endurance of the player
     */
    public getMaxEndurance() : number {
        var e = this.endurance;
        var bonuses = this.getEnduranceBonuses();
        for(var i=0; i<bonuses.length; i++)
            e += bonuses[i].increment;
        return e;
    }

    /**
     * Get the current bonuses for endurance
     * @return Array of objects with the bonuses concepts
     */
    public getEnduranceBonuses() : Array<Bonus> {

        var bonuses = [];
        this.enumerateObjects( function(o) {
            if( o.effect && o.effect.cls == 'endurance' ) {
                bonuses.push( {
                    concept: o.name,
                    increment: o.effect.increment 
                });
            }
        });

        const circlesBonuses = LoreCircle.getCirclesBonuses( this.disciplines , 'EP' );
        for( let c of circlesBonuses )
            bonuses.push(c);

        return bonuses;
    }

    /**
     * Returns the backpack objects and special items that are meals too
     * @return {Array<string>} Meal-like objects on backpack
     */
    public getMealObjects() {

        var result = [];
        this.enumerateObjects( function(o) {
            if( o.isMeal && !result.contains(o.id) )
                result.push(o.id);
        });
        return result;
    }

    /**
     * Returns all weapons and backpack / special item objects that can be
     * used as weapons
     * @param onlyHandToHand If it's true, only hand to hand weapons will be returned
     * @return All weapon objects
     */
    public getWeaponObjects(onlyHandToHand : boolean = false) : Array<Item> {

        // Weapons
        let result : Array<Item> = [];
        for( let i=0; i<this.weapons.length; i++) {
            let o = state.mechanics.getObject(this.weapons[i]);
            if( o && ( !onlyHandToHand || o.isHandToHandWeapon() ) )
                result.push(o);
        }

        // Weapon-like objects
        this.enumerateObjects( function(o : Item) {
            if( o.isWeapon() && ( !onlyHandToHand || o.isHandToHandWeapon() ) )
                result.push(o);
        });
        return result;
    }

    /**
     * Return an object with the current inventory state
     * @param objectTypes Kind of objects to get: 'all' = all, 'weaponlike' = weapons and weapon Special Objects
     */
    public getInventoryState( objectTypes ) : InventoryState {

        if( objectTypes == 'all')
            return {
                weapons: this.weapons.clone(),
                hasBackpack: this.hasBackpack,
                backpackItems: this.backpackItems.clone(),
                specialItems: this.specialItems.clone(),
                beltPouch: this.beltPouch,
                meals: this.meals
            };
        else if( objectTypes == 'weaponlike' ) {
            let objects : InventoryState = {
                weapons: [],
                hasBackpack: false,
                backpackItems: [],
                specialItems: [],
                beltPouch: 0,
                meals: 0
            };

            for( let w of this.getWeaponObjects(false) ) {
                if( w.type == Item.WEAPON )
                    objects.weapons.push(w.id);
                else if( w.type == Item.SPECIAL)
                    objects.specialItems.push(w.id);
                else if( w.type == Item.OBJECT)
                    objects.backpackItems.push(w.id);
            }
            return objects;
        }
        else
            throw 'Wrong objectTypes: ' + objectTypes;
    }

    /**
     * Joins two inventory states
     */
    public static joinInventoryStates = function(s1 : InventoryState, s2 : InventoryState) {
        return {
            weapons: s1.weapons.concat( s2.weapons ),
            hasBackpack: s1.hasBackpack || s2.hasBackpack ,
            backpackItems: s1.backpackItems.concat( s2.backpackItems ),
            specialItems: s1.specialItems.concat ( s2.specialItems ),
            beltPouch: s1.beltPouch + s2.beltPouch,
            meals: s1.meals + s2.meals
        };
    }

    /**
     * Increase the number of arrows of the player
     * @param increment N. of arrows to increment. Negative to decrement
     */
    public increaseArrows(increment : number) {
        this.arrows += increment;
        if( this.arrows < 0 )
            this.arrows = 0;
    }

    /**
     * Get the magnakai lore circles owned by the player
     */
    public getLoreCircles() : Array<LoreCircle> {
        return LoreCircle.getCircles(this.disciplines);
    }

    /** The player has Mindshield / Psi-screen? */
    public hasMindShield() : boolean {
        return this.disciplines.contains( 'mindshld' ) || this.disciplines.contains( 'psiscrn' );
    }

    /** The player has a bow and some arrow? */
    public canUseBow() : boolean {
        if( this.getSelectedBow() == null )
            return false;
        return this.arrows > 0;
    }

    /**
     * Get the selected bow weapon
     * TODO: This returns the bow with the maximum CS bonus. Allow to selected the current bow
     */
    public getSelectedBow() : Item {
        return this.getWeaponType( 'bow' );
    }

    /** 
     * Return the weapon of a given type, with the bigger bonus for combat skill. 
     * null if the player has not that kind of weapon 
     */
    public getWeaponType( weaponType : string ) : Item {
        let maxBonus = 0;
        let selectedWeapon : Item = null;
        for( let weapon of this.getWeaponObjects() ) {
            if( weapon.isWeaponType( weaponType ) ) {
                let weaponBonus : number = weapon.getCombatSkillEffect();
                if( weaponBonus >= maxBonus ) {
                    maxBonus = weaponBonus;
                    selectedWeapon = weapon;
                }
            }
        }
        return selectedWeapon;
    }
    
}

