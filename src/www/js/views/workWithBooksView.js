
/**
 * Work with books view
 */
var workWithBooksView = {

    /**
     * Fill the books table
     */
    fillBooksTable: function(booksState) {
        var $tableBody = $('#wwbooks-list > tbody');
        $tableBody.empty();

        var html = '';
        for(var i=0; i<booksState.length; i++) 
            html += '<tr id="bookstate-' + i + '" ><td>' + 
                booksState[i].bookNumber + '. ' + booksState[i].title + '</td></tr>';

        $tableBody.append(html);
    }
};
