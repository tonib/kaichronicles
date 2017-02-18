
/**
 * Special book sections with complex mechanics
 */
var specialSectionsMechanics = {

    /**
     * Cartwheel game
     */
    book2Sect238: function(rule) {
        // Cartwheel game UI:
        var $gameUI = mechanicsEngine.$mechanicsUI.find('#mechanics-book2Sect248').clone();
        gameView.appendToSection( $gameUI );

        // Bind number pickers events
        $('#mechanics-moneyToBet').bindNumberEvents();
        $('#mechanics-numberToBet').bindNumberEvents();

        // Get the game state
        var sectionState = state.sectionStates.getSectionState();
        var gameState = sectionState.ruleHasBeenExecuted(rule);
        if( !gameState ) {
            gameState = {
                moneyToBet: 1,
                numberToBet: 5,
                moneyWon: 0
            };
            sectionState.markRuleAsExecuted(rule, gameState);
        }

        $('#mechanics-moneyToBet').val( gameState.moneyToBet );
        $('#mechanics-numberToBet').val( gameState.numberToBet );

        /**
         * Function to update the UI
         */
        var updateUI = function(gameState, doNotAnimate ) {
            template.animateValueChange( $('#mechanics-moneyWon') , gameState.moneyWon , 
                doNotAnimate );
            template.animateValueChange( $('#mechanics-currentMoney') ,
                state.actionChart.beltPouch , doNotAnimate); 

            var noMoney = ( state.actionChart.beltPouch == 0 );
            if( gameState.moneyWon >= 40 || noMoney )
                // Maximum money won
                $('#mechanics-play').hide();

            mechanicsEngine.setChoiceState('sect169' , !noMoney);
            mechanicsEngine.setChoiceState('sect186' , noMoney);
        };
        
        updateUI( gameState , true );

        $('#mechanics-play').click(function() {

            // Checks
            if( !$('#mechanics-moneyToBet').isValid() || 
                !$('#mechanics-numberToBet').isValid() )
                return;
            
            var money = $('#mechanics-moneyToBet').getNumber();
            var number = $('#mechanics-numberToBet').getNumber();

            // Play the game
            var random = randomTable.getRandomValue();
            var moneyInc;
            if( random == number )
                moneyInc = money * 8;
            else if ( randomTable.module10( random + 1 ) == number || 
                      randomTable.module10( random - 1 ) == number ) {
                moneyInc = money * 5;
            }
            else 
                moneyInc = -money;

            // Limit money won to 40
            if( gameState.moneyWon + moneyInc > 40 )
                moneyInc = 40 - gameState.moneyWon;
                 
            actionChartController.increaseMoney(moneyInc);

            // Update game state:
            gameState.moneyToBet = money;
            gameState.numberToBet = number;
            gameState.moneyWon += moneyInc;
            var msg = 'Random Table: ' + random;
            if( moneyInc >= 0 )
                msg += '. You won ' + moneyInc + ' Crowns';
            else
                msg += '. You lost ' + (-moneyInc) + ' Crowns';
            $('#mechanics-gameStatus').text( msg );

            updateUI( gameState , false );

        });
    },

    /**
     * Portholes game
     */
    book2sect308: function() {

        // Portholes game UI:
        var $gameUI = mechanicsEngine.$mechanicsUI
            .find('#mechanics-book2Sect308').clone();
        gameView.appendToSection( $gameUI );

        /**
         * Function to update the UI
         */
        var updateUI = function(doNotAnimate) {
            template.animateValueChange( $('#mechanics-currentMoney') ,
                state.actionChart.beltPouch , doNotAnimate); 
        };
        updateUI(true);

        /**
         * Function to get a game player result
         */
        var playerResult = function(playerName) {
            var result = {
                dice1: randomTable.getRandomValue(),
                dice2: randomTable.getRandomValue()
            };
            result.status = playerName + ' dices: ' + result.dice1 + ' + ' + 
                result.dice2 + ' = ';
            if( result.dice1 == 0 && result.dice2 == 0 ) {
                result.total = 100;
                result.status += ' Portholes!';
            }
            else {
                result.total = result.dice1 + result.dice2;
                result.status += result.total;
            } 
            return result;
        };

        $('#mechanics-play').click(function() {

            if( state.actionChart.beltPouch < 3 ) {
                alert( 'You don\'t have enougth money to bet' );
                return;
            }

            var player1 = playerResult('Player 1'), 
                player2 = playerResult('Player 2'),
                lw = playerResult('Lone Wolf');
            var status = player1.status + '<br/>' + 
                player2.status + '<br/>' + lw.status + '<br/>';
            if( lw.total > player1.total && lw.total > player2.total ) {
                status += 'You won 6 Gold Crowns';
                actionChartController.increaseMoney(6);
            }
            else {
                status += 'You lost 3 Gold Crowns';
                actionChartController.increaseMoney(-3);
            }

            $('#mechanics-gameStatus').html( status );
            updateUI(false);
        });
    },

    /**
     * Javek venom test
     */
    book3sect88: function() {

        // Replace the combat turns generation:
        var sectionState = state.sectionStates.getSectionState();
        for(var i=0; i<sectionState.combats.length; i++) {
            var combat = sectionState.combats[i];

            combat.nextTurn = function() {
                var turn = Combat.prototype.nextTurn.call(this);
                // Check the bite:
                if( turn.loneWolf > 0 && turn.loneWolf != combatTable_DEATH ) {
                    var biteRandomValue = randomTable.getRandomValue();
                    turn.playerLossText = '(' + turn.playerLossText + ')';
                    turn.playerLossText += ' Random: ' + biteRandomValue;
                    if( biteRandomValue == 9 )
                        turn.loneWolf = combatTable_DEATH;
                    else
                        turn.loneWolf = 0;
                }
                return turn;
            };
        }
    }

};
