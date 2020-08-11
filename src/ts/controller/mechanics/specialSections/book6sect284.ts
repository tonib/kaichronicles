import { numberPickerMechanics, state, randomTable, actionChartController, translations, mechanicsEngine } from "../../..";

/** Bet */
export const book6sect284 = {

    run() {

        // Pick number event handler
        numberPickerMechanics.bindButtonActionEvent( null , () => {
            book6sect284.onPickNumber();
        });

        // Add the game results section:
        $("#mechanics-numberpicker").append('<p style="margin-top: 10px" id="mechanics-book6sect284"></p>');

        book6sect284.updateUIState();

    },

    getBetsState(): number[][] {
        let betsState = state.sectionStates.otherStates.book6sect284;
        if ( ! betsState ) {
            betsState = [];
        }
        return betsState;
    },

    setBetsState( betsState: number[][] ) {
        state.sectionStates.otherStates.book6sect284 = betsState;
    },

    onPickNumber() {

        if ( !numberPickerMechanics.isValid() ) {
            return;
        }

        const betsState  = book6sect284.getBetsState();

        const newBet: number[] = [];
        // Money amount
        newBet.push( numberPickerMechanics.getNumberPickerValue() );
        // First number
        newBet.push( randomTable.getRandomValue() );
        // Second number
        newBet.push( randomTable.getRandomValue() );

        let moneyWon = 0;
        if ( newBet[1] > ( newBet[2] + 3 ) ) {
            // Bet won
            moneyWon = newBet[0] * 2;
        } else {
            moneyWon = -newBet[0];
        }
        actionChartController.increaseMoney( moneyWon );

        betsState.push( newBet );
        book6sect284.setBetsState( betsState );

        book6sect284.updateUIState();
    },

    renderBets() {
        const $betsPlaceholder = $("#mechanics-book6sect284");
        $betsPlaceholder.empty();
        let html = "";
        for ( const bet of book6sect284.getBetsState() ) {
            html += translations.text( "number" , [1] ) + ": " + bet[1] +
            ", " + translations.text( "number" , [2] ) + ": " + bet[2] + " + 3 = " + ( bet[2] + 3 ) + "<br/>";
        }
        $betsPlaceholder.html( html );
    },

    updateUIState() {

        book6sect284.renderBets();

        const betsState = book6sect284.getBetsState();

        const allMoneyLost = ( state.actionChart.beltPouch === 0 );

        // Can you quit?
        const quitEnabled = ( betsState.length < 3 && !allMoneyLost );
        mechanicsEngine.setChoiceState("sect336" , !quitEnabled );
        if ( !quitEnabled ) {
            numberPickerMechanics.hideButtonActionEvent();
            numberPickerMechanics.disable();
        }

        // 3 bets played and still money?
        const sect347Enabled = ( betsState.length >= 3 && state.actionChart.beltPouch > 0 );
        mechanicsEngine.setChoiceState("sect347" , !sect347Enabled );

        // All money lost?
        mechanicsEngine.setChoiceState( "sect76" , !allMoneyLost );

    },
};
