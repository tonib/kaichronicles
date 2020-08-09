
// Prepare environment for jQuery execution

import * as $ from "jquery";
import { JSDOM } from "jsdom";

const jsDomDocument = new JSDOM("");
global.document = jsDomDocument as any;
global.window = jsDomDocument.window as any;
global.$ = $( jsDomDocument.window ) as any;

// Other imports

import {Builder, By, until, WebDriver} from "selenium-webdriver";
import {state, ActionChart, projectAon, declareCommonHelpers} from "..";
import { Book } from "..";
import { Language } from "..";
import { readFileSync } from "fs-extra";

// Define common functions
declareCommonHelpers(false);

/*
function sum(a: number, b: number): number {
    return a + b;
}

test("adds 1 + 2 to equal 3", () => {
    expect(sum(1, 2)).toBe(3);
});
*/

// Traverse books
for (let i = 0 ; i < projectAon.supportedBooks.length ; i++) {
    const bookMetadata = projectAon.supportedBooks[i];
    // Traverse languages
    for (const langKey of Object.keys(Language)) {
        const language = Language[langKey] as Language;

        if (!bookMetadata["code_" + language]) {
            // Untranslated
            continue;
        }

        // Setup state
        state.book = new Book(i + 1, language);
        const path = "src/www/" + state.book.getBookXmlURL();
        console.log(path);

        // Read book XML
        state.book.setXml( readFileSync( path , "latin1" ) );

        console.log( state.book.getKaiTitle(2) );
    }
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