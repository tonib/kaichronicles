
/**
 * Create a combat turn
 * @param {number} turnNumber Number of the turn (1 is the first)
 * @param {number} randomValue The random table value for this turn
 * @param {number} combatRatio Current combat ratio
 * @param {number} dammageMultiplier Lone wolf dammage multiplier
 * @param {number} enemyMultiplier Enemy dammage multiplier
 * @param {number} mindforceEP Player extra endurance points lost each turn by 
 * enemy mindforce attack. It must to be negative.
 * @param {boolean} elude True if the player is eluding the combat
 * @param {number} extraEnemyLoss Extra E.P. lost by the enemy. It must to be negative.
 * @param {number} extraLoss Extra E.P. lost by the player. It must to be negative.
 */
function CombatTurn(turnNumber, randomValue , combatRatio, dammageMultiplier, 
    enemyMultiplier, mindforceEP, elude , extraEnemyLoss , turnLoss ) {

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
    return CombatTurn.lossText( this.loneWolfBase , this.enemyMultiplier , this.loneWolfExtra ,
        this.loneWolf );
};

/**
 * Return a text with the enemy loss
 */
CombatTurn.prototype.getEnemyLossText = function() {
    return CombatTurn.lossText( this.enemyBase , this.dammageMultiplier , this.enemyExtra , 
        this.enemy );
};

/**
 * Translate the loss
 * @param {string|number} loss It can be a number with the loss, or combatTable_DEATH
 */
CombatTurn.translateLoss = function(loss) {
    return loss == combatTable_DEATH ? translations.text( 'deathLetter' ) : loss.toString();
};

/**
 * Get a text for a turn result
 */
CombatTurn.lossText = function( base , multiplier , extra , finalLoss ) {
    var loss = CombatTurn.translateLoss( base );
    if( multiplier != 1 )
        loss = loss + " x " + multiplier;
    if( extra !== 0 )
        loss += " + " + ( - extra );
    if( multiplier != 1 || extra !== 0 )
        loss += " = " + CombatTurn.translateLoss( finalLoss );
    return loss;
};


/**
 * Apply a multiplier to a combat endurance loss
 * @param {number|string} enduranceLoss The original endurance loss
 * @param {number} The multiplier
 * @return {number|string} The final endurance loss
 */
CombatTurn.applyMultiplier = function( enduranceLoss, multiplier ) {
    if( multiplier === 0 )
        // Ensure no death
        return 0;
    if( enduranceLoss != combatTable_DEATH )
        // Apply the dammage multiplier
        enduranceLoss *= multiplier;
    return enduranceLoss; 
};
