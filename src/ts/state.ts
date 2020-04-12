/**
 * The application state
 */
const state = {

    /**
     * The current book
     */
    book : null as Book,

    /**
     * The current book mechanics
     */
    mechanics: null as Mechanics,

    /**
     * The current book section states
     */
    sectionStates: null as BookSectionStates,

    /**
     * The current action chart
     */
    actionChart: null as ActionChart,

    /**
     * The current language ('en' = english / 'es' = spanish)
     */
    language: "en",

    /**
     * Color Theme ( 'light' or 'dark' ).
     * This is stored at localStorage['color'], not with the game state
     */
    color: "light",

    /**
     * The local books download state for the Cordova app.
     * This member is not persisted
     */
    localBooksLibrary: null as LocalBooksLibrary,

    /**
     * Setup the default browser language
     */
    setupDefaultLanguage() {
        console.log("Current language: " + navigator.language);
        if ( !navigator.language || navigator.language.length < 2 ) {
            return;
        }
        if ( navigator.language.toLowerCase().substr(0, 2) === "es" ) {
            state.language = "es";
        }
    },

    /**
     * Setup the default color or persist from local storage
     */
    setupDefaultColorTheme() {

        try {
            state.color = localStorage.getItem( "color" );
            if ( !state.color ) {
                state.color = "light";
            }
        } catch (e) {
            state.color = "light";
            console.log(e);
        }
    },

    /**
     * Setup the state for a book number and language
     */
    setup(bookNumber: number, language: string, keepActionChart: boolean) {

        if ( !bookNumber ) {
            bookNumber = 1;
        }

        state.sectionStates = new BookSectionStates();

        // Action chart
        state.actionChart = null;
        if ( keepActionChart ) {
            // Try to get the previous book action chart, and set it as the current
            state.actionChart = state.getPreviousBookActionChart(bookNumber - 1);
            if ( state.actionChart ) {
                // Convert the Object to ActionChart
                state.actionChart = $.extend(new ActionChart(), state.actionChart);
            }

            // Restore Kai monastery objects
            state.restoreKaiMonasterySectionObjects();
        }

        state.language = language;
        state.book = new Book(bookNumber, state.language);
        state.mechanics = new Mechanics(state.book);

        if ( !state.actionChart ) {
            state.actionChart = new ActionChart();
        }
    },

    removeCachedState() {
        state.book = null;
        state.mechanics = null;
        state.sectionStates = null;
        state.actionChart = null;
    },

    /**
     * Reset the current state
     */
    reset(deleteBooksHistory: boolean) {

        state.removeCachedState();

        // Remove current game state
        localStorage.removeItem( "state" );

        if ( deleteBooksHistory ) {
            // Remove action charts from previous books
            for (let i = 1; i <= projectAon.getLastSupportedBook(); i++) {
                localStorage.removeItem( "state-book-" + i.toString() );
            }
        }
    },

    /**
     * Returns the current state object
     */
    getCurrentState() {
        return {
            actionChart: state.actionChart,
            bookNumber: state.book ? state.book.bookNumber : 0,
            language: state.language,
            sectionStates: state.sectionStates
        };
    },

    /**
     * Store the current state at the browser local storage
     */
    persistState() {
        try {
            const json = JSON.stringify( state.getCurrentState() );
            localStorage.setItem( "state" , json );
        } catch (e) {
            console.log(e);
            // throw new Error(e);
        }
    },

    /**
     * Return true if there is an stored persisted state
     */
    existsPersistedState() {
        return localStorage.getItem( "state" );
    },

    /**
     * Restore the state from the local storage
     */
    restoreState() {
        try {
            const json = localStorage.getItem( "state" );
            if ( !json ) {
                throw new Error("No state to restore found");
            }
            const stateKeys = JSON.parse( json );
            if ( !stateKeys ) {
                throw new Error("Wrong JSON format");
            }
            state.restoreStateFromObject( stateKeys );
        } catch (e) {
            console.log(e);
            state.setup(1, "en", false);
        }
    },

    /**
     * Restore the state from an object
     */
    restoreStateFromObject(stateKeys: any) {

        // On version 1.6.3 / 1.7, the stateKeys.actionChart.weaponSkill has been changed from string to Array<string> (magnakai)
        if ( typeof stateKeys.actionChart.weaponSkill === "string" ) {
            if ( stateKeys.actionChart.weaponSkill ) {
                stateKeys.actionChart.weaponSkill = [ stateKeys.actionChart.weaponSkill ];
            } else {
                stateKeys.actionChart.weaponSkill = [];
            }
        }

        // On version 1.6.3 / 1.7, we store the number of arrows (magnakai)
        if ( !stateKeys.actionChart.arrows ) {
            stateKeys.actionChart.arrows = 0;
        }

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
    updateBookTranslation(book: Book) {
        state.book = book;
        state.mechanics.book = book;
        state.language = book.language;
    },

    /**
     * Update state to change the book language
     * @param color 'light' or 'dark'
     */
    updateColorTheme(color: string) {
        state.color = color;
        localStorage.setItem( "color" , state.color );
    },

    /**
     * Restore objects on the Kai Monastery section from the Action Chart
     */
    restoreKaiMonasterySectionObjects() {
        const kaiMonasterySection = state.sectionStates.getSectionState( Book.KAIMONASTERY_SECTION );
        kaiMonasterySection.objects = state.actionChart ? state.actionChart.kaiMonasterySafekeeping : [];
    },

    /**
     * Update state to start the next book
     */
    nextBook() {

        // Save the action chart state on the current book ending
        const key = "state-book-" + state.book.bookNumber.toString();
        localStorage.setItem( key , JSON.stringify( state.actionChart ) );

        // Move to the next book
        state.book = new Book(state.book.bookNumber + 1, state.language);
        state.mechanics = new Mechanics(state.book);
        state.sectionStates = new BookSectionStates();

        // Restore Kai monastery objects
        state.restoreKaiMonasterySectionObjects();

        state.persistState();
    },

    /**
     * Get the action chart on the ending of the previous book
     * @param {number} bookNumber Book which get the action chart
     * @returns {object} The action chart. null if it was not found. The returned value is an Object, not an ActionChart
     */
    getPreviousBookActionChart(bookNumber: number): ActionChart {
        const key = "state-book-" + bookNumber.toString();
        const json = localStorage.getItem( key );
        if ( !json ) {
            return null;
        }
        return JSON.parse(json) as ActionChart;
    },

    /**
     * Check if the Kai serie of books was completed
     * @returns {object} true if serie was completed
     */
    hasCompletedKaiSerie(): boolean {
        const json = localStorage.getItem( "state-book-1" );
        return !!json && (state.book.isMagnakaiBook() || state.book.isGrandMasterBook());
    },

    /**
     * Check if the Magnakai serie of books was completed
     * @returns {object} true if serie was completed
     */
    hasCompletedMagnakaiSerie(): boolean {
        const json = localStorage.getItem( "state-book-6" );
        return !!json && state.book.isGrandMasterBook();
    },

    /**
     * Returns the object to save the game state
     */
    getSaveGameJson() {

        // Get the current state
        const saveGameObject = {
            currentState: state.getCurrentState(),
            previousBooksState: {},
        };

        // Get the action charts at the end of each book
        for (let i = 1; i <= 30; i++) {
            const key = "state-book-" + i;
            const previousBookState = localStorage.getItem( key );
            if ( previousBookState ) {
                saveGameObject.previousBooksState[i] = previousBookState;
            }
        }
        return JSON.stringify( saveGameObject );
    },

    /**
     * Restore the game from a save game file
     */
    loadSaveGameJson(json: string) {

        // replace BOM Character (https://en.wikipedia.org/wiki/Byte_order_mark). Otherwise call to JSON.parse will fail
        json = json.replace(/\ufeff/g, "");

        // alert( json );
        // console.log( json );
        const saveGameObject = JSON.parse( json );

        // Restore current state
        if ( !saveGameObject || !saveGameObject.currentState) {
            throw new Error("Wrong format");
        }
        state.restoreStateFromObject(saveGameObject.currentState);

        // Restore previous books action chart
        for (let i = 1; i <= 30; i++) {
            const key = "state-book-" + i;
            if ( saveGameObject.previousBooksState[i] ) {
                localStorage.setItem( key , saveGameObject.previousBooksState[i] );
            } else {
                localStorage.removeItem( key );
            }
        }

        state.persistState();
    },
};
