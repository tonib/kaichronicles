
/**
 * Random table links mechanics
 */
var randomMechanics = {

    /**
     * The last random number picked, with the increment added
     */
    lastValue: null,

    /** 
     * Assing an action to a random table link.  
     */
    randomTable: function(rule) {

        // Do not enable anything if the player is death:
        if( state.actionChart.currentEndurance <= 0 )
            return;

        // The DOM link:
        var $link;

        // Check if the link is selected by plain text:
        var linkText = $(rule).attr('text-' + state.language);
        if( linkText ) {
            var $textContainer = $(':contains("' + linkText + '")').last();
            var newHtml = $textContainer.html().replace( linkText , 
                '<span class="random">' + linkText + '</span>' );
            $textContainer.html( newHtml );
            $link = $textContainer.find( '.random' );
        }
        else {
            // Get the index of the random table tag to handle
            $link = randomMechanics.getRandomTableRefByIndex(rule);
        }

        // Check if the rule was already executed (= link clicked):
        var result = state.sectionStates.ruleHasBeenExecuted(rule);
        if( result ) {
            // Setup the link, but disabled and with the value choosed:
            randomMechanics.setupRandomTableLink($link, true, result.randomValue, 
                result.increment);
            // Fire the inner rules:
            randomMechanics.onRandomTableMechanicsClicked(rule, 
                result.randomValue , result.increment);
        }
        else {
            // Bind the tag click event
            var zeroAsTen = $(rule).attr( 'zeroAsTen' ) == 'true';
            randomMechanics.bindTableRandomLink( $link , function(value, increment) {
                randomMechanics.onRandomTableMechanicsClicked(rule, value, increment);
            }, 
            false, zeroAsTen);
        }
    },

    getRandomTableRefByIndex: function(rule) {
        var index = $(rule).attr('index');
        if( !index )
            index = 0;
        return $('.random:eq( ' + index + ')');
    },

    /** Increment for random table selection */
    randomTableIncrement: function(rule) {
        var $link = randomMechanics.getRandomTableRefByIndex(rule);
        var newIncrement = mechanicsEngine.evaluateExpression( $(rule).attr('increment') );

        // Check if already there is an increment:
        var increment = 0;
        var txtCurrentIncrement = $link.attr( 'data-increment' );
        if( txtCurrentIncrement )
            increment = parseInt( txtCurrentIncrement );

        increment += newIncrement;
        $link.attr( 'data-increment' , increment );
    },

    /** 
     * Bind a link event to a random table table
     * @param $element The jquery element with the random table tag
     * @param onLinkPressed Callback to call when the link is pressed
     * @param {boolean} ignoreZero True if the zero random value should be ignored
     * @param {boolean} zeroAsTen true if the zero must to be returned as ten
     */
    bindTableRandomLink: function($element, onLinkPressed, ignoreZero, zeroAsTen) {

        // If the element is an span, replace it by a link
        $element = randomMechanics.setupRandomTableLink($element);

        $element.click(function(e) {
            e.preventDefault();

            if( $(this).hasClass('disabled') )
                // Already clicked
                return;

            // Validate money picker, if there is. If its not valid, don't follow with this link
            if( !numberPickerMechanics.isValid() )
                return;

            // If there are pending meals, don't follow with this link
            if( mealMechanics.arePendingMeals() ) {
                alert( translations.text('doMealFirst') );
                return;
            }

            // Get the random value
            var value = randomTable.getRandomValue(ignoreZero, zeroAsTen);

            // Get the increment
            var increment = $(this).attr('data-increment');
            if( increment )
                increment = parseInt( increment );
            else
                increment = 0;

            // Show the result on the link
            randomMechanics.linkAddChooseValue( $(this) , value , increment);

            // Fire the event:
            onLinkPressed( value , increment );
        });
    },

    /**
     * Setup a tag to link to the random table
     * @param {jquery} $element The DOM element to setup
     * @param {boolean} alreadyChoose If it's true, the link will be set disabled
     * @param {number} valueAlreadyChoose Only needed if alreadyChoose is true. It's the 
     * previously
     * random value got
     * @param {number} increment The increment to the choose value, due to game rules
     * @return {jquery} The link tag already processed
     */
    setupRandomTableLink: function($element, alreadyChoose, valueAlreadyChoose, increment)  {

        // Initially, the random table links are plain text (spans). When they got setup by a random rule, they
        // are converted to links:
        if( $element.prop('tagName').toLowerCase() == 'span' ) {
            var $link = $('<a class="random action" href="#">' + $element.html() + '</a>');
            $element.replaceWith( $link );
            $element = $link;
        }

        if( alreadyChoose )
            randomMechanics.linkAddChooseValue( $link , valueAlreadyChoose , increment);

        return $element;
    },

    /**
     * Change a random table link to clicked
     */
    linkAddChooseValue: function( $link , valueChoose , increment ) {
        var html = valueChoose.toString();
        if( increment > 0 )
            html += ' + ' + increment;
        else if( increment < 0 )
            html += ' - ' + (-increment);
        $link.append(' (' + html + ')');
        // Disable the link:
        $link.addClass('disabled').addClass('picked');
    },

    /**
     * Event handler of a random table link clicked
     * @param rule The "randomTable" rule
     * @param randomValue The random value result from the table
     */
    onRandomTableMechanicsClicked: function(rule, randomValue, increment) {

        // Set the last choosed value
        randomMechanics.lastValue = randomValue + increment;

        // Process rule childs. It can be a single action, and/or a set of "case" rules
        $(rule).children().each(function(index, childRule) {
            if(childRule.nodeName == 'case') {
                // Evaluate the case rule
                if( randomMechanics.evaluateCaseRule(childRule, randomValue + increment) )
                    mechanicsEngine.runChildRules( $(childRule) );
            }
            else
                // Run unconditional rule
                mechanicsEngine.runRule(childRule);
        });

        // Mark the rule as executed
        var r = randomValue, i = increment;
        state.sectionStates.markRuleAsExecuted( rule, { randomValue: r , increment: i } );
    },

    /**
     * Evaluates a "case" rule.
     * @param rule The rule to evaluate
     * @return True if the case conditions are satisfied 
     */
    evaluateCaseRule: function(rule, randomValue) {

        // Test single value
        var txtValue = $(rule).attr('value');
        if( txtValue ) {
            var value = parseInt(txtValue);
            return randomValue == value;
        }

        // Test from / to value
        var txtFromValue = $(rule).attr('from');
        if( txtFromValue ) {
            var fromValue = parseInt( txtFromValue );
            var toValue = parseInt( $(rule).attr('to') );
            return randomValue >= fromValue && randomValue <=toValue;
        }

        return false;
    }
};
