
/**
 * Bonus for CS/EP definition
 */
interface Bonus {
    /** The bonus description */
    concept: string;
    /** The increment / decrement of the CS/EP */
    increment: number;
}

/**
 * Disciplines player has for a given book series
 */
interface SeriesDisciplines {

    /** Disciplines ids */
    disciplines: string[];

    /**
     * The weapon codes for the "wepnskll" / "wpnmstry" disciplines.
     * On kai series, it's a single weapon. On serires >= magnakai, they will be more than one
     */
    weaponSkill: string[];
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
    public weapons: ActionChartItem[] = [];

    /**
     * If true, the player will fight with no weapons (hand-to-hand).
     * This may seem stupid, but in book 12 there are places where, if you try to fight with the Sommerswerd, you die.
     */
    public fightUnarmed = false;

    /** The currently hand-to-hand selected weapon id. Empty string if the player has no weapon  */
    private selectedWeapon = "";

    /** Money amount */
    public beltPouch = 0;

    /** Number of meals (they count as backpack items) */
    public meals = 0;

    /** Backpack items */
    public backpackItems: ActionChartItem[] = [];

    /** Special items */
    public specialItems: ActionChartItem[] = [];

    /** The player has a backpack? */
    public hasBackpack = true;

    /* Disciplines ids */
    // Removed in v.12
    // private disciplines: string[] = [];

    /*
     * The weapon codes for the "wepnskll" / "wpnmstry" disciplines.
     * On kai series, it's a single weapon. On magnakai, they are 3 or more
     */
    // // Removed in v.12
    // private weaponSkill: string[] = [];

    /**
     * Kai disciplines (books 1-5).
     * This stores disciplines player had at end of book 5. So, it will NEVER contain the 10 disciplines.
     * See getDisciplines() for how is handled.
     */
    private kaiDisciplines: SeriesDisciplines = { disciplines: [], weaponSkill: [] };

    /** Magnakai disciplines (books 6-12). See kaiDisciplines comments */
    private magnakaiDisciplines: SeriesDisciplines = { disciplines: [], weaponSkill: [] };

    /** Grand Master disciplines (books 13+). See kaiDisciplines comments */
    private grandMasterDisciplines: SeriesDisciplines = { disciplines: [], weaponSkill: [] };

    /** Player annotations */
    public annotations = "";

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
    public kaiMonasterySafekeeping: SectionItem[] = [];

    constructor() {
        // Debug fast setup:
        if (App.debugMode) {
            this.endurance = this.currentEndurance = 25;
            this.combatSkill = 15;
            this.manualRandomTable = true;
            this.extendedCRT = false;
            if (state.book) {
                if (state.book.isGrandMasterBook()) {
                    this.endurance = this.currentEndurance = 35;
                    this.combatSkill = 30;
                    // debug data for Grand Master
                    this.setDisciplines( ["wpnmstry", "deliver", "hntmstry", "assimila"] );
                    this.setWeaponSkill( ["axe", "sword"] );
                } else if (state.book.isMagnakaiBook()) {
                    // debug data for magnakai
                    this.setDisciplines( ["wpnmstry", "curing", "hntmstry"] );
                    this.setWeaponSkill( ["axe", "sword", "bow"] );
                } else {
                    // debug data for kai series
                    this.setDisciplines( ["camflage", "hunting", "sixthsns", "healing", "wepnskll"] );
                    this.setWeaponSkill( ["axe"] );
                }
            }
        }
    }

    /**
     * Returns the currently hand-to-hand selected weapon id.
     * @returns The currently selected weapon id. Empty string if the player has no weapon selected
     */
    public getSelectedWeapon(): string {
        if (this.fightUnarmed) {
            return "";
        }

        return this.selectedWeapon;
    }

    /**
     * Set the selected hand-to-hand weapon id.
     * This will set the fightUnarmed flag to false.
     * @param weaponId The new selected weapon id. No tests are done over this weapon id!
     */
    public setSelectedWeapon(weaponId: string) {
        this.selectedWeapon = weaponId;
        this.fightUnarmed = false;
    }

    /**
     * Get the selected weapon info
     * @param bow True if we should return the selected bow info. False to return the selected hand-to-hand weapon info.
     * @return The current weapon info. null if the is player has no weapon
     */
    public getSelectedWeaponItem(bow: boolean = false): Item {

        if (bow) {
            return this.getSelectedBow();
        }

        const weaponId = this.getSelectedWeapon();
        return weaponId ? state.mechanics.getObject(weaponId) : null;
    }

