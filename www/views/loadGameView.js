
/**
 * The load game view interface functions
 */
var loadGameView = {

    hideFilesList: function() { $('#loadGame-fileslist').hide(); },

    hideFileUpload: function() { $('#loadGame-file').hide(); },

    clearFilesList: function() { $('#loadGame-fileslist tbody').empty(); },

    /**
     * Add a file to the file games list (Cordova app)
     * @param {String} fileName File name to load
     */
    addFileToList: function(fileName) {
        $('#loadGame-fileslist tbody').append(
            '<tr><td>' + 
                '<button class="btn btn-default table-op" title="Delete" data-filename="' + 
                fileName + '">' + 
                    '<span class="glyphicon glyphicon-remove"></span>' + 
                '</button>' +
                '<a class="savegame" href="' + fileName + '">' + 
                    fileName + 
                '</a>' +
            '</td></tr>'
        );
    },

    bindListEvents: function() {
        // Load game events
        $('.savegame').click(function(e) {
            e.preventDefault();
            loadGameController.fileListClicked( $(this).attr( 'href' ) );
        });
        // Delete file events
        $('#loadGame-fileslist tbody button').click(function(e) {
            var fileName = $(this).attr('data-filename');
            if( !confirm('Are you sure you want to delete the save game ' + fileName + '?') )
                return;
            loadGameController.deleteFile( fileName );
        });
    },

    bindFileUploaderEvents: function() {
        $('#loadGame-file').change(function() {
            if( !this.files || !this.files[0] )
                return;
            loadGameController.fileUploaderChanged( this.files[0] );
        });
    }
};
