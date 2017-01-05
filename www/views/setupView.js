
/**
 * The setup view API
 */
var setupView = {
    log: function(text, level) {
        var style;
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
