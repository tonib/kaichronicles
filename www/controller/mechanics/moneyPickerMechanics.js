
/**
 * Tool to select an amount of money
 */
var moneyPickerMechanics = {

    /**
     * moneyPicker rule execution
     */
    moneyPicker: function(rule) {

        if( $(rule).attr('enabled') == 'false' ) {
            // Disable the money picker
            moneyPickerMechanics.disable();
            return;
        }

        // Add HTML to do the choose
        gameView.appendToSection( 
            mechanicsEngine.$mechanicsUI.find('#mechanics-moneypicker').clone() );

        // Set the title
        $('#mechanics-mpTitle').text( $(rule).attr('en-text') );

        // Bind number picker events
        $('#mechanics-mpAmount').bindNumberEvents();

        // Set the minimum value
        var min = $(rule).attr('min');
        if( min )
            $('#mechanics-mpAmount').attr( 'min' , min );

        // Initialize (or restore) the value
        $('#mechanics-mpAmount').initializeValue();

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
     * Get the money picker value
     */
    getMoneyPickerValue: function() {
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
    }
    
};
