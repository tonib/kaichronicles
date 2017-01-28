
/**
 * The game view interface functions
 */
var gameView = {

    /**
     * Enable / disable previous and next section links
     * @param section The current Section
     */
    updateNavigation: function(section) {
        var $navButtons = $('#game-navSectionButtons');
        if( window.getUrlParameter('debug') || section.hasNavigation() )
            $navButtons.show();
        else
            $navButtons.hide();
    },

    enableLink: function( linkId , enabled) {
        var $nextLink = $(linkId);
        if( enabled )
            $nextLink.removeClass('disabled');
        else
            $nextLink.addClass('disabled');
    },

    /** Enable or disable the "next page" link */
    enableNextLink: function(enabled) {
        gameView.enableLink('#game-nextSection', enabled);
    },

    /** Enable or disable the "previous page" link */
    enablePreviousLink: function(enabled) {
        gameView.enableLink('#game-prevSection', enabled);
    },

    /**
     * Set the current section content
     */
    setSectionContent: function( section ) {
        document.title = section.getTitleText();
        $('#game-section-title').html( section.getTitleHtml() );
        $('#game-section').html( section.getHtml() );
        $('#game-aonLink-english').attr('href', section.getSectionAonPage('en') );
        $('#game-aonLink-spanish').attr('href', section.getSectionAonPage('es') );
    },

    /**
     * View setup
     */
    setup: function() {
        
        // Section navigation events
        $('#game-prevSection').click(function(e) {
            e.preventDefault();
            gameController.onNavigatePrevNext(-1);
        });
        $('#game-nextSection').click(function(e) {
            e.preventDefault();
            if( $(this).hasClass('disabled') )
                return;
            gameController.onNavigatePrevNext(+1);
        });

        // Setup debug options
        if( window.getUrlParameter('debug') == 'true' ) {
            $('#game-debugSection').show();

            $('#game-debugJump').submit(function(e) {
                e.preventDefault();
                gameController.loadSection( $('#game-debugNSection').val() );
            });

            $('#game-debugRandomTable').submit(function(e) {
                e.preventDefault();
                randomTable.nextValueDebug = parseInt( $('#game-debugRandomFix').val() );
                console.log( 'Next random table value set to ' + randomTable.nextValueDebug );
                $('#game-debugRandomFix').val('');
            });

            $('#game-resetSection').click(function(e) {
                e.preventDefault();
                state.sectionStates.resetSectionState( state.sectionStates.currentSection );
                gameController.loadSection( state.sectionStates.currentSection );
            });

            $('#game-goDisciplines').click(function(e) {
                e.preventDefault();
                // Keep the current section, to ease the go-back
                $('#game-debugNSection').val( state.sectionStates.currentSection );
                gameController.loadSection( 'discplnz' );
            });
        }

    },

    /**
     * Appends HTML to the current section
     * @param html The HTML to append
     */
    appendToSection: function(html) {

        // Try to add the html before the first choice:
        var $firstChoice = $('p.choice').first();
        if( $firstChoice.length > 0 )
            $firstChoice.before(html);
        else
            // Add to the end
            $('#game-section').append(html);
    },

    /**
     * Bind choice events on current section
     */
    bindChoiceLinks: function() {
        // This MUST to be "live" events and non static because HTML can be replaced by 
        // by game rules 
        $('#game-section').off( 'click' , '.choice a.choice-link' );
        $('#game-section').on( 'click' , '.choice a.choice-link' , function(e) {
            gameView.choiceLinkClicked(e, this);
        });
    },

    choiceLinkClicked: function(e, link) {
        e.preventDefault();
        var section = $(link).attr('data-section');
        console.log('Jump to section ' + section);
        if( section )
            gameController.loadSection( section );
    },

    /**
     * Display origin section. Only for debug
     */
    showOriginSections: function() {

        var sectionIds = state.book.getOriginSections(state.sectionStates.currentSection);
        var linksHtml = '';
        for(var i=0; i<sectionIds.length; i++) {
            // Ignore index of numbered sections
            if( sectionIds[i] == 'numbered' )
                continue;

            if( linksHtml )
                linksHtml += ', ';
            linksHtml += '<a href="#" class="action choice-link" data-section="' + 
                sectionIds[i] + '">' + sectionIds[i] + '</a>';
        }
        $('#game-sourceSections').html( linksHtml );
        $('#game-sourceSections a').click(function(e) {
            gameView.choiceLinkClicked(e, this);
        });
    },

    animateValueChange: function( $element , newValue , doNotAnimate , newColor ) {
        var txtNewValue = newValue.toString();
        if( $element.text() == txtNewValue )
            return;

        if( doNotAnimate ) {
            $element.text( txtNewValue );
            $element.css('color', newColor ? newColor : '' );
        }
        else {
            var miliseconds = 500;
            var currentValue = parseInt( $element.text() );
            $element.css('color', newValue < currentValue ? 'red' : 'green' );
            $element.fadeOut(miliseconds, function() {
                $(this).css('color', newColor ? newColor : '');
                $(this).text( txtNewValue ).fadeIn(miliseconds);
            });
        }
    }

};
