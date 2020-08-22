import { WebDriver, Builder, WebElement, By, until, AlertPromise, Alert } from "selenium-webdriver";
import { Language, state, Mechanics, BookSectionStates, Book, LocalBooksLibrary, declareCommonHelpers, BookSeriesId, CombatMechanics } from "..";
import { Type, Level } from "selenium-webdriver/lib/logging";
import { readFileSync } from "fs-extra";
import { ActionChart } from "../model/actionChart";

export class GameDriver {

    // Selenium web driver
    private driver: WebDriver = null;

    /** URL to start a new game */
    private newGameUrl;

    private static readonly BASEPATH = "src/www/";

    public constructor() {
        state.localBooksLibrary = new LocalBooksLibrary();

        this.newGameUrl = "http://localhost/ls";
        if (process.env.KAIURL) {
            this.newGameUrl = process.env.KAIURL;
        }
        this.newGameUrl += "/?test=true#newGame";
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

    public async getElementById(id: string): Promise<WebElement> {
        try {
            return await this.driver.findElement(By.id(id));
        } catch (e) {
            return null;
        }
    }

    public async getAlert(): Promise<Alert> {
        try {
            return await this.driver.switchTo().alert();
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    public async getTextByCss(selector: string): Promise<string> {
        return await (await this.getElementByCss(selector)).getText();
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

        await this.goToSection(sectionId);
    }

    public async goToSection(sectionId: string) {
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
                const isCordova404error = entry.message.indexOf("cordova.js") >= 0;
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
        await this.driver.get(this.newGameUrl);
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
        // isEnabled only checks the "disabled". We use "disabled" class for links. So check it too
        return await element.isEnabled() && await element.isDisplayed() &&
            (await element.getAttribute("class")).indexOf("disabled") < 0;
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

    public async clickPlayCombatTurn() {
        await this.cleanClickAndWait( await this.getElementByCss(CombatMechanics.PLAY_TURN_BTN_SELECTOR) );
    }

    public async getCombatRatio(): Promise<number> {
        return parseInt( await this.getTextByCss(CombatMechanics.COMBAT_RATIO_SELECTOR) , 10);
    }

    public async getSurgeCheckbox(): Promise<WebElement> {
        return await this.getElementByCss(CombatMechanics.SURGE_CHECK_SELECTOR);
    }

    public async getEludeCombatButton(): Promise<WebElement> {
        return await this.getElementByCss(CombatMechanics.ELUDE_BTN_SELECTOR);
    }

    public async setDisciplines(disciplinesIds: string[], seriesId: BookSeriesId = null) {
        const js = `kai.state.actionChart.setDisciplines(${JSON.stringify(disciplinesIds)}, ${seriesId});` +
            "kai.state.actionChart.checkMaxEndurance();";
        await this.driver.executeScript(js);
    }

    public async setWeaponskill(weaponsIds: string[], seriesId: BookSeriesId = null) {
        const js = `kai.state.actionChart.setWeaponSkill(${JSON.stringify(weaponsIds)}, ${seriesId});`;
        await this.driver.executeScript(js);
    }

    public async setEndurance(currentEndurance: number) {
        await this.driver.executeScript(`kai.actionChartController.increaseEndurance( ${currentEndurance} - kai.state.actionChart.currentEndurance )`);
    }

    public async getActionChart(): Promise<ActionChart> {
        const aChartReceived = await this.driver.executeScript("return kai.state.actionChart");
        // aChartReceived will contain functions declarations, but wrong: They are replaced by an object {}
        // Remove them:
        for (const methodName of Object.keys(ActionChart.prototype)) {
            delete aChartReceived[methodName];
        }
        return ActionChart.fromObject(aChartReceived, state.book.bookNumber);
    }

    public static globalSetup() {
        // Define common functions
        declareCommonHelpers(false);

        // Setup jQuery
        // tslint:disable-next-line: no-var-requires
        global.jQuery = require("jquery");
        global.$ = global.jQuery;
    }

}
