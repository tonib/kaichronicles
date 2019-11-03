
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
 * The action chart / player state 
 */
class ActionChart {

    /** First book number with a limit on Special Items count */
    public static BOOK_WITH_MAX_SPECIALS = 8;

    /** The original combat skill */ 
    public combatSkill = 0;

    /** The original endurance */
    public endurance = 0;

    /** The current endurance */
    public currentEndurance = 0;

    /** The player weapons (up to 2) */
    public weapons : Array<string> = [];

    /**
      * If true, the player will fight with no weapons (hand-to-hand).
      * This may seem stupid, but in book 12 there are places where, if you try to fight with the Sommerswerd, you die. 
      */
    public fightUnarmed = false;

    /** The currently hand-to-hand selected weapon id. Empty string if the player has no weapon  */ 
    private selectedWeapon = '';

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
    public manualRandomTable = true;

    /** Use extended Combat Results Table?
     * See LW club newsletter 29 (https://www.projectaon.org/en/pdf/lwcn/Newsletters-All.pdf , page 415)
     */
    public extendedCRT = false;

    /** The latests scroll position on the game section */
    public yScrollPosition = 0;

    /** Number of arrows on the quiver. This MUST be zero if the player has no quiver. */
    public arrows = 0;

    /** The player has used adgana previously? (see "pouchadgana" object) */
    public adganaUsed = false;
    
    /**
     * Restore 20 EP used?.
     * Archmaster level:
     * Archmasters are able to use their healing power to repair serious wounds sustained in battle. If, whilst in combat, their ENDURANCE is
     * reduced to 6 points or less, they can use their skill to restore 20 ENDURANCE points. This ability can only be used once every 100 days.
     */
    private restore20EPUsed = false;

    /**
     * Objects in safekeeping at Kai monastery
     */
    public kaiMonasterySafekeeping : Array<SectionItem>  = [];

    constructor() {
        // Debug fast setup:
        if( window.getUrlParameter('debug') ) {
            this.endurance = this.currentEndurance = 25;
            this.combatSkill = 15;
            this.manualRandomTable = true;
            this.extendedCRT = false;
            if( state.book ) {
                if( state.book.isGrandMasterBook() ) {
                    this.endurance = this.currentEndurance = 35;
                    this.combatSkill = 30;
                    // debug data for Grand Master
                    this.disciplines = [ 'wpnmstry' , 'deliver' , 'hntmstry', 'assimila' ];
                    this.weaponSkill = [ 'axe' , 'sword' ];
                } else if (state.book.isMagnakaiBook()) {
                    // debug data for magnakai
                    this.disciplines = [ 'wpnmstry' , 'curing' , 'hntmstry' ];
                    this.weaponSkill = [ 'axe' , 'sword' , 'bow' ];
                }
                else {
                    // debug data for kai series
                    this.disciplines = [ 'camflage' , 'hunting' , 'sixthsns' , 'healing' , 'wepnskll' ];
                    this.weaponSkill = [ 'axe' ];
                }
            }
        }
    }

    /**
     * Returns the currently hand-to-hand selected weapon id.
     * @returns The currently selected weapon id. Empty string if the player has no weapon selected
     */
    public getSelectedWeapon() : string {
        if( this.fightUnarmed )
            return '';

        return this.selectedWeapon;
    }

    /**
     * Set the selected hand-to-hand weapon id.
     * This will set the fightUnarmed flag to false.
     * @param weaponId The new selected weapon id. No tests are done over this weapon id!
     */
    public setSelectedWeapon( weaponId : string ) {
        this.selectedWeapon = weaponId;
        this.fightUnarmed = false;
    }

    /**
     * Get the selected weapon info
     * @param bow True if we should return the selected bow info. False to return the selected hand-to-hand weapon info.
     * @return The current weapon info. null if the is player has no weapon
     */
    public getSelectedWeaponItem( bow : boolean = false ) : Item {

        if( bow )
            return this.getSelectedBow();
        
        const weaponId = this.getSelectedWeapon();
        return weaponId ? state.mechanics.getObject( weaponId ) : null;
    }

