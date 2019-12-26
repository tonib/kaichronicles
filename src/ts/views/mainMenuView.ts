
var mainMenuView = {

    /**
     * Show the map section
     * @param section The map Section
     */
    setup: function( ) {
        document.title = translations.text('kaiChronicles');

        // TODO: Use translation on mainMenu.html instead of this ?
        if( state.language == 'es' )
            $('#menu-translate').text('English');
        else
            $('#menu-translate').text('Español');

        $('#menu-continue').click(function(e) {
            e.preventDefault();
            routing.redirect('setup');
        });
        $('#menu-new').click(function(e) {
            e.preventDefault();
            routing.redirect('newGame');
        });
        $('#menu-load').click(function(e) {
            e.preventDefault();
            routing.redirect('loadGame');
        });
        $('#menu-translate').click(function(e) {
            e.preventDefault();
            mainMenuController.changeTranslation();
        });
        $('#menu-color-theme').click(function(e) {
            e.preventDefault();
            mainMenuController.changeColor();
        });
        $('#menu-faq').click(function(e) {
            e.preventDefault();
            routing.redirect('faq');
        });
        $('#menu-privacy').click(function(e) {
            e.preventDefault();
            routing.redirect('privacy');
        });

        // Download books (only for app)
        var $downloadBooksBtn = $('#menu-downloadbooks');
        // Switch this to test the "Download books" view with the web browser
        //if( true ) {
        if( cordovaApp.isRunningApp() ) {
            $('#menu-downloadbooks').click(function(e) {
                e.preventDefault();
                routing.redirect('workWithBooks');
            });
        }
        else
            $downloadBooksBtn.hide();
    },

    /**
     * Hide web text info
     */
    hideWebInfo: function() {
        $('#menu-webinfo').hide();
    },

    /**
     * Hide the continue game button
     */
    hideContinueGame: function() { 
        $('#menu-continue').hide();
    }

};