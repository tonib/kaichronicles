
/**
 * Application tests
 */
var testsController = {

    index: function() {

        if( !setupController.checkBook() )
            return;

        // Test rendering:
        for(var i=1; i<350; i++) {
            try {
                var section = new Section(state.book, 'sect' + i );
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
