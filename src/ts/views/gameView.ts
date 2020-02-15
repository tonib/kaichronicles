
/**
 * The game view interface functions
 */
const gameView = {

    /**
     * Enable / disable previous and next section links
     * @param section The current Section
     */
    updateNavigation(section: Section) {
        const $navButtons = $("#game-navSectionButtons");
        if (window.getUrlParameter("debug") || section.hasNavigation()) {
            $navButtons.show();
        } else {
            $navButtons.hide();
        }
    },

    enableLink(linkId: string, enabled: boolean) {
        const $nextLink = $(linkId);
        if (enabled) {
            $nextLink.removeClass("disabled");
        } else {
            $nextLink.addClass("disabled");
        }
    },

    /** Enable or disable the "next page" link */
    enableNextLink(enabled: boolean) {
        gameView.enableLink("#game-nextSection", enabled);
    },

    /** Enable or disable the "previous page" link */
    enablePreviousLink(enabled: boolean) {
        gameView.enableLink("#game-prevSection", enabled);
    },

    /**
     * Set the current section content
     */
    setSectionContent(section: Section) {
        document.title = section.book.getBookTitle() + " - " +
            section.getTitleText();
        $("#game-section-title").html(section.getTitleHtml());
        $("#game-section").html(section.getHtml());
        $("#game-aonLink-english").attr("href", section.getSectionAonPage("en"));
        $("#game-aonLink-spanish").attr("href", section.getSectionAonPage("es"));
    },

    /**
     * View setup
     */
    setup() {

        // Section navigation events
        $("#game-prevSection").click((e) => {
            e.preventDefault();
            gameController.onNavigatePrevNext(-1);
        });
        $("#game-nextSection").click((e) => {
            e.preventDefault();
            if ($(this).hasClass("disabled")) {
                return;
            }
            gameController.onNavigatePrevNext(+1);
        });

        // Show book copyright
        $("#game-copyrights").html(state.book.getBookTitle() + "<br/>" + state.book.getCopyrightHtml());

        // Setup debug options
        if (window.getUrlParameter("debug") === "true") {
            $("#game-debugSection").show();

            $("#game-debugJump").submit((e) => {
                e.preventDefault();
                gameController.loadSection($("#game-debugNSection").val());
            });

            $("#game-debugRandomTable").submit((e) => {
                e.preventDefault();
                randomTable.nextValueDebug = parseInt($("#game-debugRandomFix").val(), 10);
                console.log("Next random table value set to " + randomTable.nextValueDebug);
                $("#game-debugRandomFix").val("");
            });

            $("#game-resetSection").click((e) => {
                e.preventDefault();
                state.sectionStates.resetSectionState(state.sectionStates.currentSection);
                gameController.loadSection(state.sectionStates.currentSection);
            });

            $("#game-goDisciplines").click((e) => {
                e.preventDefault();
                if (state.sectionStates.currentSection === Book.DISCIPLINES_SECTION) {
                    return;
                }

                // Keep the current section, to ease the go-back
                $("#game-debugNSection").val(state.sectionStates.currentSection);
                gameController.loadSection(Book.DISCIPLINES_SECTION);
            });

            $("#game-switchlanguage").click((e: Event) => {
                e.preventDefault();
                settingsController.changeLanguage(state.book.language === "en" ? "es" : "en", false)
                    .then(() => {
                        gameController.loadSection(state.sectionStates.currentSection);
                    });
            });
        }

    },

    /**
     * Appends HTML to the current section
     * @param html The HTML to append
     * @param where Where to place the html:
     * - 'beforeChoices': Before section choices
     * - 'afterChoices': After section choices
     * - 'afterTitle': After section title
     */
    // appendToSection: function(html : any, afterChoices : boolean = false) {
    appendToSection(html: string|JQuery<HTMLElement>, where: string = "beforeChoices") {

        if (where === "beforeChoices") {
            // Try to add the html before the first choice:
            const $firstChoice = $("p.choice").first();
            if ($firstChoice.length > 0) {
                $firstChoice.before(html);
                return;
            }
        }

        if (where === "afterTitle") {
            // Add at "game-section" top
            $("#game-section").prepend(html);
            return;
        }

        // After choices, or something failed with the location
        if ($("div.footnotes").length > 0) {
            // Add to the end, but before foot notes
            $("hr").first().before(html);
        } else {
            // Add at the end
            $("#game-section").append(html);
        }

    },

    /**
     * Bind choice events on current section
     */
    bindChoiceLinks() {
        // This MUST to be "live" events and non static because HTML can be replaced by
        // by game rules
        $("#game-section").off("click", ".choice a.choice-link");
        $("#game-section").on("click", ".choice a.choice-link", function(e) {
            gameView.choiceLinkClicked(e, this);
        });

        gameView.bindCombatTablesLinks();
    },

    bindCombatTablesLinks() {
        $(".crtable").click((e) => {
            e.preventDefault();
            template.showCombatTables();
        });
    },

    /**
     * Called when a choice link is clicked
     * @param {DOM} link The clicked link
     */
    choiceLinkClicked(e: Event, link: any) {
        e.preventDefault();

        // Validate money picker, if there is. If its not valid, don't follow with this link
        if (!numberPickerMechanics.isValid()) {
            return;
        }

        const section = $(link).attr("data-section");
        // console.log('Jump to section ' + section);
        if (section) {
            gameController.loadSection(section, true);
        }
    },

    /**
     * Display origin section. Only for debug
     */
    showOriginSections() {

        const sectionIds = state.book.getOriginSections(state.sectionStates.currentSection);
        let linksHtml = "";
        for (const sectionId of sectionIds) {
            // Ignore index of numbered sections
            if (sectionId === "numbered") {
                continue;
            }

            if (linksHtml) {
                linksHtml += ", ";
            }
            linksHtml += '<a href="#" class="action choice-link" data-section="' +
                sectionId + '">' + sectionId + "</a>";
        }
        $("#game-sourceSections").html(linksHtml);
        $("#game-sourceSections a").click(function(e) {
            gameView.choiceLinkClicked(e, this);
        });
    }

};
