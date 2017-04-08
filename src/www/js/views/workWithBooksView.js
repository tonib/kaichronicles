
/**
 * Work with books view
 */
var workWithBooksView = {

    /**
     * Setup view
     */
    setup: function() {

        // Update books event
        $('#wwbooks-update').click(function(e) {
            e.preventDefault();

            if( !$('#wwbooks-license').prop('checked') ) {
                alert( translations.text('youMustAgree') );
                return;
            }

            // Get selected books:
            var selectedBooks = [];
            $('tbody input:checked').parent().parent().each(function(index, tr) {
                var bookNumber = parseInt( $(tr).attr('data-book-number') );
                selectedBooks.push( bookNumber );
            });

            workWithBooksController.downloadBooks( selectedBooks );
        });

        // Select / deselect all books
        $('#wwbooks-all').change(function() {
            var $allChecks = $('tbody input');
            if( $(this).prop('checked') )
                $allChecks.prop( 'checked' , 'checked' );
            else
                $allChecks.removeAttr('checked');
        });

    },

    setSelectAllUnchecked: function() {
        $('#wwbooks-all').removeAttr('checked');
    },

    updateBooksList: function(booksState) {
        var $tableBody = $('#wwbooks-list > tbody');
        $tableBody.empty();

        var html = '';
        for(var i=0; i<booksState.length; i++) 
            html += '<tr data-book-number="' + booksState[i].bookNumber + 
                '" style="width:100%"><td>' + 
                booksState[i].bookNumber + '. ' + booksState[i].title + 
                '</td><td style="white-space: nowrap">' + booksState[i].size.toString() + ' MB</td>' + 
                '<td class="center"><input type="checkbox"></td>' +
                '</tr>';

        $tableBody.append(html);
    },

    markBookAsDownloaded: function(bookNumber) {
        var $row = $('tr[data-book-number=' + bookNumber + ']');
        $row.addClass('success');
        $row.find( 'input' ).prop('checked' , 'checked');
    },

    displayModal: function(show) {
        if( show ) {
            // Clear the log
            $('#wwbooks-log').empty();
            // Disable close
            $('#wwbooks-closemodal').prop( 'disabled' , true );
        }

        $('#wwbooks-modal').modal( show ? 'show' : 'hide' );
    },

    enableCloseModal: function() {
        $('#wwbooks-closemodal').prop( 'disabled' , false );
    },

    logEvent: function(msg) {
        $('#wwbooks-log').append(msg + '\n\n');
    },

    setCurrentWork: function(msg) {
        $('#wwbooks-current').text(msg);
        workWithBooksView.updateProgress(0);
    },

    updateProgress: function( percent ) {
        $('#wwbooks-progress').css('width', percent + '%');
    },

};
