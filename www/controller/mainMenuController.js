
/** 
 * The application menu controller
 */
var mainMenuController = {

    /**  
     * The game menu 
     */
    index: function() {
        template.setNavTitle('Kai Chronicles', '#mainMenu');
        template.showStatistics(false);
        views.loadView('mainMenu.html').then(function() {
            mainMenuView.setup();

            // Check if there is current game
            if( !state.existsPersistedState() )
                mainMenuView.hideContinueGame();
                
        });
    },

    /** Return page */
    getBackController: function() { return 'exitApp'; }
    
};
