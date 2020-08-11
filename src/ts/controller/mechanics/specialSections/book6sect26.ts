import { state, mechanicsEngine, CombatTurn, Combat, template } from "../../..";

/** Bow tournament final */
export const book6sect26 = {

    run() {

        // Replace the combat turns generation:
        const sectionState = state.sectionStates.getSectionState();
        for (const combat of sectionState.combats) {
            combat.nextTurnAsync = book6sect26.nextTurnAsync;
            combat.applyTurn = book6sect26.applyTurn;
        }

        // Add UI
        const $UI = mechanicsEngine.getMechanicsUI("mechanics-book6sect26");
        $(".combat").append( $UI );
        book6sect26.updatePlayerTargetPointsUI(true);
    },

    /** Replacement for combat turns generation */
    nextTurnAsync(): JQueryPromise<CombatTurn> {
        return Combat.prototype.nextTurnAsync.call(this)
        .then((turn: CombatTurn) => {
            // Do not remove EP to the player. Do a backup of the real loss at turn.loneWolfExtra
            turn.loneWolfExtra = turn.loneWolf;
            turn.loneWolf = turn.loneWolfBase = 0;
            return jQuery.Deferred().resolve(turn).promise();
        });
    },

    /** Replacement for turns application */
    applyTurn( turn: CombatTurn ) {
        // Apply normal combat
        Combat.prototype.applyTurn.call(this, turn);

        // Remove player target points (stored at turn.loneWolfExtra)
        let targetPoints = book6sect26.getPlayerTargetPoints();
        targetPoints = Combat.applyLoss( targetPoints , turn.loneWolfExtra );
        book6sect26.setPlayerTargetPoints( targetPoints );

        // Combat is finished?
        const self: any = this;
        if ( targetPoints <= 0 ) {
            self.combatFinished = true;
        }

        // Update player target points
        book6sect26.updatePlayerTargetPointsUI(false);
    },

    getPlayerTargetPoints(): any {
        const targetPoints = state.sectionStates.otherStates.book6sect26TargetPoints;
        if ( targetPoints === undefined || targetPoints === null ) {
            return 50;
        }
        return targetPoints;
    },

    setPlayerTargetPoints( targetPoints: any ) {
        state.sectionStates.otherStates.book6sect26TargetPoints = targetPoints;
    },

    updatePlayerTargetPointsUI( doNotAnimate: boolean ) {
        const targetPoints = book6sect26.getPlayerTargetPoints();
        const color = ( targetPoints <= 0 ? "red" : null );
        template.animateValueChange( $("#mechanics-targetpoins") , targetPoints , doNotAnimate , color );
    },
};
