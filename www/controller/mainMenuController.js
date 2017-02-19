
/** 
 * The application menu controller
 */
var mainMenuController = {

    /**  
     * The game menu 
     */
    index: function() {
        template.setNavTitle( translations.text('kaiChronicles') , '#mainMenu');
        template.showStatistics(false);
        views.loadView('mainMenu.html').then(function() {
            mainMenuView.setup();

            // Hide info only for the web site on the app:
            if( cordovaApp.isRunningApp() )
                mainMenuView.hideWebInfo();

            // Check if there is a current game
            if( !state.existsPersistedState() )
                mainMenuView.hideContinueGame();
                
        });
    },

    changeTranslation: function() {
        state.language = state.language == 'es' ? 'en' : 'es';
        mainMenuController.index();
    },

    /** Return page */
    getBackController: function() { return 'exitApp'; }
    
};
