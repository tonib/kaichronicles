import { template, translations, views, mainMenuView, cordovaApp, state, Language, settingsController } from "..";

/**
 * The application menu controller
 */
export const mainMenuController = {

    /**
     * The game menu
     */
    index() {
        template.setNavTitle( translations.text("kaiChronicles") , "#mainMenu", true);
        template.showStatistics(false);
        views.loadView("mainMenu.html").then(() => {
            mainMenuView.setup();

            // Hide info only for the web site on the app:
            if ( cordovaApp.isRunningApp() ) {
                mainMenuView.hideWebInfo();
            }

            // Check if there is a current game
            if ( !state.existsPersistedState() ) {
                mainMenuView.hideContinueGame();
            }

        });
    },

    /**
     * Change the current language
     */
    changeTranslation() {
        state.language = ( state.language === Language.SPANISH ? Language.ENGLISH : Language.SPANISH );
        mainMenuController.index();
    },

    /**
     * Change the current color theme
     */
    changeColor() {
        settingsController.changeColorTheme(state.color === "light" ? "dark" : "light");
        mainMenuController.index();
    },

    /** Return page */
    getBackController() { return "exitApp"; }

};
