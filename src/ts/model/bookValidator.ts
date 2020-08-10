import { Mechanics, Book, Section, Language, Disciplines, mechanicsEngine, ExpressionEvaluator, randomMechanics, LoreCircle } from "..";

/**
 * Tools to validate book mechanics
 */
export class BookValidator {

    /** Book mechanics */
    private mechanics: Mechanics;

    /** Book XML */
    public book: Book;

    /** Errors found */
    public errors: string[] = [];

    /** Current testing section */
    private currentSection: Section;

    /** Special values allowed on "drop" rule */
    private specialDropValues = [ "allweapons" , "allweaponlike" , "backpackcontent" ,
        "currentweapon" , "allspecial" , "allspecialgrdmaster", "allmeals" , "all" , "allobjects" ];

    /**
     * XSD text for mechanics validation. null until is not loaded
     */
    private static xsdText: string;

    /**
     * Constructor
     */
    public constructor( mechanics: Mechanics , book: Book ) {
        this.mechanics = mechanics;
        this.book = book;
    }

    public static downloadBookAndGetValidator( bookNumber: number , language: Language ): JQueryPromise<BookValidator> {

        const book = new Book(bookNumber, language );
        const mechanics = new Mechanics( book );

        const promises = [];
        promises.push( book.downloadBookXml() );
        promises.push( mechanics.downloadXml() );
        promises.push( mechanics.downloadObjectsXml() );

        const dfd = jQuery.Deferred<BookValidator>();

        $.when.apply($, promises)
        .done( () => {
            dfd.resolve( new BookValidator(mechanics, book) );
        } )
        .fail( () => {
            dfd.reject("Error downloading book files");
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
        while ( currentSectionId !== lastSectionId ) {
            // The book section
            this.validateSectionInternal(currentSectionId);
            currentSectionId = this.currentSection.getNextSectionId();
        }
    }

    /**
     * Validate a single section. Errors will be stored at this.errors
     * @param sectionId Section to validate
     */
    public validateSection( sectionId: string ) {
        this.errors = [];
        this.validateSectionInternal(sectionId);
    }

    /** Check book disciplines ids and applicacion disciplines ids match */
    private validateDisciplines() {
        const bookIds = Object.keys( this.book.getDisciplinesTable() );
        const enumIds = Disciplines.getSeriesDisciplines(this.book.getBookSeries().id);
        for (const d of bookIds) {
            if (!enumIds.contains(d)) {
                this.addError(null, `Book discipline id ${d} not found in application enum`);
            }
        }
        for (const d of enumIds) {
            if (!bookIds.contains(d)) {
                this.addError(null, `Application enum discipline id ${d} not found in book disciplines`);
            }
        }
    }

    private validateSectionInternal( sectionId: string ) {
        // The book section
        this.currentSection = new Section( this.book , sectionId , this.mechanics );
        // The section mechanics
        const $sectionMechanics = this.mechanics.getSection( sectionId );
        this.validateChildrenRules( $sectionMechanics );

        if (sectionId === Book.DISCIPLINES_SECTION) {
            this.validateDisciplines();
        }
    }

    private validateChildrenRules($parent: JQuery<Element>) {
        if ( !$parent ) {
            return;
        }
        for ( const child of $parent.children().toArray() ) {
            this.validateRule( child );
        }
    }

    private validateRule(rule: Element) {
        try {

            const $rule = $(rule);

            if ( this[rule.nodeName] ) {
                // There is a function to validate the rule. Validate it:
                this[rule.nodeName]( $rule );
            }

            if ( rule.nodeName === "test" ) {

                // Special case: If this is a "test" rule with "bookLanguage" attr. set, check it:
                // (there are semantic differences between languages...)
                const language: string = $rule.attr("bookLanguage");
                if ( language && language !== this.book.language ) {
                    // Ignore children
                    return;
                }

                // Other special case for books XML update. If the current XML does not contain the test text, ignore children
                const text: string = $rule.attr("sectionContainsText");
                if ( text && !this.currentSection.containsText( text ) ) {
                    // Ignore children
                    return;
                }

            }

            this.validateChildrenRules( $rule );
        } catch (e) {
            mechanicsEngine.debugWarning(e);
            this.addError( $(rule) , "Exception validating rule: " + e );
        }
    }

    /**
     * Add a validation error
     * @param $rule The wrong rule. It can be null
     * @param errorMsg Error message
     */
    private addError($rule: JQuery<Element>, errorMsg: string) {
        let msg = "Section " + this.currentSection.sectionId;
        if ($rule) {
            msg += ", rule " + $rule[0].nodeName;
        }
        msg += ": " + errorMsg;
        this.errors.push(msg);
    }

    //////////////////////////////////////////////////////////
    // COMMON ATTRIBUTRES VALIDATION
    //////////////////////////////////////////////////////////

    private getPropertyValueAsArray( $rule: JQuery<Element> , property: string , allowMultiple: boolean ): string[] {

        if ( allowMultiple ) {
            return mechanicsEngine.getArrayProperty( $rule , property );
        }

        // Single value
        const value: string = $rule.attr( property );
        if ( value ) {
            return [ value ];
        } else {
            return [];
        }
    }

    private validateObjectIdsAttribute( $rule: JQuery<Element> , property: string , allowMultiple: boolean , onlyWeapons: boolean ): boolean {

        const objectIds = this.getPropertyValueAsArray( $rule , property , allowMultiple );
        if ( objectIds.length === 0 ) {
            return false;
        }

        for ( const objectId of objectIds ) {
            const item = this.mechanics.getObject(objectId);
            if ( !item ) {
                this.addError( $rule , "Object id " + objectId + " not found");
            } else if ( onlyWeapons && !item.isWeapon() ) {
                this.addError( $rule , "Object id " + objectId + " is not a weapon");
 }
        }
        return true;
    }

    private validateDisciplinesAttribute( $rule: JQuery<Element> , property: string , allowMultiple: boolean ) {

        const disciplinesIds = this.getPropertyValueAsArray( $rule , property , allowMultiple );
        if ( disciplinesIds.length === 0 ) {
            return;
        }

        const disciplinesTable = this.book.getDisciplinesTable();
        for ( const disciplineId of disciplinesIds ) {
            if ( !disciplinesTable[disciplineId] ) {
                this.addError( $rule , "Wrong discipline id: " + disciplineId );
            }
        }
    }

    private validateSectionsAttribute( $rule: JQuery<Element> , property: string , allowMultiple: boolean ) {
        const sectionIds = this.getPropertyValueAsArray( $rule , property , allowMultiple );

        for ( const sectionId of sectionIds ) {
            if ( this.book.getSectionXml(sectionId).length === 0 ) {
                this.addError( $rule , "Section does not exists: " + sectionId );
            }
        }
    }

    private validateSectionChoiceAttribute( $rule: JQuery<Element>, property: string, allowAll: boolean ) {
        const sectionId: string = $rule.attr( property );
        if ( !sectionId ) {
            return;
        }

        if ( allowAll && sectionId === "all" ) {
            return;
        }

        // If the rule is under a "registerGlobalRule", do no check this
        if ( $rule.closest( "registerGlobalRule" ).length > 0 ) {
            return;
        }

        const $choices = this.currentSection.$xmlSection.find( "choice[idref=" + sectionId + "]" );
        if ( $choices.length === 0 ) {

            // If there is a "textToChoice" link with that destination, it's ok
            const $sectionMechanics = this.mechanics.getSection( this.currentSection.sectionId );
            if ( $sectionMechanics && $sectionMechanics.find("textToChoice[section=" + sectionId + "]").length > 0 ) {
                return;
            }

            this.addError( $rule , "No choice found on this section with destination to " + sectionId );
        }
    }

    private checkThereAreCombats( $rule: JQuery<Element> ) {

        // If the rule is under a "registerGlobalRule", do no check this
        if ( $rule.closest( "registerGlobalRule" ).length > 0 ) {
            return;
        }

        // Check there are combats on this section
        if ( this.currentSection.getCombats().length === 0 ) {
            this.addError( $rule , "There are no combats on this section");
        }
    }

    //////////////////////////////////////////////////////////
    // EXPRESSIONS VALIDATION
    //////////////////////////////////////////////////////////

    private validateAndEvalExpression( $rule: JQuery<Element> ,  expression: string ): any {
        try {
            for ( const keyword of ExpressionEvaluator.getKeywords( expression ) ) {
                if ( !ExpressionEvaluator.isValidKeyword( keyword ) ) {
                    this.addError( $rule , "Unkwown keyword " + keyword );
                }
                expression = expression.replaceAll( keyword , "0" );
            }
            // tslint:disable-next-line: no-eval
            return eval( expression );
        } catch (e) {
            mechanicsEngine.debugWarning(e);
            this.addError( $rule , "Error evaluating expression: " + e );
            return null;
        }
    }

    private validateExpression( $rule: JQuery<Element> , property: string , expectedType: string ) {
        const expression = $rule.attr( property );
        if ( !expression ) {
            return;
        }

        const value = this.validateAndEvalExpression( $rule , expression );
        if ( value !== null ) {
            const type = typeof value;
            if ( type !== expectedType ) {
                this.addError( $rule , "Wrong expression type. Expected: " + expectedType + ", expression type: " + type );
            }
        }
    }

    private validateNumericExpression( $rule: JQuery<Element> , property: string ) {
        this.validateExpression( $rule , property , "number" );
    }

    private validateBooleanExpression( $rule: JQuery<Element> , property: string ) {
        this.validateExpression( $rule , property , "boolean" );
    }

    private validateRandomTableIndex($rule: JQuery<Element>) {
        // Check index:
        let txtIndex: string = $rule.attr("index");
        if (!txtIndex) {
            txtIndex = "0";
        }
        const $random = this.currentSection.$xmlSection.find("a[href=random]:eq( " + txtIndex + ")");
        if (!$random) {
            this.addError($rule, "Link to random table not found");
        }
    }

    //////////////////////////////////////////////////////////
    // VALIDATE XML
    //////////////////////////////////////////////////////////

    /**
     * Download the XSD to validate the XML, if this has not been done yet
     */
    public static downloadXsd(): JQueryPromise<void> {

        if ( BookValidator.xsdText ) {
            // Already downloaded
            return jQuery.Deferred<void>().resolve().promise();
        }

        return $.ajax({
            url: "data/mechanics.xsd",
            dataType: "text"
        })
        .done((xmlText: string) => {
            BookValidator.xsdText = xmlText;
        });
    }

    /**
     * Validate the mechanics XML. Errors will be stored at this.errors
     */
    private validateXml() {

        if ( typeof validateXML === "undefined" ) {
            // On production, the xmllint.js is not available (size = 2.2 MB minified...)
            return;
        }

        if ( !BookValidator.xsdText ) {
            this.errors.push( "The XSD for mechanics validation has not been downloaded" );
            return;
        }

        // The book mechanics
        let xmlText;
        if ( this.mechanics.mechanicsXmlText ) {
            xmlText = this.mechanics.mechanicsXmlText;
        } else {
            // This will NOT be the same as the original, and line numbers reported by "validateXML" will be aproximated
            xmlText = new XMLSerializer().serializeToString( this.mechanics.mechanicsXml.documentElement );
        }

        // There is some kind of error with the UTF8 encoding. acute characters throw errors of invalid character...
        xmlText = xmlText.replace( /[áéíóú¡¿\’]/gi , "" );

        // xmllint.js call parameters
        const mechanicsFileName = "mechanics-" + this.book.bookNumber + ".xml";
        const module = {
            xml: xmlText,
            schema: BookValidator.xsdText,
            arguments: ["--noout", "--schema", "mechanics.xsd", mechanicsFileName ]
        };

        // Do the XSD validation
        const xmllint = validateXML(module).trim();
        if ( xmllint !== mechanicsFileName + " validates") {
            // Error:
            this.errors.push( xmllint );
        }
        console.log( xmllint );
    }

    //////////////////////////////////////////////////////////
    // RULES VALIDATION
    //////////////////////////////////////////////////////////

    private pick( $rule: JQuery<Element> ) {
        const objectIdFound = this.validateObjectIdsAttribute( $rule , "objectId" , false , false );
        const classFound = $rule.attr("class");
        const onlyOne = ( ( objectIdFound && !classFound ) || ( !objectIdFound && classFound ) );
        if ( !onlyOne ) {
            this.addError( $rule , 'Must to have a "objectId" or "class" attribute, and only one' );
        }
        if ( classFound && !$rule.attr("count") ) {
            this.addError( $rule , 'Must to have a "count" attribute' );
        }
        this.validateNumericExpression( $rule , "count" );
    }

    private randomTable( $rule: JQuery<Element> ) {

        if ( !$rule.attr("text-en") ) {
            this.validateRandomTableIndex($rule);
        }

        // Check numbers coverage
        const coverage: number[] = [];
        let overlapped = false;
        let nCasesFound = 0;
        for ( const child of $rule.children().toArray() ) {
            if ( child.nodeName === "case" ) {
                nCasesFound++;
                const bounds = randomMechanics.getCaseRuleBounds( $(child) );
                if ( bounds && bounds[0] <= bounds[1] ) {
                    for ( let i = bounds[0]; i <= bounds[1]; i++) {
                        if ( coverage.contains(i) ) {
                            overlapped = true;
                        } else {
                            coverage.push(i);
                        }
                    }
                }
            }
        }

        // There can be randomTable's without cases: In that case, do no check coverage:
        if ( nCasesFound === 0 ) {
            return;
        }

        // TODO: Check randomTableIncrement, and [BOWBONUS]: If it exists, the bounds should be -99, +99
        let numberToTest;
        if ( $rule.attr( "zeroAsTen" ) === "true" ) {
            numberToTest = [1, 10];
        } else {
            numberToTest = [0, 9];
        }
        let missedNumbers = false;
        for ( let i = numberToTest[0]; i <= numberToTest[1]; i++) {
            if ( !coverage.contains(i) ) {
                missedNumbers = true;
            }
        }

        if ( missedNumbers ) {
            this.addError( $rule, "Missed numbers");
        }
        if ( overlapped ) {
            this.addError( $rule, "Overlapped numbers");
        }

    }

    private randomTableIncrement( $rule: JQuery<Element> ) {
        if ( $rule.attr( "increment" ) !== "reset" ) {
            this.validateNumericExpression( $rule , "increment" );
        }
        this.validateRandomTableIndex( $rule );
    }

    private case( $rule: JQuery<Element> ) {
        const bounds = randomMechanics.getCaseRuleBounds( $rule );
        if ( !bounds ) {
            this.addError( $rule, 'Needs "value" or "from" / "to" attributes' );
            return;
        }
        if ( bounds[0] > bounds[1] ) {
            this.addError( $rule, "Wrong range" );
        }
    }

    private test( $rule: JQuery<Element> ) {
        this.validateDisciplinesAttribute( $rule , "hasDiscipline" , true );
        this.validateObjectIdsAttribute( $rule , "hasObject" , true , false );
        this.validateBooleanExpression( $rule , "expression" );
        this.validateSectionsAttribute( $rule , "sectionVisited" , true );
        this.validateObjectIdsAttribute( $rule , "currentWeapon" , true , true );
        this.validateObjectIdsAttribute( $rule , "objectOnSection" , true , false );

        const language: string = $rule.attr("bookLanguage");
        if ( language ) {
            let langFound = false;
            for (const langKey of Object.keys(Language)) {
                if (Language[langKey] === language) {
                    langFound = true;
                    break;
                }
            }
            if (!langFound) {
                this.addError( $rule , "Language key not found in Language enum: " + language );
            }
        }

        this.validateSectionChoiceAttribute( $rule , "isChoiceEnabled" , false );
        this.validateObjectIdsAttribute( $rule , "hasWeaponType" , true , false );

        const circle: string = $rule.attr( "hasCircle" );
        if ( circle && !LoreCircle.getCircle( circle ) ) {
            this.addError( $rule , "Wrong circle: " + circle );
        }

        this.validateObjectIdsAttribute( $rule , "hasWeaponskillWith" , false , true );

        // TODO: attribute "isGlobalRuleRegistered". Check the ruleId exists on the current mechanics XML
    }

    private choiceState( $rule: JQuery<Element> ) {
        this.validateSectionChoiceAttribute( $rule , "section" , true );
    }

    private object( $rule: JQuery<Element> ) {
        this.validateObjectIdsAttribute( $rule , "objectId" , false , false );
        this.validateNumericExpression( $rule , "price" );
    }

    private combat( $rule: JQuery<Element> ) {
        this.validateNumericExpression( $rule , "combatSkillModifier" );
        this.validateNumericExpression( $rule , "combatSkillModifierIncrement" );

        if ( $rule.attr("disabledObjects") !== "none" ) {
            this.validateObjectIdsAttribute( $rule , "disabledObjects" , true , false );
        }

        this.checkThereAreCombats( $rule );

        const combatIndex = parseInt( $rule.attr("index"), 10 );
        if ( combatIndex ) {
            const nCombats = this.currentSection.getCombats().length;
            if ( nCombats <= combatIndex ) {
                this.addError( $rule , "There is no combat with index " + combatIndex );
            }
        }

        // TODO: Check attr "noWeapon" is boolean or number
    }

    private afterCombats( $rule: JQuery<Element> ) {
        this.checkThereAreCombats( $rule );
    }

    private afterElude( $rule: JQuery<Element> ) {
        this.checkThereAreCombats( $rule );
    }

    private afterCombatTurn( $rule: JQuery<Element> ) {
        this.checkThereAreCombats( $rule );
    }

    private choiceSelected( $rule: JQuery<Element> ) {
        this.validateSectionChoiceAttribute( $rule , "section" , true );
    }

    private numberPickerChoosed( $rule: JQuery<Element> ) {
        const $sectionMechanics = this.mechanics.getSection( this.currentSection.sectionId );
        if ( $sectionMechanics.find( "numberPicker" ).length === 0 ) {
            this.addError( $rule , 'No "numberPicker" rule found on this section' );
        }
    }

    private endurance( $rule: JQuery<Element> ) {
        this.validateNumericExpression( $rule , "count" );
    }

    private resetSectionState( $rule: JQuery<Element> ) {
        this.validateSectionsAttribute( $rule , "sectionId" , false );
    }

    private message( $rule: JQuery<Element> ) {
        const msgId: string = $rule.attr("id");

        if ( $rule.attr( "op" ) ) {
            if ( !msgId ) {
                this.addError( $rule , '"id" attribute required' );
            } else {
                // Find the referenced message
                const $sectionMechanics = this.mechanics.getSection( this.currentSection.sectionId );
                if ( $sectionMechanics.find( "message[id=" + msgId + "]:not([op])" ).length === 0 ) {
                    this.addError( $rule , 'No "message" found with id ' + msgId );
                }
            }
        } else {
            if ( msgId ) {
                // Check there are no duplicated ids
                const $sectionMechanics = this.mechanics.getSection( this.currentSection.sectionId );
                if ( $sectionMechanics.find( "message[id=" + msgId + "]:not([op])" ).length > 1 ) {
                    this.addError( $rule , 'Multiple "message" with the same id=' + msgId );
                }
            }

            if ( !$rule.attr( "en-text" ) ) {
                this.addError( $rule , '"en-text" or "op" attribute required' );
            }
        }
    }

    private drop( $rule: JQuery<Element> ) {
        // Special values:
        const objectId = $rule.attr( "objectId" );
        if ( objectId && this.specialDropValues.contains( objectId ) ) {
            return;
        }

        this.validateObjectIdsAttribute( $rule , "objectId" , true , false );

        // TODO: Validate "backpackItemSlots" / "specialItemSlots" property values
        // TODO: "objectId" AND/OR "backpackItemSlots"/"specialItemSlots" should have value
    }

    private disableCombats( $rule: JQuery<Element> ) {
        this.checkThereAreCombats( $rule );
    }

    private currentWeapon( $rule: JQuery<Element> ) {
        this.validateObjectIdsAttribute( $rule , "objectId" , false , true );
    }

    private sell( $rule: JQuery<Element> ) {

        const objectId = $rule.attr("objectId");
        if ( objectId ) {
            this.validateObjectIdsAttribute( $rule , "objectId" , false , false );
        }

        const cls = $rule.attr("class");
        if ( cls && cls !== "special" ) {
            this.addError( $rule , 'Wrong "class" property value' );
        }

        if ( !cls && $rule.attr("except") ) {
            this.addError( $rule , 'Attribute "except" only applies if "class" is present' );
        }
        this.validateObjectIdsAttribute( $rule , "except" , true , false );

        // "objectId" or "class" are mandatory, and exclusive
        if ( ( !objectId && !cls ) || ( objectId && cls ) ) {
            this.addError( $rule , 'One and only one of "objectId" and "class" are mandatory' );
        }
    }

    private goToSection( $rule: JQuery<Element> ) {
        this.validateSectionsAttribute( $rule , "section" , false );
    }

    private objectUsed( $rule: JQuery<Element> ) {
        this.validateObjectIdsAttribute( $rule , "objectId" , true , false );
    }

    private textToChoice( $rule: JQuery<Element> ) {
        this.validateSectionsAttribute( $rule , "section" , false );

        const html = this.currentSection.getHtml();
        const linkText: string = $rule.attr("text-" + this.book.language);
        if ( $(html).find(':contains("' + linkText + '")').length === 0 ) {
            this.addError( $rule , 'Text to replace "' + linkText + '" not found');
        }
    }

    private kaiMonasteryStorage( $rule: JQuery<Element> ) {
        // Only available on "equipment" sections
        if ( $rule.closest( "section[id=equipmnt]" ).length === 0 ) {
            this.addError( $rule , 'Rule "kaiMonasteryStorage" should be included only on section with id=equipmnt' );
        }
    }

    private displayIllustration( $rule: JQuery<Element> ) {
        this.validateSectionsAttribute( $rule , "section" , false );
        const sectionId: string = $rule.attr( "section" );
        const section = new Section( this.book , sectionId , this.mechanics );
        if ( !section.getFirstIllustrationHtml() ) {
            this.addError( $rule , "There are no illustrations on " + sectionId );
        }
    }

    private use( $rule: JQuery<Element> ) {
        this.validateObjectIdsAttribute( $rule , "objectId" , true , false );
    }
}
