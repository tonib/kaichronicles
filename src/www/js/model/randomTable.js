
/**
 * The random number generator
 */
var randomTable = {

    /**
     * If >= 0, next value to return from the random table, fixed.
     * It's for debug purposes.
     */
    nextValueDebug: -1,

    currentAsync: null,

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
            else {
                // Get an index for the picked number
                var index = Math.floor( Math.random() * 100.0 );
                // Get the number for that index on the book random table
                value = state.book.bookRandomTable[index];
            }

            if( ignoreZero && value === 0 )
                continue;
            
            if( zeroAsTen && value === 0 )
                return 10;

            return value;
        }
    },

    getRandomValueAsync: function(ignoreZero, zeroAsTen) {

        if( !state.actionChart.manualRandomTable )
            // Use computer generated random numbers:
            return jQuery.Deferred().resolve( randomTable.getRandomValue(ignoreZero, zeroAsTen) ).promise();

        // Store info about the current selection
        randomTable.currentAsync = {
            ignoreZero: ignoreZero,
            zeroAsTen: zeroAsTen,
            deferred: jQuery.Deferred()
        };

        template.showRandomTable(true);
        return randomTable.currentAsync.deferred.promise();
    },

    randomTableUIClicked: function(value) {
        if( !randomTable.currentAsync )
            return;

        if( randomTable.currentAsync.ignoreZero && value === 0 ) {
            toastr.info( translations.text('zeroIgnored') );
            return;
        }
        
        if( randomTable.currentAsync.zeroAsTen && value === 0 )
            value = 10;

        template.showRandomTable(false);

        randomTable.currentAsync.deferred.resolve(value);
        randomTable.currentAsync = null;

    },

    module10: function( value ) {
        value = value % 10;
        if( value < 0 )
            value += 10;
        return value;
    }

};
