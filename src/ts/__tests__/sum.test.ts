
import {Builder, By, until, WebDriver, ThenableWebDriver} from "selenium-webdriver";
import {state, ActionChart, projectAon, declareCommonHelpers, LocalBooksLibrary, Section} from "..";
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

// Initial setup
beforeAll( async () => {
    // Setup jQuery
    global.jQuery = require("jquery");
    global.$ = global.jQuery;

    // Setup Selenium
    console.log("Setup Selenium");
    driver = await new Builder().forBrowser("chrome").build();
});

// Final shutdown
afterAll( async () => {
    // Close Selenium
    console.log("Close Selenium");
    await driver.close();
});

function playBook(bookNumber: number, language: Language) {
    describe(`Play book ${bookNumber} / ${language}`, () => {

        beforeAll( async () => {
            console.log("Setup book " + bookNumber + " / " + language);
            await setupBookState(bookNumber, language);
        });

        test(`${bookNumber} / ${language} test`, () => {
            console.log("Test book " + bookNumber + " / " + language);
            expect(1).toBe(1);
        });
    });
}

// Traverse books
for (let i = 0 ; i < projectAon.supportedBooks.length ; i++) {
    const bookMetadata = projectAon.supportedBooks[i];

    // Traverse languages
    for (const langKey of Object.keys(Language)) {
        const language = Language[langKey] as Language;

        console.log(bookMetadata["code_" + language]);

        if (!bookMetadata["code_" + language]) {
            // Untranslated
            continue;
        }

        // Setup tests for this book
        playBook(i + 1, language);
    }
}

async function setupBookState(bookNumber: number, language: Language) {
    console.log("setupBookState");

    state.language = language;

    // Book
    state.book = new Book(bookNumber, language);
    state.book.setXml(readFileSync(basePath + state.book.getBookXmlURL(), "latin1"));

    // Mechanics
    state.mechanics = new Mechanics(state.book);
    state.mechanics.setXml(readFileSync(basePath + state.mechanics.getXmlURL(), "utf-8"));
    state.mechanics.setObjectsXml(readFileSync(basePath + state.mechanics.getObjectsXmlURL(), "utf-8"));

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