    /**
     * Pick an object
     * TODO: It's a nosense: It returns false ONLY if o is null. On all other cases, it throws an exception.
     * TODO: If o is null, throw an exception too, and do not return any value
     * @param aChartItem Object to pick
     * @return True if the object was really picked
     */
    public pick(aChartItem: ActionChartItem): boolean {

        if (!aChartItem) {
            return false;
        }
        const item = aChartItem.getItem();
        if (!item) {
            return false;
        }

        // Check incompatibilities
        if (item.incompatibleWith.length > 0) {
            for (const incompatibleId of item.incompatibleWith) {
                if (this.hasObject(incompatibleId)) {
                    const incombatibleObject = state.mechanics.getObject(incompatibleId);
                    throw translations.text("msgIncompatible", [incombatibleObject.name]);
                }
            }
        }

        switch (item.type) {
            case Item.WEAPON:
                if (this.weapons.length >= 2) {
                    throw translations.text("msgNoMoreWeapons");
                }
                // console.log('Picked weapon ' + item.id);
                this.weapons.push(aChartItem);
                this.checkCurrentWeapon();
                return true;

            case Item.SPECIAL:

                // Check Special Items limit
                const nMax = ActionChart.getMaxSpecials();
                if (item.itemCount && nMax && (this.getNSpecialItems(false) + item.itemCount) > nMax) {
                    throw translations.text("msgNoMoreSpecialItems");
                }

                // If the object is an Arrow, check if the player has some quiver
                if (item.isArrow && !this.hasObject(Item.QUIVER)) {
                    throw translations.text("noQuiversEnough");
                }

                this.specialItems.push(aChartItem);

                if (item.isWeapon()) {
                    this.checkCurrentWeapon();
                }

                if (item.isArrow) {
                    // The object is an Arrow. Drop a normal Arrow if needed
                    this.sanitizeArrowCount();
                }

                return true;

            case Item.OBJECT:

                if (aChartItem.id === Item.BACKPACK) {
                    // Special case
                    if (this.hasBackpack) {
                        throw translations.text("msgAlreadyBackpack");
                    }

                    this.hasBackpack = true;
                    return true;
                }

                if ( !this.hasBackpack ) {
                    throw translations.text( "backpackLost" );
                }
                if ( ( this.getNBackpackItems(false) + item.itemCount ) > ActionChart.getMaxBackpackItems() ) {
                    throw translations.text( "msgNoMoreBackpackItems" );
                }
                if ( aChartItem.id === Item.MEAL ) {
                    // Special case
                    this.increaseMeals(1);
                } else {
                    this.backpackItems.push(aChartItem);
                }
                if (item.isWeapon()) {
                    this.checkCurrentWeapon();
                }
                console.log("Picked object " + aChartItem.id);
                return true;

            default:
                throw "Unknown object type: " + item.type;
        }

    }

    /**
     * Returns the total number of backpack items, according to the number of slots each item consum
     * @param roundToInteger If true, the total number of objects will be rounded up to a integer (Item.itemCount can have decimals)
     * @returns The number of objects on the backpack
     */
    public getNBackpackItems(roundToInteger: boolean = true): number {
        let count = this.meals;
        for (const item of this.backpackItems) {
            const o = item.getItem();
            if (o) {
                count += o.itemCount;
            }
        }
        if (roundToInteger) {
            count = Math.ceil(count);
        }
        return count;
    }

    /**
     * Returns the total number of special items, according to the number of slots each item consum
     * @param roundToInteger If true, the total number of objects will be rounded up to a integer (Item.itemCount can have decimals)
     * @returns The number of Special Items
     */
    public getNSpecialItems(roundToInteger: boolean = true): number {
        let count = 0;
        for (const special of this.specialItems) {
            const o = special.getItem();
            if (o) {
                count += o.itemCount;
            }
        }
        if (roundToInteger) {
            count = Math.ceil(count);
        }
        return count;
    }

    /**
     * Increase / decrease the meals number
     * @param count Number to increase. Negative to decrease
     * @return The number of really picked meals
     */
    public increaseMeals(count: number): number {

        if (count > 0) {
            if (!this.hasBackpack) {
                throw translations.text("backpackLost");
            }

            const maxToPick = ActionChart.getMaxBackpackItems() - this.getNBackpackItems();
            if ( maxToPick < 0 ) {
                count = 0;
            } else if (count > maxToPick) {
                count = maxToPick;
            }
        }

        this.meals += count;

        // Sanitize for negative count values
        if (this.meals < 0) {
            this.meals = 0;
        }

        // console.log('Picked ' + count + ' meals');
        return count;
    }

    /**
     * Increase / decrease the money number
     * @param count Number to increase. Negative to decrease
     * @returns Amount really picked.
     */
    public increaseMoney(count: number): number {
        const oldBeltPouch = this.beltPouch;
        this.beltPouch += count;
        if (this.beltPouch > 50) {
            this.beltPouch = 50;
        } else if (this.beltPouch < 0) {
            this.beltPouch = 0;
        }
        return this.beltPouch - oldBeltPouch;
    }

    /**
     * Returns true if the player has the object
     * @param objectId The object id to test. "backpack" to check if the player has a backpack
     */
    public hasObject(objectId: string): boolean {
        if (objectId === Item.BACKPACK) {
            return this.hasBackpack;
        }

        return ActionChartItem.containsId(this.backpackItems, objectId) ||
            ActionChartItem.containsId(this.specialItems, objectId) ||
            ActionChartItem.containsId(this.weapons, objectId);
    }

