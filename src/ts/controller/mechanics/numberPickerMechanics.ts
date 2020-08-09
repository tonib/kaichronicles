import { mechanicsEngine, state, gameView } from "../..";

/**
 * Tool to select a number (or an amount of money)
 */
export const numberPickerMechanics = {

    /**
     * numberPicker rule execution
     */
    numberPicker(rule: any) {

        if ($(rule).attr("enabled") === "false") {
            // Disable the money picker
            numberPickerMechanics.disable();
            return;
        }

        // The number picker UI
        const $ui = mechanicsEngine.getMechanicsUI("mechanics-numberpicker");

        // Check if it's a money picker
        if ($(rule).attr("money") === "true") {
            $ui.find("#mechanics-mpAmount").attr("data-ismoneypicker", "true");
        }

        // Check if it has an action button
        const actionButtonTitle = mechanicsEngine.getRuleText(rule, "actionButton");
        if (actionButtonTitle) {
            const $pickNumberButton = $ui.find("#mechanics-picknumber");
            $pickNumberButton.show().text(actionButtonTitle);
            numberPickerMechanics.bindButtonActionEvent($pickNumberButton, () => {
                if (mechanicsEngine.fireNumberPickerChoosed()) {
                    // Store that the picker action has been fired
                    const sectionState = state.sectionStates.getSectionState();
                    sectionState.numberPickersState.actionFired = true;
                }
            });
        }

        // Add HTML to do the choose
        gameView.appendToSection($ui);

        // Set the title
        $("#mechanics-mpTitle").text(mechanicsEngine.getRuleText(rule));

        // Bind number picker events
        $("#mechanics-mpAmount").bindNumberEvents();

        // Set the minimum value
        const min = $(rule).attr("min");
        if (min) {
            $("#mechanics-mpAmount").attr("min", min);
        }

        // Set the maximum value
        const max = $(rule).attr("max");
        if (max) {
            $("#mechanics-mpAmount").attr("max", max);
        }

        // Initialize (or restore) the value
        $("#mechanics-mpAmount").initializeValue();

    },

    /** Return true if the action button has been already clicked  */
    actionButtonWasClicked(): boolean {
        const sectionState = state.sectionStates.getSectionState();
        return sectionState.numberPickersState.actionFired === true;
    },

    bindButtonActionEvent($pickNumberButton: any, callback: () => void) {

        if (!$pickNumberButton) {
            $pickNumberButton = $("#mechanics-picknumber");
        }

        $pickNumberButton.click((e) => {
            e.preventDefault();
            callback();
        });

    },

    hideButtonActionEvent() {
        $("#mechanics-picknumber").hide();
    },

    /**
     * Return true if the money picker value is valid
     */
    isValid(): boolean {
        const $picker = $("#mechanics-mpAmount");

        // If the money picker has been disabled, dont check it
        if (!$picker.isEnabled()) {
            return true;
        }

        if ($picker.length > 0) {
            return $picker.isValid();
        } else {
            return true;
        }
    },

    /**
     * Get the number picker value
     */
    getNumberPickerValue(): number {
        try {
            const $picker = $("#mechanics-mpAmount");
            if ($picker.length > 0) {
                return $picker.getNumber();
            } else {
                return 0;
            }
        } catch (e) {
            return 0;
        }
    },

    /**
     * Disable the money picker
     */
    disable() {
        $("#mechanics-mpAmount").setEnabled(false);
        $("#mechanics-picknumber").prop("disabled", true);
    }

};
