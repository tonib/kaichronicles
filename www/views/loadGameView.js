
/**
 * The load game view interface functions
 */
var loadGameView = {

    hideFilesList: function() { $('#loadGame-fileslist').hide(); },

    hideFileUpload: function() { $('#loadGame-file').hide(); },

    clearFilesList: function() { $('#loadGame-fileslist tbody').empty(); },

    /**
     * Add a file to the file games list (Cordova app)
     * @param {String} fileName File name to load. null for the empty list
     * item.
     */
    addFileToList: function(fileName) {
        var row = '<tr><td>';
        if( !fileName ) 
            row += '<i>No saved games found</i>';
        else {
            row += '<button class="btn btn-default table-op" title="Delete" data-filename="' + 
                fileName + '">' + 
                    '<span class="glyphicon glyphicon-remove"></span>' + 
                '</button>' +
                '<a class="savegame" href="' + fileName + '">' + 
                    fileName + 
                '</a>';
        }
        row += '</td></tr>';

        $('#loadGame-fileslist tbody').append(row);
    },

    bindListEvents: function() {
        // Load game events
        $('.savegame').click(function(e) {
            e.preventDefault();
            loadGameController.fileListClicked( $(this).attr( 'href' ) );
        });
        // Delete file events
        $('#loadGame-fileslist tbody button').click(function(e) {
            // IMPORTANT: Do not remove this preventDefault(), otherwise
            // Cordova beleaves we have changed the current page
            e.preventDefault();
            var fileName = $(this).attr('data-filename');
            if( !confirm( translations.text('confirmDeleteSave' , fileName ) ) )
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
