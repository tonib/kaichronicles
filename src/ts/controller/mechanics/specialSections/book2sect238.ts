import { mechanicsEngine, gameView, state, template, randomTable, actionChartController, translations } from "../../..";

/**
 * Cartwheel game
 */
export const book2sect238 = {

    run(rule: Element) {
        // Cartwheel game UI:
        const $gameUI = mechanicsEngine.getMechanicsUI("mechanics-book2Sect238");
        gameView.appendToSection($gameUI);

        // Bind number pickers events
        $("#mechanics-moneyToBet").bindNumberEvents();
        $("#mechanics-numberToBet").bindNumberEvents();

        // Get the game state
        const sectionState = state.sectionStates.getSectionState();
        let gameState = sectionState.ruleHasBeenExecuted(rule);
        if (!gameState) {
            gameState = {
                moneyToBet: 1,
                moneyWon: 0,
                numberToBet: 5,
            };
            sectionState.markRuleAsExecuted(rule, gameState);
        }

        $("#mechanics-moneyToBet").val(gameState.moneyToBet);
        $("#mechanics-numberToBet").val(gameState.numberToBet);

        book2sect238.updateUI(gameState, true);

        $("#mechanics-play").click((e) => {
            e.preventDefault();
            book2sect238.click(gameState);
        });
    },

    updateUI(gameState: any, doNotAnimate: boolean) {
        template.animateValueChange($("#mechanics-moneyWon"), gameState.moneyWon,
            doNotAnimate);
        template.animateValueChange($("#mechanics-currentMoney"),
            state.actionChart.beltPouch, doNotAnimate);

        const noMoney = (state.actionChart.beltPouch === 0);
        if (gameState.moneyWon >= 40 || noMoney) {
            // Maximum money won
            $("#mechanics-play").hide();
        }

        mechanicsEngine.setChoiceState("sect169", !noMoney);
        mechanicsEngine.setChoiceState("sect186", noMoney);
    },

    click(gameState: any) {
        // Checks
        if (!$("#mechanics-moneyToBet").isValid() ||
            !$("#mechanics-numberToBet").isValid()) {
            return;
        }

        const money = $("#mechanics-moneyToBet").getNumber();
        const num = $("#mechanics-numberToBet").getNumber();

        // Play the game
        randomTable.getRandomValueAsync().then((random) => {
            let moneyInc: number;
            if (random === num) {
                moneyInc = money * 8;
            } else if (randomTable.module10(random + 1) === num ||
                randomTable.module10(random - 1) === num) {
                moneyInc = money * 5;
            } else {
                moneyInc = -money;
            }

            // Limit money won to 40
            if (gameState.moneyWon + moneyInc > 40) {
                moneyInc = 40 - gameState.moneyWon;
            }

            actionChartController.increaseMoney(moneyInc);

            // Update game state:
            gameState.moneyToBet = money;
            gameState.numberToBet = num;
            gameState.moneyWon += moneyInc;
            let msg = translations.text("randomTable") + ": " + random + ". ";
            if (moneyInc >= 0) {
                msg += translations.text("msgGetMoney", [moneyInc]);
            } else {
                msg += translations.text("msgDropMoney", [-moneyInc]);
            }
            $("#mechanics-gameStatus").text(msg);

            book2sect238.updateUI(gameState, false);
        });
    },
};
