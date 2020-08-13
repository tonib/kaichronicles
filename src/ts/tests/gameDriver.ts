import { WebDriver, Builder, WebElement, By, until } from "selenium-webdriver";
import { Language, state, Mechanics, BookSectionStates, Book, LocalBooksLibrary } from "..";
import { Type, Level } from "selenium-webdriver/lib/logging";
import { readFileSync } from "fs-extra";

export class GameDriver {

    // Selenium web driver
    private driver: WebDriver = null;

    private static readonly BASEPATH = "src/www/";

    public constructor() {
        // Setup jQuery
        // tslint:disable-next-line: no-var-requires
        // global.jQuery = require("jquery");
        // global.$ = global.jQuery;

        state.localBooksLibrary = new LocalBooksLibrary();
    }

    public async setupBrowser() {
        // Setup Selenium
        // console.log("Setup Selenium");
        this.driver = await new Builder().forBrowser("chrome").build();
        // Maximize to avoid links get shadows by toastr
        await this.driver.manage().window().maximize();
    }

    public async close() {
        // Close Selenium
        // console.log("Close Selenium");
        await this.driver.close();
    }

    public async getElementsByCss(selector: string): Promise<WebElement[]> {
        try {
            return await this.driver.findElements(By.css(selector));
        } catch (e) {
            // console.log("No play turn button");
            return [];
        }
    }

    public async getElementByCss(selector: string): Promise<WebElement> {
        try {
            return await this.driver.findElement(By.css(selector));
        } catch (e) {
            // console.log("No play turn button");
            return null;
        }
    }

    public async increaseMoney(amount: number) {
        await this.driver.executeScript(`kai.actionChartController.increaseMoney(${amount})`);
    }

    public async pick(objectId: string) {
        await this.driver.executeScript(`kai.actionChartController.pick("${objectId}")`);
    }

    public async fireInventoryEvents() {
        await this.driver.executeScript("kai.mechanicsEngine.fireInventoryEvents()");
    }

    public async cleanLog() {
        await this.driver.executeScript("console.clear()");
    }

    public async loadCleanSection(sectionId: string, deleteLog: boolean = true) {
        // console.log("loadCleanSection " + sectionId);

        // Reset state
        await this.driver.executeScript(
            "kai.state.actionChart = new kai.ActionChart();" +
            "kai.state.actionChart.manualRandomTable = false;" +
            "kai.state.sectionStates = new kai.BookSectionStates();"
        );
        // console.log(await driver.executeScript("kai.state.actionChart.currentEndurance;"));

        if (deleteLog) {
            // Clear log
            await this.cleanLog();
        }

        // Load section
        await this.driver.executeScript(`kai.gameController.loadSection("${sectionId}")`);

        // Wait section render
        await this.waitForSectionReady();

        state.sectionStates.currentSection = sectionId;
    }

    public async getLogErrors(): Promise<string[]> {
        const errors = [];
        for (const entry of await this.driver.manage().logs().get(Type.BROWSER)) {
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

    public async debugSleep(miliseconds: number = 2500) {
        try {
            await this.driver.wait(until.elementLocated(By.id("notexists")), miliseconds);
        // tslint:disable-next-line: no-empty
        } catch { }
    }

    public async setNextRandomValue(value: number) {
        await this.driver.executeScript(`kai.randomTable.nextValueDebug = ${value}`);
    }

    public async setupBookState(bookNumber: number, language: Language) {
        // console.log("setupBookState");

        this.loadBookState(bookNumber, language);

        // Go to new game page
        await this.driver.get("http://localhost/ls/?debug=true&test=true#newGame");
        // Select new book
        await( await this.driver.wait( until.elementLocated( By.css(`#newgame-book > option[value='${bookNumber}']`) ) , 10000) ).click();
        // Select language
        await ( await this.driver.findElement( By.css(`#newgame-language > option[value='${language}']`) ) ).click();

        // Click start game
        await (await this.driver.wait(until.elementLocated(By.id("newgame-start")), 10000)).click();
        await this.driver.wait(until.elementLocated(By.id("game-nextSection")), 5000);
    }

    public loadBookState(bookNumber: number, language: Language) {
        state.book = new Book(bookNumber, language);
        state.language = state.book.language;

        // Book
        state.book.setXml(readFileSync(GameDriver.BASEPATH + state.book.getBookXmlURL(), "latin1"));

        // Mechanics
        state.mechanics = new Mechanics(state.book);
        state.mechanics.setXml(readFileSync(GameDriver.BASEPATH + state.mechanics.getXmlURL(), "utf-8"));
        state.mechanics.setObjectsXml(readFileSync(GameDriver.BASEPATH + state.mechanics.getObjectsXmlURL(), "utf-8"));

        state.sectionStates = new BookSectionStates();
    }

    public static async isClickable(element: WebElement) {
        return await element.isEnabled() && await element.isDisplayed();
    }

    public async waitForSectionReady() {
        await this.driver.wait( until.elementLocated( By.id("section-ready") ) , 10000);
    }

    public async cleanSectionReady() {
        await this.driver.executeScript("kai.gameView.removeSectionReadymarker()");
    }

    public async cleanClickAndWait(element: WebElement) {
        await this.cleanSectionReady();
        await element.click();
        await this.waitForSectionReady();
    }
}
