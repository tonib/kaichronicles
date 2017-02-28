
/**
 * Engine to render and run gamebook mechanics rules 
 */
var mechanicsEngine = {

    /**
     * The last supported book number
     */
    LAST_SUPPORTED_BOOK: 5,

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

    /************************************************************/
    /**************** MAIN FUNCTIONS ****************************/
    /************************************************************/

    /**
     * Starts the mechanics UI download
     * @return The deferred object for the download
     */
    downloadMechanicsUI: function() {
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
     * @param {Section} section The current game Section
     */
    run: function(section) {

        // Defaults:
        gameView.enableNextLink(true);
        mechanicsEngine.onAfterCombatsRule = null;
        mechanicsEngine.onEludeCombatsRule = null;
        mechanicsEngine.onInventoryEventRule = null;
        mechanicsEngine.onAfterCombatTurns = [];
        mechanicsEngine.onChoiceSelected = [];

        // Disable previous link if we are on "The story so far" section
        gameView.enablePreviousLink(section.sectionId != 'tssf');

        // Retrieve or store combat states
        state.sectionStates.setupCombats( section );

        // Run healing (execute BEFORE the rules, they can decrease the endurance of the
        // player)
        mechanicsEngine.healingDiscipline();

        // Get and run section rules
        mechanicsEngine.runSectionRules();

        // Render available objects on this section
        mechanicsEngine.showAvailableObjects();

        // Render sell prices on this section
        mechanicsEngine.showSellObjects();

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
        if( $sectionMechanics != null )
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
        $rule
        .children()
        .each(function(index, childRule) {
            mechanicsEngine.runRule(childRule);
        });
    },

    /**
     * Run a game rule
     * @param rule The XML rule node
     */
    runRule: function(rule) {
        //console.log( Mechanics.getRuleSelector(rule) );
        if( !mechanicsEngine[rule.nodeName] )
            console.log("Unknown rule: " + rule.nodeName);
        else
            mechanicsEngine[rule.nodeName](rule);
    },

    /**
     * Fire events associated to inventory changes (pick, drop, etc)
     */
    fireInventoryEvents: function() {
        if( mechanicsEngine.onInventoryEventRule )
            mechanicsEngine.runChildRules( $(mechanicsEngine.onInventoryEventRule) );
        // Update meals UI (have we picked a meal?)
        mealMechanics.updateEatBackpack();
        // Update combat ratio on combats  (have we picked a weapon?)
        combatMechanics.updateCombats();
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

        // Fire the given combat
        $.each( mechanicsEngine.onAfterCombatTurns, function(index, rule) {
            // Turn when to execute the rule:
            var txtRuleTurn = $(rule).attr('turn');
            //var ruleTurn = parseInt( txtRuleTurn );
            var ruleTurn = mechanicsEngine.evaluateExpression(txtRuleTurn);

            // We reapply all rules accumulatively
            if( txtRuleTurn == 'any' || combat.turns.length >= ruleTurn )
                mechanicsEngine.runChildRules( $(rule) );
        });
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

    /************************************************************/
    /**************** RULES *************************************/
    /************************************************************/

    /**
     * Choose player skills UI
     */
    setSkills: function() {
        setupMechanics.setSkills();
    },

    /**
     * Choose the kai disciplines UI
     */
    setDisciplines: function() {
        setupMechanics.setDisciplines();
    },

    /** 
     * Choose equipment UI (only for book 1)
     * TODO: This is weird, only for book 1? Fix this
     */
    chooseEquipment: function(rule) {
        setupMechanics.chooseEquipment(rule);
    },

    /**
     * Pick objects, money, etc
     * param rule The pick rule
     */
    pick: function(rule) {

        // Do not execute the rule twice:
        if( state.sectionStates.ruleHasBeenExecuted(rule) )
            return;

        // Check if we are picking an object
        var objectId = $(rule).attr('objectId');
        if( objectId ) {
            // Pick the object
            if( !actionChartController.pick( objectId , true) ) {
                // The object has not been picked (ex. full backpack)
                // Add the object to the section
                state.sectionStates.addObjectToSection( objectId );
            }

            // Mark the rule as exececuted
            state.sectionStates.markRuleAsExecuted(rule);
            return;
        }

        // Other things (money or meals)
        var cls = $(rule).attr('class');

        // Check the amount
        var count = mechanicsEngine.evaluateExpression( $(rule).attr('count') );

        // Add to the action chart 
        if( cls == 'meal')
            actionChartController.increaseMeals(count);
        else if( cls == 'money' )
            actionChartController.increaseMoney(count);
        else
            console.log('Pick rule with no objectId / class');

        // Mark the rule as exececuted
        state.sectionStates.markRuleAsExecuted(rule);

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

        // Check discipline
        var disciplineToTest = $(rule).attr('hasDiscipline');
        // TODO: Test "disciplineToTest" is valid 
        if( disciplineToTest ) {
            // Check if the player has some of the disciplines
            var disciplines = disciplineToTest.split('|');
            for(var i=0; i < disciplines.length; i++ ) {
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
            var objects = objectIdsToTest.split('|');
            for(var i=0; i < objects.length; i++ ) {
                if( state.actionChart.hasObject( objects[i] ) ) {
                    conditionStatisfied = true;
                    break;
                }
            }
        }

        // Check expression
        var expression = $(rule).attr('expression');
        if( expression && mechanicsEngine.evaluateExpression( expression ) )
            conditionStatisfied = true;
        
        // Check section visited:
        var sectionIds = $(rule).attr('sectionVisited');
        if( sectionIds ) {
            sectionIds = sectionIds.split('|');
            for(var i=0; i < sectionIds.length; i++ ) {
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
            
        // Test combats won:
        var combatsWon = $(rule).attr('combatsWon');
        if( combatsWon ) {
            var allCombatsWon = state.sectionStates.getSectionState().areAllCombatsWon();
            if( combatsWon == 'true' && allCombatsWon )
                conditionStatisfied = true;
            else if( combatsWon == 'false' && !allCombatsWon )
                conditionStatisfied = true;
        }

        // Test some combat active:
        var combatsActive = $(rule).attr('combatsActive');
        if( combatsActive == 'true' && 
            state.sectionStates.getSectionState().someCombatActive() )
            conditionStatisfied = true;

        // Test book language
        var bookLanguage = $(rule).attr('bookLanguage');
        if( bookLanguage && state.book.language == bookLanguage )
            conditionStatisfied = true;

        // Test weaponskill with current weapon
        var weaponskillActive = $(rule).attr('weaponskillActive');
        if( weaponskillActive == 'true' ) {
            var currentWeapon = state.actionChart.getselectedWeaponItem();
            if( state.actionChart.isWeaponskillActive(currentWeapon) )
                conditionStatisfied = true;
        }
        
        // Test section choice is enabled:
        var sectionToCheck = $(rule).attr('isChoiceEnabled');
        if( sectionToCheck && mechanicsEngine.isChoiceEnabled(sectionToCheck) )
            conditionStatisfied = true;

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
            $('a.choice-link[data-section=' + section + ']').length == 0 )
            throw 'Wrong choiceState (section=' + section + ')';

        // Get if we must enable or disable:
        var disabled = ( $(rule).attr('set') == 'disabled' );

        // Set choice/s state        
        mechanicsEngine.setChoiceState(section, disabled);
    },

    /**
     * There is an available object on the section
     */
    object: function(rule) {

        // Do not execute the rule twice:
        if( state.sectionStates.ruleHasBeenExecuted(rule) )
            return;

        var objectId = $(rule).attr('objectId');
        if( !objectId )
            throw 'Rule object without objectId';

        // Object price (optional)
        var price = $(rule).attr('price');
        if( price )
            price = mechanicsEngine.evaluateExpression( price );

        // Unlimited number of this kind of object?
        var unlimited = ( $(rule).attr('unlimited') == 'true' );

        // Add the object to the available objects on the section
        state.sectionStates.addObjectToSection( objectId , price , unlimited);

        state.sectionStates.markRuleAsExecuted(rule);
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
            price: parseInt( $(rule).attr('price') )
        });
        state.sectionStates.markRuleAsExecuted(rule);
    },

    /**
     * Combat options
     */
    combat: function(rule) {

        // Combat index
        var combatIndex = parseInt( $(rule).attr('index') );
        if( !combatIndex )
            combatIndex = 0;

        var sectionState = state.sectionStates.getSectionState();
        var combat = sectionState.combats[ combatIndex ];

        // Check LW combat skill modifiers:
        var txtCombatSkillModifier = $(rule).attr('combatSkillModifier');
        if( txtCombatSkillModifier ) {
            var combatSkillModifier = 
                mechanicsEngine.evaluateExpression( txtCombatSkillModifier );
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
        var txtNoMindblast = $(rule).attr('noMindblast');
        if( txtNoMindblast )
            combat.noMindblast = ( txtNoMindblast == 'true' );

        // Check if the enemy is partially immune to Mindblast (only +1CS)
        var txtPartialMindblast = $(rule).attr('partialMindblast');
        if( txtPartialMindblast )
            combat.partialMindblast = ( txtPartialMindblast == 'true' );

        // Check if the player cannot use weapons on this combat
        var txtNoWeapon = $(rule).attr('noWeapon');
        if( txtNoWeapon )
            combat.noWeapon = ( txtNoWeapon == 'true' );

        // Check if the combat can be eluded
        if( $(rule).attr('eludeTurn') )
            combat.eludeTurn = parseInt( $(rule).attr('eludeTurn') );
        
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
        var txtFake = $(rule).attr('fake');
        if( txtFake ) {
            combat.fakeCombat = ( txtFake == 'true' );
            // % of the E.P. lost to restore after the combat on fake combats.
            var txtFactor = $(rule).attr('restoreFactor');
            if( txtFactor )
                combat.fakeRestoreFactor = parseFloat(txtFactor);
        }

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

        var increase = mechanicsEngine.evaluateExpression( $(rule).attr('count') );
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

        var increase = mechanicsEngine.evaluateExpression( $(rule).attr('count') );
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
     * Money picker UI
     */
    moneyPicker: function(rule) {
        moneyPickerMechanics.moneyPicker(rule);
    },

    /**
     * Reset the state of a given section
     */
    resectSectionState: function(rule) {
        state.sectionStates.resetSectionState( $(rule).attr('sectionId') );
    },

    /**
     * Save the current inventory state
     */
    saveInventoryState: function(rule) {
        if( state.sectionStates.ruleHasBeenExecuted(rule) )
            // Execute only once
            return;

        // Save the inventory state:
        state.sectionStates.otherStates[ $(rule).attr('restorePoint') ] =
            state.actionChart.getInventoryState();
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
            console.log('restorePoint ' + restorePoint + ' not found!');
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
        if( !state.sectionStates.globalRulesIds.contains( ruleId ) )
            state.sectionStates.globalRulesIds.push( ruleId );

        state.sectionStates.markRuleAsExecuted(rule);
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

    /************************************************************/
    /**************** RULES HELPERS *****************************/
    /************************************************************/

    /**
     * Show or update the table with the available objects on the section
     */
    showAvailableObjects: function() {

        var sectionState = state.sectionStates.getSectionState();
        var thereAreObjects = ( sectionState.objects.length >= 1 );

        // Check if the table was already inserted on the UI:
        var $table = $('#mechanics-availableObjectsList');
        if( $table.length == 0 ) {
            if( thereAreObjects ) {
                // Add the template
                gameView.appendToSection( 
                    mechanicsEngine.getMechanicsUI('mechanics-availableObjects') );
                $table = $('#mechanics-availableObjectsList');
            }
            else
                // Nothing to do
                return;
        }       

        // Fill the objects list:
        objectsTable.objectsList(sectionState.objects, $table , 'available' );
        
        // Fire events
        mechanicsEngine.fireInventoryEvents();
    },

    /**
     * Show or update the table with the sell objects table
     */
    showSellObjects: function() {
        var sectionState = state.sectionStates.getSectionState();
        if( sectionState.sellPrices.length == 0 )
            return;

        // Check if the table was already inserted on the UI:
        var $table = $('#mechanics-sellObjectsList');
        if( $table.length == 0 ) {
            // Add the template
            gameView.appendToSection( 
                mechanicsEngine.getMechanicsUI('mechanics-sellObjects') );
            $table = $('#mechanics-sellObjectsList');
        }       

        // Fill the objects list:
        objectsTable.objectsList(sectionState.sellPrices, $table , 'sell');
    },

    /**
     * Enable or disable choice links
     * @param {string} section The section to enable / disable. 'all' for all choices
     * @param {boolean} disabled True to disable the choices. False to enable 
     */
    setChoiceState: function(section, disabled) {

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
        var $selector = $('#game-section a[data-section=' + sectionId + ']')
        if( $selector.length == 0 )
            return false;
        return !$selector.hasClass('disabled');
    },

    /** 
     * Evaluates an expression
     * @param txtExpression Expression to evaluate
     * @return The expression current value
     */
    evaluateExpression: function(txtExpression) {
        if( !txtExpression )
            return 0;
        // Do replacements:
        var sectionState = state.sectionStates.getSectionState();
        var expression = txtExpression
            .replaceAll( '[RANDOM]' , randomMechanics.lastValue )
            .replaceAll( '[MONEY]' , state.actionChart.beltPouch )
            .replaceAll( '[BACKPACK-ITEMS-CNT-ON-SECTION]' , sectionState.getCntSectionObjects('object') )
            .replaceAll( '[BACKPACK-ITEMS-CNT-ON-ACTIONCHART]' , state.actionChart.getNBackpackItems() )
            .replaceAll( '[WEAPON-ITEMS-CNT-ON-SECTION]' , sectionState.getCntSectionObjects('weapon') )
            .replaceAll( '[WEAPON-ITEMS-CNT-ON-ACTIONCHART]' , state.actionChart.weapons.length )
            .replaceAll( '[WEAPONLIKE-CNT-ON-ACTIONCHART]' , state.actionChart.getWeaponObjects().length )
            .replaceAll( '[ENDURANCE]' , state.actionChart.currentEndurance )
            .replaceAll( '[MAXENDURANCE]' , state.actionChart.getMaxEndurance() )
            .replaceAll( '[COMBATSENDURANCELOST]', sectionState.combatsEnduranceLost() )
            .replaceAll( '[COMBATSENEMYLOST]', sectionState.combatsEnduranceLost('enemy') )
            .replaceAll( '[MEALS]', state.actionChart.meals )
            .replaceAll( '[KAILEVEL]', state.actionChart.disciplines.length )
            .replaceAll( '[MONEYPICKER]', moneyPickerMechanics.getMoneyPickerValue() )
            .replaceAll( '[COMBATSDURATION]', sectionState.combatsDuration() )
            ;

        try {
            // Be sure to return always an integer (expression can contain divisions...)
            // TODO: The expression can be boolean too!. floor only numbers...
            return Math.floor( eval( expression ) );
        }
        catch(e) {
            console.log("Error evaluating expression " + txtExpression + ": " + e);
            return null;
        }
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

        if( state.actionChart.currentEndurance <= 0 && $('#mechanics-death').length == 0 ) {

            // Add the death UI
            gameView.appendToSection( mechanicsEngine.getMechanicsUI('mechanics-death') );

            // Try to set the death message (only for death sections)
            var $choice = $('p.choice, .deadend');
            if( $choice.length > 0 ) {
                if( $choice.find('.choice-link').length == 0 ) {
                    $('#mechanics-deathmsg').text( $choice.text() );
                    $choice.remove();
                }
            }

            // Disable all choice links
            mechanicsEngine.setChoiceState('all' , true);
            // Disable pick any object
            $('a.equipment-op').addClass('disabled');
            // Disable money picker
            moneyPickerMechanics.disable();
            // Disable random table links
            $('a.random').addClass('disabled');

            // Bind restart book link
            $('#mechanics-restart').click(function(e) {
                e.preventDefault();
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
        if( !state.actionChart.disciplines.contains('healing') )
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

        if( section.sectionId != 'sect350' || 
            state.book.bookNumber >= mechanicsEngine.LAST_SUPPORTED_BOOK )
            return;
        
        var $nextBook = $('.bookref');
        if( $nextBook.length == 0 ) {
            // XML bug with spanish book 4. It has no bookref...
            $nextBook = $('cite');
        }

        $nextBook.replaceWith( '<a href="#" id="game-nextBook" class="action">' + 
            $nextBook.html() + '</a>' );
        $('#game-nextBook').click(function(e) {
            e.preventDefault();
            state.nextBook();
            routing.redirect('setup');
        });
    },

    /**
     * Get the 'en-text' or 'es-text' from the given rule
     */
    getRuleText: function(rule) {
        var $rule = $(rule);
        var text = $rule.attr( state.language + '-text');
        if( !text )
            // Return the english text
            text = $rule.attr( 'en-text' );
        if( !text )
            text = '';
        return text;
    }
};
