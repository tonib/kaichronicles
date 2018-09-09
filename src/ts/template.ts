/// <reference path="external.ts" />

/**
 * The HTML template API
 */
const template = {

    /**
     * Set the navbar title and target URL
     * @param title The title to put on the navigation bar
     * @param url The target URL for the title on the nav. bar
     * @param showTitleOnSmallDevs True if the main title should be shown on
     * small devices.
     */
    setNavTitle: function(title : string, url : string, showTitleOnSmallDevs : boolean ) { 
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
        template.changeColorTheme(state.color);

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
    showStatistics: function(show : boolean) {
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
    updateStatistics: function(doNotAnimate : boolean = false) {

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
    isMenuExpanded: function() : boolean { 
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
    setViewContent: function(viewContent : any) {
        $('#body').html(viewContent);
        // Scroll to top
        window.scrollTo(0, 0);
        template.highlightActiveLink();
    },

    /**
     * Display an error
     */
    setErrorMessage: function(msg : string) {
        template.setViewContent('<p style="color: red">' + msg + '</p>');
    },
    
    /**
     * Show dialog with object details
     * @param o The object to show
     */
    showObjectDetails: function(o : Item) {
        if( !o )
            return;

        // Translate the dialog
        translations.translateTags( $('#template-objectDetails') );

        $('#template-objectTitle').text( o.name );

        // Show / hide object image
        var imageUrl = o.getImageUrl();
        if( !imageUrl )
            $('#template-objectImage').hide();
        else {
            $('#template-objectImage').show();
            $('#template-objectImage img').attr('src' , imageUrl);
        }

        $('#template-objectDescription').text(o.description);
        $('#template-objectDescriptionExtra').text(o.extraDescription);
        
        $('#template-objectDetails').modal('show');
    },

    /**
     * Change a number value by other, with an animation. On the Cordova app, the
     * change will not be animated (performance...)
     * @param {jQuery} $element Element selector to change
     * @param newValue The new value to set
     * @param doNotAnimate True if we should do not perform the animation
     * @param newColor The final HTML color of the element. If it's null, the default
     * color for the DOM element will be used
     */
    animateValueChange: function( $element : any , newValue : number , doNotAnimate : boolean , newColor : string = null ) {

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
        
        // Hide toasts
        toastr.clear();

        // Set the translated images
        var combatTablesUrls = state.book.getCombatTablesImagesUrls(state.mechanics);
        $('#template-ctimage0').attr('src', combatTablesUrls[0]);
        $('#template-ctimage1').attr('src', combatTablesUrls[1]);
        $('#template-combatTables').modal('show');
    },

    /**
     * Show / hide the random table dialog
     */
    showRandomTable: function(show : boolean) {
        var $randomModal = $('#template-randomtable');
        if( show ) {
            // Hide toasts
            toastr.clear();
            // Translate the dialog
            translations.translateTags( $randomModal );
        }
        $randomModal.modal( show ? 'show' : 'hide' );
    },

    /**
     * Populate the random table values with the current book random table
     */
    fillRandomTableModal: function(numbers : Array<number>) {

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
    },

    /**
     * Change the color theme of the templates
     */
    changeColorTheme: function(theme: string) {
        state.updateColorTheme( theme );
        
        switch(theme) {
            case 'dark':
                $('body').addClass('dark');
                break;
            default:
                // we will default to "light" theme, or no class
                $('body').removeClass();
                break;
        }
    }
};
