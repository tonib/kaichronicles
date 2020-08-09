import { state, BookSeriesId, gameView, mechanicsEngine, translations, actionChartController, template, gameController } from "../..";


/** Upgrade stats at Grand Master beginning */
export class GrandMasterUpgrade {

    public static upgrade(rule: Element) {

        // Upgrade only applies if player has played any Magnakai book:
        if (state.actionChart.getDisciplines(BookSeriesId.Magnakai).length === 0) {
            return;
        }

        // If upgrade has been executed, do nothing
        if ( state.sectionStates.ruleHasBeenExecuted(rule) ) {
            return;
        }

        // Add HTML to do the choice
        gameView.appendToSection(mechanicsEngine.getMechanicsUI("mechanics-gmupgrade"));

        // Set the default value
        $("#mechanics-gmupgrade input").first().prop("checked", true);
        $("#mechanics-gmupgrade-button").prop("disabled", true);

        // Choice changed
        $("#mechanics-gmupgrade input").click((e: Event) => {
            const disabled = $(e.currentTarget).attr("value") === "same";
            $("#mechanics-gmupgrade-button").prop("disabled", disabled);
        });

        // Upgrade button clicked
        $("#mechanics-gmupgrade-button").click((e: Event) => { GrandMasterUpgrade.doUpgrade(rule); });
    }

    private static doUpgrade(rule: Element) {
        if (!confirm( translations.text("gmupgrade-confirm"))) {
            return;
        }

        const option: string = $("#mechanics-gmupgrade input[name=mechanics-gmupgrade-option]:checked").val();
        if (option === "reroll-nobonus") {
            state.actionChart.combatSkill = 0;
            state.actionChart.endurance = 0;
            state.actionChart.currentEndurance = 0;
            state.actionChart.setDisciplines([], BookSeriesId.Kai);
            state.actionChart.setDisciplines([], BookSeriesId.Magnakai);

        } else if (option === "reroll") {
            state.actionChart.combatSkill = 0;
            state.actionChart.endurance = 0;
            state.actionChart.currentEndurance = 0;

        } else if (option === "increasestats") {
            state.actionChart.combatSkill += 15;
            state.actionChart.endurance += 10;
            state.actionChart.currentEndurance += 10;

        } else if (option === "newplayer") {
            state.actionChart.combatSkill = 0;
            state.actionChart.endurance = 0;
            state.actionChart.currentEndurance = 0;
            state.actionChart.setDisciplines([], BookSeriesId.Kai);
            state.actionChart.setDisciplines([], BookSeriesId.Magnakai);
            actionChartController.drop("all");
            state.actionChart.hasBackpack = true;
        }

        template.updateStatistics();

        // Mark rule as executed
        state.sectionStates.markRuleAsExecuted(rule);

        // Re-render the section
        gameController.loadSection(state.sectionStates.currentSection, false, window.pageYOffset);

        toastr.info(translations.text("gmupgrade-applied"));
    }
}