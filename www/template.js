/**
 * The HTML template API
 */
var template = {

    /**
     * Set the navbar title and target URL
     * @param {String} title The title to put on the navigation bar
     * @param {String} url The target URL for the title on the nav. bar
     */
    setNavTitle: function(title, url) { 
        // Update the title
        $('#template-title').text(title);
        $('#template-title').attr('href', url);
        $('#template-img-logo').attr('href', url);
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
            ( state.actionChart.combatSkill == 0 && state.actionChart.endurance == 0 ) ) {
            $('#template-statistics').hide();
            $('#template-map').hide();
        }
        else {
            $('#template-statistics').show();
            $('#template-combatSkill').text( state.actionChart.getCurrentCombatSkill() );
            gameView.animateValueChange( $('#template-endurance') , 
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
     * Display a message "Loading..."
     */
    displayLoadingMsg: function() {
        $('#body').html(
            '<img src="images/ajax-loader.gif" alt="Loading image" /> ' + 
            'Loading...'
        );
    },

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
     * Show dialog with object details
     * @param {Item} o The object to show
     */
    showObjectDetails: function(o) {
        if( !o )
            return;

        $('#template-objectTitle').text( o.name );
        if( !o.imageUrl )
            $('#template-objectImage').hide();
        else {
            $('#template-objectImage').show();
            $('#template-objectImage img').attr('src' , o.imageUrl);
        }
        $('#template-objectDescription').text(o.description);
        $('#template-objectDetails').modal('show');
    }

};