    /**
     * Pick an object
     * TODO: It's a nosense: It returns false ONLY if o is null. On all other cases, it throws an exception.
     * TODO: If o is null, throw an exception too, and do not return any value
     * @param o Object to pick
     * @return True if the object was really picked
     */
    public pick( o : Item ) : boolean {

        if( !o )
            return false;

        // Check incompatibilities
        if( o.incompatibleWith.length > 0 ) {
            for( let incompatibleId of o.incompatibleWith ) {
                if( this.hasObject( incompatibleId ) ) {
                    var incombatibleObject = state.mechanics.getObject( incompatibleId );
                    throw translations.text( 'msgIncompatible' , [incombatibleObject.name] );
                }
            }
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

                // Check Special Items limit
                const nMax = ActionChart.getMaxSpecials();
                if( o.itemCount && nMax && ( this.getNSpecialItems(false) + o.itemCount ) > nMax )
                    throw translations.text( 'msgNoMoreSpecialItems' );

                // If the object is an Arrow, check if the player has some quiver
                if( o.isArrow && !this.hasObject( Item.QUIVER ) )
                    throw translations.text( 'noQuiversEnough' );

                this.specialItems.push( o.id );

                if( o.isWeapon() )
                    this.checkCurrentWeapon();

                if( o.isArrow )
                    // The object is an Arrow. Drop a normal Arrow if needed
                    this.sanitizeArrowCount();

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
                if( ( this.getNBackpackItems(false) + o.itemCount ) > (state.book.isGrandMasterBook() ? 10 : 8) )
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
     * Returns the total number of backpack items, according to the number of slots each item consum
     * @param roundToInteger If true, the total number of objects will be rounded up to a integer (Item.itemCount can have decimals)
     * @returns The number of objects on the backpack
     */
    public getNBackpackItems( roundToInteger : boolean = true ) : number {
        var count = this.meals;
        for( var i=0; i<this.backpackItems.length; i++) {
            var o = state.mechanics.getObject(this.backpackItems[i]);
            if( o )
                count += o.itemCount;
        }
        if( roundToInteger )
            count = Math.ceil( count );
        return count;
    }

    /**
     * Returns the total number of special items, according to the number of slots each item consum 
     * @param roundToInteger If true, the total number of objects will be rounded up to a integer (Item.itemCount can have decimals)
     * @returns The number of Special Items
     */
    public getNSpecialItems( roundToInteger : boolean = true ) : number {
        let count = 0;
        for( let specialId of this.specialItems ) {
            const o = state.mechanics.getObject( specialId );
            if( o )
                count += o.itemCount;
        }
        if( roundToInteger )
            count = Math.ceil( count );
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

        // Sanitize for negative count values
        if( this.meals < 0 )
            this.meals = 0;

        //console.log('Picked ' + count + ' meals');
        return count;
    }

    /**
     * Increase / decrease the money number
     * @param count Number to increase. Negative to decrease 
     * @returns Amount really picked.
     */
    public increaseMoney(count : number) : number {
        const oldBeltPouch = this.beltPouch;
        this.beltPouch += count;
        if( this.beltPouch > 50 )
            this.beltPouch = 50;
        else if( this.beltPouch < 0 )
            this.beltPouch = 0;
        return this.beltPouch - oldBeltPouch;
    }

    /**
     * Returns true if the player has the object
     * @param objectId The object id to test. "backpack" to check if the player has a backpack
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
     * @param count Object count. Only for quivers. count == n. arrows to drop. It must to be >= 0
     * @return True if player had the object 
     */
    public drop(objectId : string, count : number = 0) : boolean {

        if( objectId == Item.MEAL ) {
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
            if( objectId == Item.QUIVER ) {
                // Decrease arrows count
                this.arrows -= count;
                this.sanitizeArrowCount();
            }
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
            this.fightUnarmed = false;
            return;
        }
        else if( weaponObjects.length >= 1 ) {
            // Get one
            this.selectedWeapon = weaponObjects[0].id;
            return;
        }
    }

    /**
     * Returns the maximum endurance of the player
     */
    public getMaxEndurance() : number {

        if( this.endurance <= 0 )
            // If the original endurance is zero, the player is death
            return 0;

        let e = this.endurance;
        const bonuses = this.getEnduranceBonuses();
        for(var i=0; i<bonuses.length; i++)
            e += bonuses[i].increment;
        return e;
    }

    /**
     * Checks if the current endurance if bigger than the maximum.
     * This can happens if an object that has effects (increase endurance) has ben dropped, or if the original endurance has changed
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
    public increaseEndurance(count : number, permanent : boolean = false) {

        if( permanent ) {
            // Change the original endurance
            this.endurance += count;
            if( this.endurance < 0 )
                this.endurance = 0;
        }

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

        const currentWeapon = this.getSelectedWeaponItem( bow );
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
     * Get bonuses for the selected weapon
     * @param noWeapon True if the combat is with no weapons
     * @param bowCombat True if it's a combat with bow
     * @param disabledObjectsIds Objects ids that cannot be used on this combat
     * @returns Action chart bonuses for the combat
     */
    private getWeaponCombatSkillBonuses( noWeapon : boolean , bowCombat : boolean , disabledObjectsIds : Array<string> ) 
    : Array<Bonus> {

        var bonuses = [];
        var currentWeapon = this.getSelectedWeaponItem( bowCombat );

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
            // No weapon: -4 CS
            
            /*  Exception (Magnakai books):
                1) Kai level "Tutelary" with "Weaponmastery": Tutelaries are able to use defensive combat skills to great effect 
                   when fighting unarmed. When entering combat without a weapon, Tutelaries lose only 2 points from their COMBAT SKILL, 
                   instead of the usual 4 points. 
                2) Kai level "Scion-kai" with "Weaponmastery": ...Also, when in combat without a weapon they lose only 1 point 
                   from their COMBAT SKILL.
            */
            let bonus = -4;
            if( state.book.isMagnakaiBook() && state.actionChart.disciplines.contains( 'wpnmstry' ) ) {
                if(state.actionChart.disciplines.length >= 8 )
                    // Scion-kai
                    bonus = -1;
                else if( state.actionChart.disciplines.length >= 5 )
                    // Tutelary
                    bonus = -2;
            }

            bonuses.push( {
                concept: translations.text('noWeapon'),
                increment: bonus
            });
        }
        else if( this.isWeaponskillActive( bowCombat ) ) {
            // Weapon skill bonus
            if( state.book.isKaiBook() )
                // Kai book:
                bonuses.push( {
                    concept: translations.text( 'weaponskill' ),
                    increment: +2
                });
            else if( state.book.isMagnakaiBook() ) {
                // Magnakai book
                let bonus = +3;
                /*  Exception (Magnakai books):
                    Improvements: Scion-kai / Weaponmastery	/ When entering combat with a weapon they have mastered, Scion-kai may add 4 points 
                    (instead of the usual 3 points) to their COMBAT SKILL...
                */
                if(state.actionChart.disciplines.length >= 8 )
                    // Scion-kai
                    bonus = +4;

                bonuses.push( {
                    concept: translations.text( 'weaponmastery' ),
                    increment: bonus
                });
            } else {
                bonuses.push( {
                    concept: translations.text( 'grdweaponmastery' ),
                    increment: +5
                });
            }
        }

        // Check current weapon bonuses
        if( !noWeapon && currentWeapon && currentWeapon.combatSkillEffect ) {
            bonuses.push( {
                concept: currentWeapon.name,
                increment: currentWeapon.combatSkillEffect
            });
        }

        if( bowCombat ) {
            /* Improved disciplines:
                Kai level "Mentora" with "Weaponmastery": Mentoras skilled in Weaponmastery are more accurate when using all missile 
                weapons, whether fired (e.g. a bow) or thrown (e.g. a dagger). When using a bow or thrown weapon and instructed to pick a 
                number from the Random Number Table, add 2 to the number picked if you are a Mentora with the Magnakai Discipline 
                of Weaponmastery */
            if( state.book.isMagnakaiBook() && this.disciplines.length >= 7 && this.disciplines.contains( 'wpnmstry' ) ) {
                bonuses.push( {
                    concept: state.book.getKaiTitle(7), // "Mentora" traslation
                    increment: +2
                });
            }
        }
        
        return bonuses;
    }

    /**
     * Get total bonus for bow shots
     * @returns The bonus increment. It can be negative
     */
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

        if( !combat ) {
            // Create a fake combat with the default values
            combat = new Combat('Fake enemy' , 0 , 0 );
            // apply all global rules (to setup disabled objects for example)
            mechanicsEngine.runGlobalRules(true, combat);
        }

        var bonuses = [];

        var currentWeapon = this.getSelectedWeaponItem( combat.bowCombat );

        // Current weapon bonuses
        if ( !combat.mentalOnly ) {
            const noWeapon = combat.noWeaponCurrentTurn();
            for( let b of this.getWeaponCombatSkillBonuses( noWeapon , combat.bowCombat , combat.disabledObjects ) )
                bonuses.push( b );
        }

        // Mindblast / Psi-surge
        if( combat.kaiSurge ) {
            bonuses.push( {
                concept: translations.text( 'kaisurge' ),
                increment: (combat.kaiSurgeBonus ? combat.kaiSurgeBonus : Combat.defaultKaiSurgeBonus()) * combat.mindblastMultiplier
            });
        } else if( combat.psiSurge ) {
            bonuses.push( {
                concept: translations.text( 'psisurge' ),
                increment: (combat.psiSurgeBonus ? combat.psiSurgeBonus : Combat.defaultPsiSurgeBonus()) * combat.mindblastMultiplier
            });
        }
        else if( !combat.noMindblast && ( this.disciplines.contains( 'mndblst' ) || this.disciplines.contains( 'psisurge' ) || this.disciplines.contains( 'kaisurge' ) ) ) {
            bonuses.push( {
                concept: translations.text( 'mindblast' ),
                increment: (combat.mindblastBonus ? combat.mindblastBonus : Combat.defaultMindblastBonus()) * combat.mindblastMultiplier
            });
        }

        // Other objects (not weapons). Ex. shield. They are not applied for bow combats
        if( !combat.mentalOnly && !combat.bowCombat ) {
            this.enumerateObjects( function( o : Item ) {
                if( !o.isWeapon() && o.combatSkillEffect && !combat.disabledObjects.contains(o.id) ) {
                    bonuses.push( {
                        concept: o.name,
                        increment: o.combatSkillEffect
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
     * @param callback Function to be called for each object. Parameter is each Item owned by the player
     */
    private enumerateObjects( callback : ( o : Item ) => void ) {

        var enumerateFunction = function(index : number , objectId : string ) {
            const o = state.mechanics.getObject( objectId );
            if( !o )
                return;
            callback(o);
        };

        // Check objects:
        $.each( this.backpackItems , enumerateFunction );
        $.each( this.specialItems , enumerateFunction );
    }

    /**
     * Get the current bonuses for endurance
     * @return Array of objects with the bonuses concepts
     */
    public getEnduranceBonuses() : Array<Bonus> {

        var bonuses = [];
        this.enumerateObjects( function( o : Item ) {
            if( o.enduranceEffect ) {
                bonuses.push( {
                    concept: o.name,
                    increment: o.enduranceEffect
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
        this.enumerateObjects( function( o : Item ) {
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
     * Get the maximum arrows number the player can carry, given by the number of owned quivers
     * @returns The max. arrows number
     */
    public getMaxArrowCount() : number {

        // Compute the maximum number of arrows, given the carried quivers 
        let max = 0;
        for( let i=0; i<this.specialItems.length; i++ ) {
            if( this.specialItems[i] == Item.QUIVER )
                // Only 6 arrows per quiver
                max += 6;
        }

        // Objects with isArrow="true" occupies the same space in quiver as a normal Arrow
        this.enumerateObjects( function( o : Item ) {
            if( o.isArrow )
                max -= 1;
        });

        return max;
    }

    /**
     * Makes sure the arrow count fits our current quiver count
     */
    private sanitizeArrowCount() {
        const max = this.getMaxArrowCount();
        this.arrows = Math.max( 0, Math.min( this.arrows, max ) );
    }

    /**
     * Increase the number of arrows of the player
     * @param increment N. of arrows to increment. Negative to decrement
     * @returns Number of really increased arrows. Arrows number on action chart is limited by the number of quivers
     */
    public increaseArrows(increment : number) : number {
        const oldArrows = this.arrows;
        this.arrows += increment;
        this.sanitizeArrowCount();
        return this.arrows - oldArrows;
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
        return this.getWeaponType( Item.BOW );
    }

    /** 
     * Return the weapon of a given type, with the bigger bonus for combat skill. 
     * null if the player has not that kind of weapon 
     */
    public getWeaponType( weaponType : string ) : Item {
        let maxBonus = 0;
        let w : Item = null;
        for( let weapon of this.getWeaponObjects() ) {
            if( weapon.isWeaponType( weaponType ) ) {
                if( weapon.combatSkillEffect >= maxBonus ) {
                    maxBonus = weapon.combatSkillEffect;
                    w = weapon;
                }
            }
        }
        return w;
    }

    /**
     * Return the maximum number of special items that can be picked on the current book.
     * @returns The max number. Zero if there is no limit on the current book
     */
    public static getMaxSpecials() : number {
        return state.book.bookNumber >= ActionChart.BOOK_WITH_MAX_SPECIALS ? 12 : 0;
    }

    /**
     * The Magnakai Medicine Archmaster +20 EP can be used on this book?
     */
    public canUse20EPRestoreOnThisBook() : boolean {
        return (this.disciplines.length >= 9 && state.book.isMagnakaiBook() && this.disciplines.contains('curing')) ||
            (state.book.isGrandMasterBook() && this.disciplines.contains('deliver'));
    }

    /**
     * The Magnakai Medicine Archmaster +20 EP can be used now?
     */
    public canUse20EPRestoreNow() : boolean {
        return ((!state.book.isGrandMasterBook() && this.currentEndurance <= 6) || (state.book.isGrandMasterBook() && this.currentEndurance <= 8))
            && !this.restore20EPUsed && this.canUse20EPRestoreOnThisBook();
    }

    /**
     * Use the Magnakai Medicine Archmaster +20 EP.
     * @returns true if was really used. False if it cannot be used
     */
    public use20EPRestore() : boolean {
        if( !this.canUse20EPRestoreNow() )
            return false;
        this.restore20EPUsed  = true;
        this.increaseEndurance(20);
        return true;
    }

    /**
     * Reset the +20 EP used flag
     */
    public reset20EPRestoreUsed() {
        this.restore20EPUsed  = false;
    }
}

