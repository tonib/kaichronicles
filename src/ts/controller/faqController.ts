
/**
 * FAQ controller
 */
const faqController = {

    index() {
        template.setNavTitle( translations.text("kaiChronicles"), "#mainMenu", true);
        views.loadView("faq_" + state.language + ".html");
    },

    /** Return page */
    getBackController() { return "mainMenu"; },

}
