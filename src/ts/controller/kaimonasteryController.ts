/// <reference path="../external.ts" />

/**
 * The map controller
 */
const kaimonasteryController = {
    
        /**
         * Render page
         */
        index: function() {
    
            if( !setupController.checkBook() )
                return;
    
            views.loadView('kaimonastery.html')
            .then(function() {

                // Go back to the equipment section
                $('#monastery-goback').click( function(e : Event) {
                    e.preventDefault();
                    state.sectionStates.currentSection = Book.EQUIPMENT_SECTION;
                    routing.redirect( 'game' );
                });

                // Render available objects on the Kai monastery
                mechanicsEngine.showAvailableObjects( true );
            });
            
        },
    
        /** Return page */
        getBackController: function() { return 'game'; }
        
    };
    