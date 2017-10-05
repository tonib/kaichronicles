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

    /** Current testing section */
    private currentSection : Section;
    
    /** Special values allowed on "drop" rule */
    private specialDropValues = [ 'allweapons' , 'allweaponlike' , 'backpackcontent' , 
        'currentweapon' , 'allspecial' , 'allmeals' , 'all' ];

    /** 
     * XSD text for mechanics validation. null until is not loaded
     */
    private static xsdText : string;

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

        const dfd = jQuery.Deferred();

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

        // Validate the XML with XSD
        this.validateXml();

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
        try {
            if( this[rule.nodeName] )
                this[rule.nodeName]( $(rule) );

            // Special case: If this is a "test" rule with "bookLanguage" attr. set, check it:
            // (there are semantic differences between languages...)
            if( rule.nodeName == 'test' ) {
                const language : string = $(rule).attr('bookLanguage');
                if( language && language != this.book.language )
                    // Ignore children
                    return;
            }
            this.validateChildrenRules( $(rule) );
        }
        catch(e) {
            console.log(e);
            this.addError( $(rule) , 'Exception validating rule: ' + e );
        }
    }

    private addError( $rule , errorMsg : string ) {
        this.errors.push( 'Section ' + this.currentSection.sectionId + ', rule ' + $rule[0].nodeName + ': ' + errorMsg );
    }

    //////////////////////////////////////////////////////////
    // COMMON ATTRIBUTRES VALIDATION
    //////////////////////////////////////////////////////////

    private getPropertyValueAsArray( $rule , property : string , allowMultiple : boolean ) : Array<string> {
        
        if( allowMultiple )
            return mechanicsEngine.getArrayProperty( $rule , property );

        // Single value
        const value : string = $rule.attr( property );
        if( value )
            return [ value ];
        else
            return [];
    }

    private validateObjectIdsAttribute( $rule , property : string , allowMultiple : boolean , onlyWeapons : boolean ) : boolean {

        let objectIds = this.getPropertyValueAsArray( $rule , property , allowMultiple );
        if( objectIds.length == 0 )
            return false;

        for( let objectId of objectIds ) {
            let item = this.mechanics.getObject(objectId);
            if( !item )
                this.addError( $rule , 'Object id ' + objectId + ' not found');
            else if( onlyWeapons && !item.isWeapon() )
                this.addError( $rule , 'Object id ' + objectId + ' is not a weapon');
        }
        return true;
    }

    private validateDisciplinesAttribute( $rule : any , property : string , allowMultiple : boolean ) {
        
        let disciplinesIds = this.getPropertyValueAsArray( $rule , property , allowMultiple );
        if( disciplinesIds.length == 0 )
            return;

        const disciplinesTable = this.book.getDisciplinesTable();
        for( let disciplineId of disciplinesIds ) {
            if( !disciplinesTable[disciplineId] )
                this.addError( $rule , 'Wrong discipline id: ' + disciplineId );
        }
    }

    private validateSectionsAttribute( $rule : any , property : string , allowMultiple : boolean ) {
        let sectionIds = this.getPropertyValueAsArray( $rule , property , allowMultiple );

        for( let sectionId of sectionIds ) {
            if( this.book.getSectionXml(sectionId).length == 0 )
                this.addError( $rule , 'Section does not exists: ' + sectionId );
        }
    }

    private validateSectionChoiceAttribute( $rule : any, property : string, allowAll : boolean ) {
        const sectionId : string = $rule.attr( property );
        if( !sectionId )
            return;

        if( allowAll && sectionId == 'all' )
            return;

        // If the rule is under a "registerGlobalRule", do no check this
        if( $rule.closest( 'registerGlobalRule' ).length > 0 )
            return;

        const $choices = this.currentSection.$xmlSection.find( 'choice[idref=' + sectionId + ']' );
        if( $choices.length == 0 ) {
            
            // If there is a "textToChoice" link with that destination, it's ok
            const $sectionMechanics = this.mechanics.getSection( this.currentSection.sectionId );
            if( $sectionMechanics && $sectionMechanics.find('textToChoice[section=' + sectionId + ']').length > 0 )
                return;

            this.addError( $rule , 'No choice found on this section with destination to ' + sectionId );
        }
    }

    private checkThereAreCombats( $rule ) {

        // If the rule is under a "registerGlobalRule", do no check this
        if( $rule.closest( 'registerGlobalRule' ).length > 0 )
            return;

        // Check there are combats on this section
        if( this.currentSection.getCombats().length == 0 ) {
            this.addError( $rule , 'There are no combats on this section');
        }
    }

    //////////////////////////////////////////////////////////
    // EXPRESSIONS VALIDATION
    //////////////////////////////////////////////////////////

    private validateAndEvalExpression( $rule : any ,  expression : string ) : any {
        try {
            for( let keyword of ExpressionEvaluator.getKeywords( expression ) ) {
                if( !ExpressionEvaluator.isValidKeyword( keyword ) )
                    this.addError( $rule , 'Unkwown keyword ' + keyword );
                expression = expression.replaceAll( keyword , '0' );
            }
            return eval( expression );
        }
        catch(e) {
            console.log(e);
            this.addError( $rule , 'Error evaluating expression: ' + e );
            return null;
        }
    }

    private validateExpression( $rule : any , property : string , expectedType : string ) {
        let expression = $rule.attr( property );
        if( !expression )
            return;

        let value = this.validateAndEvalExpression( $rule , expression );
        if( value !== null ) {
            let type = typeof value;
            if( type !== expectedType )
                this.addError( $rule , 'Wrong expression type. Expected: ' + expectedType + ', expression type: ' + type );
        }
    }

    private validateNumericExpression( $rule : any , property : string ) {
        this.validateExpression( $rule , property , 'number' );
    }

    private validateBooleanExpression( $rule : any , property : string ) {
        this.validateExpression( $rule , property , 'boolean' );
    }

    private validateRandomTableIndex($rule: any) {
        // Check index:
        let txtIndex: string = $rule.attr('index');
        if(!txtIndex)
            txtIndex = '0';
        const $random = this.currentSection.$xmlSection.find('a[href=random]:eq( ' + txtIndex + ')');
        if(!$random)
            this.addError($rule, 'Link to random table not found');
    }

    //////////////////////////////////////////////////////////
    // VALIDATE XML
    //////////////////////////////////////////////////////////

    /**
     * Download the XSD to validate the XML, if this has not been done yet
     */
    public static downloadXsd() : Promise<void> {

        if( BookValidator.xsdText )
            // Already downloaded
            return jQuery.Deferred().resolve().promise();

        return $.ajax({
            url: 'data/mechanics.xsd',
            dataType: "text"
        })
        .done(function(xmlText : string) {
            BookValidator.xsdText = xmlText;
        });
    }

    /**
     * Validate the mechanics XML. Errors will be stored at this.errors
     */
    private validateXml() {

        if( typeof validateXML == 'undefined' )
            // On production, the xmllint.js is not available (size = 2.2 MB minified...)
            return;

        if( !BookValidator.xsdText ) {
            this.errors.push( 'The XSD for mechanics validation has not been downloaded' );
            return;
        }

        // The book mechanics
        let xmlText;
        if( this.mechanics.mechanicsXmlText )
            xmlText = this.mechanics.mechanicsXmlText;
        else
            // This will NOT be the same as the original, and line numbers reported by "validateXML" will be aproximated
            xmlText = new XMLSerializer().serializeToString( this.mechanics.mechanicsXml.documentElement );

        // There is some kind of error with the UTF8 encoding. acute characters throw errors of invalid character...
        xmlText = xmlText.replace( /[áéíóú¡¿\’]/gi , '' );

        // xmllint.js call parameters
        const mechanicsFileName = 'mechanics-' + this.book.bookNumber + '.xml';
        const module = {
            xml: xmlText,
            schema: BookValidator.xsdText,
            arguments: ["--noout", "--schema", 'mechanics.xsd', mechanicsFileName ]
        };

        // Do the XSD validation
        var xmllint = validateXML(module).trim();
        if( xmllint != mechanicsFileName + ' validates')
            // Error:
            this.errors.push( xmllint );
        console.log( xmllint );
    }

    //////////////////////////////////////////////////////////
    // RULES VALIDATION
    //////////////////////////////////////////////////////////

    private pick( $rule ) {
        const objectIdFound = this.validateObjectIdsAttribute( $rule , 'objectId' , false , false );
        const classFound = $rule.attr('class');
        const onlyOne = ( ( objectIdFound && !classFound ) || ( !objectIdFound && classFound ) );
        if( !onlyOne )
            this.addError( $rule , 'Must to have a "objectId" or "class" attribute, and only one' );
        if( classFound && !$rule.attr('count') )
            this.addError( $rule , 'Must to have a "count" attribute' );
        this.validateNumericExpression( $rule , 'count' );
    }

    private randomTable( $rule ) {

        if( !$rule.attr('text-en') )
            this.validateRandomTableIndex($rule);

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

    private randomTableIncrement( $rule ) {
        this.validateNumericExpression( $rule , 'increment' );
        this.validateRandomTableIndex( $rule );
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

    private test( $rule ) {
        this.validateDisciplinesAttribute( $rule , 'hasDiscipline' , true );
        this.validateObjectIdsAttribute( $rule , 'hasObject' , true , false );
        this.validateBooleanExpression( $rule , 'expression' );
        this.validateSectionsAttribute( $rule , 'sectionVisited' , true );
        this.validateObjectIdsAttribute( $rule , 'currentWeapon' , false , true );

        const language : string = $rule.attr('bookLanguage');
        if( language && ( language != 'en' && language != 'es' ) )
            this.addError( $rule , 'Wrong language: ' + language );
        
        this.validateSectionChoiceAttribute( $rule , 'isChoiceEnabled' , false );
        this.validateObjectIdsAttribute( $rule , 'hasWeaponType' , true , false );
        
        const circle : string = $rule.attr( 'hasCircle' );
        if( circle && !LoreCircle.getCircle( circle ) )
            this.addError( $rule , 'Wrong circle: ' + circle );

        this.validateObjectIdsAttribute( $rule , 'hasWeaponskillWith' , false , true );
    }

    private choiceState( $rule ) {
        this.validateSectionChoiceAttribute( $rule , 'section' , true );
    }

    private object( $rule ) {
        this.validateObjectIdsAttribute( $rule , 'objectId' , false , false );
        this.validateNumericExpression( $rule , 'price' );
    }

    private combat( $rule ) {
        this.validateNumericExpression( $rule , 'combatSkillModifier' );
        this.validateObjectIdsAttribute( $rule , 'disabledObjects' , true , false );

        this.checkThereAreCombats( $rule );

        var combatIndex = parseInt( $rule.attr('index') );
        if( combatIndex ) {
            const nCombats = this.currentSection.getCombats().length;
            if( nCombats <= combatIndex ) 
                this.addError( $rule , 'There is no combat with index ' + combatIndex );
        }
    }

    private afterCombats( $rule ) {
        this.checkThereAreCombats( $rule );
    }

    private afterElude( $rule ) {
        this.checkThereAreCombats( $rule );
    }

    private afterCombatTurn( $rule ) {
        this.checkThereAreCombats( $rule );
    }

    private choiceSelected( $rule ) {
        this.validateSectionChoiceAttribute( $rule , 'section' , true );
    }

    private numberPickerChoosed( $rule ) {
        const $sectionMechanics = this.mechanics.getSection( this.currentSection.sectionId );
        if( $sectionMechanics.find( 'numberPicker' ).length == 0 )
            this.addError( $rule , 'No "numberPicker" rule found on this section' );
    }

    private endurance( $rule ) {
        this.validateNumericExpression( $rule , 'count' );
    }

    private resetSectionState( $rule ) {
        this.validateSectionsAttribute( $rule , 'sectionId' , false );
    }
    
    private message( $rule ) {
        if( $rule.attr( 'op' ) ) {
            var msgId = $rule.attr('id');
            if( !msgId )
                this.addError( $rule , '"id" attribute required' );
            else {
                // Find the referenced message
                const $sectionMechanics = this.mechanics.getSection( this.currentSection.sectionId );
                if( $sectionMechanics.find( 'message[id=' + msgId + ']:not([op])' ).length == 0 )
                    this.addError( $rule , 'No "message" found with English text and id ' + msgId );
            }
        }
        else {
            if( !$rule.attr( 'en-text' ) )
                this.addError( $rule , '"en-text" or "op" attribute required' );
        }
    }

    private drop( $rule ) {
        // Special values:
        const objectId = $rule.attr( 'objectId' );
        if( objectId && this.specialDropValues.contains( objectId ) )
            return;

        this.validateObjectIdsAttribute( $rule , 'objectId' , false , false );
    }

    private disableCombats( $rule ) {
        this.checkThereAreCombats( $rule );
    }

    private currentWeapon( $rule ) {
        this.validateObjectIdsAttribute( $rule , 'objectId' , false , true );
    }

    private sell( $rule ) {
        this.validateObjectIdsAttribute( $rule , 'objectId' , false , false );
    }

    private goToSection( $rule ) {
        this.validateSectionsAttribute( $rule , 'section' , false );
    }

    private objectUsed( $rule ) {
        this.validateObjectIdsAttribute( $rule , 'objectId' , true , false );
    }

    private textToChoice( $rule ) {
        this.validateSectionsAttribute( $rule , 'section' , false );

        const html = this.currentSection.getHtml();
        const linkText : string = $rule.attr('text-' + this.book.language);
        if( $(html).find(':contains("' + linkText + '")').length == 0 )
            this.addError( $rule , 'Text to replace "' + linkText + '" not found');
    }

    private kaiMonasteryStorage( $rule ) {
        // Only available on "equipment" sections
        if( $rule.closest( 'section[id=equipmnt]' ).length == 0 )
            this.addError( $rule , 'Rule "kaiMonasteryStorage" should be included only on section with id=equipmnt' );
    }
}
