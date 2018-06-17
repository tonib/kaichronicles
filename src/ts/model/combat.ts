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

    /** The enemy is immune to Psi-Surge? */
    public noPsiSurge = false;

    /** The CS bonus to apply if the player has Mindblast discipline */
    public mindblastBonus;

    /** The CS bonus to apply if the player has Psi-Surge discipline */
    public psiSurgeBonus;

    /** The CS multiplier to apply to Mindblast/Psi-Surge attacks */
    public mindblastMultiplier = 1;

    /** How many turns the player cannot use weapons on this combat. -1 = never */
    public noWeaponTurns = 0;

    /** Check if the combat is non-physical (disables most bonuses) */
    public mentalOnly = false;

    /** Turn beyond which the combat can be eluded. -1 = no elude */
    public eludeTurn = -1;

    /** Maximum turn which the combat can be eluded. -1 == no max turn */
    public maxEludeTurn = -1;

    /** Combat has been disabled? */
    public disabled = false;

    /** Enemy is immune for X turns */
    public enemyImmuneTurns = 0;

    /** LW is immune for X turns */
    public immuneTurns = 0;

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

    /** Object ids that cannot be used on this combat. */
    public disabledObjects : Array<string> = [];

    /** Adgana has been used on this combat? (see "pouchadgana" object) */
    public adganaUsed = false;

    /** Loss on this combat is permanent (reduce original endurance)? */
    public permanentDammage = false;

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

        // Default Psi-Surge / Mindblast bonuses
        this.psiSurgeBonus = Combat.defaultPsiSurgeBonus();
        this.mindblastBonus = Combat.defaultMindblastBonus();
    }

    /**
     * Get the player combat skill for this combat
     * @return The current combat skill
     */
    public getCurrentCombatSkill() : number {
        let cs = state.actionChart.combatSkill;
        for( let bonus of this.getCSBonuses() )
            cs += bonus.increment;
        return cs;
    }

    /**
     * Get the current combat bonuses
     * @returns The combat bonuses. It includes the Action Chart bonuses
     */
    public getCSBonuses() : Array<Bonus> {
        let bonuses : Array<Bonus> = [];

        for( let bonus of state.actionChart.getCurrentCombatSkillBonuses(this) )
            bonuses.push( bonus );
        
        if( this.combatModifier ) {
            bonuses.push({
                increment : this.combatModifier,
                concept : translations.text( 'sectionModifier' )
            });
        }

        if( !this.mentalOnly && this.objectsUsageModifier ) {
            bonuses.push({
                increment : this.objectsUsageModifier,
                concept : translations.text( 'objectsUse' )
            });
        }

        if( this.mindforceCS < 0 && !state.actionChart.hasMindShield() ) {
            bonuses.push({
                increment : this.mindforceCS,
                concept : translations.text( 'enemyMindblast' )
            });
        }

        return bonuses;
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
            state.actionChart.increaseEndurance( -turn.loneWolf , this.permanentDammage );
        
        // Apply enemy damages:
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
        if( this.turns.length < this.eludeTurn )
            return false;
        if( this.maxEludeTurn >= 0 && this.turns.length > this.maxEludeTurn )
            return false;
        return true;
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

    /**
     * Returns true if the player can NOT use any weapon on the current turn
     */
    public noWeaponCurrentTurn() : boolean {
        if( this.noWeaponTurns < 0 )
            // All turns no weapon
            return true;

        // No weapon if we still on a "No weapon" turn
        return this.noWeaponTurns > this.turns.length;
    }

    /** Get the default Psi-Surge bonus */
    public static defaultPsiSurgeBonus() : number {
        /*
            Magnakai / Psi-Surge:
            When using their psychic ability to attack an enemy, Archmasters may add 6 points to their COMBAT SKILL instead of the usual 4 points.
            For every round in which Psi-surge is used, Archmasters need only deduct 1 ENDURANCE point. When using the weaker psychic 
            attack—Mindblast—they may add 3 points to their COMBAT SKILL without loss of ENDURANCE points. Archmasters cannot use Psi-surge if their 
            ENDURANCE score falls to 4 points or below.
        */
        let bonus = +4;
        if( state.book.isMagnakaiBook() && state.actionChart.disciplines.length >= 9 )
            bonus = +6;
        return bonus;
    }

    /** Get the default Mindblast bonus */
    public static defaultMindblastBonus() : number {
        // See defaultPsiSurgeBonus comment
        let bonus = +2;
        if( state.book.isMagnakaiBook() && state.actionChart.disciplines.length >= 9 )
            bonus = +3;
        return bonus;
    }

    /** Returns the number of EP loss by turn when using Psi-Surge */
    public static psiSurgeTurnLoss() : number {
        // See defaultPsiSurgeBonus comment
        let loss = 2;
        if( state.book.isMagnakaiBook() && state.actionChart.disciplines.length >= 9 )
            loss = 1;
        return loss;
    }

    /** Returns the minumum Endurance Points to use the Psi-Surge */
    public static minimumEPForPsiSurge() : number {
        // See defaultPsiSurgeBonus comment
        let min = 6;
        if( state.book.isMagnakaiBook() && state.actionChart.disciplines.length >= 9 )
            min = 4;
        return min;
    }

}

