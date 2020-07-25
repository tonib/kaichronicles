
/**
 * Engine to render and run gamebook mechanics rules
 */
const mechanicsEngine = {

    /**
     * jquery DOM object with the mechanics HTML
     */
    $mechanicsUI:  null as JQuery<HTMLElement>,

    /**
     * Mechanics UI URL
     */
    mechanicsUIURL: "views/mechanicsEngine.html",

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
    downloadMechanicsUI() {
        // TODO: This is ugly. The mechanicsEngine.html load should be
        // TODO: handled always by views object

        // There is a trick here: If we are on production, the UI was already
        // loaded with the views:
        const cachedView = views.getCachedView("mechanicsEngine.html");
        if (cachedView) {
            mechanicsEngine.$mechanicsUI = $(cachedView).find("#mechanics-container");
            // Return a resolved promise
            const dfd = jQuery.Deferred();
            dfd.resolve();
            return dfd.promise();
        }

        return $.ajax({
            url: mechanicsEngine.mechanicsUIURL,
            dataType: "html"
        })
            .done((data) => {
                mechanicsEngine.$mechanicsUI = $(data).filter("#mechanics-container");
            });
    },

    /**
     * Get a mechanics tag from the mechanicsEngine.html file, translated
     * @param tagId The tag id to get
     * @returns {jQuery} The translated tag
     */
    getMechanicsUI(tagId: string): any {
        const $tag = mechanicsEngine.$mechanicsUI.find("#" + tagId).clone();
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
    run(section: Section) {

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
        gameView.enablePreviousLink(section.sectionId !== "tssf");

        // Retrieve or store combat states
        state.sectionStates.setupCombats(section);

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
        CombatMechanics.renderCombats();

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
     * @param resetRandomTableIncrements If it's true, any random table link increment will be reset before
     * run the rules. Random table increments are stored on the UI, and they are accumulative. So if rules are re-executed
     * without refresh the section, it can be needed
     */
    runSectionRules(resetRandomTableIncrements: boolean = false) {

        if (resetRandomTableIncrements) {
            randomMechanics.resetRandomTableIncrements();
        }

        // Run section rules
        const $sectionMechanics =
            state.mechanics.getSection(state.sectionStates.currentSection);
        if ($sectionMechanics !== null) {
            mechanicsEngine.runChildRules($sectionMechanics);
        }

        // Run global rules
        mechanicsEngine.runGlobalRules();
    },

    /**
     * Run registered global rules
     * @param onlyCombatRules True to apply only "combat" rules
     * @param combatToApply Only applies if onlyCombatRules is true. Single combat where to apply the combat rules
     */
    runGlobalRules(onlyCombatRules: boolean = false, combatToApply: Combat = null) {

        for (const id of state.sectionStates.globalRulesIds) {
            const $globalRule = state.mechanics.getGlobalRule(id);

            if (onlyCombatRules) {
                for (const rule of $globalRule.children().toArray()) {
                    if (rule.nodeName === "combat") {
                        mechanicsEngine.combat(rule, combatToApply);
                    }
                }
            } else {
                mechanicsEngine.runChildRules($globalRule);
            }
        }
    },

    /**
     * Run child rules of a given rule
     * @param $rule Rule where to run child rules
     */
    runChildRules($rule: JQuery<Element>) {
        const childrenRules = $rule.children();
        for (const rule of childrenRules.toArray()) {
            mechanicsEngine.runRule(rule);
        }
    },

    /**
     * Run a game rule
     * @param rule The XML rule node
     */
    runRule(rule: Element) {
        // console.log( Mechanics.getRuleSelector(rule) );
        if (!mechanicsEngine[rule.nodeName]) {
            mechanicsEngine.debugWarning("Unknown rule: " + rule.nodeName);
        } else {
            mechanicsEngine[rule.nodeName](rule);
        }
    },

    /**
     * Fire events associated to inventory changes (pick, drop, etc)
     * @param fromUI True if the event was fired from the UI
     * @param o Only applies if fromUI is true. The object picked / droped
     */
    fireInventoryEvents(fromUI: boolean = false, o: Item = null) {

        // Render object tables
        mechanicsEngine.showAvailableObjects();
        mechanicsEngine.showSellObjects();

        if (mechanicsEngine.onInventoryEventRule) {
            mechanicsEngine.runChildRules($(mechanicsEngine.onInventoryEventRule));
        }

        // Update combat ratio on combats  (have we picked a weapon?)
        CombatMechanics.updateCombats();

        if (fromUI && routing.getControllerName() === "gameController") {
            // Check if we must to re-render the section. This may be needed if the
            // picked / dropped object affects to the rules
            if (mechanicsEngine.checkReRenderAfterInventoryEvent(o)) {
                // Re-render the section
                console.log("Re-rendering the section due to rules re-execution");
                gameController.loadSection(state.sectionStates.currentSection, false,
                    window.pageYOffset);
            }
        }

    },

    /**
     * Print debug warning to console, and even more prominently if we're in
     * debug mode.
     */
    debugWarning(msg: string) {
        console.log(msg);
        if (App.debugMode) {
            mechanicsEngine.showMessage(msg);
        }
    },

    /**
     * Check if we must to re-render the section. This may be needed if the
     * picked / dropped object affects to the rules
     * @param o The object picked / droped
     */
    checkReRenderAfterInventoryEvent(o: Item) {

        // Get section rules
        const $sectionRules = state.mechanics.getSection(state.sectionStates.currentSection);
        if ($sectionRules === null) {
            return false;
        }

        // TODO: Here there is a huge design error: Or use this re-render, or use "onInventoryEvent" rule
        // TODO: Both do the same

        let reRender = false;
        mechanicsEngine.enumerateSectionRules($sectionRules[0], (rule) => {
            if (rule.nodeName === "onInventoryEvent") {
                // onInventoryEvent rule don't affect, has been executed
                return "ignoreDescendants";
            } else if (rule.nodeName === "test") {
                // test rule

                const $rule = $(rule);

                // TODO: Use mechanicsEngine.getArrayProperty here
                const objectsList = $rule.attr("hasObject");
                if (objectsList) {
                    const objects = objectsList.split("|");
                    if (objects.contains(o.id)) {
                        // Section should be re-rendered
                        reRender = true;
                        return "finish";
                    }
                }

                if ($rule.attr("canUseBow") && (o.id === Item.QUIVER || o.isWeaponType(Item.BOW))) {
                    // Section should be re-rendered
                    reRender = true;
                    return "finish";
                }

                if ($rule.attr("hasWeaponType") && o.isWeapon()) {
                    // Section should be re-rendered
                    reRender = true;
                    return "finish";
                }

                const expression: string = $rule.attr("expression");
                if (expression) {
                    if (o.id === Item.MONEY && (expression.indexOf("[MONEY]") >= 0 || expression.indexOf("[MONEY-ON-SECTION]") >= 0)) {
                        // Section should be re-rendered
                        reRender = true;
                        return "finish";
                    }

                    if (o.id === Item.MEAL && expression.indexOf("[MEALS]") >= 0) {
                        // Section should be re-rendered
                        reRender = true;
                        return "finish";
                    }
                }
            } else if (rule.nodeName === "meal") {
                // meal rule
                if (o.id === Item.MEAL || o.isMeal) {
                    // Section should be re-rendered
                    reRender = true;
                    return "finish";
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
    fireAfterCombatTurn(combat: Combat) {

        const sectionState = state.sectionStates.getSectionState();

        if (!combat) {
            // Fire all combats
            $.each(sectionState.combats, (index, turnCombat: Combat) => {
                mechanicsEngine.fireAfterCombatTurn(turnCombat);
            });
            return;
        }

        // Fire the given combat turn events
        for (const rule of mechanicsEngine.onAfterCombatTurns) {
            // Turn when to execute the rule:
            const txtRuleTurn: string = $(rule).attr("turn");
            const ruleTurn = (txtRuleTurn === "any" ? "any" : ExpressionEvaluator.evalInteger(txtRuleTurn));

            // We reapply all rules accumulatively
            if (txtRuleTurn === "any" || combat.turns.length >= ruleTurn) {
                mechanicsEngine.runChildRules($(rule));
            }
        }
    },

    /**
     * Fire events when some choice is selected
     * @param {string} sectionId The section of the selected choice
     */
    fireChoiceSelected(sectionId: string) {
        $.each(mechanicsEngine.onChoiceSelected, (index, rule) => {
            const ruleSectionId = $(rule).attr("section");
            if (ruleSectionId === "all" || ruleSectionId === sectionId) {
                mechanicsEngine.runChildRules($(rule));
            }
        });
    },

    /**
     * Fire events when some object is used
     * @param {string} objectId The id of the object used
     */
    fireObjectUsed(objectId: string) {
        if (!mechanicsEngine.onObjectUsedRule) {
            return;
        }

        const $eventRule = $(mechanicsEngine.onObjectUsedRule);
        // TODO: Use mechanicsEngine.getArrayProperty here
        const objectIds = $eventRule.attr("objectId").split("|");
        if (objectIds.contains(objectId)) {
            mechanicsEngine.runChildRules($eventRule);
        }
    },

    /**
     * The action button of a picker number was clicked
     * @returns True if the number picker value was valid (== if the action has been executed)
     */
    fireNumberPickerChoosed(): boolean {
        // Be sure the picker number value is valid
        if (!numberPickerMechanics.isValid()) {
            return false;
        }

        if (mechanicsEngine.onNumberPickerChoosed) {
            mechanicsEngine.runChildRules($(mechanicsEngine.onNumberPickerChoosed));
        }

        return true;
    },

    /************************************************************/
    /**************** RULES *************************************/
    /************************************************************/

    /**
     * Choose player skills UI
     */
    setSkills() {
        SkillsSetup.setSkills();
    },

    /**
     * Choose the kai disciplines UI
     */
    setDisciplines() {
        const setup = new SetupDisciplines();
        setup.setupDisciplinesChoose();
    },

    /**
     * Choose equipment UI (only for book 1)
     * TODO: This is weird, only for book 1? Fix this
     */
    chooseEquipment(rule: Element) {
        EquipmentSectionMechanics.chooseEquipment(rule);
    },

    /**
     * Pick objects, money, etc
     * param rule The pick rule
     */
    pick(rule: Element) {

        const sectionState = state.sectionStates.getSectionState();

        // Do not execute the rule twice:
        if (sectionState.ruleHasBeenExecuted(rule)) {
            return;
        }

        const $rule = $(rule);

        // Check if we are picking an object
        const objectId = $rule.attr("objectId");
        if (objectId) {
            if (!state.mechanics.getObject(objectId)) {
                mechanicsEngine.debugWarning("Unknown object: " + objectId);
            }

            // Pick the object
            if (!actionChartController.pick(objectId, false, false)) {
                // The object has not been picked (ex. full backpack)
                // Add the object to the section
                sectionState.addObjectToSection(objectId);
            }

            // Mark the rule as exececuted
            sectionState.markRuleAsExecuted(rule);
            return;
        }

        // Other things (money or meals)
        const cls = $rule.attr("class");

        // Check the amount
        let count = ExpressionEvaluator.evalInteger($rule.attr("count"));

        // Add to the action chart
        if (cls === Item.MEAL ) {
            actionChartController.increaseMeals(count);
        } else if (cls === Item.ARROW) {
            actionChartController.increaseArrows(count);
        } else if (cls === Item.MONEY) {
            // TODO: We should store the amount of each currency. Unsupported
            // Exchange to Gold Crows
            count = Currency.toGoldCrowns(count, $rule.attr("currency"));
            actionChartController.increaseMoney(count);
        } else {
            mechanicsEngine.debugWarning("Pick rule with no objectId / class");
        }

        // Mark the rule as exececuted
        sectionState.markRuleAsExecuted(rule);

    },

    /**
     * Assing an action to a random table link.
     */
    randomTable(rule: Element) {
        // console.log( 'randomTable rule' );
        randomMechanics.randomTable(rule);
    },

    /** Increment for random table selection */
    randomTableIncrement(rule: Element) {
        randomMechanics.randomTableIncrement(rule);
    },

    /**
     * Test a condition
     */
    test(rule: Element) {

        // IF THERE IS MORE THAN ONE CONDITION ON THE RULE, THEY SHOULD WORK LIKE AN
        // "OR" OPERATOR

        // Initially the condition is false
        let conditionStatisfied = false;

        const $rule = $(rule);

        // Check discipline
        const disciplineToTest = mechanicsEngine.getArrayProperty($rule, "hasDiscipline");
        if (disciplineToTest.length > 0) {
            // Check if the player has some of the disciplines
            const allDisciplines = Object.keys(state.book.getDisciplinesTable());
            for (const discipline of disciplineToTest) {
                if (!allDisciplines.contains(discipline)) {
                    mechanicsEngine.debugWarning("Unknown discipline: " + discipline);
                }
                if (state.actionChart.hasDiscipline(discipline)) {
                    conditionStatisfied = true;
                    break;
                }
            }
        }

        // Check objects
        let i;
        const objectIdsToTest = $rule.attr("hasObject");
        if (objectIdsToTest) {
            // Check if the player has some of the objects
            // TODO: Use mechanicsEngine.getArrayProperty here
            const objects = objectIdsToTest.split("|");
            for (i = 0; i < objects.length; i++) {
                if (!state.mechanics.getObject(objects[i])) {
                    mechanicsEngine.debugWarning("Unknown object: " + objects[i]);
                }
                if (state.actionChart.hasObject(objects[i])) {
                    conditionStatisfied = true;
                    break;
                }
            }
        }

        // Check expression
        const expression = $rule.attr("expression");
        if (expression && ExpressionEvaluator.evalBoolean(expression)) {
            conditionStatisfied = true;
        }

        // Check section visited:
        // TODO: Use mechanicsEngine.getArrayProperty here
        const sectionIdsList = $rule.attr("sectionVisited");
        if (sectionIdsList) {
            const sectionIds = sectionIdsList.split("|");
            for (i = 0; i < sectionIds.length; i++) {
                if (state.sectionStates.sectionIsVisited(sectionIds[i])) {
                    conditionStatisfied = true;
                    break;
                }
            }
        }

        // Test current weapon:
        const currentWeaponList = mechanicsEngine.getArrayProperty($rule, "currentWeapon");
        if (currentWeaponList.length > 0) {
            const selectedWeapon: Item = state.actionChart.getSelectedWeaponItem(false);
            if (selectedWeapon) {
                for (const w of currentWeaponList) {
                    if (selectedWeapon.isWeaponType(w)) {
                        conditionStatisfied = true;
                        break;
                    }
                }
            }
        }

        // Test weaponskill with current weapon
        if (mechanicsEngine.getBooleanProperty($rule, "weaponskillActive")) {
            if (state.actionChart.isWeaponskillActive()) {
                conditionStatisfied = true;
            }
        }

        // Test combats won:
        // TODO: Use mechanicsEngine.getBooleanProperty here
        const combatsWon = $rule.attr("combatsWon");
        if (combatsWon) {
            const allCombatsWon = state.sectionStates.getSectionState().areAllCombatsWon();
            if (combatsWon === "true" && allCombatsWon) {
                conditionStatisfied = true;
            } else if (combatsWon === "false" && !allCombatsWon) {
                conditionStatisfied = true;
            }
        }

        // Test some combat active:
        // TODO: Use mechanicsEngine.getBooleanProperty here
        const combatsActive = $rule.attr("combatsActive");
        if (combatsActive === "true" &&
            state.sectionStates.getSectionState().someCombatActive()) {
            conditionStatisfied = true;
        }

        // Test book language
        const bookLanguage = $rule.attr("bookLanguage");
        if (bookLanguage && state.book.language === bookLanguage) {
            conditionStatisfied = true;
        }

        // Test section choice is enabled:
        const sectionToCheck = $rule.attr("isChoiceEnabled");
        if (sectionToCheck && mechanicsEngine.isChoiceEnabled(sectionToCheck)) {
            conditionStatisfied = true;
        }

        // Test if the player can use the bow
        const canUseBow = mechanicsEngine.getBooleanProperty($rule, "canUseBow");
        if (canUseBow !== null && canUseBow === state.actionChart.canUseBow()) {
            conditionStatisfied = true;
        }

        // Test if the player has a kind of weapon
        // TODO: Use mechanicsEngine.getArrayProperty here
        const hasWeaponType: string = $rule.attr("hasWeaponType");
        if (hasWeaponType) {
            for (const weaponType of hasWeaponType.split("|")) {
                if (state.actionChart.getWeaponType(weaponType)) {
                    conditionStatisfied = true;
                    break;
                }
            }
        }

        // Test if the player has a lore-circle
        const circleId: string = $rule.attr("hasCircle");
        if (circleId && LoreCircle.getCircle(circleId).matchCircle(state.actionChart.getDisciplines(BookSeriesId.Magnakai))) {
            conditionStatisfied = true;
        }

        // Check if the player has weaponskill / weaponmastery with a given weapon
        const hasWeaponskillWith: string = $rule.attr("hasWeaponskillWith");
        if (hasWeaponskillWith && state.actionChart.hasWeaponskillWith(hasWeaponskillWith)) {
            conditionStatisfied = true;
        }

        // Current hand-to-hand weapon is special?
        const currentWeaponSpecial = mechanicsEngine.getBooleanProperty($rule, "currentWeaponSpecial");
        if (currentWeaponSpecial !== null) {
            const currentWeapon = state.actionChart.getSelectedWeaponItem(false);
            const currentIsSpecial = (currentWeapon && currentWeapon.type === Item.SPECIAL);
            if (currentIsSpecial === currentWeaponSpecial) {
                conditionStatisfied = true;
            }
        }

        // A global rule id is registered?
        const globalRuleId: string = $rule.attr("isGlobalRuleRegistered");
        if (globalRuleId && state.sectionStates.globalRulesIds.contains(globalRuleId)) {
            conditionStatisfied = true;
        }

        // There are some of these objects on the section?
        const objectOnSection = mechanicsEngine.getArrayProperty($rule, "objectOnSection");
        if (objectOnSection.length > 0) {
            const sectionState = state.sectionStates.getSectionState();
            for (const objectId of objectOnSection) {
                if (sectionState.containsObject(objectId)) {
                    conditionStatisfied = true;
                    break;
                }
            }
        }

        // Any object picked on a given section?
        const pickedSomethingOnSection: string = $rule.attr("pickedSomethingOnSection");
        if (pickedSomethingOnSection && EquipmentSectionMechanics.getNPickedObjects(pickedSomethingOnSection) > 0) {
            conditionStatisfied = true;
        }

        // Section contains text?
        const sectionContainsText: string = $rule.attr("sectionContainsText");
        if (sectionContainsText) {
            const section = new Section(state.book, state.sectionStates.currentSection, state.mechanics);
            if (section.containsText(sectionContainsText)) {
                conditionStatisfied = true;
            }
        }

        // Check if the test should be inversed
        if ($rule.attr("not") === "true") {
            conditionStatisfied = !conditionStatisfied;
        }

        if (conditionStatisfied) {
            // Run child items
            mechanicsEngine.runChildRules($rule);
        }

    },

    /**
     * Enable / disable a choice
     */
    choiceState(rule: Element) {

        // Get the choice filter
        const section = $(rule).attr("section");

        // Test section:
        if (section !== "all" &&
            $("a.choice-link[data-section=" + section + "]").length === 0) {
            mechanicsEngine.debugWarning("choiceState: Wrong choiceState (section=" + section + ")");
            return;
        }

        // Get if we must enable or disable:
        const disabled = ($(rule).attr("set") === "disabled");

        // Set choice/s state
        mechanicsEngine.setChoiceState(section, disabled);
    },

    /**
     * There is an available object on the section
     */
    object(rule: Element) {

        const sectionState = state.sectionStates.getSectionState();

        // Do not execute the rule twice:
        if (sectionState.ruleHasBeenExecuted(rule)) {
            return;
        }

        const objectId: string = $(rule).attr("objectId");
        if (!objectId) {
            mechanicsEngine.debugWarning("Rule object without objectId");
            return;
        }

        if (!state.mechanics.getObject(objectId)) {
            mechanicsEngine.debugWarning("Unknown object: " + objectId);
        }

        // Object price (optional)
        const priceValue = $(rule).attr("price");
        let price: number = 0;
        if (priceValue) {
            price = ExpressionEvaluator.evalInteger(priceValue);
        }

        // Unlimited number of this kind of object?
        const unlimited = ($(rule).attr("unlimited") === "true");

        // Number of items (only for quiver (n. arrows) and money (n.gold crowns), arrows or if you buy X objects for a single price)
        const txtCount: string = $(rule).attr("count");
        const count = (txtCount ? parseInt(txtCount, 10) : 0);

        // Object can be used directly from the section, without picking it?
        const useOnSection = ($(rule).attr("useOnSection") === "true");

        // Add the object to the available objects on the section
        sectionState.addObjectToSection(objectId, price, unlimited, count, useOnSection);

        sectionState.markRuleAsExecuted(rule);
    },

    /**
     * Allow to sell an inventory object rule
     */
    sell(rule: Element) {
        const $rule = $(rule);

        const sectionState = state.sectionStates.getSectionState();
        if (sectionState.ruleHasBeenExecuted(rule)) {
            // Execute only once
            return;
        }

        const price = parseInt($rule.attr("price"), 10);

        // Sell a specific item
        const objectId = $rule.attr("objectId");
        if (objectId) {
            const item = state.mechanics.getObject(objectId);
            sectionState.sellPrices.push({
                id: objectId,
                price,
                count: parseInt($rule.attr("count"), 10),
                unlimited: false,
                useOnSection: false,
                usageCount: item && item.usageCount ? item.usageCount : 1
            });
        }

        // Other things (money / meals / special items ...)
        const cls = $rule.attr("class");
        if (cls) {
            let objectIds: string[] = [];
            let except: string[] = [];

            // TODO: Use mechanicsEngine.getArrayProperty here
            const txtExcept = $rule.attr("except");
            if (txtExcept) {
                except = txtExcept.split("|");
            }

            if (cls === Item.SPECIAL) {
                objectIds = state.actionChart.getSpecialItemsIds();
                except.push(Item.MAP); // don't sell this, come on!
            } else {
                mechanicsEngine.debugWarning("Sell rule with invalid class");
            }

            for (const id of objectIds) {
                const item = state.mechanics.getObject(objectId);
                if (!except.contains(id)) {
                    sectionState.sellPrices.push({
                        id,
                        price,
                        count: 0,
                        unlimited: false,
                        useOnSection: false,
                        usageCount: item && item.usageCount ? item.usageCount : 1
                    });
                    except.push(id); // Avoid duplicates
                }
            }
        }

        state.sectionStates.markRuleAsExecuted(rule);
    },

    /**
     * Combat options
     * @param rule The combat rule to apply
     * @param combatToApply If null, the rule will be applied to a current section combat. If not null
     * the rule will be applied to this combat
     */
    combat(rule: Element, combatToApply: Combat = null) {

        // TODO: Reuse this selector, performance:
        const $rule = $(rule);

        // Combat index
        let combatIndex = parseInt($rule.attr("index"), 10);
        if (!combatIndex) {
            combatIndex = 0;
        }

        const sectionState = state.sectionStates.getSectionState();

        // Get the combat where to apply the rule
        let combat: Combat;
        if (combatToApply) {
            combat = combatToApply;
        } else {
            if (combatIndex >= sectionState.combats.length) {
                mechanicsEngine.debugWarning('Rule "combat": Combat with index ' +
                    combatIndex + " not found");
                return;
            }
            combat = sectionState.combats[combatIndex];
        }

        // Check LW combat ABSOLUTE skill modifier for this section:
        const combatSkillModifier = mechanicsEngine.getIntProperty($rule, "combatSkillModifier", true);
        if (combatSkillModifier !== null) {
            combat.combatModifier = combatSkillModifier;
        }

        // Check LW combat skill modifier INCREMENT
        const combatSkillModifierIncrement = mechanicsEngine.getIntProperty($rule, "combatSkillModifierIncrement", true);
        if (combatSkillModifierIncrement !== null) {
            combat.combatModifier += combatSkillModifierIncrement;
        }

        // Check if the enemy has mindforce attack
        const txtMindforceCS = $rule.attr("mindforceCS");
        if (txtMindforceCS) {
            combat.mindforceCS = parseInt(txtMindforceCS, 10);
        }
        const txtMindforceEP = $rule.attr("mindforceEP");
        if (txtMindforceEP) {
            combat.mindforceEP = parseInt(txtMindforceEP, 10);
        }

        // Check if the enemy is immune to Mindblast
        combat.noMindblast = mechanicsEngine.getBooleanProperty($rule, "noMindblast", combat.noMindblast);

        // Check if the enemy is immune to Psi-Surge
        combat.noPsiSurge = mechanicsEngine.getBooleanProperty($rule, "noPsiSurge", combat.noPsiSurge);

        // Check if the enemy is immune to Kai-Surge
        combat.noKaiSurge = mechanicsEngine.getBooleanProperty($rule, "noKaiSurge", combat.noKaiSurge);

        // Special mindblast bonus?
        const txtMindblastBonus = $rule.attr("mindblastBonus");
        if (txtMindblastBonus) {
            combat.mindblastBonus = parseInt(txtMindblastBonus, 10);
        }

        // Mindblast multiplier (to all mental attacks too, like psi-surge)
        const txtMindblastMultiplier: string = $rule.attr("mindblastMultiplier");
        if (txtMindblastMultiplier) {
            combat.mindblastMultiplier = parseFloat(txtMindblastMultiplier);
        }

        // Special Psi-Surge bonus?
        const txtPsiSurgeBonus: string = $rule.attr("psiSurgeBonus");
        if (txtPsiSurgeBonus) {
            combat.psiSurgeBonus = parseInt(txtPsiSurgeBonus, 10);
        }

        // Special Kai-Surge bonus?
        const txtKaiSurgeBonus: string = $rule.attr("kaiSurgeBonus");
        if (txtKaiSurgeBonus) {
            combat.kaiSurgeBonus = parseInt(txtKaiSurgeBonus, 10);
        }

        // Check if the player cannot use weapons on this combat
        const txtNoWeapon: string = $rule.attr("noWeapon");
        if (txtNoWeapon) {
            if (txtNoWeapon === "true") {
                // All turns no weapon
                combat.noWeaponTurns = -1;
            } else if (txtNoWeapon === "false") {
                // Use weapon on all turns
                combat.noWeaponTurns = 0;
            } else {
                // Use weapon after "n" turns
                combat.noWeaponTurns = parseInt(txtNoWeapon, 10);
            }
        }

        // Check if the combat is non-physical (disables most bonuses)
        // TODO: Use mechanicsEngine.getBooleanProperty here
        const txtMentalOnly = $rule.attr("mentalOnly");
        if (txtMentalOnly) {
            combat.mentalOnly = (txtMentalOnly === "true");
        }

        // Initial turn to allow to elude the combat
        if ($rule.attr("eludeTurn")) {
            combat.eludeTurn = parseInt($rule.attr("eludeTurn"), 10);
        }

        // Max. turn to elude combat
        const txtmaxEludeTurn: string = $rule.attr("maxEludeTurn");
        if (txtmaxEludeTurn) {
            combat.maxEludeTurn = parseInt(txtmaxEludeTurn, 10);
        }

        // Enemy EP to allow to elude the combat
        if ($rule.attr("eludeEnemyEP")) {
            combat.eludeEnemyEP = parseInt($rule.attr("eludeEnemyEP"), 10);
        }

        // Dammage multiplier (player)
        const txtDammageMultiplier: string = $rule.attr("dammageMultiplier");
        if (txtDammageMultiplier) {
            combat.dammageMultiplier = parseFloat(txtDammageMultiplier);
        }

        // Dammage multiplier (enemy)
        const txtEnemyMultiplier: string = $rule.attr("enemyMultiplier");
        if (txtEnemyMultiplier) {
            combat.enemyMultiplier = parseFloat(txtEnemyMultiplier);
        }

        // Enemy is immune for X turns
        const txtEnemyImmuneTurns: string = $rule.attr("enemyImmuneTurns");
        if (txtEnemyImmuneTurns) {
            combat.enemyImmuneTurns = parseInt(txtEnemyImmuneTurns, 10);
        }

        // LW is immune for X turns
        const txtImmuneTurns: string = $rule.attr("immuneTurns");
        if (txtImmuneTurns) {
            combat.immuneTurns = parseInt(txtImmuneTurns, 10);
        }

        // Enemy extra loss per turn
        const txtEnemyTurnLoss = $rule.attr("enemyTurnLoss");
        if (txtEnemyTurnLoss) {
            combat.enemyTurnLoss = parseInt(txtEnemyTurnLoss, 10);
        }

        // Player extra loss per turn
        const txtPlayerTurnLoss: string = $rule.attr("turnLoss");
        if (txtPlayerTurnLoss) {
            combat.turnLoss = parseInt(txtPlayerTurnLoss, 10);
        }

        // Player extra loss per turn if he/she has been wounded on that turn.
        const txtPlayerTurnLossIfWounded: string = $rule.attr("turnLossIfWounded");
        if (txtPlayerTurnLossIfWounded) {
            combat.turnLossIfWounded = parseInt(txtPlayerTurnLossIfWounded, 10);
        }

        // It's a fake combat?
        // TODO: Use mechanicsEngine.getBooleanProperty here
        const txtFake = $rule.attr("fake");
        if (txtFake) {
            combat.fakeCombat = (txtFake === "true");
            // % of the E.P. lost to restore after the combat on fake combats.
            const txtFactor = $rule.attr("restoreFactor");
            if (txtFactor) {
                combat.fakeRestoreFactor = parseFloat(txtFactor);
            }
        }

        // It's a bow combat?
        // TODO: Use mechanicsEngine.getBooleanProperty here
        if ($rule.attr("bow") === "true") {
            combat.bowCombat = true;
        }

        // LW loss is permament (applied to the original endurance)?
        const permanentDammage = mechanicsEngine.getBooleanProperty($rule, "permanentDammage");
        if (permanentDammage !== null) {
            combat.permanentDammage = permanentDammage;
        }

        // Objects to disable on this combat:
        const txtDisabledObjects: string = $rule.attr("disabledObjects");
        if (txtDisabledObjects) {
            if (txtDisabledObjects === "none") {
                combat.disabledObjects = [];
            } else {
                combat.disabledObjects = txtDisabledObjects.split("|");
            }
        }

    },

    /**
     * After all combats are finished rule
     */
    afterCombats(rule: Element) {

        mechanicsEngine.onAfterCombatsRule = rule;
        const sectionState = state.sectionStates.getSectionState();
        if (sectionState.areAllCombatsFinished(state.actionChart) === "finished") {
            // All combats are finished. Fire the rule
            mechanicsEngine.runChildRules($(rule));
        }

    },

    /**
     * After elude combats rule
     */
    afterElude(rule: Element) {

        mechanicsEngine.onEludeCombatsRule = rule;
        const sectionState = state.sectionStates.getSectionState();
        if (sectionState.areAllCombatsFinished(state.actionChart) === "eluded") {
            // All combats are eluded. Fire the rule
            mechanicsEngine.runChildRules($(rule));
        }

    },

    /** Event for combat turn */
    afterCombatTurn(rule: Element) {
        mechanicsEngine.onAfterCombatTurns.push(rule);
    },

    /**
     * Disable / enable all combats
     */
    disableCombats(rule: Element) {
        const sectionState = state.sectionStates.getSectionState();
        const enabled = $(rule).attr("disabled") === "false";
        sectionState.setCombatsEnabled(enabled);
        if (enabled) {
            // Enable combats
            CombatMechanics.showCombatButtons(null);
        } else {
            // Disable combats
            CombatMechanics.hideCombatButtons(null);
        }
    },

    /**
     * Increase endurance rule
     */
    endurance(rule: Element) {

        if (state.sectionStates.ruleHasBeenExecuted(rule)) {
            // Execute only once
            return;
        }

        const increase = ExpressionEvaluator.evalInteger($(rule).attr("count"));
        const noToast = mechanicsEngine.getBooleanProperty($(rule), "noToast", false);
        const permanent = mechanicsEngine.getBooleanProperty($(rule), "permanent", false);
        actionChartController.increaseEndurance(increase, noToast, permanent);

        state.sectionStates.markRuleAsExecuted(rule);
    },

    /**
     * Increase combat skill (permanent)
     */
    combatSkill(rule: Element) {
        if (state.sectionStates.ruleHasBeenExecuted(rule)) {
            // Execute only once
            return;
        }

        const $rule = $(rule);

        const increase = ExpressionEvaluator.evalInteger($rule.attr("count"));

        // TODO: Use mechanicsEngine.getBooleanProperty here. Default value = "true"
        const showToast = ($rule.attr("toast") !== "false");
        actionChartController.increaseCombatSkill(increase, showToast);

        state.sectionStates.markRuleAsExecuted(rule);
    },

    /**
     * Player death rule
     */
    death(rule: Element) {
        actionChartController.increaseEndurance(-state.actionChart.currentEndurance, true);
    },

    /** Have a meal rule */
    meal(rule: Element) {
        MealMechanics.runRule(rule);
    },

    /** Display message rule */
    message(rule: Element) {

        const $rule = $(rule);
        const msgId = $rule.attr("id");

        const op = $rule.attr("op");
        if (op) {
            // Change the state of the message
            if (op === "show") {
                $("#" + msgId).show();
            } else {
                $("#" + msgId).hide();
            }
            return;
        }

        // Display a new message
        mechanicsEngine.showMessage(mechanicsEngine.getRuleText(rule), msgId);
    },

    /** Inventory events rule */
    onInventoryEvent(rule: Element) {
        mechanicsEngine.onInventoryEventRule = rule;
        // Fire the rule at startup:
        mechanicsEngine.runChildRules($(rule));
    },

    /** Drop an object (object lost) */
    drop(rule: Element) {
        if (state.sectionStates.ruleHasBeenExecuted(rule)) {
            // Execute only once
            return;
        }

        const $rule = $(rule);

        // Object ids dropped on this rule execution
        let droppedObjects: ActionChartItem[] = [];

        // Track dropped arrows
        const originalArrows = state.actionChart.arrows;

        // Drop the first one of the specified
        for (const objectId of mechanicsEngine.getArrayProperty($rule, "objectId")) {
            const droppedItem = actionChartController.drop(objectId);
            if (droppedItem) {
                if (droppedItem instanceof ActionChartItem) {
                    droppedObjects.push(droppedItem);
                }
                break;
            }
        }

        // Drop backpack item slots by its index (1-based index)
        droppedObjects = droppedObjects.concat(
            mechanicsEngine.dropActionChartSlots($rule, "backpackItemSlots", state.actionChart.backpackItems));
        droppedObjects = droppedObjects.concat(
            mechanicsEngine.dropActionChartSlots($rule, "specialItemSlots", state.actionChart.specialItems));

        // Store dropped objects as an inventory state
        const restorePointId: string = $rule.attr("restorePoint");
        if (restorePointId) {
            const inventoryState = new InventoryState();
            inventoryState.addItemsArray(droppedObjects);

            if (state.actionChart.arrows < originalArrows) {
                // One or more quivers have been dropped. Save arrows:
                inventoryState.arrows += originalArrows - state.actionChart.arrows;
            }

            mechanicsEngine.appendToInventoryState(inventoryState, restorePointId);
        }

        state.sectionStates.markRuleAsExecuted(rule);
    },

    /**
     * On choice selected event
     */
    choiceSelected(rule: Element) {
        mechanicsEngine.onChoiceSelected.push(rule);
    },

    /**
     * Set the current weapon rule
     */
    currentWeapon(rule: Element) {
        if (state.sectionStates.ruleHasBeenExecuted(rule)) {
            // Execute only once
            return;
        }
        actionChartController.setSelectedWeapon($(rule).attr("objectId"));
        state.sectionStates.markRuleAsExecuted(rule);
    },

    /**
     * Enable / disable hunting until new advice
     */
    huntStatus(rule: Element) {
        state.sectionStates.huntEnabled = ($(rule).attr("enabled") !== "false");
    },

    /**
     * Number picker UI
     */
    numberPicker(rule: Element) {
        numberPickerMechanics.numberPicker(rule);
    },

    /**
     * Number picker action button clicked event handler
     */
    numberPickerChoosed(rule: Element) {
        mechanicsEngine.onNumberPickerChoosed = rule;

        // If the action button has been already picked, run the event handler right now, if it's requested
        if (mechanicsEngine.getBooleanProperty($(rule), "executeAtStart") && numberPickerMechanics.actionButtonWasClicked()) {
            mechanicsEngine.runChildRules($(mechanicsEngine.onNumberPickerChoosed));
        }
    },

    /**
     * Reset the state of a given section
     */
    resetSectionState(rule: Element) {
        state.sectionStates.resetSectionState($(rule).attr("sectionId"));
    },

    /**
     * Save the current inventory state
     */
    saveInventoryState(rule: Element) {
        if (state.sectionStates.ruleHasBeenExecuted(rule)) {
            // Execute only once
            return;
        }

        const restorePointId: string = $(rule).attr("restorePoint");
        let objectsType: string = $(rule).attr("objectsType");
        if (!objectsType) {
            objectsType = "all";
        }

        // Save the inventory state:
        const newRestorePoint = InventoryState.fromActionChart(objectsType, state.actionChart);
        mechanicsEngine.appendToInventoryState(newRestorePoint, restorePointId);

        state.sectionStates.markRuleAsExecuted(rule);
    },

    /**
     * Restore the inventory state
     */
    restoreInventoryState(rule: Element) {
        if (state.sectionStates.ruleHasBeenExecuted(rule)) {
            // Execute only once
            return;
        }

        const $rule = $(rule);

        // Get the restore point
        const restorePoint = $rule.attr("restorePoint");
        const inventoryStateObject: any = state.sectionStates.otherStates[restorePoint];
        if (!inventoryStateObject) {
            // Sometimes it's OK if the restore point does not exist, so don't be so expressive
            // mechanicsEngine.debugWarning('restorePoint ' + restorePoint + ' not found!');
            console.log("restorePoint " + restorePoint + " not found");
            return;
        }
        const inventoryState = InventoryState.fromObject(inventoryStateObject);

        // Restore weapons?
        const restoreWeapons = mechanicsEngine.getBooleanProperty($rule, "restoreWeapons", true);

        // Restore objects
        actionChartController.restoreInventoryState(inventoryState, restoreWeapons);

        // Save the current inventory state, modified by restoreInventoryState
        state.sectionStates.otherStates[restorePoint] = inventoryState.toObject();

        state.sectionStates.markRuleAsExecuted(rule);
    },

    /**
     * Register a set of global rules: Rules to execute at any section until they are
     * unregistered
     */
    registerGlobalRule(rule: Element) {
        if (state.sectionStates.ruleHasBeenExecuted(rule)) {
            // Execute only once
            return;
        }

        const ruleId = $(rule).attr("id");
        if (!state.sectionStates.globalRulesIds.contains(ruleId)) {
            console.log("Registered global rule " + ruleId);
            state.sectionStates.globalRulesIds.push(ruleId);
        }

        state.sectionStates.markRuleAsExecuted(rule);
        // update stats in case global rule affects them...
        actionChartView.updateStatistics();
        template.updateStatistics();
    },

    /**
     * Unregister a set of global rules
     */
    unregisterGlobalRule(rule: Element) {
        const ruleId = $(rule).attr("id");
        console.log("Unregistering global rule " + ruleId );
        state.sectionStates.globalRulesIds.removeValue(ruleId);
        // update stats in case global rule affected them...
        actionChartView.updateStatistics();
        template.updateStatistics();

    },

    /**
     * Add an event handler for when an object is used on this section
     */
    objectUsed(rule: Element) {
        mechanicsEngine.onObjectUsedRule = rule;
    },

    /**
     * Move to other book section
     */
    goToSection(rule: Element) {
        gameController.loadSection($(rule).attr("section"), true);
        // To avoid continuing executing rules, throw an exception
        throw "Jumped to a new section, rules execution interrupted " +
            "(This exception is not really an error)";
    },

    /**
     * Show a "toast" message
     */
    toast(rule: Element) {
        let durationValue = 5000;
        const txtDurationValue: string = $(rule).attr("duration");
        if (txtDurationValue) {
            durationValue = parseInt(txtDurationValue, 10);
        }

        toastr.info(mechanicsEngine.getRuleText(rule), null, {timeOut: durationValue});
    },

    /**
     * Change a section text by a section choice
     */
    textToChoice(rule: Element) {

        const linkText: string = $(rule).attr("text-" + state.language);
        if (!linkText) {
            mechanicsEngine.debugWarning("textToChoice: text-" + state.language + " attribute not found");
            return;
        }

        const $textContainer = $(':contains("' + linkText + '")').last();
        if ($textContainer.length === 0) {
            mechanicsEngine.debugWarning('textToChoice: text "' + linkText + '" not found');
            return;
        }

        const sectionId = $(rule).attr("section");
        const newHtml = $textContainer.html().replace(linkText,
            '<p class="choice" style="display: inline; margin: 0"><a href="#" class="action choice-link" data-section="' + sectionId + '">' + linkText + "</a></p>");
        $textContainer.html(newHtml);
    },

    /**
     * Add a button to access to the Kai monastery stored objects
     */
    kaiMonasteryStorage(rule: Element) {
        const $tag = mechanicsEngine.getMechanicsUI("mechanics-kaimonasterystorage");
        gameView.appendToSection($tag, "afterChoices");
        $tag.find("button").click( (e: Event) => {
            e.preventDefault();
            // Move to the fake section for Kai monastery
            state.sectionStates.currentSection = Book.KAIMONASTERY_SECTION;
            state.persistState();
            routing.redirect("kaimonastery");
        });
    },

    /**
     * Magnakai: Restore deliverance +20 EP button use (each X days)
     * Rule has state.
     */
    restoreDeliveranceUse(rule: Element) {
        if ( state.sectionStates.ruleHasBeenExecuted(rule) ) {
            // Execute only once
            return;
        }

        state.actionChart.reset20EPRestoreUsed();
        state.sectionStates.markRuleAsExecuted(rule);
    },

    /**
     * Set of rules that should be executed only once
     */
    executeOnce(rule: Element) {
        if (state.sectionStates.ruleHasBeenExecuted(rule)) {
            // Execute only once
            return;
        }
        mechanicsEngine.runChildRules($(rule));
        state.sectionStates.markRuleAsExecuted(rule);
    },

    /**
     * Fire the inventory event
     */
    runInventoryEvent(rule: Element) {
        mechanicsEngine.fireInventoryEvents();
    },

    /**
     * Display section illustration
     */
    displayIllustration(rule: Element) {

        // Get the UI
        const $illContainer = mechanicsEngine.getMechanicsUI("mechanics-displayillustration");

        // Set title
        const title = mechanicsEngine.getRuleText(rule);
        if (title) {
            $illContainer.find("#mechanics-illtitle").text(title);
        } else {
            $illContainer.find("#mechanics-illtitlecontainer").hide();
        }

        // Set illustration
        const sectionId = $(rule).attr("section");
        const section = new Section(state.book, sectionId, state.mechanics);
        const illustrationHtml = section.getFirstIllustrationHtml();
        $illContainer.find("#mechanics-ill").html(illustrationHtml);

        gameView.appendToSection($illContainer);
    },

    /**
     * Force use of some owned object.
     * Rule has state.
     */
    use(rule: Element) {
        if ( state.sectionStates.ruleHasBeenExecuted(rule) ) {
            // Execute only once
            return;
        }

        // Use only the first one
        for (const objectId of mechanicsEngine.getArrayProperty($(rule) , "objectId")) {
            if (state.actionChart.hasObject(objectId)) {
                actionChartController.use(objectId, true, -1, true);
                break;
            }
        }

        state.sectionStates.markRuleAsExecuted(rule);
    },

    /************************************************************/
    /**************** SPECIAL SECTIONS **************************/
    /************************************************************/

    book2Sect238(rule: Element) {
        book2sect238.run(rule);
    },

    book2sect308(rule: Element) {
        book2sect308.run();
    },

    book3sect88(rule: Element) {
        book3sect88.run();
    },

    book6sect26(rule: Element) {
        book6sect26.run();
    },

    book6sect284(rule: Element) {
        book6sect284.run();
    },

    book6sect340(rule: Element) {
        book6sect340.run();
    },

    book9sect91(rule: Element) {
        book9sect91.run();
    },

    /************************************************************/
    /**************** RULES HELPERS *****************************/
    /************************************************************/

    /**
     * Get an array of strings stored on a rule property
     * @param $rule {jQuery} The rule (a jQuery tag)
     * @param property The property to get. Property values must be separated by '|' (ex. 'a|b|c' )
     * @returns The values stored on the property. An empty array if the property does not exists
     */
    getArrayProperty($rule: JQuery<Element>, property: string): string[] {
        const propertyText = $rule.attr(property);
        if (!propertyText) {
            return [];
        }
        return propertyText.split("|");
    },

    /**
     * Get a boolean rule property
     * @param $rule {jQuery} The rule
     * @param property The property to get
     * @param defaultValue Value to return if the attribute is not present (default "defaultValue" is null)
     * @returns The property value. defaultValue if the property was not present
     */
    getBooleanProperty($rule: JQuery<Element>, property: string, defaultValue: boolean = null): boolean | null {
        const txtValue: string = $rule.attr(property);
        if (!txtValue) {
            return defaultValue;
        }
        return txtValue === "true";
    },

    /**
     * Get a integer property
     * TODO: Use this where a parseInt is used on this file
     * @param $rule {jQuery} The rule
     * @param property The property to get
     * @returns The property value. null if the property was not present
     */
    getIntProperty($rule: JQuery<Element>, property: string, evaluateReplacements: boolean): number | null {
        const txtValue: string = $rule.attr(property);
        if (!txtValue) {
            return null;
        }

        if (evaluateReplacements) {
            return ExpressionEvaluator.evalInteger(txtValue);
        }

        return parseInt(txtValue, 10);
    },

    /**
     * Show or update the table with the available objects on the section
     * @param renderEmptyTable If it's true and there are no objects on the current section section,
     * a empty objects table will be rendered. If it's empty, no table will be rendered
     */
    showAvailableObjects(renderEmptyTable = false) {

        const sectionState = state.sectionStates.getSectionState();
        const thereAreObjects = (sectionState.objects.length >= 1);

        // Check if the table was already inserted on the UI:
        let $table = $("#mechanics-availableObjectsList");
        if ($table.length === 0) {
            if (thereAreObjects || renderEmptyTable) {
                // Add the objects table template
                gameView.appendToSection(mechanicsEngine.getMechanicsUI("mechanics-availableObjects"));
                $table = $("#mechanics-availableObjectsList");
            } else {
                // Nothing to do
                return;
            }
        }

        // Fill the objects list:
        new ObjectsTable(sectionState.objects, $table, ObjectsTableType.AVAILABLE).renderTable();
    },

    /**
     * Show or update the table with the sell objects table
     */
    showSellObjects() {
        const sectionState = state.sectionStates.getSectionState();
        if (sectionState.sellPrices.length === 0) {
            return;
        }

        // Check if the table was already inserted on the UI:
        let $table = $("#mechanics-sellObjectsList");
        if ($table.length === 0) {
            // Add the template
            gameView.appendToSection(
                mechanicsEngine.getMechanicsUI("mechanics-sellObjects"));
            $table = $("#mechanics-sellObjectsList");
        }

        // Fill the objects list:
        new ObjectsTable(sectionState.sellPrices, $table, ObjectsTableType.SELL).renderTable();
    },

    /**
     * Enable or disable choice links
     * @param section The section to enable / disable. 'all' for all choices
     * @param disabled True to disable the choices. False to enable
     */
    setChoiceState(section: string, disabled: boolean) {

        // Do not enable anything if the player is death:
        if (state.actionChart.currentEndurance <= 0 && !disabled) {
            return;
        }

        let txtSelector = "#game-section .choice";
        if (section !== "all") {
            txtSelector += ":has(a[data-section=" + section + "])";
        }

        // Select the choose that contains the link to the section, and enable / disable it
        const $choose = $(txtSelector);
        if (disabled) {
            $choose.find(".choice-link").addClass("disabled");
        } else {
            $choose.find(".choice-link").removeClass("disabled");
        }
    },

    /**
     * Return true if the choice for a given section is enabled
     * @param {String} sectionId The section id for the choice to check
     */
    isChoiceEnabled(sectionId: string) {
        const $selector = $("#game-section a[data-section=" + sectionId + "]");
        if ($selector.length === 0) {
            return false;
        }
        return !$selector.hasClass("disabled");
    },

    /**
     * Set the death UI if the player is death
     */
    testDeath() {
        // Dont show death on non numbered sections (maybe we have not choose the endurance yet)
        const section = new Section(state.book, state.sectionStates.currentSection,
            state.mechanics);
        if (!section.getSectionNumber()) {
            return;
        }

        if (state.actionChart.currentEndurance <= 0 && $("#mechanics-death").length === 0) {

            // Add the death UI
            gameView.appendToSection(mechanicsEngine.getMechanicsUI("mechanics-death"), "afterChoices");

            // Disable all choice links
            mechanicsEngine.setChoiceState("all", true);
            // Disable pick any object
            $("a.equipment-op").addClass("disabled");
            // Disable number picker
            numberPickerMechanics.disable();
            // Disable random table links
            $("a.random").addClass("disabled");

            // Bind restart book link
            $("#mechanics-restart").click( (e) => {
                e.preventDefault();
                if (confirm(translations.text("confirmRestart"))) {
                    setupController.restartBook();
                }
            });

            // If there are pending combats, disable them
            CombatMechanics.hideCombatButtons(null);
        }
    },

    /**
     * Apply the healing discipline on the current section
     */
    healingDiscipline() {
        if (!state.actionChart.hasKaiDiscipline(KaiDiscipline.Healing) &&
            !state.actionChart.hasMgnDiscipline(MgnDiscipline.Curing) &&
            !state.actionChart.hasGndDiscipline(GndDiscipline.Deliverance)) {
            // Only if having healing discipline or loyalty bonus
            return;
        }
        const sectionState = state.sectionStates.getSectionState();
        if (sectionState.combats.length > 0) {
            // Only on sections without combats
            return;
        }
        if (sectionState.healingExecuted) {
            // Already executed
            return;
        }
        sectionState.healingExecuted = true;
        if (state.actionChart.currentEndurance < state.actionChart.getMaxEndurance()) {
            actionChartController.increaseEndurance(+1, true);
        }
    },

    /**
     * Check if this is the last section of the book
     * @param {Section} section The current section
     */
    checkLastSection(section: Section) {

        if (section.sectionId !== state.mechanics.getLastSectionId() ||
            state.book.bookNumber >= projectAon.getLastSupportedBook()) {
            return;
        }

        let $nextBook = $(".bookref");
        if ($nextBook.length === 0) {
            // XML bug with spanish book 4 (and 9, and others???). It has no bookref...
            // Just the first one, spanish book 9 contains two cites
            $nextBook = $("cite").first();
        }

        $nextBook.replaceWith('<a href="#" id="game-nextBook" class="action">' +
            $nextBook.html() + "</a>");
        $("#game-nextBook").click( (e) => {
            e.preventDefault();
            // Move the scroll to the top: The scroll state will be stored when we leave
            // the controller, and we want to start the next book with a scroll y=0
            window.scrollTo(0, 0);
            state.nextBook();
            routing.redirect("setup");
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
    getRuleText(rule: Element | JQuery<HTMLElement>, propertyName: string = null): string {
        if (!propertyName) {
            propertyName = "text";
        }

        const $rule = $(rule);
        let text = $rule.attr(state.language + "-" + propertyName);
        if (!text) {
            // Return the english text
            text = $rule.attr("en-" + propertyName);
        }
        if (!text) {
            text = "";
        }
        return text;
    },

    /**
     * Execute a function for each rule on a section
     * @param {XmlNode} rule The root rule
     * @param {function(XmlNode)} callback The function to execute
     */
    enumerateSectionRules(rule: Element, callback: any) {

        let result = callback(rule);
        if (result === "finish") {
            return "finish";
        } else if (result === "ignoreDescendants") {
            return;
        }

        const childrenRules = $(rule).children();
        for (const childRule of childrenRules.toArray()) {
            result = mechanicsEngine.enumerateSectionRules(childRule, callback);
            if (result === "finish") {
                return "finish";
            }
        }

    },

    /**
     * Drop backpack / special items slots by its index (1-based index)
     * @param $rule The "drop" rule
     * @param property The rule property with the slots to drop
     * @param objectsArray The Action Chart array (the Special Items or BackBackItems)
     * @returns Dropped objects
     */
    dropActionChartSlots($rule: JQuery<Element>, property: string, objectsArray: ActionChartItem[]): ActionChartItem[] {

        // Indices to drop
        const slotIndices: number[] = [];
        for (const itemSlotTxt of mechanicsEngine.getArrayProperty($rule, property)) {

            let slotIndex;
            if (itemSlotTxt === "last") {
                slotIndex = objectsArray.length;
            } else {
                slotIndex = parseInt(itemSlotTxt, 10);
            }
            slotIndex -= 1;

            if (slotIndex >= 0 && objectsArray.length > slotIndex) {
                slotIndices.push(slotIndex);
            }
        }

        // Drop objects
        return actionChartController.dropItemIndicesList(objectsArray, slotIndices);
    },

    appendToInventoryState(newRestorePoint: InventoryState, restorePointId: string) {

        const currentRestorePointObject: any = state.sectionStates.otherStates[restorePointId];
        if (currentRestorePointObject) {
            // Join both
            newRestorePoint.addInventoryToThis(InventoryState.fromObject(currentRestorePointObject));
        }
        state.sectionStates.otherStates[restorePointId] = newRestorePoint.toObject();
    },

    /**
     * Append a message to the section
     * @param msg Message text
     * @param msgId Id to set on the message HTML tag. It's optional
     */
    showMessage(msg: string, msgId: string = null) {

        if (msgId) {
            // Avoid duplicated messages
            if ($(".mechanics-message[id=" + msgId + "]").length > 0) {
                return;
            }
        }

        const $messageUI = mechanicsEngine.getMechanicsUI("mechanics-message");
        if (msgId) {
            $messageUI.attr("id", msgId);
        }
        $messageUI.find("b").text(msg);
        gameView.appendToSection($messageUI);
    },

};
