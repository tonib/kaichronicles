import { GameDriver } from "../gameDriver";
import { Dir } from "fs-extra";
import { Language } from "../../state";
import { KaiDiscipline, MgnDiscipline, GndDiscipline } from "../../model/disciplinesDefinitions";
import { BookSeriesId } from "../../model/bookSeries";
import { Disciplines } from "../../model/disciplines";
import { CombatMechanics } from "../..";
import { Driver } from "selenium-webdriver/chrome";

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
        await driver.setDisciplines( [ KaiDiscipline.Mindblast]  );
        await driver.goToSection("sect133");
        expect( await driver.getCombatRatio() ).toBe(-5);
    });

    test("noPsiSurge", async () => {
        await driver.setupBookState(6, Language.ENGLISH);
        await driver.setDisciplines( [ MgnDiscipline.PsiSurge ] );
        await driver.goToSection("sect156");
        // No mindblast bonus:
        expect( await driver.getCombatRatio() ).toBe(-2);
        // No Psi-surge check available:
        expect( await (await driver.getSurgeCheckbox()).isDisplayed() ).toBe(false);
    });

    test("noKaiSurge", async () => {
        await driver.setupBookState(13, Language.ENGLISH);
        await driver.setDisciplines( [ GndDiscipline.KaiSurge ] );
        await driver.goToSection("sect56");
        // No mindblast bonus:
        expect( await driver.getCombatRatio() ).toBe(-6);
        // No Kai-surge check available:
        expect( await (await driver.getSurgeCheckbox()).isDisplayed() ).toBe(false);
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

    test("mindblastBonus", async () => {
        await driver.setupBookState(5, Language.ENGLISH);
        await driver.setDisciplines( [ KaiDiscipline.Mindblast ] );
        await driver.goToSection("sect110");

        expect( await driver.getCombatRatio() ).toBe(-4);
    });

    test("psiSurgeBonus", async () => {
        await driver.setupBookState(10, Language.ENGLISH);
        await driver.setDisciplines( [ MgnDiscipline.PsiSurge ] );
        await driver.goToSection("sect81");

        // Check use Kai Surge. Expect CS increase
        await driver.cleanClickAndWait( await driver.getSurgeCheckbox() );
        expect( await driver.getCombatRatio() ).toBe(-9);
    });

    test("kaiSurgeBonus", async () => {
        await driver.setupBookState(13, Language.ENGLISH);
        await driver.setDisciplines( [ GndDiscipline.KaiSurge ] );
        await driver.goToSection("sect301");

        // Check use Kai Surge. Expect CS increase
        await driver.cleanClickAndWait( await driver.getSurgeCheckbox() );
        expect( await driver.getCombatRatio() ).toBe(0);
    });
});
