
import {Builder, By, until, WebDriver, ThenableWebDriver, WebElement} from "selenium-webdriver";
import {state, projectAon, declareCommonHelpers, LocalBooksLibrary, Section} from "..";
import { Book } from "..";
import { Language } from "..";
import { readFileSync } from "fs-extra";
import { Mechanics } from "../model/mechanics";
import { Type, Level } from "selenium-webdriver/lib/logging";
import { BookSectionStates } from "../model/bookSectionStates";

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

// To debug I add "sleeps", so increase the timeout
jest.setTimeout(30000);

// Initial setup
beforeAll( async () => {
    // Setup jQuery
    global.jQuery = require("jquery");
    global.$ = global.jQuery;

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

async function noLogErrors() {
    expect( await getLogErrors() ).toHaveLength(0);
}

async function getPlayTurnButton(): Promise<WebElement> {
    try {
        return await driver.findElement(By.css(".mechanics-playTurn"));
    } catch (e) {
        // console.log("No play turn button");
        return null;
    }
}

async function noCombatErrors() {

    // TODO: This only plays the first combat
    // TODO: This do not test elude

    // Clean rendering messages
    await cleanLog();

    let playTurnButton = await getPlayTurnButton();
    while (playTurnButton && await playTurnButton.isEnabled() && await playTurnButton.isDisplayed() ) {
        await cleanSectionReady();
        await setNextRandomValue(0);
        await playTurnButton.click();
        await waitForSectionReady();
        playTurnButton = await getPlayTurnButton();
    }
    await noLogErrors();
}

function declareSectionTests(sectionId: string) {
    describe(sectionId, () => {

        // Clean book state before each section test
        beforeEach( async () => { await loadCleanSection(sectionId); } );

        // Test there are no errors with initial section rendering
        test("No errors rendering section", noLogErrors );

        test("No errors playing combats", noCombatErrors );
    });
}

function declarePlayBookTests(book: Book) {

    // jest runs out of memory if the closure references the book variable. So I'll use these instead:
    const bookNumber = book.bookNumber;
    const language = book.language;
    const bookCode = book.getProjectAonBookCode();
    console.log("Declaring tests book " + bookCode);

    const sectionIds = [];
    let sectionId = Book.INITIAL_SECTION;
    while (sectionId != null) {
        const section = new Section(book, sectionId, state.mechanics);
        if (!process.env.KAISECT || process.env.KAISECT === sectionId) {
            sectionIds.push(section.sectionId);
        }
        sectionId = section.getNextSectionId();
    }

    describe(bookCode, () => {

        // Load book state
        beforeAll( async () => {
            // console.log("Setup book " + book.bookNumber + " / " + book.language);
            await setupBookState(bookNumber, language);
        });

        // Declare section tests
        for (const sId of sectionIds) {
            declareSectionTests(sId);
        }
    });
}

// Test single book / language?
// This can be done with jest -t option, but it sill declares all tests and is damn slow
let bookNumberToTest: number = 0;
if (process.env.KAIBOOK) {
    bookNumberToTest = parseInt(process.env.KAIBOOK, 10);
    console.log("Just book " + bookNumberToTest);
}

// Traverse books
for (let i = 0 ; i < projectAon.supportedBooks.length ; i++) {
    const bookMetadata = projectAon.supportedBooks[i];

    if (bookNumberToTest && (i + 1) !== bookNumberToTest) {
        continue;
    }

    // Traverse languages
    for (const langKey of Object.keys(Language)) {
        const language = Language[langKey] as Language;

        if (process.env.KAILANG && process.env.KAILANG !== language) {
            continue;
        }

        if (!bookMetadata["code_" + language]) {
            // Untranslated
            continue;
        }

        // Setup tests for this book
        loadBookState(i + 1, language);
        declarePlayBookTests(state.book);
    }
}

function loadBookState(bookNumber: number, language: Language) {
    state.book = new Book(bookNumber, language);
    state.language = state.book.language;

    // Book
    state.book.setXml(readFileSync(basePath + state.book.getBookXmlURL(), "latin1"));

    // Mechanics
    state.mechanics = new Mechanics(state.book);
    state.mechanics.setXml(readFileSync(basePath + state.mechanics.getXmlURL(), "utf-8"));
    state.mechanics.setObjectsXml(readFileSync(basePath + state.mechanics.getObjectsXmlURL(), "utf-8"));

    state.sectionStates = new BookSectionStates();
}

async function setupBookState(bookNumber: number, language: Language) {
    // console.log("setupBookState");

    loadBookState(bookNumber, language);

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

async function cleanLog() {
    await driver.executeScript("console.clear()");
}

async function loadCleanSection(sectionId: string) {
    // Reset state
    await driver.executeScript(
        "kai.state.actionChart = new kai.ActionChart();" +
        "kai.state.actionChart.manualRandomTable = false;" +
        "kai.state.sectionStates = new kai.BookSectionStates();"
    );
    // console.log(await driver.executeScript("kai.state.actionChart.currentEndurance;"));

    // Clear log
    await cleanLog();

    // Load section
    await driver.executeScript(`kai.gameController.loadSection("${sectionId}")`);

    // Wait section render
    await waitForSectionReady();

    state.sectionStates.currentSection = sectionId;
}

async function waitForSectionReady() {
    await driver.wait( until.elementLocated( By.id("section-ready") ) , 10000);
}

async function cleanSectionReady() {
    await driver.executeScript("kai.gameView.removeSectionReadymarker()");
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

async function debugSleep(miliseconds: number = 2500) {
    try {
        await driver.wait(until.elementLocated(By.id("notexists")), miliseconds);
    // tslint:disable-next-line: no-empty
    } catch { }
}

async function setNextRandomValue(value: number) {
    await driver.executeScript(`kai.randomTable.nextValueDebug = ${value}`);
}
