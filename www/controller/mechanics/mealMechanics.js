
/** 
 * Meal mechanics 
 */
var mealMechanics = {

    /** Run meals rule */
    runRule: function(rule) {

        if( state.sectionStates.ruleHasBeenExecuted(rule) )
            // Execute only once
            return;
            
        // Add HTML to do the choose
        gameView.appendToSection( 
            mechanicsEngine.$mechanicsUI.find('#mechanics-meal').clone() );

        // Initialize state:
        if( !state.actionChart.disciplines.contains('hunting') || 
            !state.sectionStates.huntEnabled )
            $('#mechanics-eatHunt').hide();
        mealMechanics.updateEatBackpack();

        // Check if you can buy a meal
        var price = $(rule).attr('price'); 
        if( price ) {
            price = parseInt( price );
            $('#mechanics-mealPrice').text(price);
        }
        else
            $('#mechanics-buyMeal').hide();

        // Get meal objects on backpack (ex. "laumspurmeal")
        var $mealObjectTemplate = $('.mechanics-eatObject').clone();
        $('.mechanics-eatObject').remove();
        $.each( state.actionChart.getMealObjects() , function(index, objectId) {
            var o = state.mechanics.getObject( objectId );
            var $mealObject = $mealObjectTemplate.clone();
            $mealObject.find( '.mechanics-eatDescription' ).text( o.name );
            $mealObject.find( 'input' ).val( o.id );
            $('#mechanics-eatDoNotEat').before( $mealObject );
        });

        // Set the default value
        $('#mechanics-meal input:visible').first().prop('checked', true);

        // Disable chooses:
        mechanicsEngine.setChoiceState('all', true);
        
        // Button event handler
        $('#mechanics-meal button').click(function(e) {
            e.preventDefault();

            var option = $('input[name=mechanics-mealOption]:checked').val();
            if( option == 'meal' )
                actionChartController.drop('meal' , false);
            else if( option == 'doNotEat' )
                actionChartController.increaseEndurance(-3);
            else if( option == 'hunting' )
                // Do nothing
                ;
            else if( option == 'buyMeal') {
                // Buy the meal
                if( state.actionChart.beltPouch < price ) {
                    alert( 'You don\'t have enougth money' );
                    return;
                }
                actionChartController.increaseMoney( -price );
            }
            else
                // Drop the selected object
                actionChartController.drop(option, false);

            // Mark the rule as executed
            state.sectionStates.markRuleAsExecuted(rule);

            // Enable section choices, and re-execute section rules to disable not available
            // choices
            mechanicsEngine.setChoiceState('all', false);
            mechanicsEngine.runSectionRules();
            
            // Remove UI
            $('#mechanics-meal').remove();

        });
    },

    updateEatBackpack: function() {
        if( state.actionChart.meals <= 0 )
            $('#mechanics-eatMeal').hide();
        else
            $('#mechanics-eatMeal').show();
    }
};
