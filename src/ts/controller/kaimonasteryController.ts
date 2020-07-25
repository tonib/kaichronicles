/**
 * The Kai monastery storage controller
 */
// tslint:disable-next-line: class-name
class kaimonasteryController {

    /** Controller name */
    public static readonly NAME = "kaimonasteryController";

    /**
     * Render page
     */
    public static index() {

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

    }

    /** Go back to the Equipment section clicked */
    private static onGoBackToEquipment(e: Event) {
        e.preventDefault();

        // Save the Kai monastery inventory to the Action Chart
        state.actionChart.kaiMonasterySafekeeping = state.sectionStates.getSectionState().objects;
        state.persistState();

        // Go back to Equipment section
        state.sectionStates.currentSection = Book.EQUIPMENT_SECTION;
        routing.redirect( "game" );
    }

    /** Remove any Special Item non allowed in Grand Master from Kai Monastery. */
    public static removeSpecialGrandMaster() {
        const kaiMonasterySection = state.sectionStates.getSectionState(Book.KAIMONASTERY_SECTION);

        // Remove any non allowed Special Item
        kaiMonasterySection.objects = kaiMonasterySection.objects.filter( (sectionItem: SectionItem) => {
            const item = state.mechanics.getObject(sectionItem.id);
            if (!item) {
                return false;
            }
            if (item.type !== Item.SPECIAL) {
                return true;
            }
            return Item.ALLOWED_GRAND_MASTER.contains(sectionItem.id);
        });

        // Update action chart
        state.actionChart.kaiMonasterySafekeeping = kaiMonasterySection.objects;
    }

    /** Return page */
    public static getBackController() { return "mainMenu"; }

}
