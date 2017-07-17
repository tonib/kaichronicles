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
     * @param turnNumber Number of the turn (1 is the first)
     * @param randomValue The random table value for this turn
     * @param combatRatio Current combat ratio
     * @param dammageMultiplier Lone wolf dammage multiplier
     * @param enemyMultiplier Enemy dammage multiplier
     * @param mindforceEP Player extra endurance points lost each turn by 
     * enemy mindforce attack. It must to be negative.
     * @param elude True if the player is eluding the combat
     * @param extraEnemyLoss Extra E.P. lost by the enemy. It must to be negative.
     * @param extraLoss Extra E.P. lost by the player. It must to be negative.
     */
    public constructor(turnNumber : number, randomValue : number, combatRatio : number, dammageMultiplier : number, 
        enemyMultiplier : number, mindforceEP : number, elude : boolean, extraEnemyLoss : number , turnLoss : number ) {

        if( !turnNumber )
            // Default constructor (called on BookSectionStates.prototype.fromStateObject)
            // You know, javascript crap
            return;

        /** True if the player is eluding the combat */
        this.elude = elude;

        /** Number of the turn (1 is the first) */
        this.turnNumber = turnNumber;

        /** The random table result  */
        this.randomValue = randomValue;
        /** Lone wolf dammage multiplier */
        this.dammageMultiplier = dammageMultiplier;
        /** Enemy dammage multiplier */
        this.enemyMultiplier = enemyMultiplier;

        var tableResult = combatTable.getCombatTableResult(combatRatio, 
            this.randomValue);

        /** Enemy base loss  */
        this.enemyBase = ( elude ? 0 : tableResult[0] );
        /** The enemy loss */
        this.enemy = CombatTurn.applyMultiplier( this.enemyBase , this.dammageMultiplier );
        /** Enemy extra loss (extraEnemyLoss is negative)*/
        this.enemyExtra = extraEnemyLoss;
        if( this.enemy != combatTable_DEATH)
            this.enemy -= extraEnemyLoss;

        /** The player base loss */
        this.loneWolfBase = tableResult[1];
        /** Player loss */
        this.loneWolf = CombatTurn.applyMultiplier( this.loneWolfBase , this.enemyMultiplier );
        /** Player extra loss. TODO: Add magnakai discipline */
        this.loneWolfExtra = 0;
        if( this.loneWolf != combatTable_DEATH && mindforceEP < 0 && 
            !state.actionChart.disciplines.contains( 'mindshld' ) ) {
            // Enemy mind force attack (this.mindforceEP is negative):
            if( this.loneWolf != combatTable_DEATH)
                this.loneWolf -= mindforceEP;
            this.loneWolfExtra = mindforceEP;
        }
        // Extra loss
        if( this.loneWolf != combatTable_DEATH)
            this.loneWolf -= turnLoss;
        this.loneWolfExtra += turnLoss;

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
            enduranceLoss *= multiplier;
        return enduranceLoss; 
    }

}

