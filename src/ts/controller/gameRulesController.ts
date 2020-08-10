import { setupController, translations, views, Book, state, BookSeriesId, gameView, routing, Section, SectionRenderer, mechanicsEngine } from "..";

/**
 * Game rules controller
 */
export const gameRulesController = {

    /**
     * Render the game rules page
     */
    index() {

        if ( !setupController.checkBook() ) {
            return;
        }

        document.title = translations.text("gameRules");
        views.loadView("gameRules.html")
        .then(() => {

            // Push game rules sections:
            gameRulesController.appendSection( Book.COMBATRULESSUMMARY_SECTION );
            gameRulesController.appendSection( Book.KAILEVELS_SECTION );

            if (state.book.getBookSeries().id === BookSeriesId.Magnakai) {
                // Lore-circles rules
                gameRulesController.appendSection( Book.LORECIRCLES_SECTION );
                // Improved disciplines
                gameRulesController.appendSection( Book.IMPROVEDDISCIPLINES_SECTION );
            }

            gameRulesController.appendSection( Book.HOWTOCARRY_SECTION );
            gameRulesController.appendSection( Book.HOWTOUSE_SECTION );

            // Bind combat table links
            gameView.bindCombatTablesLinks();

            // If a section parameter was specified, scroll to that section
            try {
                const section: string = routing.getHashParameter("section");
                if ( section ) {
                    window.scrollTo( 0 , $("a[id=" + section + "]").offset().top - 65 );
                }
            } catch (e) {
                mechanicsEngine.debugWarning(e);
            }
        });
    },

    appendSection( sectionId: string ) {

        const section = new Section( state.book , sectionId , state.mechanics );
        const renderer = new SectionRenderer( section );

        // Add a target anchor
        let html = '<a id="' + sectionId + '"></a>';
        html += "<h2>" + section.getTitleHtml() + "</h2>";
        html += renderer.renderSection();

        $("#rules-content").append( html );
    },

    /** Return page (the caller) */
    getBackController() { return null; }

};
