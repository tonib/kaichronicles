/// <reference path="../external.ts" />

class Combat {

    /** Enemy name */
    public enemy : string;

    /** Enemy combat skill */
    public combatSkill : number;

    /** Enemy current endurance points  */
    public endurance : number;

    /** Enemy original endurance points  */
    public originalEndurance : number;

    /** Combat turns */
    public turns : Array<CombatTurn> = [];

    /** Increment of combat skill of Lone Wolf in this combat  */
    public combatModifier = 0;

    /** Increment of combat skill by objects usage  */
    public objectsUsageModifier = 0;

    /** The enemy is immune to Mindblast? */
    public noMindblast = false;

    /** The CS bonus to apply if the player has Mindblast discipline */
    public mindblastBonus = 2;

    /** The player cannot use weapons on this combat */
    public noWeapon = false;

    /** Turn beyond which the combat can be eluded. -1 = no elude */
    public eludeTurn = -1;

    /** Combat has been disabled? */
    public disabled = false;

    /** Player dammage multiplier */
    public dammageMultiplier = 1.0;

    /** Enemy dammage multiplier */
    public enemyMultiplier = 1.0;

    /** Mindforce negative bonus by enemy mindforce attack */
    public mindforceCS = 0;

    /** 
     * Player extra endurance points lost each turn by enemy mindforce attack.
     * It must to be negative.
     */
    public mindforceEP = 0;

    /**
     * Extra E.P. lost by the enemy each turn. It must to be negative.
     */
    public enemyTurnLoss = 0;

    /**
     * Extra E.P. lost by the player each turn. It must to be negative.
     */
    public turnLoss = 0;

    /** Book 2 / sect276: True if the combat is not a combat to death */
    public fakeCombat = false;

    /** If fakeCombat is true, percentage of the E.P. lost to restore  */
    public fakeRestoreFactor = 1.0;

    /** The original endurance of the player before the combat (for fake combats) */
    public originalPlayerEndurance = state.actionChart.currentEndurance;

    /** Combat has been finished? */
    public combatFinished = false;

    /** Psi-surge is activated on this combat? */
    public psiSurge = false;

    /** It's a bow combat? If false, it's a hand-to-hand combat */
    public bowCombat = false;

    /**
     * Create a combat
     * @param enemy Enemy name
     * @param combatSkill Enemy combat skill
     * @param endurance Enemy endurance points 
     */
    constructor(enemy : string, combatSkill : number, endurance : number) {
        
        /** Enemy name */
        this.enemy = enemy;
        /** Enemy combat skill */
        this.combatSkill = combatSkill;
        /** Enemy endurance points  */
        this.endurance = endurance;
        /** Enemy original endurance points  */
        this.originalEndurance = endurance;

        /** The original endurance of the player before the combat (for fake combats) */
        this.originalPlayerEndurance = state.actionChart.currentEndurance;
    }

    /**
     * Get the player combat skill for this combat
     * @return The current combat skill
     */
    public getCurrentCombatSkill() : number {
        var cs = state.actionChart.getCurrentCombatSkill(this.noMindblast, 
            this.noWeapon, this.mindblastBonus , this.psiSurge , this.bowCombat ) + 
            this.combatModifier + 
            this.objectsUsageModifier;

        // Check enemy mindforce attack
        if( this.mindforceCS < 0 && !state.actionChart.hasMindShield() )
            cs += this.mindforceCS;

        return cs;
    }

    /**
     * Returns the combat ratio for this combat
     */
    public getCombatRatio() : number {
        return this.getCurrentCombatSkill() - this.combatSkill;
    }

    /**
     * Get the next combat turn
     * @param elude True if the player is eluding the combat
     * @return Promise with the next CombatTurn
     */
    public nextTurnAsync( elude : boolean ) : Promise<CombatTurn> {

        var dfd = jQuery.Deferred();

        // Calculate the turn
        var self = this;
        randomTable.getRandomValueAsync()
        .then(function(randomValue) {
            var turn = new CombatTurn( self, randomValue, elude );
            self.turns.push( turn );
            dfd.resolve(turn);
        });

        return dfd.promise();
    }

    public static applyLoss( currentEndurance : number , loss : any ) : number {
        if( loss == combatTable_DEATH )
            return 0;
        else {
            currentEndurance -= loss;
            if( currentEndurance < 0 )
                currentEndurance = 0;
            return currentEndurance;
        }
    } 

    /**
     * Apply the combat turn effects
     * @param turn The turn to apply
     */
    public applyTurn( turn : CombatTurn ) {

        // Apply player damages:
        if( turn.loneWolf == combatTable_DEATH )
            state.actionChart.currentEndurance = 0;
        else
            state.actionChart.increaseEndurance( -turn.loneWolf );
        
        // Apply enemy damages:
        /*if( turn.enemy == combatTable_DEATH )
            this.endurance = 0;
        else {
            this.endurance -= turn.enemy;
            if( this.endurance < 0 )
                this.endurance = 0;
        }*/
        this.endurance = Combat.applyLoss( this.endurance , turn.enemy );

        // Check if the combat has been finished
        if( turn.elude || this.endurance === 0 || state.actionChart.currentEndurance === 0 ) {
            this.combatFinished = true;
            if( this.fakeCombat ) {
                // Restore player endurance to original :
                var epToRestore = this.originalPlayerEndurance - state.actionChart.currentEndurance;
                // Apply the factor
                epToRestore = Math.floor( this.fakeRestoreFactor * epToRestore );
                // If you call this, the endurance on the UI is not updated
                //state.actionChart.increaseEndurance( epToRestore );
                actionChartController.increaseEndurance( epToRestore );
            }
        }
    }

    /**
     * Returns true if the combat is finished?
     */
    public isFinished() : boolean {
        //return this.endurance == 0 || state.actionChart.currentEndurance == 0;
        return this.combatFinished;
    }

    /**
     * Returns true if the combat can be eluded right now
     */
    public canBeEluded() : boolean {
        if( this.eludeTurn < 0 || this.isFinished() )
            return false;
        return this.turns.length >= this.eludeTurn;
    }

    /**
     * Returns the number on endurance points lost by the player on this combat 
     */
    public playerEnduranceLost() : number {
        var lost = 0;
        for( var i=0, len = this.turns.length; i< len; i++) {
            var turn = this.turns[i];
            if( turn.loneWolf == combatTable_DEATH )
                lost += state.actionChart.getMaxEndurance();
            else
                lost += turn.loneWolf;
        }
        return lost;
    }

    /**
     * Returns the number on endurance points lost by the enemy on this combat 
     */
    public enemyEnduranceLost() : number {
        var lost = 0;
        for( var i=0, len = this.turns.length; i< len; i++) {
            var turn = this.turns[i];
            if( turn.enemy == combatTable_DEATH )
                lost += this.originalEndurance;
            else
                lost += turn.enemy;
        }
        return lost;
    }
}

