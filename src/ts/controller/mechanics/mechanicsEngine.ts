/// <reference path="../../external.ts" />

/**
 * Engine to render and run gamebook mechanics rules 
 */
const mechanicsEngine = {

    /**
     * jquery DOM object with the mechanics HTML
     */
    $mechanicsUI: null,

    /**
     * Mechanics UI URL
     */
    mechanicsUIURL: 'views/mechanicsEngine.html',

    /** The rule to run after combats */
    onAfterCombatsRule: null,

    /** The rule to run after elude combats */
    onEludeCombatsRule: null,

    /** The rule to run after some inventory event */
    onInventoryEventRule: null,

    /** Rules to execute after some combat turn */
    onAfterCombatTurns: [],

    /** Rules for events on some choice is selected */
    onChoiceSelected: [],

    /** The rule to run after some object used */
    onObjectUsedRule: null,

    /** The rule to execute when the action button of a number picker is clicked */
    onNumberPickerChoosed: null,

    /************************************************************/
    /**************** MAIN FUNCTIONS ****************************/
    /************************************************************/

    /**
     * Starts the mechanics UI download
     * @return The deferred object for the download
     */
    downloadMechanicsUI: function() {
        // TODO: This is ugly. The mechanicsEngine.html load should be 
        // TODO: handled always by views object

        // There is a trick here: If we are on production, the UI was already
        // loaded with the views:
        var cachedView = views.getCachedView( 'mechanicsEngine.html' );
        if( cachedView ) {
            mechanicsEngine.$mechanicsUI = $(cachedView).find('#mechanics-container');
            // Return a resolved promise
            var dfd = jQuery.Deferred();
            dfd.resolve();
            return dfd.promise();
        }

        return $.ajax({
            url: mechanicsEngine.mechanicsUIURL,
            dataType: "html"
        })
        .done( function(data) {
            mechanicsEngine.$mechanicsUI = $(data).filter('#mechanics-container');
        });
    },

    /**
     * Get a mechanics tag from the mechanicsEngine.html file, translated
     * @param {string} tagId The tag id to get
     * @returns {jQuery} The translated tag
     */
    getMechanicsUI: function( tagId ) {
        var $tag = mechanicsEngine.$mechanicsUI.find('#' + tagId ).clone();
        return translations.translateView($tag, true);
    },

    /************************************************************/
    /**************** RULES EXECUTION ENTRY *********************/
    /************************************************************/

    /**
     * Run the game mechanics of a section. 
     * It updates the gameView, binds events, etc. 
     * @param section The current game Section
     */
    run: function(section : Section) {

        // Defaults:
        gameView.enableNextLink(true);
        mechanicsEngine.onAfterCombatsRule = null;
        mechanicsEngine.onEludeCombatsRule = null;
        mechanicsEngine.onInventoryEventRule = null;
        mechanicsEngine.onAfterCombatTurns = [];
        mechanicsEngine.onChoiceSelected = [];
        mechanicsEngine.onObjectUsedRule = null;
        mechanicsEngine.onNumberPickerChoosed = null;

        // Disable previous link if we are on "The story so far" section
        gameView.enablePreviousLink(section.sectionId != 'tssf');

        // Retrieve or store combat states
        state.sectionStates.setupCombats( section );

        // Run healing (execute BEFORE the rules, they can decrease the endurance of the
        // player)
        mechanicsEngine.healingDiscipline();

        // Get and run section rules
        mechanicsEngine.runSectionRules();

        // Render available / to sell objects on this section
        mechanicsEngine.fireInventoryEvents();

        // Fire combat turns events (for restored combats)
        mechanicsEngine.fireAfterCombatTurn(null);

        // Render combats
        combatMechanics.renderCombats();

        // Test if the player is already death
        mechanicsEngine.testDeath();

        // Be sure the section state is stored (to keep track of visited sections)
        state.sectionStates.getSectionState();

        // If this is the last section of the book, put a link to continue to
        // the next book
        mechanicsEngine.checkLastSection(section);

    },

    /**
     * Run current section rules
     */
    runSectionRules: function() {
        // Run section rules
        var $sectionMechanics = 
            state.mechanics.getSection( state.sectionStates.currentSection );
        if( $sectionMechanics !== null )
            mechanicsEngine.runChildRules( $sectionMechanics );
        
        // Run global rules
        for( var i=0; i<state.sectionStates.globalRulesIds.length; i++) {
            var id = state.sectionStates.globalRulesIds[i];
            mechanicsEngine.runChildRules( state.mechanics.getGlobalRule(id) );
        }
    },

    /**
     * Run child rules of a given rule
     * @param $rule Rule where to run child rules 
     */
    runChildRules: function($rule) {
        var childrenRules = $rule.children();
        for(var i=0; i<childrenRules.length; i++)
            mechanicsEngine.runRule( childrenRules[i] );
    },

    /**
     * Run a game rule
     * @param rule The XML rule node
     */
    runRule: function(rule) {
        //console.log( Mechanics.getRuleSelector(rule) );
        if( !mechanicsEngine[rule.nodeName] )
            mechanicsEngine.debugWarning("Unknown rule: " + rule.nodeName);
        else
            mechanicsEngine[rule.nodeName](rule);
    },

    /**
     * Fire events associated to inventory changes (pick, drop, etc)
     * @param fromUI True if the event was fired from the UI
     * @param o Only applies if fromUI is true. The object picked / droped
     */
    fireInventoryEvents: function( fromUI : boolean = false , o : Item = null ) {

        // Render object tables
        mechanicsEngine.showAvailableObjects();
        mechanicsEngine.showSellObjects();

        if( mechanicsEngine.onInventoryEventRule )
            mechanicsEngine.runChildRules( $(mechanicsEngine.onInventoryEventRule) );

        // Update combat ratio on combats  (have we picked a weapon?)
        combatMechanics.updateCombats();

        if( fromUI && routing.getControllerName() == 'gameController' ) {
            // Check if we must to re-render the section. This may be needed if the 
            // picked / dropped object affects to the rules
            if( mechanicsEngine.checkReRenderAfterInventoryEvent(o) ) {
                // Re-render the section
                console.log('Re-rendering the section due to rules re-execution');
                gameController.loadSection( state.sectionStates.currentSection , false , 
                    window.pageYOffset);
            }
        }

    },

    /**
     * Print debug warning to console, and even more prominently if we're in
     * debug mode.
     */
    debugWarning: function(msg : string) {
        console.log(msg);
        if( window.getUrlParameter( 'debug' ) ) {
            var $messageUI = mechanicsEngine.getMechanicsUI('mechanics-message');
            $messageUI.attr('id', '' );
            $messageUI.find('b').text( msg );
            gameView.appendToSection( $messageUI );
        }
    },

    /**
     * Check if we must to re-render the section. This may be needed if the 
     * picked / dropped object affects to the rules
     * @param o The object picked / droped
     */
    checkReRenderAfterInventoryEvent: function(o : Item) {
        
        // Get section rules
        var $sectionRules = state.mechanics.getSection( state.sectionStates.currentSection );
        if( $sectionRules === null )
            return false;

        var reRender = false;
        mechanicsEngine.enumerateSectionRules( $sectionRules[0] , function(rule) {
            if( rule.nodeName == 'onInventoryEvent' )
                // onInventoryEvent rule don't affect, has been executed
                return 'ignoreDescendants';
            else if( rule.nodeName == 'test' ) {
                // test rule
                // TODO: Use mechanicsEngine.getArrayProperty here
                var objects = $(rule).attr('hasObject');
                if( objects ) {
                    objects = objects.split('|');
                    if( objects.contains(o.id) ) {
                        // Section should be re-rendered
                        reRender = true;
                        return 'finish';
                    }
                }

                if( $(rule).attr('canUseBow') && ( o.id == 'quiver' || o.isWeaponType( 'bow' ) ) ) {
                    // Section should be re-rendered
                    reRender = true;
                    return 'finish';
                }

                if( $(rule).attr('hasWeaponType') && o.isWeapon() ) {
                    // Section should be re-rendered
                    reRender = true;
                    return 'finish';
                }

                const expression : string = $(rule).attr( 'expression' );
                if( expression ) {
                    if( o.id == 'money' && ( expression.indexOf('[MONEY]') >= 0 ||  expression.indexOf('[MONEY-ON-SECTION]') >= 0 ) ) {
                        // Section should be re-rendered
                        reRender = true;
                        return 'finish';
                    }
                }
            }
            else if( rule.nodeName == 'meal' ) {
                // meal rule
                if( o.id == 'meal' || o.isMeal ) {
                    // Section should be re-rendered
                    reRender = true;
                    return 'finish';
                }
            }
        });
        return reRender;
    },

    /**
     * Fire events after some combat turn
     * @param {Combat} combat The combat that has played turn. null to fire all combats on this
     * section
     */
    fireAfterCombatTurn: function(combat) {

        var sectionState = state.sectionStates.getSectionState();

        if( !combat) {
            // Fire all combats
            $.each(sectionState.combats, function(index, combat) {
                mechanicsEngine.fireAfterCombatTurn(combat);
            });
            return;
        }

        // Fire the given combat turn events
        for(var i=0; i< mechanicsEngine.onAfterCombatTurns.length; i++) {
            var rule = mechanicsEngine.onAfterCombatTurns[i];

            // Turn when to execute the rule:
            const txtRuleTurn : string = $(rule).attr('turn');
            const ruleTurn = ( txtRuleTurn == 'any' ? 'any' : ExpressionEvaluator.evalInteger( txtRuleTurn ) );

            // We reapply all rules accumulatively
            if( txtRuleTurn == 'any' || combat.turns.length >= ruleTurn )
                mechanicsEngine.runChildRules( $(rule) );
        }
    },

    /**
     * Fire events on some choice is selected
     * @param {string} sectionId The section of the selected choice 
     */
    fireChoiceSelected: function(sectionId) {
        $.each( mechanicsEngine.onChoiceSelected , function(index, rule) {
            var ruleSectionId = $(rule).attr('section');
            if( ruleSectionId == 'all' || ruleSectionId == sectionId )
                mechanicsEngine.runChildRules( $(rule) );
        });
    },

    /**
     * Fire events when some object is used
     * @param {string} objectId The id of the object used
     */
    fireObjectUsed: function(objectId) {
        if( !mechanicsEngine.onObjectUsedRule )
            return;

        var $eventRule = $(mechanicsEngine.onObjectUsedRule);
        // TODO: Use mechanicsEngine.getArrayProperty here
        var objectIds = $eventRule.attr('objectId').split('|');
        if( objectIds.contains(objectId) ) 
            mechanicsEngine.runChildRules( $eventRule );
    },

    /**
     * The action button of a picker number was clicked
     */
    fireNumberPickerChoosed: function() {
        // Be sure the picker number value is valid
        if( !numberPickerMechanics.isValid() )
            return;

        if( mechanicsEngine.onNumberPickerChoosed )
            mechanicsEngine.runChildRules( $(mechanicsEngine.onNumberPickerChoosed) );
    },

    /************************************************************/
    /**************** RULES *************************************/
    /************************************************************/

    /**
     * Choose player skills UI
     */
    setSkills: function() {
        SkillsSetup.setSkills();
    },

    /**
     * Choose the kai disciplines UI
     */
    setDisciplines: function() {
        var setup = new SetupDisciplines();
        setup.setupDisciplinesChoose();
    },

    /** 
     * Choose equipment UI (only for book 1)
     * TODO: This is weird, only for book 1? Fix this
     */
    chooseEquipment: function(rule) {
        EquipmentSectionMechanics.chooseEquipment(rule);
    },

    /**
     * Pick objects, money, etc
     * param rule The pick rule
     */
    pick: function(rule) {

        var sectionState = state.sectionStates.getSectionState();

        // Do not execute the rule twice:
        if( sectionState.ruleHasBeenExecuted(rule) )
            return;

        // Check if we are picking an object
        var objectId = $(rule).attr('objectId');
        if( objectId ) {
            if( !state.mechanics.getObject( objectId ) )
                mechanicsEngine.debugWarning( 'Unknown object: ' + objectId );

            // Pick the object
            if( !actionChartController.pick( objectId , false, false) ) {
                // The object has not been picked (ex. full backpack)
                // Add the object to the section
                sectionState.addObjectToSection( objectId );
            }

            // Mark the rule as exececuted
            sectionState.markRuleAsExecuted(rule);
            return;
        }

        // Other things (money or meals)
        var cls = $(rule).attr('class');

        // Check the amount
        const count = ExpressionEvaluator.evalInteger( $(rule).attr('count') );

        // Add to the action chart 
        if( cls == 'meal')
            actionChartController.increaseMeals(count);
        else if( cls == 'money' )
            actionChartController.increaseMoney(count);
        else if( cls == 'arrow' )
            actionChartController.increaseArrows(count);
        else
            mechanicsEngine.debugWarning('Pick rule with no objectId / class');

        // Mark the rule as exececuted
        sectionState.markRuleAsExecuted(rule);

    },

    /** 
     * Assing an action to a random table link.  
     */
    randomTable: function(rule) {
        randomMechanics.randomTable(rule);
    },

    /** Increment for random table selection */
    randomTableIncrement: function(rule) {
        randomMechanics.randomTableIncrement(rule);
    },

    /**
     * Test a condition
     */
    test: function(rule) {

        // IF THERE IS MORE THAN ONE CONDITION ON THE RULE, THEY SHOULD WORK LIKE AN 
        // "OR" OPERATOR
        
        // Initially the condition is false
        var conditionStatisfied = false;

        // TODO: Remove references to $(rule), use and re-use this
        const $rule = $(rule);

        // Check discipline
        // TODO: Use mechanicsEngine.getArrayProperty here
        var disciplineToTest = $(rule).attr('hasDiscipline');
        var i;
        if( disciplineToTest ) {
            // Check if the player has some of the disciplines
            var allDisciplines = Object.keys( state.book.getDisciplinesTable() );
            var disciplines = disciplineToTest.split('|');
            for(i=0; i < disciplines.length; i++ ) {
                if( !allDisciplines.contains( disciplines[i] ) )
                    mechanicsEngine.debugWarning('Unknown discipline: ' + disciplines[i]);
                if( state.actionChart.disciplines.contains( disciplines[i] ) ) {
                    conditionStatisfied = true;
                    break;
                }
            }
        }

        // Check objects
        var objectIdsToTest = $(rule).attr('hasObject');
        if( objectIdsToTest ) {
            // Check if the player has some of the objects
            // TODO: Use mechanicsEngine.getArrayProperty here
            var objects = objectIdsToTest.split('|');
            for(i=0; i < objects.length; i++ ) {
                if( !state.mechanics.getObject( objects[i] ) )
                    mechanicsEngine.debugWarning( 'Unknown object: ' + objects[i] );
                if( state.actionChart.hasObject( objects[i] ) ) {
                    conditionStatisfied = true;
                    break;
                }
            }
        }

        // Check expression
        var expression = $(rule).attr('expression');
        if( expression && ExpressionEvaluator.evalBoolean( expression ) )
            conditionStatisfied = true;
        
        // Check section visited:
        // TODO: Use mechanicsEngine.getArrayProperty here
        var sectionIds = $(rule).attr('sectionVisited');
        if( sectionIds ) {
            sectionIds = sectionIds.split('|');
            for(i=0; i < sectionIds.length; i++ ) {
                if( state.sectionStates.sectionIsVisited(sectionIds[i]) ) {
                    conditionStatisfied = true;
                    break;
                }
            }
        }

        // Test current weapon:
        var currentWeapon = $(rule).attr('currentWeapon');
        if( currentWeapon && state.actionChart.selectedWeapon == currentWeapon )
            conditionStatisfied = true;
            
        // Test weaponskill with current weapon
        // TODO: Use mechanicsEngine.getBooleanProperty here
        var weaponskillActive = $(rule).attr('weaponskillActive');
        if( weaponskillActive == 'true' ) {
            if( state.actionChart.isWeaponskillActive() )
                conditionStatisfied = true;
        }

        // Test combats won:
        // TODO: Use mechanicsEngine.getBooleanProperty here
        var combatsWon = $(rule).attr('combatsWon');
        if( combatsWon ) {
            var allCombatsWon = state.sectionStates.getSectionState().areAllCombatsWon();
            if( combatsWon == 'true' && allCombatsWon )
                conditionStatisfied = true;
            else if( combatsWon == 'false' && !allCombatsWon )
                conditionStatisfied = true;
        }

        // Test some combat active:
        // TODO: Use mechanicsEngine.getBooleanProperty here
        var combatsActive = $(rule).attr('combatsActive');
        if( combatsActive == 'true' && 
            state.sectionStates.getSectionState().someCombatActive() )
            conditionStatisfied = true;

        // Test book language
        var bookLanguage = $(rule).attr('bookLanguage');
        if( bookLanguage && state.book.language == bookLanguage )
            conditionStatisfied = true;
        
        // Test section choice is enabled:
        var sectionToCheck = $(rule).attr('isChoiceEnabled');
        if( sectionToCheck && mechanicsEngine.isChoiceEnabled(sectionToCheck) )
            conditionStatisfied = true;

        // Test if the player can use the bow
        const canUseBow = mechanicsEngine.getBooleanProperty( $rule , 'canUseBow' );
        if( canUseBow != null && canUseBow == state.actionChart.canUseBow() )
            conditionStatisfied = true;

        // Test if the player has a kind of weapon
        // TODO: Use mechanicsEngine.getArrayProperty here
        let hasWeaponType : string = $(rule).attr( 'hasWeaponType' );
        if( hasWeaponType ) {
            for( let weaponType of hasWeaponType.split('|') ) {
                if( state.actionChart.getWeaponType( weaponType ) ) {
                    conditionStatisfied = true;
                    break;
                }
            }
        }

        // Test if the player has a lore-circle
        let circleId : string = $(rule).attr('hasCircle');
        if( circleId && LoreCircle.getCircle( circleId ).matchCircle( state.actionChart.disciplines ) )
            conditionStatisfied = true;

        // Check if the player has weaponskill / weaponmastery with a given weapon
        const hasWeaponskillWith : string = $(rule).attr('hasWeaponskillWith');
        if( hasWeaponskillWith && state.actionChart.hasWeaponskillWith( hasWeaponskillWith ) )
            conditionStatisfied = true;

        // Current hand-to-hand weapon is special?
        const currentWeaponSpecial = mechanicsEngine.getBooleanProperty( $rule , 'currentWeaponSpecial' );
        if( currentWeaponSpecial != null ) {
            const currentWeapon = state.actionChart.getselectedWeaponItem(false);
            const currentIsSpecial = ( currentWeapon && currentWeapon.type == Item.SPECIAL );
            if( currentIsSpecial == currentWeaponSpecial )
                conditionStatisfied = true;
        }

        // Check if the test should be inversed
        if( $(rule).attr('not') == 'true' )
            conditionStatisfied = !conditionStatisfied;

        if( conditionStatisfied )
            // Run child items
            mechanicsEngine.runChildRules( $(rule) );
        
    },

    /**
     * Enable / disable a choice 
     */
    choiceState: function(rule) {

        // Get the choice filter
        var section = $(rule).attr('section');

        // Test section:
        if( section != 'all' && 
            $('a.choice-link[data-section=' + section + ']').length === 0 ) {
            mechanicsEngine.debugWarning( 'choiceState: Wrong choiceState (section=' + section + ')' );
            return;
        }
        
        // Get if we must enable or disable:
        var disabled = ( $(rule).attr('set') == 'disabled' );

        // Set choice/s state        
        mechanicsEngine.setChoiceState(section, disabled);
    },

    /**
     * There is an available object on the section
     */
    object: function(rule) {

        var sectionState = state.sectionStates.getSectionState();

        // Do not execute the rule twice:
        if( sectionState.ruleHasBeenExecuted(rule) )
            return;

        const objectId : string = $(rule).attr('objectId');
        if( !objectId ) {
            mechanicsEngine.debugWarning( 'Rule object without objectId' );
            return;
        }

        if( !state.mechanics.getObject( objectId ) )
            mechanicsEngine.debugWarning( 'Unknown object: ' + objectId );

        // Object price (optional)
        var price = $(rule).attr('price');
        if( price )
            price = ExpressionEvaluator.evalInteger( price );

        // Unlimited number of this kind of object?
        const unlimited = ( $(rule).attr('unlimited') == 'true' );

        // Number of items (only for quiver (n. arrows) and money (n.gold crowns))
        const txtCount : string = $(rule).attr('count');
        const count = ( txtCount ? parseInt( txtCount ) : 0 );
        
        // Object can be used directly from the section, without picking it?
        const useOnSection = ( $(rule).attr('useOnSection') == 'true' );
        
        // Add the object to the available objects on the section
        sectionState.addObjectToSection( objectId , price , unlimited , count , useOnSection );

        sectionState.markRuleAsExecuted(rule);
    },

    /**
     * Allow to sell an inventory object rule
     */
    sell: function(rule) {
        var sectionState = state.sectionStates.getSectionState();
        if( sectionState.ruleHasBeenExecuted(rule) )
            // Execute only once
            return;
        sectionState.sellPrices.push({
            id: $(rule).attr('objectId'),
            price: parseInt( $(rule).attr('price') ),
            count: parseInt( $(rule).attr('count') )
        });
        state.sectionStates.markRuleAsExecuted(rule);
    },

    /**
     * Combat options
     */
    combat: function(rule) {

        // TODO: Reuse this selector, performance:
        const $rule = $(rule);

        // Combat index
        var combatIndex = parseInt( $rule.attr('index') );
        if( !combatIndex )
            combatIndex = 0;

        var sectionState = state.sectionStates.getSectionState();
        if( combatIndex >= sectionState.combats.length ) {
            mechanicsEngine.debugWarning('Rule "combat": Combat with index ' +
                combatIndex + ' not found');
            return;
        }
        var combat = sectionState.combats[ combatIndex ];

        // Check LW combat skill modifiers:
        var txtCombatSkillModifier = $(rule).attr('combatSkillModifier');
        if( txtCombatSkillModifier ) {
            var combatSkillModifier = 
                ExpressionEvaluator.evalInteger( txtCombatSkillModifier );
            combat.combatModifier = combatSkillModifier;
        }

        // Check if the enemy has mindforce attack
        var txtMindforceCS = $(rule).attr('mindforceCS');
        if( txtMindforceCS )
            combat.mindforceCS = parseInt( txtMindforceCS );
        var txtMindforceEP = $(rule).attr('mindforceEP');
        if( txtMindforceEP )
            combat.mindforceEP = parseInt( txtMindforceEP );

        // Check if the enemy is immune to Mindblast
        // TODO: Use mechanicsEngine.getBooleanProperty here
        var txtNoMindblast = $(rule).attr('noMindblast');
        if( txtNoMindblast )
            combat.noMindblast = ( txtNoMindblast == 'true' );

        // Check if the enemy is immune to Psi-Surge
        // TODO: Use mechanicsEngine.getBooleanProperty here
        const txtNoPsiSurge : string = $(rule).attr('noPsiSurge');
        if( txtNoPsiSurge )
            combat.noPsiSurge = ( txtNoPsiSurge == 'true' );

        // Special mindblast bonus?
        var txtMindblastBonus = $(rule).attr('mindblastBonus');
        if( txtMindblastBonus )
            combat.mindblastBonus = parseInt( txtMindblastBonus );

        // Check if the player cannot use weapons on this combat
        const noWeapon = mechanicsEngine.getBooleanProperty( $rule , 'noWeapon' );
        if( noWeapon != null )
            combat.noWeapon = noWeapon;

        // Initial turn to allow to elude the combat
        if( $(rule).attr('eludeTurn') )
            combat.eludeTurn = parseInt( $(rule).attr('eludeTurn') );
        
        // Max. turn to elude combat
        const txtmaxEludeTurn : string = $(rule).attr('maxEludeTurn');
        if( txtmaxEludeTurn )
            combat.maxEludeTurn = parseInt( txtmaxEludeTurn );

        // Dammage multiplier (player)
        if( $(rule).attr('dammageMultiplier') )
            combat.dammageMultiplier = parseInt( $(rule).attr('dammageMultiplier') );

        // Dammage multiplier (enemy)
        var txtEnemyMultiplier = $(rule).attr('enemyMultiplier'); 
        if( txtEnemyMultiplier )
            combat.enemyMultiplier = parseInt( txtEnemyMultiplier );

        // Enemy extra loss per turn
        var txtEnemyTurnLoss = $(rule).attr('enemyTurnLoss'); 
        if( txtEnemyTurnLoss )
            combat.enemyTurnLoss = parseInt( txtEnemyTurnLoss );

        // Player extra loss per turn
        var txtPlayerTurnLoss = $(rule).attr('turnLoss'); 
        if( txtPlayerTurnLoss )
            combat.turnLoss = parseInt( txtPlayerTurnLoss );

        // It's a fake combat?
        // TODO: Use mechanicsEngine.getBooleanProperty here
        var txtFake = $(rule).attr('fake');
        if( txtFake ) {
            combat.fakeCombat = ( txtFake == 'true' );
            // % of the E.P. lost to restore after the combat on fake combats.
            var txtFactor = $(rule).attr('restoreFactor');
            if( txtFactor )
                combat.fakeRestoreFactor = parseFloat(txtFactor);
        }

        // It's a bow combat?
        // TODO: Use mechanicsEngine.getBooleanProperty here
        if( $rule.attr('bow') == 'true' )
            combat.bowCombat = true;
        
        // Objects to disable on this combat:
        const txtDisabledObjects : string = $rule.attr('disabledObjects');
        if( txtDisabledObjects )
            combat.disabledObjects = txtDisabledObjects.split('|');
        
    },

    /**
     * After all combats are finished rule
     */
    afterCombats: function(rule) {

        mechanicsEngine.onAfterCombatsRule = rule;
        var sectionState =  state.sectionStates.getSectionState();
        if( sectionState.areAllCombatsFinished(state.actionChart) == 'finished' )
            // All combats are finished. Fire the rule
            mechanicsEngine.runChildRules( $(rule) );
        
    },

    /**
     * After elude combats rule
     */
    afterElude: function(rule) {

        mechanicsEngine.onEludeCombatsRule = rule;
        var sectionState =  state.sectionStates.getSectionState();
        if( sectionState.areAllCombatsFinished(state.actionChart) == 'eluded' )
            // All combats are eluded. Fire the rule
            mechanicsEngine.runChildRules( $(rule) );

    },

    /** Event for combat turn */
    afterCombatTurn: function(rule) {
        mechanicsEngine.onAfterCombatTurns.push(rule);
    },

    /**
     * Disable / enable all combats
     */
    disableCombats: function(rule) {
        var sectionState = state.sectionStates.getSectionState();
        var enabled = $(rule).attr('disabled') == 'false';
        sectionState.setCombatsEnabled(enabled);
        if(enabled)
            // Enable combats
            combatMechanics.showCombatButtons(null);
        else
            // Disable combats
            combatMechanics.hideCombatButtons(null);
    },

    /** 
     * Increase endurance rule
     */
    endurance: function(rule) {

        if( state.sectionStates.ruleHasBeenExecuted(rule) )
            // Execute only once
            return;

        const increase = ExpressionEvaluator.evalInteger( $(rule).attr('count') );
        actionChartController.increaseEndurance( increase );

        state.sectionStates.markRuleAsExecuted(rule);
    },

    /**
     * Increase combat skill (permanent)
     */
    combatSkill: function(rule) {
        if( state.sectionStates.ruleHasBeenExecuted(rule) )
            // Execute only once
            return;

        const increase = ExpressionEvaluator.evalInteger( $(rule).attr('count') );
        actionChartController.increaseCombatSkill( increase );
        state.sectionStates.markRuleAsExecuted(rule);
    },

    /**
     * Player death rule
     */
    death: function(rule) {
        actionChartController.increaseEndurance( -state.actionChart.currentEndurance , true);
    },

    /** Have a meal rule */
    meal: function(rule) {
        mealMechanics.runRule(rule);
    },

    /** Display message rule */
    message: function(rule) {

        var msgId = $(rule).attr('id');

        var op = $(rule).attr('op');
        if( op ) {
            // Change the state of the message
            if( op == 'show' )
                $('#' + msgId).show();
            else
                $('#' + msgId).hide();
            return;
        }

        // Display a new message
        var $messageUI = mechanicsEngine.getMechanicsUI('mechanics-message');
        $messageUI.attr('id', msgId );
        $messageUI.find('b').text( mechanicsEngine.getRuleText(rule) );
        gameView.appendToSection( $messageUI );
    },

    /** Inventory events rule */
    onInventoryEvent: function(rule) {
        mechanicsEngine.onInventoryEventRule = rule;
        // Fire the rule at startup:
        mechanicsEngine.runChildRules( $(rule) );
    },

    /** Drop an object (object lost) */
    drop: function(rule) {
        if( state.sectionStates.ruleHasBeenExecuted(rule) )
            // Execute only once
            return;
        actionChartController.drop( $(rule).attr('objectId') , false );
        state.sectionStates.markRuleAsExecuted(rule);
    },

    /**
     * On choice selected event
     */
    choiceSelected: function(rule) {
        mechanicsEngine.onChoiceSelected.push( rule );
    },

    /**
     * Set the current weapon rule
     */
    currentWeapon: function(rule) {
        if( state.sectionStates.ruleHasBeenExecuted(rule) )
            // Execute only once
            return;
        actionChartController.setSelectedWeapon( $(rule).attr('objectId') , true );
        state.sectionStates.markRuleAsExecuted(rule);
    },

    /**
     * Enable / disable hunting until new advice
     */
    huntStatus: function(rule) {
        state.sectionStates.huntEnabled = ( $(rule).attr('enabled') != 'false' );
    },

    /**
     * Number picker UI
     */
    numberPicker: function(rule) {
        numberPickerMechanics.numberPicker(rule);
    },

    /**
     * Number picker action button clicked event handler
     */
    numberPickerChoosed: function(rule) {
        mechanicsEngine.onNumberPickerChoosed = rule;
    },

    /**
     * Reset the state of a given section
     */
    resetSectionState: function(rule) {
        state.sectionStates.resetSectionState( $(rule).attr('sectionId') );
    },

    /**
     * Save the current inventory state
     */
    saveInventoryState: function(rule) {
        if( state.sectionStates.ruleHasBeenExecuted(rule) )
            // Execute only once
            return;
        
        const restorePoint : string = $(rule).attr('restorePoint');
        let objectsType : string = $(rule).attr('objectsType');
        if( !objectsType )
            objectsType = 'all';

        // Save the inventory state:
        const currentRestorePoint : InventoryState = state.sectionStates.otherStates[ restorePoint ];
        var newRestorePoint = state.actionChart.getInventoryState( objectsType );
        if( currentRestorePoint )
            // Join both
            newRestorePoint = ActionChart.joinInventoryStates(currentRestorePoint, newRestorePoint);
        state.sectionStates.otherStates[ restorePoint ] = newRestorePoint;

        state.sectionStates.markRuleAsExecuted(rule);
    },

    /**
     * Restore the inventory state
     */
    restoreInventoryState: function(rule) {
        if( state.sectionStates.ruleHasBeenExecuted(rule) )
            // Execute only once
            return;

        var restorePoint = $(rule).attr('restorePoint');
        var inventoryState = state.sectionStates.otherStates[ restorePoint ];
        if( !inventoryState ) {
            mechanicsEngine.debugWarning('restorePoint ' + restorePoint + ' not found!');
            return;
        }
        actionChartController.restoreInventoryState( inventoryState );
        // Clean the restore point, to avoid space overhead
        state.sectionStates.otherStates[ restorePoint ] = null;

        state.sectionStates.markRuleAsExecuted(rule);
    },

    /**
     * Register a set of global rules: Rules to execute at any section until they are
     * unregistered
     */
    registerGlobalRule: function(rule) {
        if( state.sectionStates.ruleHasBeenExecuted(rule) )
            // Execute only once
            return;

        var ruleId = $(rule).attr('id');
        if( !state.sectionStates.globalRulesIds.contains( ruleId ) ) {
            console.log('Registered global rule ' + ruleId);
            state.sectionStates.globalRulesIds.push( ruleId );
        }

        state.sectionStates.markRuleAsExecuted(rule);
    },

    /**
     * Unregister a set of global rules
     */
    unregisterGlobalRule: function(rule) {
        var ruleId = $(rule).attr('id');
        console.log('Unregistering global rule ' + ruleId );
        state.sectionStates.globalRulesIds.removeValue(ruleId);
    },

    /**
     * Add an event handler for when an object is used on this section
     */
    objectUsed: function(rule) {
        mechanicsEngine.onObjectUsedRule = rule;
    },

    /**
     * Move to other book section
     */
    goToSection: function(rule) {
        gameController.loadSection( $(rule).attr('section') , true );
        // To avoid continuing executing rules, throw an exception
        throw 'Jumped to a new section, rules execution interrupted ' + 
            '(This exception is not really an error)';
    },

    /**
     * Show a "toast" message
     */
    toast: function(rule) {
        toastr.info( mechanicsEngine.getRuleText(rule) );
    },

    /**
     * Drop all disciplines.
     * Used when changing of book series (kai -> magnakai)
     */
    dropDisciplines: function(rule) {
        if( state.sectionStates.ruleHasBeenExecuted(rule) )
            // Execute only once
            return;
        state.actionChart.disciplines = [];
        // Redraw current CS / EP on the bar title
        template.updateStatistics();
        state.sectionStates.markRuleAsExecuted(rule);
    },

    /**
     * Change a section text by a section choice
     */
    textToChoice: function( rule ) {

        const linkText : string = $(rule).attr('text-' + state.language);
        if( !linkText ) {
            mechanicsEngine.debugWarning( 'textToChoice: text-' + state.language +' attribute not found');
            return;
        }

        var $textContainer = $(':contains("' + linkText + '")').last();
        if( $textContainer.length == 0 ) {
            mechanicsEngine.debugWarning( 'textToChoice: text "' + linkText + '" not found');
            return;
        }

        let sectionId = $(rule).attr('section');
        var newHtml = $textContainer.html().replace( linkText , 
            '<p class="choice" style="display: inline; margin: 0"><a href="#" class="action choice-link" data-section="' + sectionId + '">' + linkText + '</a></p>' );
        $textContainer.html( newHtml );           
    },

    /**
     * Add a button to access to the Kai monastery stored objects
     */
    kaiMonasteryStorage: function( rule : any ) {
        const $tag = mechanicsEngine.getMechanicsUI( 'mechanics-kaimonasterystorage' );
        gameView.appendToSection( $tag , true );
        $tag.find( 'button' ).click( function( e : Event ) {
            e.preventDefault();
            // Move to the fake section for Kai monastery
            state.sectionStates.currentSection = Book.KAIMONASTERY_SECTION;
            state.persistState();
            routing.redirect( 'kaimonastery' );
        });
    },

    /************************************************************/
    /**************** SPECIAL SECTIONS **************************/
    /************************************************************/

    book2Sect238: function(rule) {
        specialSectionsMechanics.book2Sect238(rule);
    },

    book2sect308: function(rule) {
        specialSectionsMechanics.book2sect308();
    },
    
    book3sect88: function(rule) {
        specialSectionsMechanics.book3sect88();
    },

    book6sect26: function(rule) {
        new Book6sect26();
    },

    book6sect284: function(rule) {
        new Book6sect284(rule);
    },

    book6sect340 : function(rule) {
        new Book6sect340();
    },

    /************************************************************/
    /**************** RULES HELPERS *****************************/
    /************************************************************/

    /**
     * Get an array of strings stored on a rule property
     * @param $rule {jQuery} The rule
     * @param property The property to get. Property values must be separated by '|' (ex. 'a|b|c' )
     * @returns The values stored on the property. An empty array if the property does not exists
     */
    getArrayProperty : function( $rule : any , property : string ) : Array<string> {
        const propertyText = $rule.attr( property );
        if( !propertyText )
            return [];
        return propertyText.split('|');
    },

    /**
     * Get a boolean rule property
     * @param $rule {jQuery} The rule
     * @param property The property to get
     * @returns The property value. null if the property was not present
     */
    getBooleanProperty : function( $rule : any , property : string ) : boolean | null {
        const txtValue : string = $rule.attr( property );
        if( !txtValue )
            return null;
        return txtValue == 'true';
    },

    /**
     * Show or update the table with the available objects on the section
     * @param renderEmptyTable If it's true and there are no objects on the current section section, 
     * a empty objects table will be rendered. If it's empty, no table will be rendered
     */
    showAvailableObjects: function( renderEmptyTable = false ) {

        var sectionState = state.sectionStates.getSectionState();
        var thereAreObjects = ( sectionState.objects.length >= 1 );

        // Check if the table was already inserted on the UI:
        var $table = $('#mechanics-availableObjectsList');
        if( $table.length === 0 ) {
            if( thereAreObjects || renderEmptyTable ) {
                // Add the objects table template
                gameView.appendToSection( mechanicsEngine.getMechanicsUI('mechanics-availableObjects') );
                $table = $('#mechanics-availableObjectsList');
            }
            else
                // Nothing to do
                return;
        }

        // Fill the objects list:
        new ObjectsTable(sectionState.objects, $table, ObjectsTableType.AVAILABLE).renderTable();
    },

    /**
     * Show or update the table with the sell objects table
     */
    showSellObjects: function() {
        var sectionState = state.sectionStates.getSectionState();
        if( sectionState.sellPrices.length === 0 )
            return;

        // Check if the table was already inserted on the UI:
        var $table = $('#mechanics-sellObjectsList');
        if( $table.length === 0 ) {
            // Add the template
            gameView.appendToSection( 
                mechanicsEngine.getMechanicsUI('mechanics-sellObjects') );
            $table = $('#mechanics-sellObjectsList');
        }       

        // Fill the objects list:
        new ObjectsTable(sectionState.sellPrices, $table, ObjectsTableType.SELL).renderTable();
    },

    /**
     * Enable or disable choice links
     * @param section The section to enable / disable. 'all' for all choices
     * @param disabled True to disable the choices. False to enable 
     */
    setChoiceState: function(section : string, disabled : boolean) {

        // Do not enable anything if the player is death:
        if( state.actionChart.currentEndurance <= 0 && !disabled )
            return;
            
        var txtSelector = '#game-section .choice';
        if( section != 'all' )
             txtSelector += ':has(a[data-section=' + section + '])';

        // Select the choose that contains the link to the section, and enable / disable it
        var $choose = $( txtSelector );
        if( disabled )
            $choose.find('.choice-link').addClass('disabled');
        else
            $choose.find('.choice-link').removeClass('disabled');
    },

    /**
     * Return true if the choice for a given section is enabled
     * @param {String} sectionId The section id for the choice to check
     */
    isChoiceEnabled: function(sectionId) {
        var $selector = $('#game-section a[data-section=' + sectionId + ']');
        if( $selector.length === 0 )
            return false;
        return !$selector.hasClass('disabled');
    },

    /**
     * Set the death UI if the player is death
     */
    testDeath: function() {
        // Dont show death on non numbered sections (maybe we have not choose the endurance yet)
        var section = new Section(state.book, state.sectionStates.currentSection, 
            state.mechanics);
        if( ! section.getSectionNumber() )
            return;

        if( state.actionChart.currentEndurance <= 0 && $('#mechanics-death').length === 0 ) {

            // Add the death UI
            gameView.appendToSection( mechanicsEngine.getMechanicsUI('mechanics-death') , true );

            // Disable all choice links
            mechanicsEngine.setChoiceState('all' , true);
            // Disable pick any object
            $('a.equipment-op').addClass('disabled');
            // Disable number picker
            numberPickerMechanics.disable();
            // Disable random table links
            $('a.random').addClass('disabled');

            // Bind restart book link
            $('#mechanics-restart').click(function(e) {
                e.preventDefault();
                if( confirm( translations.text( 'confirmRestart' ) ) )
                    setupController.restartBook();
            });

            // If there are pending combats, disable them
            combatMechanics.hideCombatButtons(null);
        }
    },

    /**
     * Apply the healing discipline on the current section
     */
    healingDiscipline: function() {
        if( !state.actionChart.disciplines.contains('healing') && !state.actionChart.disciplines.contains('curing') )
            return;
        var sectionState = state.sectionStates.getSectionState();
        if( sectionState.combats.length > 0 )
            // Only on sections without combats
            return;
        if( sectionState.healingExecuted )
            // Already executed
            return;
        sectionState.healingExecuted = true;
        if( state.actionChart.currentEndurance < state.actionChart.getMaxEndurance() )
            actionChartController.increaseEndurance(+1, true);
    },

    /**
     * Check if this is the last section of the book
     * @param {Section} section The current section
     */
    checkLastSection: function(section) {

        if( section.sectionId != state.mechanics.getLastSectionId() || 
            state.book.bookNumber >= projectAon.getLastSupportedBook() )
            return;
        
        var $nextBook = $('.bookref');
        if( $nextBook.length === 0 ) {
            // XML bug with spanish book 4. It has no bookref...
            $nextBook = $('cite');
        }

        $nextBook.replaceWith( '<a href="#" id="game-nextBook" class="action">' + 
            $nextBook.html() + '</a>' );
        $('#game-nextBook').click(function(e) {
            e.preventDefault();
            // Move the scroll to the top: The scroll state will be stored when we leave
            // the controller, and we want to start the next book with a scroll y=0
            window.scrollTo(0, 0);
            state.nextBook();
            routing.redirect('setup');
        });
    },

    /**
     * Get a translated property of a rule. The properties checked are 'en-<property>' and 
     * 'es-<property>'
     * @param {xmlNode} rule The rule to check
     * @param propertyName The property to check. If it's null, the 'text' property
     * will be search
     * @return The translated text
     */
    getRuleText: function(rule, propertyName : string = null ) : string {
        if( !propertyName )
            propertyName = 'text';

        var $rule = $(rule);
        var text = $rule.attr( state.language + '-' + propertyName);
        if( !text )
            // Return the english text
            text = $rule.attr( 'en-' + propertyName);
        if( !text )
            text = '';
        return text;
    },

    /**
     * Execute a function for each rule on a section
     * @param {XmlNode} rule The root rule
     * @param {function(XmlNode)} callback The function to execute
     */
    enumerateSectionRules: function( rule , callback ) {

        var result = callback( rule );
        if( result == 'finish' )
            return 'finish';
        else if( result == 'ignoreDescendants' )
            return;

        var childrenRules = $(rule).children();
        for(var i=0; i<childrenRules.length; i++) {
            result = mechanicsEngine.enumerateSectionRules( childrenRules[i] , callback );
            if( result == 'finish' )
                return 'finish';
        }

    }

};
