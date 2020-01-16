/**
 * Special objects use
 */
class SpecialObjectsUse {

    /** Use special object */
    public static use( item: Item ) {
        if ( item.id === "pouchadgana" ) {
            SpecialObjectsUse.useAdgana();
        } else {
            console.log("SpecialObjectsUse - Unknown object: " + item.id );
        }
    }

    /** Effects of Adgana after combats ( object id "pouchadgana") */
    public static postAdganaUse() {
        const r = randomTable.getRandomValue();
        toastr.info( translations.text( "adganaUse" , [r] ) );

        // If you have ever used Adgana in a previous Lone Wolf adventure, the risks of addiction are doubled should you decide to
        // use this dose (you will become addicted if you pick a 0, 1, 2, or 3 on the Random Number Table
        let addicted = false;
        if ( state.actionChart.adganaUsed ) {
            addicted = ( r >= 0 && r <= 3 );
        } else {
            addicted = ( r === 0 || r === 1 );
        }

        if ( addicted ) {
            actionChartController.increaseEndurance( -4 , false , true );
        }

        // Rembember adgana use
        state.actionChart.adganaUsed = true;
    }

    /** Use Adgana ( object id "pouchadgana") */
    private static useAdgana() {

        // There are pending combats on the current section?
        const sectionState = state.sectionStates.getSectionState();

        // Set flag for ccombats
        for ( const c of sectionState.combats ) {
            c.adganaUsed = true;
        }

        // Apply adgana effects:
        const effectCS = state.actionChart.adganaUsed ? +3 : +6;
        sectionState.combatSkillUsageModifier( effectCS );

        const combatsState = sectionState.areAllCombatsFinished(state.actionChart);
        if ( combatsState === "finished" || combatsState === "eluded"  ) {
            // No pending combats. Fire the adgana post-combat effects right now
            SpecialObjectsUse.postAdganaUse();
        }

    }

}
