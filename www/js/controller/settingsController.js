
/**
 * Game settings controller
 */
var settingsController = {

    index: function() {

        if( !setupController.checkBook() )
            return;

        document.title = translations.text('settings');

        views.loadView('settings.html')
        .then(function() {
            settingsView.setup();
        });

    },

    /**
     * Change the current language
     */
    changeLanguage: function(newLanguage) {

        // TODO: Check download errors
        
        // Load the book with the new language:
        settingsView.showDownloadDialog();
        var book = new Book( state.book.bookNumber , newLanguage );
        book.downloadBookXml()
        .then(function() {
            settingsView.hideDownloadDialog();
            // Load game mechanics XML
            state.updateBookTranslation(book);
            // Set the new language title
            template.setNavTitle( book.getBookTitle() , '#game', false);
            // Clear the objects cache (they contain translated object names)
            state.mechanics.clearObjectsCache();
            // Translate the main menu
            template.translateMainMenu();
            // Force to reload the settings view, translated to the new language
            settingsController.index();
        });
    },

    /**
     * Show the save game dialog
     */
    saveGameDialog: function() {
        $('#settings-saveDialog').modal('show');
    },

    /**
     * Return a default save game file name
     */
    defaultSaveGameName: function() {
        var now = new Date();
        return now.getFullYear() + '_' + 
            ( now.getMonth() + 1 ).toString().padLeft( 2 , '0' ) + '_' + 
            now.getDate().toString().padLeft( 2 , '0' ) + '_' +
            now.getHours().toString().padLeft( 2 , '0' ) + '_' +
            now.getMinutes().toString().padLeft( 2 , '0' ) + '_' + 
            now.getSeconds().toString().padLeft( 2 , '0' ) + '-book-' +
            state.book.bookNumber + '-savegame.json';
    },

    /**
     * Save the current game
     * @param {String} fileName File name to save
     */
    saveGame: function(fileName) {
        try {
            var stateJson = state.getSaveGameJson();
            var blob = new Blob( [ stateJson ], {type: "text/plain;charset=utf-8"});

            // Check file name
            fileName = fileName.trim();
            if( !fileName )
                fileName = settingsController.defaultSaveGameName();
            if( !fileName.toLowerCase().endsWith('.json') )
                fileName += '.json';

            // Check for invalid character names
            if( !fileName.isValidFileName() ) {
                alert('The file name contains invalid characters');
                return false;
            }

            if( cordovaApp.isRunningApp() ) {
                // We are on cordova app
                cordovaFS.saveFile( fileName , blob, function() {
                    toastr['success']( translations.text( 'gameSaved' ) );
                });
            }
            else {
                saveAs(blob, fileName);
            }
            return true;
        }
        catch(e) {
            console.log(e);
            alert('Your browser version does not support save file with javascript. ' + 
                'Try a newer browser version. Error: ' + e);
            return false;
        }
    },

    /** Return page */
    getBackController: function() { return 'game'; }
    
};