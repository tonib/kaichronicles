/// <reference path="../../external.ts" />

/** 
 * Player characteristics setup
 */
class SkillsSetup {

    /**
     * Choose player skills UI
     */
    public static setSkills() {
        // If the skills are already set, do nothing
        if( state.actionChart.combatSkill !== 0 && state.actionChart.endurance !== 0 )
            return;

        // Add HTML to do the choose
        gameView.appendToSection( mechanicsEngine.getMechanicsUI('mechanics-setSkills') );

        // Disable next link
        gameView.enableNextLink(false);

        // Book language inconsistencies: Spanish books say "ignore zero", english does not
        var ignoreZero = ( state.book.language == 'es' );

        // Combat skill
        if( state.actionChart.combatSkill !== 0 )
            $('#mechanics-detWeapon').hide();
        else {
            var $w = $('#mechanics-chooseWeapon');
            randomMechanics.bindTableRandomLink( $w , function(value) {
                state.actionChart.combatSkill = value + (state.book.isGrandMasterBook() ? 25 : 10);
                $w.parent().append( '<b>' + translations.text('combatSkillSet' , [state.actionChart.combatSkill] ) + '.</b>' );
                template.updateStatistics();
                if( state.actionChart.combatSkill !== 0 && state.actionChart.endurance !== 0 )
                    gameView.enableNextLink(true);
            }, ignoreZero, false);
        }
        
        // Endurance points
        if( state.actionChart.endurance !== 0 )
            $('#mechanics-detEndurance').hide();
        else {
            var $e = $('#mechanics-chooseEndurance');
            randomMechanics.bindTableRandomLink( $e , function(value) {
                state.actionChart.endurance = value + (state.book.isGrandMasterBook() ? 30 : 20);
                state.actionChart.currentEndurance = state.actionChart.endurance;
                $e.parent().append('<b>' + translations.text('enduranceSet' , [state.actionChart.endurance]) + '.</b>' );
                template.updateStatistics();
                if( state.actionChart.combatSkill !== 0 && state.actionChart.endurance !== 0 )
                    gameView.enableNextLink(true);
            }, ignoreZero, false);
        }

    }
}
