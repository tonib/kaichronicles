
/// <reference path="../external.ts" />

/**
 * Info about a current choose
 */
interface RandomTableCurrentChoose {
    ignoreZero: boolean;
    zeroAsTen: boolean;
    /**
     * The jQuery Deferred object for the promise
     */
    deferred: any;
}

/**
 * The random number generator
 */
class RandomTable {

    /**
     * If >= 0, next value to return from the random table, fixed.
     * It's for debug purposes.
     */
    public nextValueDebug: number = -1;

    /**
     * Promise for random number choosing with UI (manual random table).
     * Null if there is no active choose
     */
    private currentAsync: RandomTableCurrentChoose = null;

    /**
     * Returns an integer number between 0 and 9
     * @param ignoreZero true if the zero should not be returned
     * @param zeroAsTen true if the zero must to be returned as ten
     * @return The random number
     */
    public getRandomValue(ignoreZero : boolean = false, zeroAsTen : boolean = false) : number {
        let value : number;
        while(true) {

            if( this.nextValueDebug >= 0 && this.nextValueDebug <= 9 ) {
                // Debug value
                value = this.nextValueDebug;
                this.nextValueDebug = -1;
            }
            else {
                // Get an index for the picked number
                const index = Math.floor( Math.random() * 100.0 );
                // Get the number for that index on the book random table
                value = state.book.bookRandomTable[index];
            }

            if( ignoreZero && value === 0 )
                continue;
            
            if( zeroAsTen && value === 0 )
                return 10;

            return value;
        }
    }

    public getRandomValueAsync(ignoreZero : boolean, zeroAsTen : boolean) : Promise<number> {

        if( !state.actionChart.manualRandomTable )
            // Use computer generated random numbers:
            return jQuery.Deferred().resolve( this.getRandomValue(ignoreZero, zeroAsTen) ).promise();

        // Store info about the current selection
        this.currentAsync = {
            ignoreZero: ignoreZero,
            zeroAsTen: zeroAsTen,
            deferred: jQuery.Deferred()
        };

        template.showRandomTable(true);
        return this.currentAsync.deferred.promise();
    }

    public randomTableUIClicked(value : number) {

        if( !this.currentAsync )
            return;

        if( this.currentAsync.ignoreZero && value === 0 ) {
            toastr.info( translations.text('zeroIgnored') );
            return;
        }
        
        if( this.currentAsync.zeroAsTen && value === 0 )
            value = 10;

        template.showRandomTable(false);

        this.currentAsync.deferred.resolve(value);
        this.currentAsync = null;
    }

    public module10( value : number) : number {
        value = value % 10;
        if( value < 0 )
            value += 10;
        return value;
    }
}

/**
 * The random numbers generator singleton
 */
const randomTable = new RandomTable();
