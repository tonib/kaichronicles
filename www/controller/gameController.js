
/**
 * The game controller
 */
var gameController = {

    /**
     * {Section} The current book section
     */
    currentSection: null,

    /**
     * Setup the game view
     */
    index: function() {

        if( !setupController.checkBook() )
            return;

        views.loadView('game.html')
        .then(function() {
            template.showStatistics(true);
            template.setNavTitle( state.book.getBookTitle() , '#game' , false);
            gameView.setup();
            // Go to the current section (or the initial)
            var sec = state.sectionStates.currentSection;
            if( !sec )
                sec = 'tssf';
            gameController.loadSection(sec);
        });

    },

    /**
     * Load and display a section
     * @param {string} sectionId The section id to display
     * @param {bool} choiceLinkClicked True if the section is load due to a choice link click
     */
    loadSection: function(sectionId, choiceLinkClicked ) {

        // Load and display the section
        var newSection = new Section(state.book, sectionId, state.mechanics);
        if( !newSection.exists() ) {
            console.log("Section " + sectionId + " does not exists" );
            return;
        }
        gameController.currentSection = newSection;

        // Clear previous section toasts:
        toastr.clear();
        
        // Fire choice events:
        if( choiceLinkClicked )
            mechanicsEngine.fireChoiceSelected(sectionId);
        
        // Store the current section id (must to be done BEFORE execute mechanicsEngine.run,
        // there are references to this there)
        state.sectionStates.currentSection = sectionId;

        // Show the section
        gameView.setSectionContent( gameController.currentSection );

        // Update previous / next navigation links
        gameView.updateNavigation( gameController.currentSection );

        // Run section mechanics
        mechanicsEngine.run( gameController.currentSection );
        
        // Bind choice links
        gameView.bindChoiceLinks();

        // Scroll to top
        window.scrollTo(0, 0);

        // Persist state
        state.persistState();

        if( window.getUrlParameter('debug') )
            // Show section that can come to here
            gameView.showOriginSections();
        
    },

    /**
     * Navigate to the previous or next section
     * @param increment -1 to go the previous. +1 to the next
     */
    onNavigatePrevNext: function(increment) {
        var s = gameController.currentSection;
        var newId = ( increment < 0 ? s.getPreviousSectionId() : s.getNextSectionId() );
        gameController.loadSection( newId );
    },

    /** Return page */
    getBackController: function() { return 'mainMenu'; }

};
