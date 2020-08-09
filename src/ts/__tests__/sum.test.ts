
// Prepare environment for jQuery execution

import * as $ from "jquery";
import { JSDOM } from "jsdom";

const jsDomDocument = new JSDOM("");
global.document = jsDomDocument as any;
global.window = jsDomDocument.window as any;
global.$ = $( jsDomDocument.window ) as any;

// Other imports

import {Builder, By, until, WebDriver, ThenableWebDriver} from "selenium-webdriver";
import {state, ActionChart, projectAon, declareCommonHelpers, LocalBooksLibrary, Section} from "..";
import { Book } from "..";
import { Language } from "..";
import { readFileSync } from "fs-extra";
import { Mechanics } from "../model/mechanics";

// Define common functions
declareCommonHelpers(false);

const basePath = "src/www/";
state.localBooksLibrary = new LocalBooksLibrary();

// Selenium web driver
let driver: WebDriver = null;

(async function execution() {

    // Setup Selenium
    driver = await new Builder().forBrowser("chrome").build();

    await traverseBooks();

    // Close Selenium
    await driver.close();
})();

// Traverse books
async function traverseBooks() {
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

            // Setup state
            await setupBookState(i + 1, language);

            // Traverse sections
            let sectionId = Book.INITIAL_SECTION;
            while (sectionId != null) {
                const section = new Section(state.book, sectionId, state.mechanics);
                await testSection(section);
                sectionId = section.getNextSectionId();
            }
        }
    }
}

async function testSection(section: Section) {
    console.log(section.sectionId);

    // Reset state
    await driver.executeScript("kai.state.actionChart = new kai.ActionChart(); kai.state.sectionStates = new kai.BookSectionStates();");
    // console.log(await driver.executeScript("kai.state.actionChart.currentEndurance;"));

    // Load section
    await driver.executeScript(`kai.gameController.loadSection("${section.sectionId}")`);

    // Wait section render
    await driver.wait( until.elementLocated( By.id("section-ready") ) , 10000);

}

async function setupBookState(bookNumber: number, language: Language) {

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

/*
test("test selenium", () => {
    return (async function myFunction() {
        const driver = await new Builder().forBrowser("chrome").build();

        await driver.get("http://localhost/ls/?debug=true#game");

        (await driver.findElement(By.id("menu-new"))).click();

        await (await driver.wait(until.elementLocated(By.id("newgame-start")), 10000)).click();

        const ac = await driver.executeScript("return state.actionChart");

        console.log(state.actionChart);
        // await driver.close();
    })();

});
*/

/*
function sum(a: number, b: number): number {
    return a + b;
}

test("adds 1 + 2 to equal 3", () => {
    expect(sum(1, 2)).toBe(3);
});
*/
