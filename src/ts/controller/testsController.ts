
/**
 * Application tests
 * TODO: Run XSD
 * TODO: Test all books / languages
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
        $('#tests-allbooks').click( function(e : Event) {
            e.preventDefault();
            testsController.testAllBooks();
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
        testsController.testBook( validator );
        testsController.addLog('Finished');
    }

    private static testBook( validator : BookValidator ) {
        validator.validateBook();
        let title = 'Book ' + validator.book.bookNumber + ' (' + validator.book.language + ') ';
        if( validator.errors.length == 0 )
            testsController.addLog( title + 'OK!');
        else
            testsController.addLog(title + 'with errors:');
        for( let error of validator.errors )
            testsController.addError(error);

        // Separator
        testsController.addLog('');
    }

    private static downloadAndTestBook( bookNumber : number , language : string ) {
        BookValidator.downloadBookAndGetValidator( bookNumber , language )
        .then(function(validator : BookValidator) {

            testsController.testBook(validator);

            // Move to the next book:
            let nextBookNumber = validator.book.bookNumber;
            let nextLanguage = validator.book.language;
            if( nextLanguage == 'en')
                nextLanguage = 'es';
            else {
                nextBookNumber++;
                nextLanguage = 'en';
            }
            if( nextBookNumber > projectAon.supportedBooks.length ) {
                testsController.addLog("Finished");
                return;
            }

            testsController.downloadAndTestBook( nextBookNumber , nextLanguage );
        });
    }

    private static testAllBooks() {
        testsController.clearLog();
        testsController.downloadAndTestBook( 1, 'en' );
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
