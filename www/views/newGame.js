
/**
 * The new game view API
 */
var newGameView = {

    setup: function() {

        // Set current language
        $('#newgame-language').val( state.language );

        // Form submit
        $('#newgame-form').submit(function(e) {
            e.preventDefault();
            newGameController.startNewGame( $('#newgame-book').val() , 
                $('#newgame-language').val() );
        });
    }

};
