
var mainMenuView = {

    /**
     * Show the map section
     * @param section The map Section
     */
    setup: function( section ) {
        document.title = 'Kai Chronicles';
        $('#menu-continue').click(function() {
            routing.redirect('setup');
        });
        $('#menu-new').click(function() {
            routing.redirect('newGame');
        });
        $('#menu-load').click(function() {
            routing.redirect('loadGame');
        });
    },

    hideContinueGame: function() { 
        $('#menu-continue').hide();
    }

};