    /**
     * Drop an object
     * @param objectId Object id to drop, or 'meal' to drop one meal, or 'backpack' to drop the
     * backpack.
     * @param arrowsCount Only for quivers. count === n. arrows to drop. It must to be >= 0
     * @param objectIndex If specified, object index in the Action Chart object array to drop. If it's not specified
     * the first object with the given objectId will be dropped
     * @returns The dropped item. null if no item was dropped
     */
    public drop(objectId: string, arrowsCount: number = 0, objectIndex: number = -1): ActionChartItem {

        if (objectId === Item.MEAL) {
            // Special
            this.increaseMeals(-1);
            return new ActionChartItem(Item.MEAL);
        }

        if (objectId === Item.BACKPACK) {
            // Special
            if (!this.hasBackpack) {
                return null;
            }

            this.hasBackpack = false;
            this.meals = 0;
            this.backpackItems = [];
            this.checkCurrentWeapon();
            return new ActionChartItem(Item.BACKPACK);
        }

        // Drop the object (find its position, and drop that position)
        const item = state.mechanics.getObject(objectId);
        if (!item) {
            return null;
        }
        const objectsArray = this.getObjectsByType(item.type);
        if (!objectsArray) {
            return null;
        }

        let index: number;
        if (objectIndex >= 0) {
            index = objectIndex;
        } else {
            index = ActionChartItem.findById(objectsArray, objectId);
        }
        if (index < 0) {
            return null;
        }

        return this.dropByIndex(item.type, index, arrowsCount);
    }

    /**
     * Drops an object by its position on the action chart
     * TODO: No need for a different functions for this. Put this code inside drop() function
     * @param objectType The object type to drop (Item.WEAPON, Item.SPECIAL or Item.OBJECT)
     * @param index Object position on the objects array (this.weapons, this.specialItems or this.backpackItems)
     * @param arrowsCount Only for quivers. n. arrows to drop. It must to be >= 0
     * @returns The dropped item. null if no object was dropped
     */
    private dropByIndex(objectType: string, index: number, arrowsCount: number = 0): ActionChartItem {
        const objectsArray = this.getObjectsByType(objectType);
        if (!objectsArray) {
            return null;
        }
        if (index < 0 || index >= objectsArray.length) {
            return null;
        }
        const aChartItem = objectsArray[index];
        objectsArray.splice(index, 1);

        this.checkMaxEndurance();
        this.checkCurrentWeapon();
        if (aChartItem.id === Item.QUIVER) {
            // Decrease arrows count
            this.arrows -= arrowsCount;
            this.sanitizeArrowCount();
        }
        return aChartItem;
    }

    /**
     * Get an owned object info.
     * @param objectId Object id to get the information
     * @param index If specified and >= 0, object index in the Action Chart array. Otherwise, the
     * first owned object will be returned
     * @returns The object info. null if it was not found
     */
    public getActionChartItem(objectId: string, index: number = -1): ActionChartItem {
        const item = state.mechanics.getObject(objectId);
        if (!item) {
            return null;
        }
        const objectsArray = this.getObjectsByType(item.type);
        if (!objectsArray) {
            return null;
        }
        if (index < 0) {
            index = ActionChartItem.findById(objectsArray, objectId);
        }
        if (index < 0 || index >= objectsArray.length) {
            return null;
        }
        return objectsArray[index];
    }

    /**
     * Returns the array of objects of a given type
     * @param objectType The object types (Item.WEAPON, Item.SPECIAL or Item.OBJECT)
     * @returns The objects of that type. null if the object type was wrong
     */
    private getObjectsByType(objectType: string): ActionChartItem[] {
        let objectsArray: ActionChartItem[] = null;
        switch (objectType) {
            case Item.WEAPON:
                objectsArray = this.weapons;
                break;
            case Item.SPECIAL:
                objectsArray = this.specialItems;
                break;
            case Item.OBJECT:
                objectsArray = this.backpackItems;
                break;
            default:
                objectsArray = null;
        }
        return objectsArray;
    }

    /**
     * Check if the player still has its selected weapon
     */
    private checkCurrentWeapon() {

        if (this.selectedWeapon && this.hasObject(this.selectedWeapon)) {
            // All is ok
            return;
        }

        // Try to set the current weapon, only hand-to-hand weapons
        const weaponObjects = this.getWeaponObjects(true);
        if (weaponObjects.length === 0) {
            // No weapons
            this.selectedWeapon = "";
            this.fightUnarmed = false;
            return;
        } else if (weaponObjects.length >= 1) {
            // Get one
            this.selectedWeapon = weaponObjects[0].id;
            return;
        }
    }

    /**
     * Returns the maximum endurance of the player
     */
    public getMaxEndurance(): number {

        if (this.endurance <= 0) {
            // If the original endurance is zero, the player is death
            return 0;
        }

        let e = this.endurance;
        const bonuses = this.getEnduranceBonuses();
        for (const bonus of bonuses) {
            e += bonus.increment;
        }
        return e;
    }

    /**
     * Checks if the current endurance if bigger than the maximum.
     * This can happens if an object that has effects (increase endurance) has ben dropped, or if the original endurance has changed
     */
    private checkMaxEndurance() {
        const max = this.getMaxEndurance();
        if (this.currentEndurance > max) {
            this.currentEndurance = max;
        }
    }

