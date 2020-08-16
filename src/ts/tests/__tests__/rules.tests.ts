import { GameDriver } from "../gameDriver";
import { Dir } from "fs-extra";
import { Language } from "../../state";
import { KaiDiscipline, MgnDiscipline, GndDiscipline } from "../../model/disciplinesDefinitions";
import { BookSeriesId } from "../../model/bookSeries";
import { Disciplines } from "../../model/disciplines";
import { CombatMechanics } from "../..";

// Selenium web driver
const driver: GameDriver = new GameDriver();

GameDriver.globalSetup();

// jest.setTimeout(200000);

// Initial setup
beforeAll( async () => {
    await driver.setupBrowser();
});

// Final shutdown
afterAll( async () => {
    await driver.close();
});

describe("combat rule", () => {

    test("noMindblast", async () => {
        await driver.setupBookState(1, Language.ENGLISH);
        await driver.setDisciplines( [ KaiDiscipline.Mindblast] );
        await driver.goToSection("sect133");
        expect( await driver.getTextByCss(".mechanics-combatRatio") ).toBe("-5");
    });

    test("maxEludeTurn", async () => {
        await driver.setupBookState(6, Language.ENGLISH);
        await driver.goToSection("sect116");

        // Expect to elude to be clickable in first turn
        const eludeBtn = await driver.getElementByCss(CombatMechanics.ELUDE_BTN_SELECTOR);
        expect(await GameDriver.isClickable(eludeBtn)).toBe(true);

        // Play turn
        await driver.setNextRandomValue(0);
        await driver.clickPlayCombatTurn();

        // Expect to elude to be not visible
        expect(await eludeBtn.isDisplayed()).toBe(false);
    });
});
