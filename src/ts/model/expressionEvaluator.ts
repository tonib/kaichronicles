
/**
 * Evaluation of mechanics expressions
 */
class ExpressionEvaluator {

    /**
     * Expression to find texts to replace
     * Matches anything between "[" and "]", both included
     */
    private static replacementsRegex : RegExp = /\[[^\]]*\]/g;

    /**
     * Dictionary of functions to do the replacements.
     * Key is the keyword to replace, and the value is the function that returns the replacement
     */
    private static replacementFunctions : { [ keyword : string ] : () => number } = {

        // Last random value
        '[RANDOM]' : function() { 
            return randomMechanics.lastValue;
        },

        // Last combat random value
        '[COMBATRANDOM]' : function() { 
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.getLastRandomCombatTurn();
        },

        // Money on the belt pouch
        '[MONEY]' : function() { 
            return state.actionChart.beltPouch;
        },

        // Money available on the section
        '[MONEY-ON-SECTION]' : function() { 
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.getAvailableMoney();
        },

        // Backpack items on section (includes meals)
        '[BACKPACK-ITEMS-CNT-ON-SECTION]' : function() { 
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.getCntSectionObjects('object');
        },

        // Backpack items on section (includes meals)
        '[BACKPACK-ITEMS-CNT-ON-ACTIONCHART]' : function() { 
            return state.actionChart.getNBackpackItems();
        },

        // This does NOT include special items:
        '[WEAPON-ITEMS-CNT-ON-SECTION]' : function() { 
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.getCntSectionObjects('weapon');
        },

        // This does NOT include special items:
        '[WEAPON-ITEMS-CNT-ON-ACTIONCHART]' : function() { 
            return state.actionChart.weapons.length;
        },

        // This includes special items
        '[WEAPONLIKE-CNT-ON-SECTION]' : function() { 
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.getWeaponObjects().length;
        },

        // This includes special items
        '[WEAPONLIKE-CNT-ON-ACTIONCHART]' : function() { 
            return state.actionChart.getWeaponObjects().length;
        },

        // Count of special items on section
        '[SPECIAL-ITEMS-ON-SECTION]' : function() { 
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.getCntSectionObjects('special');
        },

        // Count of special items on on action chart
        '[SPECIAL-ITEMS-ON-ACTIONCHART]' : function() { 
            return state.actionChart.specialItems.length;
        },

        // Current endurance
        '[ENDURANCE]' : function() { 
            return state.actionChart.currentEndurance;
        },

        '[MAXENDURANCE]' : function() { 
            return state.actionChart.getMaxEndurance();
        },

        '[ORIGINALCOMBATSKILL]' : function() { 
            return state.actionChart.combatSkill; 
        },

        '[COMBATSENDURANCELOST]' : function() { 
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.combatsEnduranceLost('player');
        },

        '[COMBATSENEMYLOST]' : function() { 
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.combatsEnduranceLost('enemy');
        },

        '[ENEMYENDURANCE]' : function() { 
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.getEnemyEndurance();
        },

        // Number of meals on the backpack
        '[MEALS]': function() {
            return state.actionChart.meals;
        },

        // Player current number of disciplines
        '[KAILEVEL]' : function() { 
            return state.actionChart.disciplines.length;
        },

        '[NUMBERPICKER]' : function() { 
            return numberPickerMechanics.getNumberPickerValue();
        },

        '[COMBATSDURATION]': function() { 
            const sectionState = state.sectionStates.getSectionState();
            return sectionState.combatsDuration();
        },

        '[BOWBONUS]' : function() {
            return state.actionChart.getBowBonus();
        },

        // Current number of arrows
        '[ARROWS]' : function() { 
            return state.actionChart.arrows;
        },

        // Extra randoms
        '[RANDOM0]' : function() { return randomMechanics.getRandomValueChoosed(0); },
        '[RANDOM1]' : function() { return randomMechanics.getRandomValueChoosed(1); },
        '[RANDOM2]' : function() { return randomMechanics.getRandomValueChoosed(2); }

    };

    /**
     * Get keywords contained on an expression
     * @param expression Expression where to find keywords
     * @returns Keywords found
     */
    public static getKeywords( expression : string ) : Array<string> {

        const repeatedKeywords = expression.match( ExpressionEvaluator.replacementsRegex );
        if( !repeatedKeywords ) 
            return [];

        let keywords : Array<string> = [];
        for( let keyword of repeatedKeywords ) {
            if( !keywords.contains(keyword) )
                keywords.push( keyword );
        }
        return keywords;
    }

    /**
     * Replace keywords by its values
     * @param expression Expression where to replace keywords
     * @returns The expression with the replaced values
     */
    private static doReplacements( expression : string ) : string {
        for( let keyword of ExpressionEvaluator.getKeywords(expression) ) {
            let replacement;
            const functionReplacer = ExpressionEvaluator.replacementFunctions[ keyword ];
            if( !functionReplacer ) {
                mechanicsEngine.debugWarning( 'Unknown keyword on expression: ' + keyword );
                replacement = '0';
            }
            else
                replacement = functionReplacer().toString();
            expression = expression.replaceAll( keyword , replacement );
        }
        return expression;
    }

    /**
     * Replaces keywords and evaluates an expression
     * @param expression Expression to evaluate
     * @returns The expression value
     */
    private static eval( expression : string ) : any {
        try {
            expression = ExpressionEvaluator.doReplacements( expression );
            return eval( expression );
        }
        catch(e) {
            mechanicsEngine.debugWarning("Error evaluating expression " + expression + ": " + e);
            return null;
        }
    }

    /**
     * Check if a keyword is valid
     * @param keyword Keyword to check
     * @returns True if it's valid
     */
    public static isValidKeyword( keyword : string ) : boolean {
        if( ExpressionEvaluator.replacementFunctions[ keyword ] )
            return true;
        else
            return false;
    }

    /**
     * Evaluates a boolean expression
     * @param expression Expression to evaluate
     * @returns The expression value
     */
    public static evalBoolean( expression : string ) : boolean {
        return ExpressionEvaluator.eval( expression );
    }

    /**
     * Evaluates an integer expression
     * @param expression Expression to evaluate
     * @returns The expression value
     */
    public static evalInteger( expression : string ) : number {
        return Math.floor( ExpressionEvaluator.eval( expression ) );
    }
    
}
