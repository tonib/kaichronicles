/// <reference path="../external.ts" />

class CombatTurn {


    /** True if the player is eluding the combat */
    public elude : boolean;

    /** Number of the turn (1 is the first) */
    public turnNumber : number;

    /** The random table result  */
    public randomValue : number;

    /** Lone wolf dammage multiplier */
    public dammageMultiplier : number;

    /** Enemy dammage multiplier */
    public enemyMultiplier : number;

    /** Enemy EP base loss.
      * It can be a number or combatTable_DEATH
      */
    public enemyBase : any;

    /** Enemy extra loss */
    public enemyExtra : number;

    /** The enemy total loss.
      * It can be a number or combatTable_DEATH
      */
    public enemy : any;

    /** The player base loss.
      * It can be a number or combatTable_DEATH
      */
    public loneWolfBase : any;

    /** Player extra loss */
    public loneWolfExtra : number;

    /** Player total loss.
      * It can be a number or combatTable_DEATH
      */
    public loneWolf : any;

    /** Text with the player loss */
    public playerLossText : string;

    /**
     * Create a combat turn
     * TODO: Do not pass all those parameters. Pass only Combat, and read the properties
     * @param combat The combat owner of this turn
     * @param randomValue The random table value for this turn
     * @param elude True if the player is eluding the combat
     */
    public constructor( combat : Combat , randomValue : number , elude : boolean ) {

        if( !combat )
            // Default constructor (called on BookSectionStates.prototype.fromStateObject)
            return;
        
        /** True if the player is eluding the combat */
        this.elude = elude;

        /** Number of the turn (1 is the first) */
        this.turnNumber = combat.turns.length + 1;

        /** The random table result  */
        this.randomValue = randomValue;
        /** Lone wolf dammage multiplier */
        this.dammageMultiplier = combat.dammageMultiplier;
        /** Enemy dammage multiplier */
        this.enemyMultiplier = combat.enemyMultiplier;

        var tableResult = combatTable.getCombatTableResult(combat.getCombatRatio(), this.randomValue);

        /** Enemy base loss  */
        this.enemyBase = ( ( elude || combat.enemyImmuneTurns >= this.turnNumber ) ? 0 : tableResult[0] );
        /** The enemy loss */
        this.enemy = CombatTurn.applyMultiplier( this.enemyBase , this.dammageMultiplier );
        /** Enemy extra loss (combat.enemyTurnLoss is negative)*/
        this.enemyExtra = combat.enemyTurnLoss;
        if( this.enemy != combatTable_DEATH)
            this.enemy -= combat.enemyTurnLoss;

        /** The player base loss */
        this.loneWolfBase = ( ( combat.immuneTurns >= this.turnNumber ) ? 0 : tableResult[1] );
        /** Player loss */
        this.loneWolf = CombatTurn.applyMultiplier( this.loneWolfBase , this.enemyMultiplier );
        /** Player extra loss. TODO: Add magnakai discipline */
        this.loneWolfExtra = 0;
        if( this.loneWolf != combatTable_DEATH && combat.mindforceEP < 0 && !state.actionChart.hasMindShield() ) {
            // Enemy mind force attack (combat.mindforceEP is negative):
            if( this.loneWolf != combatTable_DEATH)
                this.loneWolf -= combat.mindforceEP;
            this.loneWolfExtra = combat.mindforceEP;
        }

        // Extra loss
        if( this.loneWolf != combatTable_DEATH)
            this.loneWolf -= combat.turnLoss;
        this.loneWolfExtra += combat.turnLoss;

        // Psi-surge loss
        if( combat.psiSurge ) {
            if( this.loneWolf != combatTable_DEATH )
                this.loneWolf += 2;
            this.loneWolfExtra -= 2;
        }

        /** Text with the player loss */
        this.playerLossText = this.calculatePlayerLossText();
    }

    /**
     * Return a text with the player loss
     */
    public getPlayerLossText() : string { return this.playerLossText; }

    /**
     * Calculate the text with the player loss
     */
    public calculatePlayerLossText() : string {
        return CombatTurn.lossText( this.loneWolfBase , this.enemyMultiplier , this.loneWolfExtra ,
            this.loneWolf );
    }

    /**
     * Return a text with the enemy loss
     */
    public getEnemyLossText() : string {
        return CombatTurn.lossText( this.enemyBase , this.dammageMultiplier , this.enemyExtra , 
            this.enemy );
    }

    /**
     * Translate the loss
     * @param {string|number} loss It can be a number with the loss, or combatTable_DEATH
     */
    public static translateLoss(loss : any) : string {
        return loss == combatTable_DEATH ? translations.text( 'deathLetter' ) : loss.toString();
    }

    /**
     * Get a text for a turn result
     */
    public static lossText( base : any , multiplier : number, extra : number, finalLoss : any ) : string {
        var loss = CombatTurn.translateLoss( base );
        if( multiplier != 1 )
            loss = loss + " x " + multiplier;
        if( extra !== 0 )
            loss += " + " + ( - extra );
        if( multiplier != 1 || extra !== 0 )
            loss += " = " + CombatTurn.translateLoss( finalLoss );
        return loss;
    }

    /**
     * Apply a multiplier to a combat endurance loss
     * @param {number|string} enduranceLoss The original endurance loss
     * @param multiplier The multiplier
     * @return {number|string} The final endurance loss
     */
    public static applyMultiplier( enduranceLoss : any , multiplier : number ) : any {
        if( multiplier === 0 )
            // Ensure no death
            return 0;
        if( enduranceLoss != combatTable_DEATH )
            // Apply the dammage multiplier
            enduranceLoss = Math.floor( enduranceLoss * multiplier );
        return enduranceLoss; 
    }

}

