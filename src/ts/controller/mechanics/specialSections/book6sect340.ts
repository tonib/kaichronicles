import { mechanicsEngine, gameView, ExpressionEvaluator, state, randomMechanics } from "../../..";

/** Bow tournament */
export const book6sect340 = {

    run() {
        const $gameUI = mechanicsEngine.getMechanicsUI("mechanics-book6sect340");
        gameView.appendToSection( $gameUI );

        mechanicsEngine.setChoiceState("all" , true );

        // Bow bonus:
        $("#mechanics-book6sect340-bonus").text( ExpressionEvaluator.evalInteger("[BOWBONUS]") );

        for ( let i = 0; i < 3; i++) {
            book6sect340.bindRandomLink(i);
        }

        book6sect340.updateUI();
    },

    getState(): number[] {
        let tournmentState = state.sectionStates.otherStates.book6sect340;
        if ( !tournmentState ) {
            tournmentState = [ -1 , -1 , -1 ];
            state.sectionStates.otherStates.book6sect340 = tournmentState;
        }
        return tournmentState;
    },

    bindRandomLink( i: number ) {
        const tournmentState = book6sect340.getState();
        // Add one because there is a random table on the section text to ignore
        const $link = randomMechanics.getRandomTableRefByIndex( i + 1 );
        if ( tournmentState[i] >= 0 ) {
            randomMechanics.linkAddChooseValue( $link , tournmentState[i] , 0);
        } else {
            randomMechanics.bindTableRandomLink( $link ,
                (value: number, increment: number) => {
                    tournmentState[i] = value;
                    book6sect340.updateUI();
                },
                false , false );
        }
    },

    updateUI() {

        let sum = ExpressionEvaluator.evalInteger("[BOWBONUS]");
        const tournmentState = book6sect340.getState();
        for ( let i = 0; i < 3; i++) {
            if ( tournmentState[i] < 0 ) {
                // Random not choosed
                return;
            }
            sum += tournmentState[i];
        }

        // All random choosed
        if ( sum <= 7 ) {
            mechanicsEngine.setChoiceState("sect103" , false );
        } else {
            mechanicsEngine.setChoiceState("sect26" , false );
        }
    },
};
