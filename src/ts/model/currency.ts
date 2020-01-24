
/**
 * Currency exchange
 */
class Currency {

    /** Gold crowns id (Sommerlund) */
    public static readonly CROWN = "crown";

    /** Lunes id */
    public static readonly LUNE = "lune";

    /** Kikas id (Darklands) */
    public static readonly KIKA = "kika";

    /**
     * Currencies exchange.
     * How many coins per 1 Gold Crown?
     */
    private static readonly EXCHANGES = {
        "crown" : 1,
        "lune" : 4,
        "kika" : 10
    };

    /**
     * Make a currency exchange to Gold Crowns
     * @param nCoins Number of coins
     * @param currencyId Coins currency id. If null, Gold Crowns will be assumed
     * @returns Gold Crowns number, floor rounded
     */
    public static toGoldCrowns( nCoins: number , currencyId: string = null ): number {

        if ( !currencyId ) {
            currencyId = Currency.CROWN;
        }

        let exchange = Currency.EXCHANGES[ currencyId ];
        if ( !exchange ) {
            console.log( "Wrong currency: " + currencyId );
            exchange = 1;
        }

        return Math.floor( nCoins / exchange );
    }

}