    /**
     * Increase / decrease the current endurance
     * @param count Number to increase. Negative to decrease
     * @param permanent True if the increase is permanent (it changes the original endurance)
     */
    public increaseEndurance(count: number, permanent: boolean = false) {

        if (permanent) {
            // Change the original endurance
            this.endurance += count;
            if (this.endurance < 0) {
                this.endurance = 0;
            }
        }

        this.currentEndurance += count;
        this.checkMaxEndurance();
        if (this.currentEndurance < 0) {
            this.currentEndurance = 0;
        }
    }

    /**
     * Get the current combat skill.
     * @param combat The current combat. null to check default bonuses
     * @return The current combat skill. It includes bonuses for weapons and mindblast
     * discipline
     */
    public getCurrentCombatSkill(combat: Combat = null): number {

        let cs = this.combatSkill;
        const bonuses = this.getCurrentCombatSkillBonuses(combat);
        for (const bonus of bonuses) {
            cs += bonus.increment;
        }

        return cs;
    }

    /**
     * Return true if the Weaponskill is active with the selected weapon
     * @return True if Weaponskill is active
     */
    public isWeaponskillActive(bow: boolean = false): boolean {

        if (!this.getDisciplines().contains("wepnskll") && !this.getDisciplines().contains("wpnmstry") && !state.hasCompletedKaiSerie()) {
            // Player has no Weaponskill
            return false;
        }

        const currentWeapon = this.getSelectedWeaponItem(bow);
        if (!currentWeapon) {
            // Player has no weapon
            return false;
        }

        if (state.hasCompletedKaiMagnakaiSerie()) {
            // Weapon mastery loyalty bonus
            return true;
        }

        for (const skill of this.getWeaponSkill()) {
            if (currentWeapon.isWeaponType(skill)) {
                return true;
            }
        }
    }

