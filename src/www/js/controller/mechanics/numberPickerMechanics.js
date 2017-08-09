
/**
 * Tool to select a number (or an amount of money)
 */
var numberPickerMechanics = {

    /**
     * numberPicker rule execution
     */
    numberPicker: function(rule) {

        if( $(rule).attr('enabled') == 'false' ) {
            // Disable the money picker
            numberPickerMechanics.disable();
            return;
        }

        // The number picker UI
        var $ui = mechanicsEngine.getMechanicsUI('mechanics-numberpicker');

        // Check if it's a money picker
        if( $(rule).attr('money') == 'true' )
            $ui.find('#mechanics-mpAmount').attr('data-ismoneypicker', 'true');

        // Check if it has an action button
        var actionButtonTitle = mechanicsEngine.getRuleText(rule, 'actionButton');
        if( actionButtonTitle ) {
            var $pickNumberButton = $ui.find('#mechanics-picknumber');
            $pickNumberButton.show().text( actionButtonTitle );
            numberPickerMechanics.bindButtonActionEvent( $pickNumberButton , function() {
                mechanicsEngine.fireNumberPickerChoosed();
            });
        }

        // Add HTML to do the choose
        gameView.appendToSection( $ui );

        // Set the title
        $('#mechanics-mpTitle').text( mechanicsEngine.getRuleText(rule) );

        // Bind number picker events
        $('#mechanics-mpAmount').bindNumberEvents();

        // Set the minimum value
        var min = $(rule).attr('min');
        if( min )
            $('#mechanics-mpAmount').attr( 'min' , min );

        // Set the maximum value
        var max = $(rule).attr('max');
        if( max )
            $('#mechanics-mpAmount').attr( 'max' , max );

        // Initialize (or restore) the value
        $('#mechanics-mpAmount').initializeValue();

    },

    bindButtonActionEvent : function( $pickNumberButton , callback ) {

        if( !$pickNumberButton )
            $pickNumberButton = $('#mechanics-picknumber');

        $pickNumberButton.click(function(e) {
            e.preventDefault();
            callback();
        });

    },

    hideButtonActionEvent : function() {
        $('#mechanics-picknumber').hide();
    },

    /**
     * Return true if the money picker value is valid
     */
    isValid: function() {
        var $picker = $('#mechanics-mpAmount');

        // If the money picker has been disabled, dont check it
        if( !$picker.isEnabled() )
            return true;
            
        if( $picker.length > 0 )
            return $picker.isValid();
        else
            return true;
    },

    /**
     * Get the number picker value
     */
    getNumberPickerValue: function() {
        try {
            var $picker = $('#mechanics-mpAmount');
            if( $picker.length > 0 )
                return $picker.getNumber();
            else
                return 0;
        }
        catch(e) {
            return 0;
        }
    },

    /**
     * Disable the money picker
     */
    disable: function() {
        $('#mechanics-mpAmount').setEnabled(false);
        $('#mechanics-picknumber').prop('disabled', true);
    }
    
};
