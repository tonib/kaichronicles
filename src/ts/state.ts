/// <reference path="external.ts" />

/** 
 * The application state
 */
const state = {

    /**
     * The current book
     */
    book : <Book> null,

    /**
     * The current book mechanics
     */
    mechanics: null,

    /**
     * The current book section states
     */
    sectionStates: null,

    /**
     * The current action chart
     */
    actionChart: <ActionChart> null,

    /**
     * The current language ('en' = english / 'es' = spanish)
     */
    language: 'en',

    /**
     * The local books download state for the Cordova app.
     * This member is not persisted
     */
    localBooksLibrary: null,

    /**
     * Setup the default browser language
     */
    setupDefaultLanguage: function() {
        console.log('Current language: ' + navigator.language);
        if( !navigator.language || navigator.language.length < 2 )
            return;
        if( navigator.language.toLowerCase().substr(0,2) == 'es' )
            state.language = 'es';
    },

    /**
     * Setup the state for a book number and language
     */
    setup: function(bookNumber : number, language : string, keepActionChart : boolean) {

        if( !bookNumber )
            bookNumber = 1;

        // Action chart
        state.actionChart = null;
        if( keepActionChart ) {
            // Try to get the previous book action chart, and set it as the current
            state.actionChart = state.getPreviousBookActionChart(bookNumber - 1);
            if( state.actionChart )
                // Convert the Object to ActionChart
                state.actionChart = $.extend(new ActionChart(), state.actionChart);
        }

        state.language = language;
        state.book = new Book(bookNumber, state.language);
        state.mechanics = new Mechanics(state.book);
        state.sectionStates = new BookSectionStates();

        if( !state.actionChart )
            state.actionChart = new ActionChart();
    },

    removeCachedState: function() {
        state.book = null;
        state.mechanics = null;
        state.sectionStates = null;
        state.actionChart = null;
    },

    /**
     * Reset the current state
     */
    reset: function(deleteBooksHistory : boolean) {

        state.removeCachedState();

        // Remove current game state
        localStorage.removeItem( 'state' );

        if( deleteBooksHistory ) {
            // Remove action charts from previous books
            for(var i=1; i <= projectAon.getLastSupportedBook(); i++)
                localStorage.removeItem( 'state-book-' + i.toString() );
        }
    },

    /**
     * Returns the current state object
     */
    getCurrentState: function() {
        return {
            bookNumber: state.book ? state.book.bookNumber : 0,
            actionChart: state.actionChart,
            sectionStates: state.sectionStates,
            language: state.language
        };
    },

    /**
     * Store the current state at the browser local storage
     */
    persistState: function() {
        try {
            var json = JSON.stringify( state.getCurrentState() );
            localStorage.setItem( 'state' , json );
        }
        catch(e) {
            console.log(e);
        }
    },

    /**
     * Return true if there is an stored persisted state
     */
    existsPersistedState: function() {
        return localStorage.getItem( 'state' );
    },

    /**
     * Restore the state from the local storage
     */
    restoreState: function() {
        try {
            var json = localStorage.getItem( 'state' );
            if( !json )
                throw "No state to restore found";
            var stateKeys = JSON.parse( json );
            if( !stateKeys )
                throw 'Wrong JSON format';
            state.restoreStateFromObject( stateKeys );
        }
        catch(e) {
            console.log(e);
            state.setup(1, 'en', false);
        }
    },

    /**
     * Restore the state from an object
     */
    restoreStateFromObject: function(stateKeys) {

        // On version 1.6.3 / 1.7, the stateKeys.actionChart.weaponSkill has been changed from string to Array<string> (magnakai)
        if( typeof stateKeys.actionChart.weaponSkill === 'string' ) {
            if( stateKeys.actionChart.weaponSkill )
                stateKeys.actionChart.weaponSkill = [ stateKeys.actionChart.weaponSkill ];
            else
                stateKeys.actionChart.weaponSkill = [];
        }

        // On version 1.6.3 / 1.7, we store the number of arrows (magnakai)
        if( !stateKeys.actionChart.arrows )
            stateKeys.actionChart.arrows = 0;
            
        state.language = stateKeys.language;
        state.book = new Book(stateKeys.bookNumber, state.language);
        state.mechanics = new Mechanics(state.book);
        state.actionChart = $.extend(new ActionChart(), stateKeys.actionChart);
        state.sectionStates = new BookSectionStates();
        state.sectionStates.fromStateObject( stateKeys.sectionStates );
    },

    /**
     * Update state to change the book language
     */
    updateBookTranslation: function(book) {
        state.book = book;
        state.mechanics.book = book;
        state.language = book.language;
    },

    /**
     * Update state to start the next book
     */
    nextBook: function() {

        // Save the action chart state on the current book ending
        var key = 'state-book-' + state.book.bookNumber.toString();
        localStorage.setItem( key , JSON.stringify( state.actionChart ) );

        // Move to the next book
        state.book = new Book(state.book.bookNumber + 1, state.language);
        state.mechanics = new Mechanics(state.book);
        state.sectionStates = new BookSectionStates();
        state.persistState();
    },

    /**
     * Get the action chart on the ending of the previous book
     * @param {number} bookNumber Book which get the action chart
     * @returns {object} The action chart. null if it was not found 
     */
    getPreviousBookActionChart: function(bookNumber) {
        var key = 'state-book-' + bookNumber.toString();
        var json = localStorage.getItem( key );
        if( !json )
            return null;
        return JSON.parse(json); 
    },

    /**
     * Returns the object to save the game state
     */
    getSaveGameJson: function() {

        // Get the current state
        var saveGameObject = {
            currentState: state.getCurrentState(),
            previousBooksState: {}
        };

        // Get the action charts at the end of each book
        for(var i=1; i<= 30; i++) {
            var key = 'state-book-' + i;
            var previousBookState = localStorage.getItem( key );
            if( previousBookState )
                saveGameObject.previousBooksState[i] = previousBookState;
        }
        return JSON.stringify( saveGameObject );
    },

    /**
     * Restore the game from a save game file
     */
    loadSaveGameJson: function(json) {
        var saveGameObject = JSON.parse(json);

        // Restore current state
        if( !saveGameObject || !saveGameObject.currentState)
            throw "Wrong format";
        state.restoreStateFromObject(saveGameObject.currentState);

        // Restore previous books action chart
        for(var i=1; i<= 30; i++) {
            var key = 'state-book-' + i;
            if( saveGameObject.previousBooksState[i] ) {
                localStorage.setItem( key , saveGameObject.previousBooksState[i] );
            }
            else
                localStorage.removeItem( key );
        }

        state.persistState();
    }
};
