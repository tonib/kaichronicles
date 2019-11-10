/**
 * The Kai monastery storage controller
 */
const kaimonasteryController = {

    /** Controller name */
    NAME : "kaimonasteryController",

    /**
     * Render page
     */
    index() {

        if ( !setupController.checkBook() ) {
            return;
        }

        if ( state.sectionStates.currentSection !== Book.KAIMONASTERY_SECTION ) {
            // This page should be only available if the current section is KAIMONASTERY_SECTION
            // This is beacause on that section state will be stored the objects info
            routing.redirect("game");
            return;
        }

        views.loadView("kaimonastery.html")
        .then( () => {
            // Go back to the equipment section
            $("#monastery-goback").click( (e: Event) => {
                kaimonasteryController.onGoBackToEquipment(e);
            });

            // Render available objects on the Kai monastery
            mechanicsEngine.showAvailableObjects( true );
        });

    },

    /** Return page */
    getBackController() { return "mainMenu"; },

    /** Go back to the Equipment section clicked */
    onGoBackToEquipment(e: Event) {
        e.preventDefault();

        // Save the Kai monastery inventory to the Action Chart
        state.actionChart.kaiMonasterySafekeeping = state.sectionStates.getSectionState().objects;
        state.persistState();

        // Go back to Equipment section
        state.sectionStates.currentSection = Book.EQUIPMENT_SECTION;
        routing.redirect( "game" );
    },

};
