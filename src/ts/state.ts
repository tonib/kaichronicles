
/** Language codes */
enum Language {
    ENGLISH = "en",
    SPANISH = "es"
}

// Variabe "state" is declared at bottom of this file

/**
 * The application state.
 */
class State {

    /**
     * The current book
     */
    public book = null as Book;

    /**
     * The current book mechanics
     */
    public mechanics = null as Mechanics;

    /**
     * The current book section states
     */
    public sectionStates = null as BookSectionStates;

    /**
     * The current action chart
     */
    public actionChart = null as ActionChart;

    /**
     * The current language ('en' = english / 'es' = spanish)
     */
    public language = Language.ENGLISH;

    // TODO: Declare enum for "color"
    /**
     * Color Theme ( 'light' or 'dark' ).
     * This is stored at localStorage['color'], not with the game state
     */
    public color = "light";

    /**
     * The local books download state for the Cordova app.
     * This member is not persisted
     */
    public localBooksLibrary = null as LocalBooksLibrary;

    /**
     * Setup the default browser language
     */
    public setupDefaultLanguage() {
        console.log("Current language: " + navigator.language);
        if ( !navigator.language || navigator.language.length < 2 ) {
            return;
        }
        if ( navigator.language.toLowerCase().substr(0, 2) === "es" ) {
            this.language = Language.SPANISH;
        }
    }

    /**
     * Setup the default color or persist from local storage
     */
    public setupDefaultColorTheme() {

        try {
            this.color = localStorage.getItem( "color" );
            if ( !this.color ) {
                this.color = "light";
            }
        } catch (e) {
            this.color = "light";
            console.log(e);
        }
    }

    /**
     * Setup the state for a book number and language
     */
    public setup(bookNumber: number, language: Language, keepActionChart: boolean) {

        if ( !bookNumber ) {
            bookNumber = 1;
        }

        this.sectionStates = new BookSectionStates();

        // Action chart
        this.actionChart = null;
        if ( keepActionChart ) {
            // Try to get the previous book action chart, and set it as the current
            this.actionChart = this.getPreviousBookActionChart(bookNumber - 1);

            // Restore Kai monastery objects
            this.restoreKaiMonasterySectionObjects();
        }

        this.language = language;
        this.book = new Book(bookNumber, this.language);
        this.mechanics = new Mechanics(this.book);

        if ( !this.actionChart ) {
            this.actionChart = new ActionChart();
        }
    }

    public removeCachedState() {
        this.book = null;
        this.mechanics = null;
        this.sectionStates = null;
        this.actionChart = null;
    }

    /**
     * Reset the current state
     */
    public reset(deleteBooksHistory: boolean) {

        this.removeCachedState();

        // Remove current game state
        localStorage.removeItem( "state" );

        if ( deleteBooksHistory ) {
            // Remove action charts from previous books
            for (let i = 1; i <= projectAon.getLastSupportedBook(); i++) {
                localStorage.removeItem( "state-book-" + i.toString() );
            }
        }
    }

    /**
     * Returns the current state object
     */
    private getCurrentState(): object {
        return {
            actionChart: this.actionChart,
            bookNumber: this.book ? this.book.bookNumber : 0,
            language: this.language,
            sectionStates: this.sectionStates
        };
    }

    /**
     * Store the current state at the browser local storage
     */
    public persistState() {
        try {
            const json = JSON.stringify( this.getCurrentState() );
            localStorage.setItem( "state" , json );
        } catch (e) {
            console.log(e);
            // throw new Error(e);
        }
    }

    /**
     * Return true if there is an stored persisted state
     */
    public existsPersistedState() {
        return localStorage.getItem( "state" );
    }

    /**
     * Restore the state from the local storage
     */
    public restoreState() {
        try {
            const json = localStorage.getItem( "state" );
            if ( !json ) {
                throw new Error("No state to restore found");
            }
            const stateKeys = JSON.parse( json );
            if ( !stateKeys ) {
                throw new Error("Wrong JSON format");
            }
            this.restoreStateFromObject( stateKeys );
        } catch (e) {
            console.log(e);
            this.setup(1, Language.ENGLISH, false);
        }
    }

    /**
     * Restore the state from an object
     */
    private restoreStateFromObject(stateKeys: any) {
        this.language = stateKeys.language;
        this.book = new Book(stateKeys.bookNumber, this.language);
        this.mechanics = new Mechanics(this.book);
        this.actionChart = ActionChart.fromObject(stateKeys.actionChart, stateKeys.bookNumber);
        this.sectionStates = new BookSectionStates();
        this.sectionStates.fromStateObject( stateKeys.sectionStates );
    }

    /**
     * Update state to change the book language
     */
    public updateBookTranslation(book: Book) {
        this.book = book;
        this.mechanics.book = book;
        this.language = book.language;
    }

    /**
     * Update state to change the book language
     * @param color 'light' or 'dark'
     */
    public updateColorTheme(color: string) {
        this.color = color;
        localStorage.setItem( "color" , this.color );
    }

    /**
     * Restore objects on the Kai Monastery section from the Action Chart
     */
    private restoreKaiMonasterySectionObjects() {
        const kaiMonasterySection = this.sectionStates.getSectionState( Book.KAIMONASTERY_SECTION );
        kaiMonasterySection.objects = this.actionChart ? this.actionChart.kaiMonasterySafekeeping : [];
    }

    /**
     * Update state to start the next book
     */
    public nextBook() {

        // Save the action chart state on the current book ending
        const key = "state-book-" + this.book.bookNumber.toString();
        localStorage.setItem( key , JSON.stringify( this.actionChart ) );

        // Move to the next book
        this.book = new Book(this.book.bookNumber + 1, this.language);
        this.mechanics = new Mechanics(this.book);
        this.sectionStates = new BookSectionStates();

        // Restore Kai monastery objects
        this.restoreKaiMonasterySectionObjects();

        this.persistState();
    }

    /**
     * Get the action chart on the ending of the previous book
     * @param bookNumber Book which get the action chart
     * @returns The action chart. null if it was not found or it cannot be loaded.
     */
    public getPreviousBookActionChart(bookNumber: number): ActionChart {
        try {
            const key = "state-book-" + bookNumber.toString();
            const json = localStorage.getItem( key );
            if ( !json ) {
                return null;
            }
            return ActionChart.fromObject(JSON.parse(json), bookNumber);
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
     * Returns the object to save the game state
     */
    public getSaveGameJson(): any {

        // Get the current state
        const saveGameObject = {
            currentState: this.getCurrentState(),
            previousBooksState: {}
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
    }

    /**
     * Restore the game from a save game file
     */
    public loadSaveGameJson(json: string) {

        // replace BOM Character (https://en.wikipedia.org/wiki/Byte_order_mark). Otherwise call to JSON.parse will fail
        json = json.replace(/\ufeff/g, "");

        // alert( json );
        // console.log( json );
        const saveGameObject = JSON.parse( json );

        // Check errors
        if ( !saveGameObject || !saveGameObject.currentState) {
            throw new Error("Wrong format");
        }

        // Restore previous books action chart
        for (let i = 1; i <= 30; i++) {
            const key = "state-book-" + i;
            if ( saveGameObject.previousBooksState[i] ) {
                localStorage.setItem( key , saveGameObject.previousBooksState[i] );
            } else {
                localStorage.removeItem( key );
            }
        }

        // Restore current state
        this.restoreStateFromObject(saveGameObject.currentState);

        this.persistState();
    }
}

/** Application model state */
const state = new State();
