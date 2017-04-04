
/**
 * Work with books view
 */
var workWithBooksView = {

    /**
     * Fill the books table
     */
    setup: function(booksState) {
        var $tableBody = $('#wwbooks-list > tbody');
        $tableBody.empty();

        var html = '';
        for(var i=0; i<booksState.length; i++) 
            html += '<tr data-book-number="' + booksState[i].bookNumber + '"><td>' + 
                booksState[i].bookNumber + '. ' + booksState[i].title + '</td>' + 
                '<td class="center"><input type="checkbox"></td>' +
                '</tr>';

        $tableBody.append(html);

        $('#wwbooks-update').click(function(e) {
            e.preventDefault();

            if( !$('#wwbooks-license').prop('checked') ) {
                alert( translations.text('youMustAgree') );
                return;
            }

            // Get selected books:
            var selectedBooks = [];
            $('input:checked').parent().parent().each(function(index, tr) {
                var bookNumber = parseInt( $(tr).attr('data-book-number') );
                selectedBooks.push( bookNumber );
            });

            workWithBooksController.updateBooks( selectedBooks );
        });

    },

    setBookChecked: function(bookNumber) {
        $('tr[data-book-number=' + bookNumber + '] input').prop('checked' , 'checked');
    },

    displayModal: function(show) {
        if( show )
            // Clear the log
            $('#wwbooks-log').empty();

        $('#wwbooks-modal').modal( show ? 'show' : 'hide' );
    },

    logEvent: function(msg) {
        $('#wwbooks-log').append('<p>' + msg + '</p>');
    },

    setCurrentWork: function(msg) {
        $('#wwbooks-current').text(msg);
        workWithBooksView.updateProgress(0);
    },

    updateProgress: function( percent ) {
        $('#wwbooks-progress').css('width', percent + '%');
    },

};
