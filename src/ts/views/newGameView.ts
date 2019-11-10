/**
 * The new game view API
 */
let newGameView = {

    setup(downloadedBooks: BookDownloadState[]) {

        // Set current language
        $("#newgame-language").val(state.language);

        // Add supported books
        let html = "";
        for (const book of downloadedBooks) {
            html += '<option value="' + book.bookNumber + '" >' +
                book.bookNumber + ". " +
                book.getTitle() + "</option>";
        }
        $("#newgame-book").html(html);

        // Form submit
        $("#newgame-form").submit((e) => {
            e.preventDefault();
            if (!$("#newgame-license").prop("checked")) {
                alert(translations.text("youMustAgree"));
                return;
            }
            newGameController.startNewGame($("#newgame-book").val(),
                $("#newgame-language").val());
        });

        // Book change
        $("#newgame-book").change(() => {
            newGameController.selectedBookChanged($("#newgame-book").val());
        });

        // Set the first book as selected:
        if (downloadedBooks.length > 0) {
            newGameController.selectedBookChanged(downloadedBooks[0].bookNumber);
        }
    },

    /**
     * Change the current book cover
     * @param {string} url The cover URL
     */
    setCoverImage(url: string) {
        if (!cordovaApp.isRunningApp()) {
            // Web: Clear the previous cover (PA server has a slow connection)
            $("#newgame-cover").attr("src", "");
        }
        $("#newgame-cover").attr("src", url);
    },
};
