import { setupController, translations, views, settingsView, Language, Book, state, template, cordovaApp, cordovaFS, mechanicsEngine } from "..";

/**
 * Game settings controller
 */
export const settingsController = {

    index() {

        if ( !setupController.checkBook() ) {
            return;
        }

        document.title = translations.text("settings");

        views.loadView("settings.html")
        .then(() => {
            settingsView.setup();
        });

    },

    /**
     * Change the current language
     * @param newLanguage The new language code
     * @param updateUI Should we show progress on UI. Set true ONLY on the settings page
     * @return The promise to download the book with the new language
     */
    changeLanguage(newLanguage: Language, updateUI: boolean): JQueryPromise<void> {

        // TODO: Check download errors

        // Load the book with the new language:
        if ( updateUI ) {
            settingsView.showDownloadDialog();
        }
        const book = new Book( state.book.bookNumber , newLanguage );
        return book.downloadBookXml()
        .then(() => {
            if ( updateUI ) {
                settingsView.hideDownloadDialog();
            }
            // Load game mechanics XML
            state.updateBookTranslation(book);
            // Set the new language title
            template.setNavTitle( book.getBookTitle() , "#game", false);
            // Clear the objects cache (they contain translated object names)
            state.mechanics.clearObjectsCache();
            // Translate the main menu
            template.translateMainMenu();
            // Force to reload the settings view, translated to the new language
            if ( updateUI ) {
                settingsController.index();
            }
        });
    },

    /**
     * Change the current color theme
     * @param color 'light' or 'dark'
     */
    changeColorTheme(color: string): void {
        template.changeColorTheme( color );
        state.updateColorTheme( color );
    },

    /**
     * Show the save game dialog
     */
    saveGameDialog() {
        $("#settings-saveDialog").modal("show");
    },

    /** Return a string to put on saved games files */
    getDateForFileNames(): string {
        const now = new Date();
        return now.getFullYear() + "_" +
            ( now.getMonth() + 1 ).toString().padLeft( 2 , "0" ) + "_" +
            now.getDate().toString().padLeft( 2 , "0" ) + "_" +
            now.getHours().toString().padLeft( 2 , "0" ) + "_" +
            now.getMinutes().toString().padLeft( 2 , "0" ) + "_" +
            now.getSeconds().toString().padLeft( 2 , "0" );
    },

    /**
     * Return a default save game file name
     */
    defaultSaveGameName() {
        return settingsController.getDateForFileNames() + "-book-" + state.book.bookNumber + "-savegame.json";
    },

    /**
     * Save the current game
     * @param fileName File name to save
     */
    saveGame(fileName: string) {
        try {
            const stateJson = state.getSaveGameJson();
            const blob = new Blob( [ stateJson ], {type: "text/plain;charset=utf-8"});

            // Check file name
            fileName = fileName.trim();
            if ( !fileName ) {
                fileName = settingsController.defaultSaveGameName();
            }
            if ( !fileName.toLowerCase().endsWith(".json") ) {
                fileName += ".json";
            }

            // Check for invalid character names
            if ( !fileName.isValidFileName() ) {
                alert("The file name contains invalid characters");
                return false;
            }

            if ( cordovaApp.isRunningApp() ) {
                // We are on cordova app
                cordovaFS.saveFile( fileName , blob, () => {
                    toastr.success( translations.text( "gameSaved" ) );
                });
            } else {
                saveAs(blob, fileName);
            }
            return true;
        } catch (e) {
            mechanicsEngine.debugWarning(e);
            alert("Your browser version does not support save file with javascript. " +
                "Try a newer browser version. Error: " + e);
            return false;
        }
    },

    /** Return page */
    getBackController() { return "game"; }

};
