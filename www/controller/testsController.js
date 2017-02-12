
/**
 * Application tests
 */
var testsController = {

    index: function() {

        if( !setupController.checkBook() )
            return;

        // Test randomness
        var count = [];
        for( var i=0; i<10; i++)
            count[i] = 0;
        var total = 200000;
        for( i=0; i<total; i++)
            count[randomTable.getRandomValue()]++;
        console.log('Randomness test (' + total + ' random table hits)');
        for( i=0; i<10; i++)
            console.log(i + ': ' + count[i] + ' hits (' + ( count[i] / total ) * 100.0 + ' %)' );

        // Test rendering:
        for(var i=1; i<350; i++) {
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

    /** Return page */
    getBackController: function() { return 'game'; }

};
