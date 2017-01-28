
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

        $('#mechanics-mpAmount').bindNumberEvents();
        var min = $(rule).attr('min');
        if( min ) {
            $('#mechanics-mpAmount').attr( 'min' , min );
            $('#mechanics-mpAmount').val( min );
        }

    },

    /**
     * Return true if the money picker value is valid
     */
    isValid: function() {
        var $picker = $('#mechanics-mpAmount');
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
