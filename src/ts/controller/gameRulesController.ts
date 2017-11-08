/// <reference path="../external.ts" />

/**
 * Game rules controller
 */
const gameRulesController = {
    
    /**
     * Render the game rules page
     */
    index: function() {

        if( !setupController.checkBook() )
            return;
        
        document.title = translations.text('gameRules');
        views.loadView('gameRules.html')
        .then(function() {
            
            // Push game rules sections:
            gameRulesController.appendSection( 'crsumary' );
            gameRulesController.appendSection( 'levels' );
            gameRulesController.appendSection( 'howcarry'  );
            gameRulesController.appendSection( 'howuse' );
            if( state.book.isMagnakaiBook() )
                // Lore-circles rules
                gameRulesController.appendSection( 'lorecrcl' );

            // Bind combat table links
            gameView.bindCombatTablesLinks();

            // If a section parameter was specified, scroll to that section
            try {
                const section : string = routing.getHashParameter('section');
                if( section )
                    window.scrollTo( 0 , $('a[id='+ section + ']').offset().top - 65 );
            }
            catch(e) {
                console.log(e);
            }
        });
    },

    appendSection: function( sectionId : string ) {

        var section = new Section( state.book , sectionId , state.mechanics );
        var renderer = new SectionRenderer( section );
        
        // Add a target anchor
        let html = '<a id="' + sectionId + '"></a>';
        html += '<h2>' + section.getTitleHtml() + '</h2>';
        html += renderer.renderSection();

        $('#rules-content').append( html );
    },

    /** Return page (the caller) */
    getBackController: function() { return null; }

};
