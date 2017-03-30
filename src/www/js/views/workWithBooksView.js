
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
    }
};
