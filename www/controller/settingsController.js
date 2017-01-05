
/**
 * Game settings controller
 */
var settingsController = {

    index: function() {

        if( !setupController.checkBook() )
            return;

        document.title = 'Settings';

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
            // Load game mechanics XML
            state.updateBookTranslation(book);
            template.setNavTitle( book.getBookTitle() , '#game');
            settingsView.hideDownloadDialog();
        });
    },

    /**
     * Save the current game
     */
    saveGame: function() {
        try {
            var stateJson = state.getSaveGameJson();
            var blob = new Blob( [ stateJson ], {type: "text/plain;charset=utf-8"});
            var now = new Date();
            var fileName = now.getFullYear() + '_' + 
                ( now.getMonth() + 1 ).toString().padLeft( 2 , '0' ) + '_' + 
                now.getDate().toString().padLeft( 2 , '0' ) + '_' +
                now.getHours().toString().padLeft( 2 , '0' ) + '_' +
                now.getMinutes().toString().padLeft( 2 , '0' ) + '_' + 
                now.getSeconds().toString().padLeft( 2 , '0' ) + '-book-' +
                state.book.bookNumber + '-savegame.json';
            //var fileName = "book-" + state.book.bookNumber + "-savegame.json";
            if( cordovaApp.isRunningApp() ) {
                // We are on cordova app
                cordovaFS.saveFile( fileName , blob, function() {
                    toastr['success']('Game saved');
                });
            }
            else {
                saveAs(blob, fileName);
            }
        }
        catch(e) {
            console.log(e);
            alert('Your browser version does not support save file with javascript. ' + 
                'Try a newer browser version. Error: ' + e);
        }
    },

    /** Return page */
    getBackController: function() { return 'game'; }
    
};