
/**
 * The new game view API
 */
var newGameView = {

    setup: function() {

        // Set current language
        $('#newgame-language').val( state.language );

        // Add supported books
        var html = '';
        var titles = projectAon.getBookTitles( state.language );
        for( var i=0; i<titles.length; i++) {
            var bookIndex = i + 1;
            html += '<option value="' + bookIndex + '" >' + bookIndex + '. ' + 
                titles[i] + '</option>';
        }
        $('#newgame-book').html( html );

        // Form submit
        $('#newgame-form').submit(function(e) {
            e.preventDefault();
            if( !$('#newgame-license').prop('checked') ) {
                alert( translations.text('youMustAgree') );
                return;
            }
            newGameController.startNewGame( $('#newgame-book').val() , 
                $('#newgame-language').val() );
        });

        // Book change
        $('#newgame-book').change(function() {
            newGameController.selectedBookChanged( $('#newgame-book').val() );
        });
    },

    setCoverImage: function(url) {
        $('#newgame-cover').attr('src', url);
    }
};
