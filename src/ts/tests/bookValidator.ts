/**
 * Tools to validate book mechanics
 */
class BookValidator {
    
    /** Book mechanics */
    private mechanics : Mechanics;

    /** Book XML */
    public book : Book;

    /** Errors found */
    public errors : Array<string> = [];

    private currentSection : Section;
    
    /**
     * Constructor
     */
    public constructor( mechanics : Mechanics , book : Book ) {
        this.mechanics = mechanics;
        this.book = book;
    }

    public static downloadBookAndGetValidator( bookNumber : number , language : string ) : Promise<BookValidator> {

        const book = new Book(bookNumber, language );
        const mechanics = new Mechanics( book );
        
        let promises = [];
        promises.push( book.downloadBookXml() );
        promises.push( mechanics.downloadXml() );
        promises.push( mechanics.downloadObjectsXml() );

        var dfd = jQuery.Deferred();

        $.when.apply($, promises)
        .done( function() {
            dfd.resolve( new BookValidator(mechanics, book) );
        } )
        .fail( function() {
            dfd.reject('Error downloading book files');
        });

        return dfd.promise();
    }

    /**
     * Validate the entire book. Errors will be stored at this.errors
     */
    public validateBook() {
        
        this.errors = [];

        // Traverse book sections
        const lastSectionId = this.mechanics.getLastSectionId();
        let currentSectionId = Book.INITIAL_SECTION;
        while( currentSectionId != lastSectionId ) {
            // The book section
            this.validateSectionInternal(currentSectionId);
            currentSectionId = this.currentSection.getNextSectionId();
        }
    }

    /**
     * Validate a single section. Errors will be stored at this.errors
     * @param sectionId Section to validate
     */
    public validateSection( sectionId : string ) {
        this.errors = [];
        this.validateSectionInternal(sectionId);
    }

    private validateSectionInternal( sectionId : string ) {
        // The book section
        this.currentSection = new Section( this.book , sectionId , this.mechanics );
        // The section mechanics
        const $sectionMechanics = this.mechanics.getSection( sectionId );
        this.validateChildrenRules( $sectionMechanics );
    }

    private validateChildrenRules( $parent ) {
        if( !$parent )
            return;
        for( let child of $parent.children() )
            this.validateRule( child );
    }

    private validateRule( rule ) {
        if( this[rule.nodeName] )
            this[rule.nodeName]( $(rule) );

        this.validateChildrenRules( $(rule) );
    }

    private validateObjectId( $rule , property : string , allowMultiple : boolean ) : boolean {
        const txtObjectIds : string = $rule.attr('objectId');
        if( !txtObjectIds )
            return false;

        let objectIds = [];
        if( allowMultiple )
            objectIds = txtObjectIds.split('|');
        else
            objectIds.push( txtObjectIds );

        for( let objectId of objectIds ) {
            if( !this.mechanics.getObject(objectId) )
                this.addError( $rule , 'Object id ' + objectId + ' not found');
        }
        return true;
    }

    private validateNumericExpression( $rule , property : string ) {
        // TODO: Pending
    }

    private addError( $rule , errorMsg : string ) {
        this.errors.push( 'Section ' + this.currentSection.sectionId + ', rule ' + $rule[0].nodeName + ': ' + errorMsg );
    }

    //////////////////////////////////////////////////////////
    // RULES VALIDATION
    //////////////////////////////////////////////////////////

    private pick( $rule ) {
        const objectIdFound = this.validateObjectId( $rule , 'objectId' , false );
        const classFound = $rule.attr('class');
        const onlyOne = ( ( objectIdFound && !classFound ) || ( !objectIdFound && classFound ) );
        if( !onlyOne )
            this.addError( $rule , 'Must to have a "objectId" or "class" attribute, and only one' );
        if( classFound && !$rule.attr('count') )
            this.addError( $rule , 'Must to have a "count" attribute' );
        this.validateNumericExpression( $rule , 'count' );
    }

    private randomTable( $rule ) {

        if( !$rule.attr('text-en') ) {
            // Check index:
            let txtIndex : string = $rule.attr('index');
            if( !txtIndex )
                txtIndex = '0';
            const $random = this.currentSection.$xmlSection.find( 'a[href=random]:eq( ' + txtIndex + ')' );
            if( !$random )
                this.addError( $rule , 'Link to random table not found' );
        }

        // Check numbers coverage
        let coverage : Array<number> = [];
        let overlapped = false;
        let nCasesFound = 0;
        for( let child of $rule.children() ) {
            if( child.nodeName == 'case' ) {
                nCasesFound++;
                const bounds = randomMechanics.getCaseRuleBounds( $(child) );
                if( bounds && bounds[0] <= bounds[1] ) {
                    for( let i=bounds[0]; i<= bounds[1]; i++) {
                        if( coverage.contains(i) )
                            overlapped = true;
                        else
                            coverage.push(i);
                    }
                }
            }
        }

        // There can be randomTable's without cases: In that case, do no check coverage:
        if( nCasesFound == 0 )
            return;
        
        // TODO: Check randomTableIncrement, and [BOWBONUS]: If it exists, the bounds should be -99, +99
        let numberToTest;
        if( $rule.attr( 'zeroAsTen' ) == 'true' )
            numberToTest = [1, 10];
        else
            numberToTest = [0, 9];
        let missedNumbers = false;
        for( let i=numberToTest[0]; i<= numberToTest[1]; i++) {
            if( !coverage.contains(i) )
                missedNumbers = true;
        }

        if( missedNumbers )
            this.addError( $rule, 'Missed numbers');
        if( overlapped )
            this.addError( $rule, 'Overlapped numbers');

    }

    private case( $rule ) {
        const bounds = randomMechanics.getCaseRuleBounds( $rule );
        if( !bounds ) {
            this.addError( $rule, 'Needs "value" or "from" / "to" attributes' );
            return;
        }
        if( bounds[0] > bounds[1] )
            this.addError( $rule, 'Wrong range' );
    }
}
