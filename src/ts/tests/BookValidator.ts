/**
 * Tools to validate book mechanics
 */
class BookValidator {
    
    /** Book mechanics */
    private mechanics : Mechanics;

    /** Book XML */
    private book : Book;

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

    public validate() {
        
        // Traverse book sections
        const lastSectionId = this.mechanics.getLastSectionId();
        let currentSectionId = Book.INITIAL_SECTION;
        while( currentSectionId != lastSectionId ) {

            // The book section
            this.currentSection = new Section( this.book , currentSectionId , this.mechanics );
            // The section mechanics
            const $sectionMechanics = this.mechanics.getSection( currentSectionId );
            this.validateChildrenRules( $sectionMechanics );

            currentSectionId = this.currentSection.getNextSectionId();
        }
    }

    private validateChildrenRules( $parent ) {
        if( !$parent )
            return;
        for( let child of $parent.children() )
            this.validateRule( child );
    }

    private validateRule( rule ) {
        if( this[rule.nodeName] )
            mechanicsEngine[rule.nodeName]( $(rule) );

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


}
