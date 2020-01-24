
/**
 * The new game view API
 */
var newGameView = {

    setup(downloadedBooks: BookDownloadState[]) {

        // Set current language
        $("#newgame-language").val( state.language );

        // Add supported books
        var html = "";
        for ( var i = 0; i < downloadedBooks.length; i++) {
            html += '<option value="' + downloadedBooks[i].bookNumber + '" >' +
                downloadedBooks[i].bookNumber + ". " +
                downloadedBooks[i].getTitle() + "</option>";
        }
        $("#newgame-book").html( html );

        // Form submit
        $("#newgame-form").submit(function(e) {
            e.preventDefault();
            if ( !$("#newgame-license").prop("checked") ) {
                alert( translations.text("youMustAgree") );
                return;
            }
            newGameController.startNewGame( $("#newgame-book").val() ,
                $("#newgame-language").val() );
        });

        // Book change
        $("#newgame-book").change(function() {
            newGameController.selectedBookChanged( $("#newgame-book").val() );
        });

        // Set the first book as selected:
        if ( downloadedBooks.length > 0 ) {
            newGameController.selectedBookChanged( downloadedBooks[0].bookNumber );
        }
    },

    /**
     * Change the current book cover
     * @param {string} url The cover URL
     */
    setCoverImage(url: string) {
        if ( !cordovaApp.isRunningApp() ) {
            // Web: Clear the previous cover (PA server has a slow connection)
            $("#newgame-cover").attr("src", "");
        }
        $("#newgame-cover").attr("src", url);
    }
};
