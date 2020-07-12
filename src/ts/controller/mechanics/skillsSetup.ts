
/**
 * Player characteristics setup
 */
class SkillsSetup {

    /**
     * Choose player skills UI
     */
    public static setSkills() {

        // Add mechanics info, only for first played book
        if (state.getPreviousBookActionChart(state.book.bookNumber - 1) == null) {
            gameView.appendToSection(mechanicsEngine.getMechanicsUI("mechanics-actionChartInfo"), "afterTitle");
        }

        // If the skills are already set, do nothing
        if (state.actionChart.combatSkill !== 0 && state.actionChart.endurance !== 0) {
            return;
        }

        // Add HTML to do the choose
        gameView.appendToSection(mechanicsEngine.getMechanicsUI("mechanics-setSkills"));

        // Disable next link
        gameView.enableNextLink(false);

        // Book language inconsistencies: Spanish books say "ignore zero", english does not.
        // Starting from book 13 (Grand Master), Spanish books allow zero:
        const ignoreZero = ( state.book.language === "es" && state.book.bookNumber < 13 );

        // Combat skill
        if (state.actionChart.combatSkill !== 0) {
            $("#mechanics-detWeapon").hide();
        } else {
            const $w = $("#mechanics-chooseWeapon");
            randomMechanics.bindTableRandomLink($w, (value) => {
                state.actionChart.combatSkill = value + state.book.getBookSeries().baseCombatSkill;
                $w.parent().append("<b>" + translations.text("combatSkillSet", [state.actionChart.combatSkill]) + ".</b>");
                template.updateStatistics();
                if (state.actionChart.combatSkill !== 0 && state.actionChart.endurance !== 0) {
                    gameView.enableNextLink(true);
                }
            }, ignoreZero, false);
        }

        // Endurance points
        if (state.actionChart.endurance !== 0) {
            $("#mechanics-detEndurance").hide();
        } else {
            const $e = $("#mechanics-chooseEndurance");
            randomMechanics.bindTableRandomLink($e, (value) => {
                state.actionChart.endurance = value + state.book.getBookSeries().baseEndurance;
                state.actionChart.currentEndurance = state.actionChart.endurance;
                $e.parent().append("<b>" + translations.text("enduranceSet", [state.actionChart.endurance]) + ".</b>");
                template.updateStatistics();
                if (state.actionChart.combatSkill !== 0 && state.actionChart.endurance !== 0) {
                    gameView.enableNextLink(true);
                }
            }, ignoreZero, false);
        }

    }
}
