
/**
 * Load stored game controller
 */
var loadGameController = {

    /**  
     * The load game page 
     */
    index: function() {
        template.setNavTitle('Kai Chronicles', '#mainMenu');
        template.showStatistics(false);
        views.loadView('loadGame.html').then(function() {
                
            if( !cordovaApp.isRunningApp() ) {
                // Web page environment:
                loadGameView.hideFilesList();
                loadGameView.bindFileUploaderEvents();
            }
            else {
                // Cordova app files list
                loadGameView.hideFileUpload();
                loadGameController.listGameFiles();
            }

        });
    },

    /**
     * Fill the Cordova app saved games list
     */
    listGameFiles: function() {
        loadGameView.clearFilesList();
        cordovaFS.getDirectoryFiles( function(entries) {
            
            if( entries.length == 0 )
                loadGameView.addFileToList( null );
            else {
                // Get file names
                var fileNames = [];
                for(var i=0; i<entries.length; i++)
                    fileNames.push(entries[i].name);
                // The list may be unsorted:
                fileNames.sort();
                // Show files
                for(var i=0; i<fileNames.length; i++)
                    loadGameView.addFileToList( fileNames[i] );
                loadGameView.bindListEvents();
            }
            
        });
    },

    fileUploaderChanged: function(fileToUpload) {
        try {
            var reader = new FileReader();
            reader.onload = function (e) {
                loadGameController.loadGame( e.target.result );
            };
            reader.readAsText(fileToUpload);
        }
        catch(e) {
            console.log(e);
            $('#loadGame-errors').text(e.toString());
        }
    },

    fileListClicked: function(fileName) {
        cordovaFS.loadFile( fileName , function(fileContent) {
            loadGameController.loadGame( fileContent );
        });
    },

    loadGame: function(jsonState) {
        try {
            state.loadSaveGameJson( jsonState );
            routing.redirect('setup');
        }
        catch(e) {
            console.log(e);
            if( cordovaApp.isRunningApp() )
                alert(e.toString());
            else
                $('#loadGame-errors').text(e.toString());
        } 
    },

    deleteFile: function(fileName) {
        cordovaFS.deleteFile(fileName, function() {
            loadGameController.listGameFiles();
        });
    },

    /** Return page */
    getBackController: function() { return 'mainMenu'; }
    
};