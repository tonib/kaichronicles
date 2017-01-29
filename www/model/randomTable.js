
/**
 * The random number generator
 */
var randomTable = {

    /**
     * If >= 0, next value to return from the random table, fixed.
     * It's for debug purposes.
     */
    nextValueDebug: -1,

    /**
     * Returns an integer number between 0 and 9
     * @param {boolean} ignoreZero true if the zero should not be returned
     * @param {boolean} zeroAsTen true if the zero must to be returned as ten
     * @return The random number
     */
    getRandomValue: function(ignoreZero, zeroAsTen) {
        var value;
        while(true) {

            if( randomTable.nextValueDebug >= 0 && randomTable.nextValueDebug <= 9 ) {
                // Debug value
                value = randomTable.nextValueDebug;
                randomTable.nextValueDebug = -1;
            }
            else
                value = Math.floor( Math.random() * 10.0 );

            if( ignoreZero && value === 0 )
                continue;
            
            if( zeroAsTen && value === 0 )
                return 10;

            return value;
        }
    },

    module10: function( value ) {
        value = value % 10;
        if( value < 0 )
            value += 10;
        return value;
    }
};
