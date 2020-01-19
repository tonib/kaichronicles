/// <reference path="../external.ts" />

/**
 * The setup view API
 */
const setupView = {
    log: function(text: string, level: string = null) {
        let style: string = '';
        if( level == 'ok' )
            style = 'style="color: green"';
        else if( level == 'error' )
            style = 'style="color: red; font-weight: bold"';
        $('#setup-log').append('<div ' + style + '>' + text + '</div>');
    },

    done: function() { 
        $('#setup-loadImg').hide();
    }
};
