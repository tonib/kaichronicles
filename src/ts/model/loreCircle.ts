
/**
 * Lore-circles for Magnakai disciplines
 */
class LoreCircle {

    /** The lore circles */
    private static circles: LoreCircle[];

    /** Id of Circle of Fire */
    public static readonly FIRE_ID = "circleFire";

    /** Id of Circle of Light */
    public static readonly LIGHT_ID = "circleLight";

    /** Id of Circle of Solaris */
    public static readonly SOLARIS_ID = "circleSolaris";

    /** Id of Circle of the Spirit */
    public static readonly SPIRIT_ID = "circleSpirit";

    /** Code */
    public id: string;

    /** Increment of combat skill */
    public bonusCS: number;

    /** Increment of endurance points */
    public bonusEP: number;

    /** Disciplines on the circle */
    public disciplines: string[];

    /**
     * Returns the translated description of the circle
     */
    public getDescription(): string {
        return translations.text( this.id );
    }

    private constructor(id: string, bonusCS: number, bonusEP: number, disciplines: string[]) {
        this.id = id;
        this.bonusCS = bonusCS;
        this.bonusEP = bonusEP;
        this.disciplines = disciplines;
    }

    /**
     * Return true if the player disciplines match this circle
     * @param disciplines Player disciplines ids
     */
    public matchCircle( disciplines: string[] ): boolean {
        if (state.hasCompletedKaiMagnakaiSerie()) {
            // Loyalty bonus
            return true;
        }

        for ( const d of this.disciplines ) {
            if ( !disciplines.contains(d) ) {
                return false;
            }
        }
        return true;
    }

    private static initializeCircles() {
        if ( LoreCircle.circles ) {
            return;
        }
        LoreCircle.circles = [];
        LoreCircle.circles.push( new LoreCircle(LoreCircle.FIRE_ID, 1, 2, [ "wpnmstry" , "hntmstry" ]) );
        LoreCircle.circles.push( new LoreCircle(LoreCircle.LIGHT_ID, 0, 3 , [ "anmlctrl" , "curing" ]) );
        LoreCircle.circles.push( new LoreCircle(LoreCircle.SOLARIS_ID, 1, 3 , [ "invsblty" , "hntmstry" , "pthmnshp" ]) );
        LoreCircle.circles.push( new LoreCircle(LoreCircle.SPIRIT_ID, 3, 3 , [ "psisurge" , "psiscrn" , "nexus" , "dvnation" ]) );
    }

    /**
     * Return the player Lore-Circles
     * @param disciplines The player disciplines ids
     */
    public static getCircles( disciplines: string[] ): LoreCircle[] {

        if ( state.book.bookNumber <= 5 || (state.book.bookNumber >= 13 && !state.hasCompletedKaiMagnakaiSerie()) ) {
            // Only for magnakai books
            return [];
        }

        LoreCircle.initializeCircles();

        const circles: LoreCircle[] = [];
        for ( const c of LoreCircle.circles ) {
            if ( c.matchCircle( disciplines ) ) {
                circles.push( c );
            }
        }
        return circles;
    }

    /**
     * Return the bonuses for the player circles
     * @param disciplines The player disciplines ids
     * @param type Type of bonuses to return: 'EP' for endurance points. 'CS' for combat skill
     */
    public static getCirclesBonuses( disciplines: string[] , type: string ): Bonus[] {

        const circles = LoreCircle.getCircles( disciplines );
        const bonuses: Bonus[] = [];
        for ( const c of circles ) {
            const bonusValue = ( type === "CS" ? c.bonusCS : c.bonusEP );
            if ( bonusValue > 0 ) {
                bonuses.push({
                    concept: c.getDescription(),
                    increment: bonusValue
                });
            }
        }
        return bonuses;
    }

    /**
     * Return a given lore circle
     * @param circleId The circle id
     * @return The LoreCircle. null if it was not found
     */
    public static getCircle( circleId: string ): LoreCircle {

        LoreCircle.initializeCircles();

        for ( const c of LoreCircle.circles ) {
            if ( c.id === circleId ) {
                return c;
            }
        }
        return null;
    }
}
