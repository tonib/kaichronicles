
/**
 * Class to store book sections states
 * TODO: Remove all members that call to this.getSectionState(). They should be
 * TODO: called directly from SectionState
 */
class BookSectionStates {

    /** The current section id */
    public currentSection : string = null;

    /** 
     * Visited section states. The key is the section id (string), and the value
     * is a SectionState instance 
     */
    public sectionStates : { [ sectionId : string ] : SectionState } = {};

    /**
     * Hunting discipline enabled?
     */
    public huntEnabled : boolean = true;

    /**
     * Other states
     */
    public otherStates = {};

    /**
     * Global rules to run on each section
     */
    public globalRulesIds = [];

    /**
     * Get the current section state. If it does not exists, it will be created
     * @return The section state
     */
    public getSectionState() : SectionState {
        var sectionState = this.sectionStates[ this.currentSection ];
        if( !sectionState ) {
            sectionState = new SectionState();
            this.sectionStates[ this.currentSection ] = sectionState;
        }
        return sectionState;
    }

    /**
     * Remove an object from the current section
     * @param {string} objectId Object id to remove
     */
    public removeObjectFromSection(objectId : string) {
        var sectionState = this.getSectionState();
        sectionState.removeObjectFromSection( objectId );
    }

    /**
     * Clear some section state
     * @param {string} sectionId The section id to clear
     */
    public resetSectionState(sectionId : string) {
        this.sectionStates[ sectionId ] = null;
    }

    /**
     * Add a combat skill bonus to the current section combats by an object usage.
     * @param combatSkillModifier The combat skill increase
     */
    public combatSkillUsageModifier( combatSkillModifier : number ) {
        const sectionState = this.getSectionState();
        // Apply the modifier to current combats:
        $.each(sectionState.combats, function(index, combat) {
            combat.objectsUsageModifier += combatSkillModifier;
        });
    }

    /**
     * Check if a rule has been executed on the current section
     * @param rule Rule to check
     * @return The object associated with the execution. true if there was no result stored
     */
    public ruleHasBeenExecuted(rule) : boolean {
        return this.getSectionState().ruleHasBeenExecuted(rule);
    }

    /**
     * Mark a rule as executed on the current section
     * @param rule The executed rule
     * @param executionState The state to associate with the execution. If it's null,
     * if will be set to true
     */
    public markRuleAsExecuted( rule, executionState : any = true ) {
        this.getSectionState().markRuleAsExecuted( rule, executionState );
    }

    /**
     * Setup combat states on the current section
     * @param section The current section info 
     */
    public setupCombats( section : Section ) {
        var sectionState = this.getSectionState();
        if( sectionState.combats.length === 0 ) {
            var combats = section.getCombats();
            if( combats.length > 0 )
                sectionState.combats = combats;
        }
    }

    public fromStateObject(stateObject) {

        this.currentSection = stateObject.currentSection;
        this.huntEnabled = stateObject.huntEnabled;

        // Replace generic objects by the needed objects
        this.sectionStates = {};
        var self = this;
        $.each( stateObject.sectionStates , function( sectionId , s ) {
            var sectionState = $.extend( new SectionState() , s );
            self.sectionStates[ sectionId ] = sectionState; 

            // Restore combats
            var combats = [];
            $.each( sectionState.combats , function( index , combat ) {
                var rightCombat = $.extend( new Combat( '' , 0 , 0 ) , combat );
                combats.push( rightCombat );
                
                // Restore combat turns
                var turns = [];
                $.each( rightCombat.turns , function( index , turn ) {
                    turns.push( $.extend( new CombatTurn(null, 0, false) , turn ) );
                });
                rightCombat.turns = turns;
            });
            sectionState.combats = combats;
        });

        // Other states initialization. Be sure it's not null (created on v1.3)
        this.otherStates = stateObject.otherStates;
        if( !this.otherStates )
            this.otherStates = {};
            
        // Global rules. Be sure it's not null (created on v1.4)
        this.globalRulesIds = stateObject.globalRulesIds;
        if( !this.globalRulesIds )
            this.globalRulesIds = [];
            
    }

    public sectionIsVisited(sectionId) : boolean {
        return this.sectionStates[sectionId] ? true : false;
    }

}
