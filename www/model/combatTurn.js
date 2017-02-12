
/**
 * Create a combat turn
 * @param {number} turnNumber Number of the turn (1 is the first)
 * @param {number} combatRatio Current combat ratio
 * @param {number} dammageMultiplier Lone wolf dammage multiplier
 * @param {number} enemyMultiplier Enemy dammage multiplier
 * @param {number} mindforceEP Player extra endurance points lost each turn by 
 * enemy mindforce attack. It must to be negative.
 * @param {boolean} elude True if the player is eluding the combat
 * @param {number} extraEnemyLoss Extra E.P. lost by the enemy. It must to be negative.
 * @param {number} extraLoss Extra E.P. lost by the player. It must to be negative.
 */
function CombatTurn(turnNumber, combatRatio, dammageMultiplier, enemyMultiplier, 
    mindforceEP, elude , extraEnemyLoss , turnLoss ) {

    if( !turnNumber )
        // Default constructor (called on BookSectionStates.prototype.fromStateObject)
        // You know, javascript crap
        return;

    /** True if the player is eluding the combat */
    this.elude = elude;

    /** Number of the turn (1 is the first) */
    this.turnNumber = turnNumber;

    /** The random table result  */
    this.randomValue = randomTable.getRandomValue();
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
    /** Player extra loss */
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
CombatTurn.prototype.getPlayerLossText = function() { return this.playerLossText; };

/**
 * Calculate the text with the player loss
 */
CombatTurn.prototype.calculatePlayerLossText = function() {
    var loss = this.loneWolfBase.toString();
    if( this.enemyMultiplier != 1 )
        loss = loss + " x " + this.enemyMultiplier;
    if( this.loneWolfExtra != 0 )
        loss += " + " + ( - this.loneWolfExtra );
    if( this.enemyMultiplier != 1 || this.loneWolfExtra != 0 )
        loss += " = " + this.loneWolf;
    return loss;
};

/**
 * Return a text with the enemy loss
 */
CombatTurn.prototype.getEnemyLossText = function() {
    var loss = this.enemyBase.toString();
    if( this.dammageMultiplier != 1 )
        loss = loss + " x " + this.dammageMultiplier;
    if( this.enemyExtra != 0 )
        loss += " + " + ( - this.enemyExtra );
    if( this.dammageMultiplier != 1 || this.enemyExtra != 0 )
        loss += " = " + this.enemy
    return loss;
};

/**
 * Apply a multiplier to a combat endurance loss
 * @param {number|string} enduranceLoss The original endurance loss
 * @param {number} The multiplier
 * @return {number|string} The final endurance loss
 */
CombatTurn.applyMultiplier = function( enduranceLoss, multiplier ) {
    if( multiplier == 0 )
        // Ensure no death
        return 0;
    if( enduranceLoss != combatTable_DEATH )
        // Apply the dammage multiplier
        enduranceLoss *= multiplier;
    return enduranceLoss; 
};
