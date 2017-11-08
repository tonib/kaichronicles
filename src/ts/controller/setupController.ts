/// <reference path="../external.ts" />

/** 
 * The book loader controller
 * TODO: Change the name of this controller. It's a "book setup" controller
 */
const setupController = {
    
    /** Set up the application 
     * This will load the XML book and then redirect to the game 
     */
    index: function() {

        // If the book is already loaded, redirect to the game
        if( state.book && state.book.bookXml ) {
            console.log("Book already loaded");
            template.setNavTitle( state.book.getBookTitle() , '#game' , false);
            routing.redirect('game');
            setupController.verifyLanguageChange();
            return;
        }

        // Check if there is a persisted state
        if( state.existsPersistedState() ) {
            template.updateStatistics(true);
            state.restoreState();
            setupController.recordPageVisit('continue');
        }
        else {
            // New game. Get hash URL parameters
            var bookNumber = parseInt( routing.getHashParameter('bookNumber') );
            var language = routing.getHashParameter('language');
            var keepActionChart = routing.getHashParameter('keepActionChart');
            state.setup(bookNumber, language, keepActionChart);
            setupController.recordPageVisit('newgame');
        }
        template.translateMainMenu();

        // Check if the book to setup is downloaded
        if( !state.localBooksLibrary.isBookDownloaded(state.book.bookNumber) ) {
            alert( translations.text('bookNotDownloaded' , [state.book.bookNumber] ) );
            routing.redirect('mainMenu');
            return jQuery.Deferred().reject().promise();
        }
        else {
            return views.loadView('setup.html')
            .then(function() { setupController.runDownloads(); }); 
        }
        
    },

    verifyLanguageChange: function() {
        // Re-translate the main menu (needed if the language has been changed on the 
        // main menu). The book language rules:
        if( !state.book )
            return;
        if( state.language != state.book.language) {
            state.language = state.book.language;
            template.translateMainMenu();
        }
    },

    runDownloads: function() {


        var downloads = [];
        // The book xml
        downloads.push( {
            url: state.book.getBookXmlURL(),
            promise: state.book.downloadBookXml()
        });

        // Game mechanics XML
        downloads.push( {
            url: state.mechanics.getXmlURL(),
            promise: state.mechanics.downloadXml()
        });

        // Objects mechanics XML
        downloads.push( {
            url: state.mechanics.getObjectsXmlURL(),
            promise: state.mechanics.downloadObjectsXml()
        });

        // Load game mechanics UI
        downloads.push( {
            url: mechanicsEngine.mechanicsUIURL,
            promise: mechanicsEngine.downloadMechanicsUI()
        });

        // Stuff to handle each download
        var promises = [];
        var someError = false;
        var failFunction = function(jqXHR, textStatus, errorThrown) {
            setupView.log( ajaxErrorMsg(this, jqXHR, textStatus, errorThrown), 'error' );
            someError = true;
        };
        var doneFunction = function() {
            setupView.log( this.url + ' OK!' , 'ok' );
        };
        for(var i=0; i<downloads.length; i++) {
            setupView.log(downloads[i].url + ' download started...');
            downloads[i].promise.url = downloads[i].url; 
            downloads[i].promise
            .fail( failFunction )
            .done( doneFunction );
            promises.push( downloads[i].promise );
        }

        // Wait for all downloads
        $.when.apply($, promises)
        .done( function() {
            setupView.log('Done!');
            setupView.done();

            // Fill the random table UI
            template.fillRandomTableModal( state.book.bookRandomTable );
            template.setNavTitle( state.book.getBookTitle() , '#game', false);
            template.updateStatistics(true);
            routing.redirect('game');
        })
        .fail( function() { setupView.done(); });
        
    },

    restartBook: function() {
        var bookNumber = state.book.bookNumber;
        var language = state.language;
        state.reset(false);
        template.updateStatistics(true);
        routing.redirect('setup' , {
            bookNumber: bookNumber,
            language: language,
            keepActionChart: true
        });
    },

    /**
     * Check if the book is already loaded.
     * If is not, it redirects to the main menu
     * @return false if the book is not loaded
     */
    checkBook: function() {
        if( !state.book ) {
            // The book was not loaded
            console.log("Book not loaded yet");
            routing.redirect('mainMenu');
            return false;
        }
        return true;
    },

    /**
     * Record page on Google Analytics
     * @param {string} pageName The page name to record
     */
    recordPageVisit: function(pageName) {
        try {
            if( ENVIRONMENT == 'PRODUCTION' && !cordovaApp.isRunningApp() ) {
                var url = '/' + pageName + '-' + state.book.bookNumber + '.html';
                ga('set', 'page', url);
                ga('send', 'pageview');
            }
        }
        catch(e) {
            console.log(e);
        }
    },

    /** Return page */
    getBackController: function() { return 'mainMenu'; }
    
};
    
    