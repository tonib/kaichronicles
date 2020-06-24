
/**
 * Stores information about an object available to pick on a section
 */
interface SectionItem {
    /** The object id */
    id: string;

    /** The object price. If its zero or null, the object is free */
    price: number;

    /** True if there are an infinite number of this kind of object on the section */
    unlimited: boolean;

    /**
     * Only applies if id = 'quiver' (number of arrows on the quiver)
     * or id = 'money' (number of Gold Crowns)
     */
    count: number;

    /**
     * Object is allowed to be used from the section (not picked object)?
     */
    useOnSection: boolean;

    /**
     * Number of allowed uses of the item.
     * Added in v1.12. It can be null after installation of this version. In this case, asume is 1
     */
    usageCount: number;
}

/**
 * Stores a section state (combats, objects, etc)
 */
class SectionState {

    /**
     * Objects on the section
     */
    public objects: SectionItem[]  = [];

    /**
     * Sell prices on the section. Applies only on sections where you can
     * sell inventory objects.
     */
    public sellPrices: SectionItem[] = [];

    /** Combats on the section */
    public combats: Combat[] = [];

    /** The combat has been eluded? */
    public combatEluded = false;

    /** Paths of mechanics rules already executed
     * The key is the rule path, and the value is true bool value, or info about the
     * rule execution
     */
    public executedRules = {};

    /** Healing discipline has been executed on this section? */
    public healingExecuted = false;

    /**
     * Number picker states for this section.
     * See numberPicker.js and numberPickerMechanics.ts
     */
    public numberPickersState = {
        actionFired: null
    };

    /**
     * Mark a rule as executed
     * @param rule The executed rule
     * @param executionState The state to associate with the execution. If it's null,
     * if will be set to true
     */
    public markRuleAsExecuted( rule: Element, executionState: any = true ) {
        if ( !executionState ) {
            executionState = true;
        }

        this.executedRules[ Mechanics.getRuleSelector(rule) ] = executionState;
    }

    /**
     * Check if a rule for this section has been executed
     * @param rule Rule to check
     * @return The object associated with the execution. true if there was no result stored
     */
    public ruleHasBeenExecuted(rule: Element): any {
        // TODO: This will fail if the XML changes. The rule should be searched
        // TODO: with all selectors on the sectionState.executedRules keys
        // TODO: If it's found, it's executed
        return this.executedRules[ Mechanics.getRuleSelector(rule) ];
    }

    /**
     * Return the count of items on the current section of a given type
     * @param type The object type to count ('weapon', 'object' or 'special').
     * null to return all
     * @return The objects on this section
     */
    public getSectionObjects(type: string = null): Item[] {
        const items: Item[] = [];
        for ( const sectionItem of this.objects) {

            if ( sectionItem.id === Item.MONEY ) {
                // Money if not really an object. It's stored like one for mechanics needs
                continue;
            }

            const i = state.mechanics.getObject( sectionItem.id );
            if ( !type || i.type === type ) {
                items.push(i);
            }
        }
        return items;
    }

    /**
     * Return the count of objects on the current section of a given type
     * @param type The object type to count ('weapon', 'object' or 'special').
     * null to return all
     * @return The count of objects on this section
     */
    public getCntSectionObjects(type: string): number {
        return this.getSectionObjects(type).length;

        // Code from cracrayol fork (reverted, it will break things, https://github.com/tonib/kaichronicles/commit/c527e2e63ae80c6a5e60ef66cde29f3825ee2725)
        /*let count = 0;
        const items = this.getSectionObjects(type);
        for (const item of items) {
            count += item.itemCount ? item.itemCount : 1;
        }
        return count;*/
    }

    /**
     * Return the weapons and weapon special object on the section
     */
    public getWeaponObjects(): Item[] {
        const weapons: Item[] = [];
        for ( const i of this.getSectionObjects() ) {
            if ( i.isWeapon() ) {
                weapons.push( i );
            }
        }
        return weapons;
    }

    /**
     * Returns 'finished' if all combats are finished, and Lone Wolf is not death.
     * Returns 'eluded' if all combats are eluded, and Lone Wolf is not death.
     * Returns false if there are pending combats, or Lone Wolf is death
     */
    public areAllCombatsFinished(actionChart: ActionChart): string|boolean {

        if ( actionChart.currentEndurance <= 0 ) {
            // LW death
            return false;
        }

        if ( this.combats.length === 0 ) {
            return "finished";
        }

        if ( this.combatEluded ) {
            return "eluded";
        }

        for (const combat of this.combats) {
            if ( !combat.isFinished() ) {
                return false;
            }
        }
        return "finished";
    }

