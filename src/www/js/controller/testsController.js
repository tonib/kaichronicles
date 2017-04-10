
/**
 * Application tests
 */
var testsController = {

    index: function() {

        if( !setupController.checkBook() )
            return;

        // Test randomness
        testsController.testRandomTable();

        // Test rendering:
        var count = state.mechanics.getSectionsCount();
        console.log('Testing sections render (' + count + ')');
        for(var i=1; i<count; i++) {
            try {
                var section = new Section(state.book, 'sect' + i, state.mechanics );
                var renderer = new SectionRenderer(section);
                renderer.renderSection();
            }
            catch(e) {
                console.log('Section ' + i + ' error: ' + e );
            }
        }

        // TODO: Test the mechanics engine for each section
        
        console.log('Current book tests finished');
    },

    testRandomTable: function() {

        // Test implemented random table
        var count = [];
        for( var i=0; i<10; i++)
            count[i] = 0;
        var total = 1000000;
        for( i=0; i<total; i++)
            count[randomTable.getRandomValue()]++;
        console.log('Randomness test (' + total + ' random table hits)');
        for( i=0; i<10; i++)
            console.log(i + ': ' + count[i] + ' hits (' + ( count[i] / total ) * 100.0 + ' %)' );

        // Test randomness of the book random table:
        count = [];
        for( var i=0; i<10; i++)
            count[i] = 0;
        var bookRandomTable = state.book.getRandomTable();
        for( i=0; i<bookRandomTable.length; i++)
            count[ bookRandomTable[i] ]++;
        
        console.log('Book random table:');
        for( i=0; i<10; i++)
            console.log(i + ': ' + count[i] + ' (' + ( count[i] / bookRandomTable.length ) * 100.0 + ' %)' );
    },

    /** Return page */
    getBackController: function() { return 'game'; }

};
