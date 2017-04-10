/**
 * The HTML template API
 */
var template = {

    /**
     * Set the navbar title and target URL
     * @param {String} title The title to put on the navigation bar
     * @param {String} url The target URL for the title on the nav. bar
     * @param {bool} showTitleOnSmallDevs True if the main title should be shown on
     * small devices.
     */
    setNavTitle: function(title, url, showTitleOnSmallDevs ) { 
        // Update the title
        $('#template-title').text(title);
        $('#template-title').attr('href', url);
        $('#template-img-logo').attr('href', url);

        var $title = $('#template-title');
        if( showTitleOnSmallDevs )
            $title.removeClass('hidden-xs hidden-sm');
        else
            $title.addClass('hidden-xs hidden-sm');
            
    },

    /**
    * Hightlight the active navigation bar link
    */
    highlightActiveLink: function() {
        $('#template-header a, #template-header li').removeClass('active');
        var $actives = $('#template-header a[href="#' + 
            routing.normalizeHash(location.hash) + '"]');
        $actives.each(function(index, link) {
            var $link = $(link);
            // Bootstrap puts the class 'active' on the parent of the link
            // But I want to remark the "brand" link too, so put it on both
            $link.parent().filter('li').addClass('active');
            $link.addClass('active');
        });
    },

    /**
     * Setup navigation bar
     */
    setup: function() {

        // Hide the bootstrap menu when some menu option is clicked, or when
        // the content is clicked
        $('#template-header a, #template-container').click(function(){
            template.collapseMenu();
        });
        $('#template-statistics').click(function() {
            routing.redirect('actionChart');
        });
        template.updateStatistics(true);
        template.translateMainMenu();

        if( cordovaApp.isRunningApp() ) {
            // If we are on the cordova app, disable the animation (performance)
            $('#navbar').addClass('no-transition');

            // Link not needed: You have the "back" hardware button
            $('#template-mainMenu').hide();
        }
    },

    /**
    * Hide statistics on navigation bar
    */
    showStatistics: function(show) {
        if( show ) {
            $('#navbar-content').show();
            $('#template-menubutton').removeClass( 'hideImportant' );
            template.updateStatistics();
        }
        else {
            $('#navbar-content').hide();
            $('#template-statistics').hide();
            $('#template-menubutton').addClass( 'hideImportant' );
        }
    },

    /**
     * Update player statistics
     */
    updateStatistics: function(doNotAnimate) {

        // Update statistics
        if( !state.actionChart || 
            ( state.actionChart.combatSkill === 0 && state.actionChart.endurance === 0 ) ) {
            $('#template-statistics').hide();
            $('#template-map').hide();
        }
        else {
            $('#template-statistics').show();
            $('#template-combatSkill').text( state.actionChart.getCurrentCombatSkill() );
            template.animateValueChange( $('#template-endurance') , 
            state.actionChart.currentEndurance , doNotAnimate , 
            state.actionChart.currentEndurance > 0 ? null : 'red' );

            // Update map link
            if( state.actionChart.hasObject('map') )
            $('#template-map').show();
            else
            $('#template-map').hide(); 
        }
    },

    /**
     * Return true if the template menu is expanded
     */
    isMenuExpanded: function() { 
        return $('#template-menubutton').attr('aria-expanded') == 'true'; 
    },

    /**
     * Collapse the template menu
     */
    collapseMenu: function() { $('#navbar').collapse('hide'); },

    /**
     * Show an HTML view
     * @param {DOM} viewContent The view to show
     */
    setViewContent: function(viewContent) {
        $('#body').html(viewContent);
        // Scroll to top
        window.scrollTo(0, 0);
        template.highlightActiveLink();
    },

    /**
     * Display an error
     */
    setErrorMessage: function(msg) {
        template.setViewContent('<p style="color: red">' + msg + '</p>');
    },
    
    /**
     * Show dialog with object details
     * @param {Item} o The object to show
     */
    showObjectDetails: function(o) {
        if( !o )
            return;

        // Translate the dialog
        translations.translateTags( $('#template-objectDetails') );

        $('#template-objectTitle').text( o.name );
        if( !o.imageUrl )
            $('#template-objectImage').hide();
        else {
            $('#template-objectImage').show();
            $('#template-objectImage img').attr('src' , o.imageUrl);
        }
        $('#template-objectDescription').text(o.description);
        $('#template-objectDetails').modal('show');
    },

    /**
     * Change a number value by other, with an animation. On the Cordova app, the
     * change will not be animated (performance...)
     * @param {jQuery} $element Element selector to change
     * @param {number} newValue The new value to set
     * @param {bool} doNotAnimate True if we should do not perform the animation
     * @param {string} newColor The final HTML color of the element. If it's null, the default
     * color for the DOM element will be used
     */
    animateValueChange: function( $element , newValue , doNotAnimate , newColor ) {

        // Disable animations on Cordova app (bad performance)
        if( cordovaApp.isRunningApp() )
            doNotAnimate = true;
        else
            // Clear previous animations
            $element.stop(true, true);

        // If the value is not going to change, do nothing
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
    },

    translateMainMenu: function() {
        translations.translateTags( $('#template-header') );
    },

    /**
     * Show the dialog with the combat tables
     */
    showCombatTables: function() {
        // Translate the dialog
        translations.translateTags( $('#template-combatTables') );
        
        // Set the translated images
        var combatTablesUrls = state.book.getCombatTablesImagesUrls(state.mechanics);
        $('#template-ctimage0').attr('src', combatTablesUrls[0]);
        $('#template-ctimage1').attr('src', combatTablesUrls[1]);
        $('#template-combatTables').modal('show');
    },

    showRandomTable: function(show) {
        var $randomModal = $('#template-randomtable');
        if( show )
            translations.translateTags( $randomModal );
        $randomModal.modal( show ? 'show' : 'hide' );
    },

    fillRandomTableModal: function(numbers) {

        // Fill table
        var html = '';
        for(var row=0; row<10; row++) {
            html += '<tr>';
            for(var column=0; column<10; column++) {
                var number = numbers[ row * 10 + column ];
                html += '<td data-number="' + number + '">' + number + '</td>';
            }
            html += '</tr>';
        }
        $('#template-randomcontent').html( html );

        // Add click event handlers:
        $('#template-randomcontent td').mousedown(function(e) {
            e.preventDefault();
            randomTable.randomTableUIClicked( parseInt( $(this).attr('data-number') ) );
        });
    }
};
