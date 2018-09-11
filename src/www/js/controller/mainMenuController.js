
/** 
 * The application menu controller
 */
var mainMenuController = {

    /**  
     * The game menu 
     */
    index: function() {
        template.setNavTitle( translations.text('kaiChronicles') , '#mainMenu', true);
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

    /**
     * Change the current language
     */
    changeTranslation: function() {
        state.language = state.language == 'es' ? 'en' : 'es';
        mainMenuController.index();
    },

    /**
     * Change the current color theme
     */
    changeColor: function() {
        settingsController.changeColorTheme(state.color == 'light' ? 'dark' : 'light', false);
        mainMenuController.index();
    },


    /** Return page */
    getBackController: function() { return 'exitApp'; }
    
};
