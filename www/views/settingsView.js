
/**
 * Settings view
 */
var settingsView = {

    setup: function() {

        // Language
        $('#settings-language').val( state.language );
        $('#settings-language').change(function() {
            settingsController.changeLanguage( $(this).val() );
        });

        // Restart book
        $('#settings-restart').click(function(e) {
            e.preventDefault();
            if( confirm('Are you sure you want to restart the book?') )
                setupController.restartBook();
        });

        // Go back to the main menu
        $('#settings-mainmenu').click(function() {
            routing.redirect('mainMenu');
        });

        // About the book
        $('#settings-about').click(function() {
            routing.redirect('about');
        });

        // Save the game
        $('#settings-save').click( function() {
            settingsController.saveGame();
        });
    },

    /**
     * Show the download book dialog
     */
    showDownloadDialog: function() { $('#settings-downloadDialog').modal('show') },

    /**
     * Hide the download book dialog
     */
    hideDownloadDialog: function() { $('#settings-downloadDialog').modal('hide') }

};
