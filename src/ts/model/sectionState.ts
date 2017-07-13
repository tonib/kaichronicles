/// <reference path="../external.ts" />

/**
 * Stores information about an object available to pick on a section
 */
interface SectionItem {
    /** The object id */
    id : string;

    /** The object price. If its zero or null, the object is free */
    price : number;

    /** True if there are an infinite number of this kind of object on the section */
    unlimited : boolean;
}

/**
 * Store a price on a section where the player can shell an object
 */
interface ShellPrice {
    /** The object id */
    id : string;

    /** The object price */
    price : number;
}

/**
 * Stores a section state (combat, objects, etc) 
 */
class SectionState {

    /**
     * Objects on the section 
     */
    public objects : Array<SectionItem>  = [];

    /**
     * Sell prices on the section. Applies only on sections where you can
     * sell inventory objects.
     */
    public sellPrices : Array<ShellPrice> = [];

    /** Combats on the section */
    public combats = [];

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
     * Last value for number pickers. The key is the number picker id and the value is the
     * last value
     */
    public numberPickersState = {};

    /**
     * Mark a rule as executed
     * @param rule The executed rule
     * @param executionState The state to associate with the execution. If it's null,
     * if will be set to true
     */
    public markRuleAsExecuted( rule, executionState : any ) {
        if( !executionState )
            executionState = true;

        this.executedRules[ Mechanics.getRuleSelector(rule) ] = executionState;
    }

    /**
     * Check if a rule for this section has been executed
     * @param rule Rule to check
     * @return The object associated with the execution. true if there was no result stored
     */
    public ruleHasBeenExecuted(rule) : any {
        // TODO: This will fail if the XML changes. The rule should be searched
        // TODO: with all selectors on the sectionState.executedRules keys 
        // TODO: If it's found, it's executed 
        return this.executedRules[ Mechanics.getRuleSelector(rule) ]; 
    }

    /**
     * Return the count of objects on the current section of a given type
     * @param type The object type to count ('weapon', 'object' or 'special').
     * null to return all
     * @return The count of objects on this section
     */
    public getCntSectionObjects(type : string) : number {
        var cnt = 0;
        for( var i=0, len = this.objects.length; i< len; i++) {
            var o = state.mechanics.getObject( this.objects[i].id );
            if( !type || o.type == type )
                cnt++;
        }
        return cnt;
    }

    /**
     * Returns 'finished' if all combats are finished, and Lone Wolf is not death.
     * Returns 'eluded' if all combats are eluded, and Lone Wolf is not death.
     * Returns false if there are pending combats, or Lone Wolf is death
     */
    public areAllCombatsFinished(actionChart : ActionChart) : any {

        if( actionChart.currentEndurance <= 0 )
            // LW death
            return false;

        if( this.combats.length === 0 )
            return 'finished';

        if( this.combatEluded )
            return 'eluded';

        for(var i=0; i<this.combats.length; i++) {
            if( !this.combats[i].isFinished() )
                return false;
        }
        return 'finished';
    }

    /**
     * Returns true if all combats are won
     */
    public areAllCombatsWon() : boolean {
        for(var i=0; i<this.combats.length; i++) {
            if( this.combats[i].endurance > 0 )
                return false;
        }
        return true;
    }

    /**
     * Returns true if there is some combat active
     */
    public someCombatActive() : boolean {
        if( this.combatEluded )
            return false;

        for(var i=0; i<this.combats.length; i++) {
            if( !this.combats[i].isFinished() )
                return true;
        }
        return false;
    }

    /**
     * Returns the number on endurance points lost by somebody on section combats 
     * @param {string} who If is 'enemy' we will calculate the enemy loss. Otherwise, we will
     * calculate the player loss
     */
    public combatsEnduranceLost( who : string ) : number {
        var lost = 0;
        for( var i=0, len = this.combats.length; i< len; i++) {
            if( who == 'enemy')
                lost += this.combats[i].enemyEnduranceLost();
            else
                lost += this.combats[i].playerEnduranceLost();
        }
        return lost;
    }

    /**
     * Returns the number of turns used on all combats on the section
     */
    public combatsDuration() : number {
        var duration = 0;
        for( var i=0, len = this.combats.length; i< len; i++)
            duration += this.combats[i].turns.length;
        return duration;
    }

    /**
     * Set combats as enabled / disabled
     * @param enabled True to enable combats. False to disable them
     */
    public setCombatsEnabled(enabled : boolean) {
        for( var i=0, len = this.combats.length; i< len; i++)
            this.combats[i].disabled = !enabled;
    }

    /**
     * Add an object to the section
     * @param objectId Object id to add
     * @param price The object price
     * @param unlimited True if there are an infinite number of this kind of object on the section
     */
    public addObjectToSection(objectId : string , price : number, unlimited : boolean) {
        this.objects.push({
            id: objectId,
            price: price,
            unlimited: unlimited
        });
    }

    /**
     * Remove an object from the section
     * @param objectId Object id to remove
     */
    public removeObjectFromSection(objectId : string) {
        for( var i=0, len = this.objects.length; i< len; i++) {
            if( this.objects[i].id == objectId ) {
                this.objects.splice(i, 1);
                return;
            }
        }
    }

    /**
     * Returns the last random value picked on the first combat of this section.
     * Returns -1 if there are no combats or not turns yet
     */
    public getLastRandomCombatTurn() : number {
        if( this.combats.length === 0 )
            return -1;
        var combat = this.combats[0];
        if( combat.turns.length === 0 )
            return -1;
        return combat.turns[ combat.turns.length - 1].randomValue;
    };
}
