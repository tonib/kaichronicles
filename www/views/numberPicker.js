
/**
 * jQuery functions for number fields
 */
(function ( $ ) {
 
    /**
     * Returns the number value, or NaN
     */
    $.fn.getNumber = function() { return parseInt( this.val() ); };

    /**
     * Get the title for this field
     */
    $.fn.getTitle = function() {
        return $("label[for='" + this.attr('id') + "']").text();
    }

    /**
     * Bind number events
     */
    $.fn.bindNumberEvents = function() {
        var self = this;
        this.parent().find('button.add-number').click(function(e) {
            e.preventDefault();
            var n = self.getNumber();
            if( isNaN(n) )
                return;
            n++;
            if( n <= self.getMaxValue() )
                self.val(n);
        });
        this.parent().find('button.sub-number').click(function(e) {
            e.preventDefault();
            var n = self.getNumber();
            if( isNaN(n) )
                return;
            n--;
            if( n >= self.getMinValue() )
                self.val(n);
        });
    }

    /**
     * Returns the minimum value for this field
     */
    $.fn.getMinValue = function() {
        var min = parseInt( this.attr('min') );
        if( isNaN(min) )
            return -99999999;
        return min;
    }

    /**
     * Returns the maximum value for this field
     */
    $.fn.getMaxValue = function() {
        var max = parseInt( this.attr('max') );
        if( isNaN(max) )
            return 99999999;
        return max;
    }

    /**
     * Return true if the number is valid
     */
    $.fn.isValid = function() {
        var number = this.getNumber();

        if( isNaN(number) ) {
            alert('Wrong value for "' + this.getTitle() + '"');
            return false;
        }

        var min = this.getMinValue();
        if( number < min ) {
            alert('Minimun value for "' + this.getTitle() + '" is ' + min);
            return false;
        }

        var max = this.getMaxValue();
        if( number > max ) {
            alert('Maximum value for "' + this.getTitle() + '" is ' + max);
            return false;
        }

        if( this.attr('data-ismoneypicker') == 'true' ) {
            // Check if you have enougth money
            if( state.actionChart.beltPouch < number) {
                alert('You have only ' + state.actionChart.beltPouch + ' Golden Crowns');
                return false;
            }
        }

        return true;
    };
 
    /**
     * Enable / disable the number picker
     * @param {boolean} enabled True to enable, false to disable
     */
    $.fn.setEnabled = function(enabled) {
        this.prop('disabled', !enabled);
        this.parent().find('button.add-number').prop('disabled', !enabled);
        this.parent().find('button.sub-number').prop('disabled', !enabled);
    }

    /**
     * Return true if the number picker is enabled
     */
    $.fn.isEnabled = function() {
        return !this.prop('disabled');
    }

}( jQuery ));
