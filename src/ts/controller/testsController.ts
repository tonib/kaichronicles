
/**
 * Application tests
 */
class testsController {
    
    public static index() {

        return views.loadView('tests.html')
        .then(function() { testsController.setup(); }); 
    }

    /**
     * Setup view
     */
    private static setup() {
        $('#tests-random').click( function(e : Event) {
            e.preventDefault();
            testsController.testRandomTable();
        } );
        $('#tests-rendering').click( function(e : Event) {
            e.preventDefault();
            testsController.testRendering();
        } );
        $('#tests-bookmechanics').click( function(e : Event) {
            e.preventDefault();
            testsController.testCurrentBookMechanics();
        } );
    }

    /**
     * Test new tags with no render function
     */
    private static testRendering() {

        testsController.clearLog();

        if( !setupController.checkBook() ) {
            testsController.addError('No book loaded yet (Finished');
            return;
        }

        var count = state.mechanics.getSectionsCount();
        testsController.addLog('Testing sections render (' + count + ')');
        for(var i=1; i<count; i++) {
            try {
                var section = new Section(state.book, 'sect' + i, state.mechanics );
                var renderer = new SectionRenderer(section);
                renderer.renderSection();
            }
            catch(e) {
                testsController.addError('Section ' + i + ' error: ' + e , e );
            }
        }
        testsController.addLog('Finished (errors are displayed here, see Dev. Tools console for warnings)');
    }

    /**
     * Test random table ramdomness
     */
    private static testRandomTable() {

        testsController.clearLog();

        if( !setupController.checkBook() ) {
            testsController.addError('No book loaded yet (Finished)');
            return;
        }

        // Test implemented random table
        var count = [];
        for( var i=0; i<10; i++)
            count[i] = 0;
        var total = 1000000;
        for( i=0; i<total; i++)
            count[randomTable.getRandomValue()]++;
        console.log('Randomness test (' + total + ' random table hits)');
        for( i=0; i<10; i++)
            testsController.addLog(i + ': ' + count[i] + ' hits (' + ( count[i] / total ) * 100.0 + ' %)' );

        // Test randomness of the book random table:
        count = [];
        for( i=0; i<10; i++)
            count[i] = 0;
        var bookRandomTable = state.book.getRandomTable();
        for( i=0; i<bookRandomTable.length; i++)
            count[ bookRandomTable[i] ]++;
        
        console.log('Book random table:');
        for( i=0; i<10; i++)
            testsController.addLog(i + ': ' + count[i] + ' (' + ( count[i] / bookRandomTable.length ) * 100.0 + ' %)' );
    }

    private static testCurrentBookMechanics() {
        testsController.clearLog();
        const validator = new BookValidator( state.mechanics , state.book );
        validator.validateBook();
        for( let error of validator.errors )
            testsController.addError(error);
        testsController.addLog('Finished');
    }

    private static clearLog() {
        $('#tests-log').empty();
    }

    private static addLog( textLine : string ) {
        $('#tests-log').append( textLine + '</br>' );
    }

    private static addError( textLine : string , exception : any = null ) {
        testsController.addLog('ERROR: ' + textLine );
        if( exception )
            console.log( exception );
    }

    /** Return page */
    public static getBackController() : string { return 'game'; }

};
