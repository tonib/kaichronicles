
/**
 * Game rules controller
 */
var gameRulesController = {

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
        });
    },

    appendSection: function(sectionId) {
        var section = new Section( state.book , sectionId , state.mechanics );
        var renderer = new SectionRenderer( section );
        var $content = $('#rules-content');
        $content.append( '<h2>' + section.getTitleHtml() + '</h2>' );
        $content.append( renderer.renderSection() );
    },

    /** Return page */
    getBackController: function() { return 'settings'; }

};
