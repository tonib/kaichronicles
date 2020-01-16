/** Bow tournament */
const book9sect91 = {

    run() {

        try {
            // Check if this has been executed
            let coinState: string = state.sectionStates.otherStates.book9sect91;
            if ( coinState ) {
                // Already executed
                book9sect91.setUI( coinState );
                return;
            }

            // Count up the number of Backpack Items you possess and, if there is an odd number, erase the last one on your list
            const l = state.actionChart.backpackItems.length;
            if ( l % 2 === 1 ) {
                actionChartController.drop( state.actionChart.backpackItems[ l - 1 ] );
            }

            // Get the two lists
            const heads = [];
            const tails = [];
            const halfIndex = state.actionChart.backpackItems.length / 2;
            for ( let i = 0; i < state.actionChart.backpackItems.length; i++)  {
                if ( i < halfIndex ) {
                    heads.push( state.actionChart.backpackItems[i] );
                } else {
                    tails.push( state.actionChart.backpackItems[i] );
                }
            }

            // Get the list to remove
            coinState = ( randomTable.getRandomValue() % 2 === 0 ? "heads" : "tails" );

            // Drop objects
            actionChartController.dropItemsList( coinState === "heads" ? heads : tails );

            // Store state
            state.sectionStates.otherStates.book9sect91 = coinState;

            // Set UI
            book9sect91.setUI( coinState );
        } catch (e) {
            throw new Error(e);
        }
    },

    setUI(coinState: string) {
        mechanicsEngine.showMessage( translations.text( coinState ) );
    },
};
