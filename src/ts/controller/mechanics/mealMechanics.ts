
/**
 * Meal mechanics
 */
const mealMechanics = {

    /** Run meals rule */
    runRule(rule: Element) {

        if (state.sectionStates.ruleHasBeenExecuted(rule)) {
            // Execute only once
            return;
        }

        // Get the UI id for the meal
        let id = "mechanics-meal";
        const txtIndex = $(rule).attr("index");
        if (txtIndex) {
            id += "-" + txtIndex;
        }

        // The jquery current meal selector
        const mealSelector = "#" + id;

        // If the meal UI is already on the section, recreate the UI
        if ($(mealSelector).length > 0) {
            $(mealSelector).remove();
        }

        // Get a copy of the meal UI
        const $meal = mechanicsEngine.getMechanicsUI("mechanics-meal");
        $meal.attr("id", id);

        // Set the radio inputs id
        let mealOptionId = "mechanics-mealOption";
        if (txtIndex) {
            mealOptionId += "-" + txtIndex;
            $meal.find("input[name=mechanics-mealOption]").attr("name", mealOptionId);
        }

        // Add the UI to the section
        gameView.appendToSection($meal);

        // Check if hunting discipline is available
        const huntDisabled = $(rule).attr("huntDisabled") === "true";
        const hasHuntingDiscipline = state.actionChart.disciplines.contains("hunting") ||
            state.actionChart.disciplines.contains("hntmstry");
        if (!hasHuntingDiscipline || !state.sectionStates.huntEnabled || huntDisabled) {
            $(mealSelector + " .mechanics-eatHunt").hide();
        }

        // Check if there are meals on the backpack
        if (state.actionChart.meals <= 0) {
            $(".mechanics-eatMeal").hide();
        } else {
            $(".mechanics-eatMeal").show();
        }

        // Check if you can buy a meal
        const priceValue = $(rule).attr("price");
        let price = 0;
        if (priceValue) {
            price = parseInt(priceValue, 10);
            $(mealSelector + " .mechanics-mealPrice").text(price);
        } else {
            $(mealSelector + " .mechanics-buyMeal").hide();
        }

        // Get meal objects on backpack (ex. "laumspurmeal")
        const $mealObjectTemplate = $(mealSelector + " .mechanics-eatObject").clone();
        $(mealSelector + " .mechanics-eatObject").remove();
        $.each(state.actionChart.getMealObjects(), (index, objectId) => {
            const o = state.mechanics.getObject(objectId);
            const $mealObject = $mealObjectTemplate.clone();
            $mealObject.find(".mechanics-eatDescription").text(o.name);
            $mealObject.find("input").val(o.id);
            $(mealSelector + " .mechanics-eatDoNotEat").before($mealObject);
        });

        // Set the default value
        $(mealSelector + " input:visible").first().prop("checked", true);

        // Disable choices:
        mechanicsEngine.setChoiceState("all", true);

        // Button event handler
        $(mealSelector + " button").click((e) => {
            e.preventDefault();

            const option = $(mealSelector + " input[name=" + mealOptionId + "]:checked").val();
            if (option === "meal") {
                actionChartController.drop("meal", false);
            } else if (option === "doNotEat") {
                actionChartController.increaseEndurance(-3);
            } else if (option === "hunting") {
                // Do nothing
            } else if (option === "buyMeal") {
                // Buy the meal
                if (state.actionChart.beltPouch < price) {
                    alert(translations.text("noEnoughMoney"));
                    return;
                }
                actionChartController.increaseMoney(-price);
            } else {
                // Eat object (option is the object id)
                const item = state.mechanics.getObject(option);
                if (item && item.usage) {
                    // Use / eat the object
                    actionChartController.use(option, true);
                } else {
                    // Drop the selected object
                    actionChartController.drop(option, false);
                }
            }

            // Mark the rule as executed
            state.sectionStates.markRuleAsExecuted(rule);

            // Enable section choices, and re-execute section rules to disable not available
            // choices
            mechanicsEngine.setChoiceState("all", false);
            mechanicsEngine.runSectionRules(true);

            // Remove UI
            $(mealSelector).remove();

        });
    },

    /**
     * Return true if there are pending meals on the section
     */
    arePendingMeals() {
        return $(".mechanics-meal-ui").length > 0;
    }

};