    /**
     * Check if the player has weaponskill with a given type of weapon
     * @param weaponType Weapon type to check
     * @return True if the player has weaponskill with that weapon
     */
    public hasWeaponskillWith(weaponType: string): boolean {
        if (!this.getDisciplines().contains("wepnskll") && !this.getDisciplines().contains("wpnmstry") && !state.hasCompletedKaiSerie()) {
            // Player has no Weaponskill
            return false;
        }

        const weaponTypes = weaponType.split("|");

        for (const w of this.getWeaponSkill()) {
            if (weaponTypes.contains(w)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get bonuses for the selected weapon
     * @param noWeapon True if the combat is with no weapons
     * @param bowCombat True if it's a combat with bow
     * @param disabledObjectsIds Objects ids that cannot be used on this combat
     * @returns Action chart bonuses for the combat
     */
    private getWeaponCombatSkillBonuses(noWeapon: boolean, bowCombat: boolean, disabledObjectsIds: string[])
        : Bonus[] {

        const bonuses = [];
        let currentWeapon = this.getSelectedWeaponItem(bowCombat);

        // Check if the current weapon is disabled
        if (disabledObjectsIds.length > 0 && currentWeapon) {
            if (disabledObjectsIds.contains(currentWeapon.id)) {
                // Disabled
                currentWeapon = null;
            } else if (currentWeapon.weaponType && disabledObjectsIds.contains(currentWeapon.weaponType)) {
                // Base weapon disabled
                currentWeapon = null;
            }
        }

        // Weapons
        if (noWeapon || !currentWeapon) {
            // No weapon: -4 CS

            /*  Exception (Magnakai books):
                1) Kai level "Tutelary" with "Weaponmastery": Tutelaries are able to use defensive combat skills to great effect
                   when fighting unarmed. When entering combat without a weapon, Tutelaries lose only 2 points from their COMBAT SKILL,
                   instead of the usual 4 points.
                2) Kai level "Scion-kai" with "Weaponmastery": ...Also, when in combat without a weapon they lose only 1 point
                   from their COMBAT SKILL.
            */
            let bonus = -4;
            if (state.book.isMagnakaiBook() && state.actionChart.getDisciplines().contains("wpnmstry")) {
                if (state.actionChart.getDisciplines().length >= 8) {
                    // Scion-kai
                    bonus = -1;
                } else if (state.actionChart.getDisciplines().length >= 5) {
                    // Tutelary
                    bonus = -2;
                }
            }

            bonuses.push({
                concept: translations.text("noWeapon"),
                increment: bonus
            });
        } else if (this.isWeaponskillActive(bowCombat)) {
            // Weapon skill bonus
            if (state.book.isKaiBook() || (state.hasCompletedKaiSerie() && state.book.isMagnakaiBook() && !state.actionChart.getDisciplines().contains("wpnmstry"))) {
                // Kai book, or later with loyalty bonus
                bonuses.push({
                    concept: translations.text("weaponskill"),
                    increment: +2
                });
            } else if (state.book.isMagnakaiBook() || (state.hasCompletedKaiMagnakaiSerie() && (!this.getDisciplines().contains("wpnmstry") || !this.hasWeaponskillWith(currentWeapon.weaponType || currentWeapon.id)))) {
                // Magnakai book
                let bonus = +3;
                /*  Exception (Magnakai books):
                    Improvements: Scion-kai / Weaponmastery	/ When entering combat with a weapon they have mastered, Scion-kai may add 4 points
                    (instead of the usual 3 points) to their COMBAT SKILL...
                */
                if (state.actionChart.getDisciplines().length >= 8 || state.hasCompletedKaiMagnakaiSerie()) {
                    // Scion-kai
                    bonus = +4;
                }

                bonuses.push({
                    concept: translations.text("weaponmastery"),
                    increment: bonus
                });
            } else {
                bonuses.push({
                    concept: translations.text("grdweaponmastery"),
                    increment: +5
                });
            }
        }

        // Check current weapon bonuses
        if (!noWeapon && currentWeapon && currentWeapon.combatSkillEffect) {
            bonuses.push({
                concept: currentWeapon.name,
                increment: currentWeapon.combatSkillEffect
            });
        }

        if (bowCombat) {
            /* Improved disciplines:
                Kai level "Mentora" with "Weaponmastery": Mentoras skilled in Weaponmastery are more accurate when using all missile
                weapons, whether fired (e.g. a bow) or thrown (e.g. a dagger). When using a bow or thrown weapon and instructed to pick a
                number from the Random Number Table, add 2 to the number picked if you are a Mentora with the Magnakai Discipline
                of Weaponmastery */
            if (state.book.isMagnakaiBook() && this.getDisciplines().length >= 7 && this.getDisciplines().contains("wpnmstry")) {
                bonuses.push({
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
    public getBowBonus(): number {
        let bonus = 0;
        for (const b of this.getWeaponCombatSkillBonuses(false, true, [])) {
            bonus += b.increment;
        }
        return bonus;
    }

    /**
     * Get the current bonuses for combat skill
     * @param combat The current combat. null to check default bonuses
     * @return Array of objects with the bonuses concepts
     */
    public getCurrentCombatSkillBonuses(combat: Combat = null): Bonus[] {

        if (!combat) {
            // Create a fake combat with the default values
            combat = new Combat("Fake enemy", 0, 0);
            // apply all global rules (to setup disabled objects for example)
            mechanicsEngine.runGlobalRules(true, combat);
        }

        const bonuses = [];

        // Current weapon bonuses
        if (!combat.mentalOnly) {
            const noWeapon = combat.noWeaponCurrentTurn();
            for (const b of this.getWeaponCombatSkillBonuses(noWeapon, combat.bowCombat, combat.disabledObjects)) {
                bonuses.push(b);
            }
        }

        // Mindblast / Psi-surge
        if (combat.kaiSurge) {
            bonuses.push({
                concept: translations.text("kaisurge"),
                increment: (combat.kaiSurgeBonus ? combat.kaiSurgeBonus : Combat.defaultKaiSurgeBonus()) * combat.mindblastMultiplier
            });
        } else if (combat.psiSurge) {
            bonuses.push({
                concept: translations.text("psisurge"),
                increment: (combat.psiSurgeBonus ? combat.psiSurgeBonus : Combat.defaultPsiSurgeBonus()) * combat.mindblastMultiplier
            });
        } else if (!combat.noMindblast && (this.getDisciplines().contains("mndblst") || this.getDisciplines().contains("psisurge") || this.getDisciplines().contains("kaisurge") || state.hasCompletedKaiSerie())) {
            bonuses.push({
                concept: translations.text("mindblast"),
                increment: (combat.mindblastBonus ? combat.mindblastBonus : Combat.defaultMindblastBonus()) * combat.mindblastMultiplier
            });
        }

        // Other objects (not weapons). Ex. shield. They are not applied for bow combats
        if (!combat.mentalOnly && !combat.bowCombat) {
            this.enumerateObjectsAsItems((o: Item) => {
                if (!o.isWeapon() && o.combatSkillEffect && !combat.disabledObjects.contains(o.id)) {
                    bonuses.push({
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
        if (!combat.mentalOnly) {
            const circlesBonuses = LoreCircle.getCirclesBonuses(this.getDisciplines(BookSeriesId.Magnakai), "CS");
            for (const c of circlesBonuses) {
                bonuses.push(c);
            }
        }

        // Grand Master level bonus
        if (state.book.isGrandMasterBook() && this.getDisciplines().length > 4) {
            bonuses.push({
                concept: translations.text("kaiLevel"),
                increment: (this.getDisciplines().length - 4),
            });
        }

        return bonuses;
    }

    /**
     * Function to enumerate backpack objects and special items. Optionally weapons can be included
     * @param callback Function to be called for each object. Parameter is each Item owned by the player
     * @param enumerateWeapons True if weapons should be enumerated
     */
    private enumerateObjectsAsItems(callback: (o: Item) => void, enumerateWeapons: boolean = false) {
        this.enumerateObjects((aItem) => { callback(aItem.getItem()); }, enumerateWeapons);
    }

    /**
     * Function to enumerate backpack objects and special items as ActionChartItems. Optionally weapons can be included
     * @param callback Function to be called for each object. Parameter is each Item owned by the player
     * @param enumerateWeapons True if weapons should be enumerated
     */
    private enumerateObjects(callback: (o: ActionChartItem) => void, enumerateWeapons: boolean = false) {

        const enumerateFunction = (index: number, aItem: ActionChartItem) => {
            if (!aItem.getItem()) {
                return;
            }
            callback(aItem);
        };

        // Check objects:
        if (enumerateWeapons) {
            $.each(this.weapons, enumerateFunction);
        }
        $.each(this.backpackItems, enumerateFunction);
        $.each(this.specialItems, enumerateFunction);
    }

    /**
     * Get the current bonuses for endurance
     * @return Array of objects with the bonuses concepts
     */
    public getEnduranceBonuses(): Bonus[] {

        const bonuses = [];
        this.enumerateObjectsAsItems((o: Item) => {
            if (o.enduranceEffect) {
                bonuses.push({
                    concept: o.name,
                    increment: o.enduranceEffect
                });
            }
        });

        const circlesBonuses = LoreCircle.getCirclesBonuses(this.getDisciplines(BookSeriesId.Magnakai), "EP");
        for (const c of circlesBonuses) {
            bonuses.push(c);
        }

        // Grand Master level bonus
        if (state.book.isGrandMasterBook() && this.getDisciplines().length > 4) {
            bonuses.push({
                concept: translations.text("kaiLevel"),
                increment: (this.getDisciplines().length - 4) * 2,
            });
        }

        return bonuses;
    }

    /**
     * Returns the backpack objects and special items that are meals too
     * @return Meal-like object ids owned by the player
     */
    public getMealObjects(): string[] {

        const result = [];
        this.enumerateObjectsAsItems((o: Item) => {
            if (o.isMeal && !result.contains(o.id)) {
                result.push(o.id);
            }
        });
        return result;
    }

    /**
     * Returns all weapons and backpack / special item objects that can be
     * used as weapons
     * @param onlyHandToHand If it's true, only hand to hand weapons will be returned
     * @return All weapon objects
     */
    public getWeaponObjects(onlyHandToHand: boolean = false): Item[] {

        const result: Item[] = [];
        for (const aChartItem of this.getWeaponAChartItems(onlyHandToHand)) {
            result.push(aChartItem.getItem());
        }
        return result;
    }

    /**
     * Returns all weapons and backpack / special item objects that can be
     * used as weapons
     * @param onlyHandToHand If it's true, only hand to hand weapons will be returned
     * @return All weapon objects
     */
    public getWeaponAChartItems(onlyHandToHand: boolean = false): ActionChartItem[] {

        const result: ActionChartItem[] = [];
        // Traverse Weapons and Weapon-like objects
        this.enumerateObjects((aChartItem: ActionChartItem) => {
            const o = aChartItem.getItem();
            if (o.isWeapon() && (!onlyHandToHand || o.isHandToHandWeapon())) {
                result.push(aChartItem);
            }
        }, true);
        return result;
    }

    /**
     * Get the maximum arrows number the player can carry, given by the number of owned quivers
     * @returns The max. arrows number
     */
    public getMaxArrowCount(): number {

        // Compute the maximum number of arrows, given the carried quivers
        let max = 0;
        for (const aItem of this.specialItems) {
            if (aItem.id === Item.QUIVER) {
                // Only 6 arrows per quiver
                max += 6;
            }
        }

        // Objects with isArrow="true" occupies the same space in quiver as a normal Arrow
        this.enumerateObjectsAsItems((o: Item) => {
            if (o.isArrow) {
                max -= 1;
            }
        });

        return max;
    }

    /**
     * Makes sure the arrow count fits our current quiver count
     */
    private sanitizeArrowCount() {
        const max = this.getMaxArrowCount();
        this.arrows = Math.max(0, Math.min(this.arrows, max));
    }

    /**
     * Increase the number of arrows of the player
     * @param increment N. of arrows to increment. Negative to decrement
     * @returns Number of really increased arrows. Arrows number on action chart is limited by the number of quivers
     */
    public increaseArrows(increment: number): number {
        const oldArrows = this.arrows;
        this.arrows += increment;
        this.sanitizeArrowCount();
        return this.arrows - oldArrows;
    }

    /**
     * Get the magnakai lore circles owned by the player
     */
    public getLoreCircles(): LoreCircle[] {
        return LoreCircle.getCircles(this.getDisciplines(BookSeriesId.Magnakai));
    }

    /** The player has Mindshield / Psi-screen? */
    public hasMindShield(): boolean {
        return this.getDisciplines().contains("mindshld") || this.getDisciplines().contains("psiscrn");
    }

    /** The player has a bow and some arrow? */
    public canUseBow(): boolean {
        if (this.getSelectedBow() === null) {
            return false;
        }
        return this.arrows > 0;
    }

    /**
     * Get the selected bow weapon
     * TODO: This returns the bow with the maximum CS bonus. Allow to selected the current bow
     */
    public getSelectedBow(): Item {
        return this.getWeaponType(Item.BOW);
    }

    /**
     * Return the weapon of a given type, with the bigger bonus for combat skill.
     * null if the player has not that kind of weapon
     */
    public getWeaponType(weaponType: string): Item {
        let maxBonus = 0;
        let w: Item = null;
        for (const weapon of this.getWeaponObjects()) {
            if (weapon.isWeaponType(weaponType)) {
                if (weapon.combatSkillEffect >= maxBonus) {
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
    public static getMaxSpecials(): number {
        return state.book.bookNumber >= ActionChart.BOOK_WITH_MAX_SPECIALS ? 12 : 0;
    }

    /**
     * The Magnakai Medicine Archmaster +20 EP can be used on this book?
     */
    public canUse20EPRestoreOnThisBook(): boolean {
        return (this.getDisciplines().length >= 9 && state.book.isMagnakaiBook() && this.getDisciplines().contains("curing")) ||
            (state.book.isGrandMasterBook() && this.getDisciplines().contains("deliver"));
    }

    /**
     * The Magnakai Medicine Archmaster +20 EP can be used now?
     */
    public canUse20EPRestoreNow(): boolean {
        return ((!state.book.isGrandMasterBook() && this.currentEndurance <= 6) || (state.book.isGrandMasterBook() && this.currentEndurance <= 8))
            && !this.restore20EPUsed && this.canUse20EPRestoreOnThisBook();
    }

    /**
     * Use the Magnakai Medicine Archmaster +20 EP.
     * @returns true if was really used. False if it cannot be used
     */
    public use20EPRestore(): boolean {
        if (!this.canUse20EPRestoreNow()) {
            return false;
        }
        this.restore20EPUsed = true;
        this.increaseEndurance(20);
        return true;
    }

    /**
     * Reset the +20 EP used flag
     */
    public reset20EPRestoreUsed() {
        this.restore20EPUsed = false;
    }

    /**
     * Return identifiers of backpack items
     */
    public getBackpackItemsIds(): string[] {
        return ActionChartItem.getIds(this.backpackItems);
    }

    /**
     * Return identifiers of special items
     */
    public getSpecialItemsIds(): string[] {
        return ActionChartItem.getIds(this.specialItems);
    }

    /**
     * Return identifiers of weapons
     */
    public getWeaponsIds(): string[] {
        return ActionChartItem.getIds(this.weapons);
    }

    /**
     * Returns player disciplines for a given book series
     * @param series Book series witch get disciplines. If null or not specified, we get current book disciplines
     * @returns Disciplines for that serie
     */
    public getDisciplines(series: BookSeriesId = null): string[] {
        return this.getSeriesDisciplines(series).disciplines;
    }

    public hasDiscipline(disciplineId: string, seriesId: BookSeriesId = null) {
        return this.getSeriesDisciplines(seriesId).disciplines.contains(disciplineId);
    }
    public hasKaiDiscipline(disciplineId: KaiDiscipline) {
        return this.hasDiscipline(disciplineId, BookSeriesId.Kai);
    }
    public hasMgnDiscipline(disciplineId: MgnDiscipline) {
        return this.hasDiscipline(disciplineId, BookSeriesId.Magnakai);
    }
    public hasGndDiscipline(disciplineId: GndDiscipline) {
        return this.hasDiscipline(disciplineId, BookSeriesId.GrandMaster);
    }

    /**
     * Returns player disciplines and weaponskill for a given book series
     * @param series Book series witch get disciplines. If null or not specified, we get current book disciplines
     * @returns Disciplines for that serie
     */
    private getSeriesDisciplines(seriesId: BookSeriesId = null): SeriesDisciplines {

        const currentSeriesId = state.book.getBookSeries().id;
        if (seriesId === null) {
            seriesId = currentSeriesId;
        } else if (seriesId > currentSeriesId) {
            // Future series. If we are debugging, maybe we have disciplines in that series: Ignore them
            return { disciplines: [], weaponSkill: [] };
        }

        let seriesDisciplines: SeriesDisciplines;
        switch (seriesId) {
            case BookSeriesId.Kai:
                seriesDisciplines = this.kaiDisciplines;
                break;
            case BookSeriesId.Magnakai:
                seriesDisciplines = this.magnakaiDisciplines;
                break;
            case BookSeriesId.GrandMaster:
                seriesDisciplines = this.grandMasterDisciplines;
                break;
            default:
                mechanicsEngine.debugWarning("ActionChart.getSeriesDisciplines: Wrong book series");
                seriesDisciplines = { disciplines: [], weaponSkill: [] };
                break;
        }

        // If the player has played SOME book of a previous series, he/she has ALL disciplines of that series
        // and can benefit of loyalty bonuses
        if (seriesId < currentSeriesId && seriesDisciplines.disciplines.length > 0 ) {
            // Clone, to avoid change ActionChart
            seriesDisciplines = { disciplines: Disciplines.getSeriesDisciplines(seriesId), weaponSkill: seriesDisciplines.weaponSkill };
            // TODO: If player had no weaponskill, add two random weapons
        }

        return seriesDisciplines;
    }

    /**
     * Set current disciplines for current book series
     */
    public setDisciplines(disciplinesIds: string[]) {
        this.getSeriesDisciplines().disciplines = disciplinesIds;
    }

    /**
     * Get the weaponSkill array.
     * If no weaponSkill but the kai serie is completed, add a random weaponSkill from kai serie.
     * @return Array of weapon skill
     */
    // TODO: DO NOT DELETE THIS. IT SHOULD BE ADAPTED TO THE NEW DISCIPLINES STORAGE
    /*private getWeaponSkill(): string[] {

        let weaponSkill = this.weaponSkill;

        if (!this.getDisciplines().contains("wpnmstry") && state.hasCompletedKaiSerie()) {
            // Player currently has no Weaponmastery, but has completed Kai series: Add loyalty bonus

            // Check weapons with Weaponmastery on last Kai book serie
            const lastKaiBookActionChat = state.getPreviousBookActionChart(5);
            if (lastKaiBookActionChat) {
                weaponSkill = lastKaiBookActionChat.weaponSkill;
                if (!weaponSkill.length) {
                    // Player had no weaponskill at the end of book 5. Use current weapons Weaponskill
                    if (this.weaponSkill.length === 0) {
                        // But currently has no Weaponskill! So, add a random weapon
                        this.weaponSkill.push(SetupDisciplines.kaiWeapons[randomTable.getRandomValue()]);
                    }
                    weaponSkill = this.weaponSkill;
                }
            }
        }

        return weaponSkill;
    }*/
    public getWeaponSkill(seriesId: BookSeriesId = null): string[] {
        return this.getSeriesDisciplines(seriesId).weaponSkill;
    }
    public setWeaponSkill(weaponSkill: string[], seriesId: BookSeriesId = null) {
        this.getSeriesDisciplines(seriesId).weaponSkill = weaponSkill;
    }

    /**
     * Return the maximum number of backpack items in the current book
     */
    private static getMaxBackpackItems(): number {
        return state.book.isGrandMasterBook() ? 10 : 8;
    }

    /**
     * Create an ActionChart instance from a plain object. The localStorage keys "state-book-xxxx" **MUST** to
     * be loaded before call to this member.
     * @param o The plain object
     * @returns The ActionChart instance
     */
    public static fromObject(o: any, bookNumber: number): ActionChart {

        // In version 1.6.3 / 1.7, the o.weaponSkill has been changed from string to string[] (magnakai)
        if ( o.disciplines && typeof o.weaponSkill === "string" ) {
            if ( o.actionChart.weaponSkill ) {
                o.actionChart.weaponSkill = [ o.actionChart.weaponSkill ];
            } else {
                o.actionChart.weaponSkill = [];
            }
        }

        // In version 1.6.3 / 1.7, we store the number of arrows (magnakai)
        if ( !o.arrows ) {
            o.arrows = 0;
        }

        // In version 1.12 disciplines of Kai, Magnakai and Grand Master are stored in ActionChart. Previously, only the
        // current book disciplines were stored
        if (!o.kaiDisciplines) {

            // Store current book disciplines
            const currentSeries = BookSeries.getBookNumberSeries(bookNumber);
            switch (currentSeries.id) {
                case BookSeriesId.Kai:
                    o.kaiDisciplines = { disciplines: o.disciplines, weaponSkill: o.weaponSkill };
                    break;
                case BookSeriesId.Magnakai:
                    o.magnakaiDisciplines = { disciplines: o.disciplines, weaponSkill: o.weaponSkill };
                    break;
                case BookSeriesId.GrandMaster:
                    o.grandMasterDisciplines = { disciplines: o.disciplines, weaponSkill: o.weaponSkill };
                    break;
            }
            delete o.disciplines;
            delete o.weaponSkill;

            // Try to load previous series final disciplines
            if (BookSeriesId.Kai < currentSeries.id) {
                const aChartEndKai = state.getPreviousBookActionChart(BookSeries.series[BookSeriesId.Kai].bookEnd);
                if (aChartEndKai) {
                    o.kaiDisciplines = aChartEndKai.kaiDisciplines;
                }
            }
            if (BookSeriesId.Magnakai < currentSeries.id) {
                const aChartEndMagnakai = state.getPreviousBookActionChart(BookSeries.series[BookSeriesId.Magnakai].bookEnd);
                if (aChartEndMagnakai) {
                    o.magnakaiDisciplines = aChartEndMagnakai.magnakaiDisciplines;
                }
            }

            // Setup uninitialiced properties
            if (!o.kaiDisciplines) {
                o.kaiDisciplines = { disciplines: [], weaponSkill: [] };
            }
            if (!o.magnakaiDisciplines) {
                o.magnakaiDisciplines = { disciplines: [], weaponSkill: [] };
            }
            if (!o.grandMasterDisciplines) {
                o.grandMasterDisciplines = { disciplines: [], weaponSkill: [] };
            }
        }

        const actionChart: ActionChart = $.extend(new ActionChart(), o);

        // Replace plain objects by ActionChartItem instances.
        // Changed in 1.12. In previous versiones, arrays were string[] with object ids
        actionChart.weapons = ActionChartItem.fromObjectsArray(actionChart.weapons);
        actionChart.backpackItems = ActionChartItem.fromObjectsArray(actionChart.backpackItems);
        actionChart.specialItems = ActionChartItem.fromObjectsArray(actionChart.specialItems);

        return actionChart;
    }
}