    /**
     * Returns true if all combats are won
     */
    public areAllCombatsWon(): boolean {
        for (const combat of this.combats) {
            if ( combat.endurance > 0 ) {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns true if there is some combat active
     */
    public someCombatActive(): boolean {
        if ( this.combatEluded ) {
            return false;
        }

        for (const combat of this.combats) {
            if ( !combat.isFinished() ) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns the number on endurance points lost by somebody on section combats
     * @param {string} who If is 'enemy' we will calculate the enemy loss. Otherwise, we will
     * calculate the player loss
     */
    public combatsEnduranceLost( who: string ): number {
        let lost = 0;
        for ( let i = 0, len = this.combats.length; i < len; i++) {
            if ( who === "enemy") {
                lost += this.combats[i].enemyEnduranceLost();
            } else {
                lost += this.combats[i].playerEnduranceLost();
            }
        }
        return lost;
    }

    /**
     * Returns the number of turns used on all combats on the section
     */
    public combatsDuration(): number {
        let duration = 0;
        for ( let i = 0, len = this.combats.length; i < len; i++) {
            duration += this.combats[i].turns.length;
        }
        return duration;
    }

    /**
     * Set combats as enabled / disabled
     * @param enabled True to enable combats. False to disable them
     */
    public setCombatsEnabled(enabled: boolean) {
        for ( let i = 0, len = this.combats.length; i < len; i++) {
            this.combats[i].disabled = !enabled;
        }
    }

    /**
     * Add an object to the section
     * @param objectId Object id to add
     * @param price The object price. 0 === no buy (free)
     * @param unlimited True if there are an infinite number of this kind of object on the section
     * @param count Only applies if id = 'quiver' (number of arrows on the quiver), 'arrow' (number of arrows), or 'money' (number of Gold Crowns),
     * or if price is is not zero (-> you buy "count" items for one "price")
     * @param useOnSection The object is allowed to be used on the section (not picked object)?
     */
    public addObjectToSection(objectId: string , price: number = 0, unlimited: boolean = false, count: number = 0 ,
                              useOnSection: boolean = false ) {

        // Special cases:
        if ( objectId === Item.MONEY ) {
            // Try to increase the current money amount / arrows on the section:
            for ( const o of this.objects ) {
                if ( o.id === objectId ) {
                    o.count += count;
                    return;
                }
            }
        }

        const item = state.mechanics.getObject(objectId);
        this.objects.push({
            id: objectId,
            price,
            unlimited,
            count: (objectId === Item.QUIVER || objectId === Item.ARROW || objectId === Item.MONEY || price > 0 ? count : 0 ),
            useOnSection,
            usageCount: item && item.usageCount ? item.usageCount : 1
        });
    }

    /**
     * Remove an object from the section
     * @param objectId Object id to remove
     * @param price Price of the object to remove
     * @param count Count to decrease. Only applies if the object is 'money'
     */
    public removeObjectFromSection(objectId: string, price: number, count: number = -1) {
        // Be sure price is not null
        if ( !price ) {
            price = 0;
        }

        for ( let i = 0, len = this.objects.length; i < len; i++) {
            // Be sure price is not null
            let currentPrice = this.objects[i].price;
            if ( !currentPrice ) {
                currentPrice = 0;
            }

            if ( this.objects[i].id === objectId && currentPrice === price ) {
                let removeObject = true;
                if ( ( objectId === Item.MONEY || objectId === Item.ARROW ) && count >= 0 && this.objects[i].count > count ) {
                    // Still money / arrows available:
                    this.objects[i].count -= count;
                    removeObject = false;
                }

                if ( removeObject ) {
                    this.objects.splice(i, 1);
                }
                return;
            }
        }
        console.log( "Object to remove from section not found :" + objectId + " " + price );
    }

    /**
     * Returns the last random value picked on the first combat of this section.
     * Returns -1 if there are no combats or not turns yet
     */
    public getLastRandomCombatTurn(): number {
        if ( this.combats.length === 0 ) {
            return -1;
        }
        const combat = this.combats[0];
        if ( combat.turns.length === 0 ) {
            return -1;
        }
        return combat.turns[ combat.turns.length - 1].randomValue;
    }

    /**
     * Returns the enemy current endurance of the first combat on the section.
     * It returns zero if there are no combats on the section
     */
    public getEnemyEndurance(): number {
        if ( this.combats.length === 0 ) {
            return 0;
        }
        return this.combats[0].endurance;
    }

    /**
     * Get the available amount of money on the section
     */
    public getAvailableMoney(): number {
        let moneyCount = 0;
        for ( const o of this.objects ) {
            if (o.id === Item.MONEY) {
                moneyCount += o.count;
            }
        }
        return moneyCount;
    }

    /**
     * Add a combat skill bonus to the current section combats by an object usage.
     * @param combatSkillModifier The combat skill increase
     */
    public combatSkillUsageModifier( combatSkillModifier: number ) {
        // Apply the modifier to current combats:
        for ( const combat of this.combats ) {
            combat.objectsUsageModifier += combatSkillModifier;
        }
    }

    /** Return true if the object is on the section */
    public containsObject( objectId: string ): boolean {
        for ( const sectionItem of this.objects ) {
            if ( sectionItem.id === objectId ) {
                return true;
            }
        }
        return false;
    }

}
