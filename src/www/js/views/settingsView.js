
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
            if( confirm( translations.text('confirmRestart') ) )
                setupController.restartBook();
        });

        // Game rules
        $('#settings-gamerules').click(function() {
            routing.redirect('gameRules');
        });
        
        // About the book
        $('#settings-about').click(function() {
            routing.redirect('about');
        });

        // Game save button
        $('#settings-save').click( function(e) {
            e.preventDefault();
            $('#settings-saveName').val( settingsController.defaultSaveGameName() );
            $('#settings-saveDialog').modal('show');
        });

        // Save game dialog - save button
        $('#settings-saveBtn').click( function(e) {
            e.preventDefault();
            if( settingsController.saveGame( $('#settings-saveName').val() ) )
                $('#settings-saveDialog').modal('hide');
        });

        // Remove the current file name
        $('#settings-saveRemove').click( function(e) {
            e.preventDefault();
            $('#settings-saveName').val('').focus();
        });
    },

    /**
     * Show the download book dialog, only for web
     */
    showDownloadDialog: function() { 
        if( cordovaApp.isRunningApp() )
            return;
        $('#settings-downloadDialog').modal('show');
    },

    /**
     * Hide the download book dialog, only for web
     */
    hideDownloadDialog: function() { 
        if( cordovaApp.isRunningApp() )
            return;
        $('#settings-downloadDialog').modal('hide');
    }

};
