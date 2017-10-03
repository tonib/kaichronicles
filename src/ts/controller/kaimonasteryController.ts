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
                
            });
            
        },
    
        /** Return page */
        getBackController: function() { return 'game'; }
        
    };
    