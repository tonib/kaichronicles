
import {Builder, By, until, WebDriver, ThenableWebDriver} from "selenium-webdriver";
import {state, projectAon, declareCommonHelpers, LocalBooksLibrary, Section} from "..";
import { Book } from "..";
import { Language } from "..";
import { readFileSync } from "fs-extra";
import { Mechanics } from "../model/mechanics";
import { Type, Level } from "selenium-webdriver/lib/logging";

// Define common functions
declareCommonHelpers(false);

const basePath = "src/www/";
state.localBooksLibrary = new LocalBooksLibrary();

// Selenium web driver
let driver: WebDriver = null;

// Setup jQuery
// tslint:disable-next-line: no-var-requires
global.jQuery = require("jquery");
global.$ = global.jQuery;

// Initial setup
beforeAll( async () => {
    // Setup jQuery
    global.jQuery = require("jquery");
    global.$ = global.jQuery;

    /*const jsDomDocument = new JSDOM("");
    global.document = jsDomDocument as any;
    global.window = jsDomDocument.window as any;
    global.$ = $( jsDomDocument.window ) as any;*/

    // Setup Selenium
    // console.log("Setup Selenium");
    driver = await new Builder().forBrowser("chrome").build();
});

// Final shutdown
afterAll( async () => {
    // Close Selenium
    // console.log("Close Selenium");
    await driver.close();
});

function declareSectionTests(section: Section) {
    describe(`Play section ${section.sectionId}`, () => {

        // Clean book state before each section test
        beforeEach( async () => { await loadCleanSection(section); } );

        // Test there are no errors with initial section rendering
        test("No errors rendering section", async () => {
            expect( await getLogErrors() ).toHaveLength(0);
        });
    });
}

function declarePlayBookTests(book: Book) {
    describe(`Play book ${book.bookNumber} / ${book.language}`, () => {

        // Load book state
        beforeAll( async () => {
            // console.log("Setup book " + book.bookNumber + " / " + book.language);
            await setupBookState(book);
        });

        // Traverse sections
        let sectionId = Book.INITIAL_SECTION;
        // console.log("book = " + book);
        while (sectionId != null) {
            // console.log("Declare tests for section " + sectionId);

            const section = new Section(book, sectionId, state.mechanics);
            // Declare tests for this section
            declareSectionTests(section);
            sectionId = section.getNextSectionId();
        }

    });
}

// Traverse books
for (let i = 0 ; i < 1 ; i++) {
// for (let i = 0 ; i < projectAon.supportedBooks.length ; i++) {
    const bookMetadata = projectAon.supportedBooks[i];

    // Traverse languages
    for (const langKey of Object.keys(Language)) {
        const language = Language[langKey] as Language;

        // console.log(bookMetadata["code_" + language]);

        if (!bookMetadata["code_" + language]) {
            // Untranslated
            continue;
        }

        // Setup tests for this book
        const book = new Book(i + 1, language);
        loadBookState(book);
        declarePlayBookTests(book);
    }
}

function loadBookState(book: Book) {
    state.book = book;
    state.language = book.language;

    // Book
    book.setXml(readFileSync(basePath + book.getBookXmlURL(), "latin1"));

    // Mechanics
    state.mechanics = new Mechanics(state.book);
    state.mechanics.setXml(readFileSync(basePath + state.mechanics.getXmlURL(), "utf-8"));
    state.mechanics.setObjectsXml(readFileSync(basePath + state.mechanics.getObjectsXmlURL(), "utf-8"));
}

async function setupBookState(book: Book) {
    // console.log("setupBookState");

    loadBookState(book);

    // Go to new game page
    await driver.get("http://localhost/ls/?debug=true&test=true#newGame");
    // Select new book
    await( await driver.wait( until.elementLocated( By.css(`#newgame-book > option[value='${state.book.bookNumber}']`) ) , 10000) ).click();
    // Select language
    await ( await driver.findElement( By.css(`#newgame-language > option[value='${state.language}']`) ) ).click();

    // Click start game
    await (await driver.wait(until.elementLocated(By.id("newgame-start")), 10000)).click();
    await driver.wait(until.elementLocated(By.id("game-nextSection")), 5000);
}

async function loadCleanSection(section: Section) {
    // Reset state
    await driver.executeScript("kai.state.actionChart = new kai.ActionChart(); kai.state.sectionStates = new kai.BookSectionStates();");
    // console.log(await driver.executeScript("kai.state.actionChart.currentEndurance;"));

    // Clear log
    await driver.executeScript("console.clear()");

    // Load section
    await driver.executeScript(`kai.gameController.loadSection("${section.sectionId}")`);

    // Wait section render
    await driver.wait( until.elementLocated( By.id("section-ready") ) , 10000);
}

async function getLogErrors(): Promise<string[]> {
    const errors = [];
    for (const entry of await driver.manage().logs().get(Type.BROWSER)) {
        if (entry.level === Level.SEVERE ) {

            const isCordova404error = entry.message.indexOf("http://localhost/ls/cordova.js") >= 0 &&
                entry.message.indexOf("http://localhost/ls/cordova.js") >= 0;

            if (!isCordova404error) {
                errors.push(entry.message);
            }
        }
    }
    return errors;
}
