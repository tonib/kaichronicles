import { GameDriver } from "../gameDriver";
import { Dir } from "fs-extra";
import { Language } from "../../state";
import { KaiDiscipline, MgnDiscipline, GndDiscipline } from "../../model/disciplinesDefinitions";
import { BookSeriesId, BookSeries } from "../../model/bookSeries";
import { Disciplines } from "../../model/disciplines";
import { CombatMechanics, Book, SetupDisciplines } from "../..";
import { Driver } from "selenium-webdriver/chrome";
import { projectAon } from "../../model/projectAon";
import { WebElement, Alert } from "selenium-webdriver";

// Selenium web driver
const driver: GameDriver = new GameDriver();

GameDriver.globalSetup();

jest.setTimeout(2000000);

// Initial setup
beforeAll( async () => {
    await driver.setupBrowser();
});

// Final shutdown
afterAll( async () => {
    await driver.close();
});

describe("combat", () => {

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
        const eludeBtn = await driver.getEludeCombatButton();
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

    test("eludeEnemyEP", async () => {
        await driver.setupBookState(13, Language.ENGLISH);
        await driver.pick("sommerswerd");
        await driver.goToSection("sect38");

        await driver.setNextRandomValue(0);
        await driver.clickPlayCombatTurn();

        for (let i = 0; i < 4 ; i++) {
            await driver.setNextRandomValue(0);
            await driver.clickPlayCombatTurn();
        }
        // Enemy EP here = 40

        await driver.setNextRandomValue(5);
        await driver.clickPlayCombatTurn();

        // EP = 37. Expect no elude allowed
        const eludeBtn = await driver.getEludeCombatButton();
        expect( await eludeBtn.isDisplayed() ).toBe(false);

        await driver.setNextRandomValue(3);
        await driver.clickPlayCombatTurn();

        // EP = 36. Expect elude allowed
        expect( await GameDriver.isClickable(eludeBtn) ).toBe(true);
    });

    test("combatSkillModifier", async () => {
        await driver.setupBookState(13, Language.ENGLISH);
        await driver.setDisciplines([]);
        await driver.goToSection("sect86");
        expect( await driver.getCombatRatio() ).toBe(-10);
    });
});

// setDisciplines -> See setDisciplines.tests.ts

describe("test", () => {
    test("hasDiscipline", async () => {
        await driver.setupBookState(13, Language.ENGLISH);

        await driver.setDisciplines([]);
        await driver.goToSection("sect84");
        expect( await driver.choiceIsEnabled("sect7") ).toBe(false);
        expect( await driver.choiceIsEnabled("sect171") ).toBe(true);

        await driver.setDisciplines([GndDiscipline.AnimalMastery]);
        await driver.goToSection("sect84");
        expect( await driver.choiceIsEnabled("sect7") ).toBe(true);
        expect( await driver.choiceIsEnabled("sect171") ).toBe(false);
    });

    test("hasObject", async () => {
        await driver.setupBookState(13, Language.ENGLISH);
        await driver.pick("sommerswerd");
        await driver.goToSection("sect290");
        expect( await driver.choiceIsEnabled("sect199") ).toBe(true);
        expect( await driver.choiceIsEnabled("sect316") ).toBe(false);

        await driver.drop("sommerswerd", true);
        await driver.goToSection("sect290");
        expect( await driver.choiceIsEnabled("sect199") ).toBe(false);
        expect( await driver.choiceIsEnabled("sect316") ).toBe(true);

        // Pick object from section, expect allow to go to section right now
        await driver.pick("sommerswerd", true);
        expect( await driver.choiceIsEnabled("sect199") ).toBe(true);
        expect( await driver.choiceIsEnabled("sect316") ).toBe(false);
    });

    test("canUseBow", async () => {
        await driver.setupBookState(13, Language.ENGLISH);
        await driver.goToSection("sect96");
        expect( await driver.choiceIsEnabled("sect225") ).toBe(false);

        // Only bow, you cannot shot
        await driver.pick("bow");
        await driver.goToSection("sect96");
        expect( await driver.choiceIsEnabled("sect225") ).toBe(false);

        // Bow and quiver, but no arrows, you cannot shot
        await driver.pick("quiver");
        await driver.goToSection("sect96");
        expect( await driver.choiceIsEnabled("sect225") ).toBe(false);

        await driver.increaseArrows(1);
        await driver.goToSection("sect96");
        expect( await driver.choiceIsEnabled("sect225") ).toBe(true);

        // If you pick the bow from the section, expect to shot inmediatelly
        await driver.drop("bow", true);
        await driver.goToSection("sect96");
        expect( await driver.choiceIsEnabled("sect225") ).toBe(false);
        await driver.pick("bow", true);
        expect( await driver.choiceIsEnabled("sect225") ).toBe(true);
    });
});

describe("expressions", () => {

    test("ENDURANCE", async () => {
        await driver.setupBookState(13, Language.ENGLISH);

        async function setup(endurance: number, randomValue: number) {
            await driver.loadCleanSection(Book.INITIAL_SECTION);
            await driver.setDisciplines([]);
            await driver.setEndurance(endurance);
            await driver.goToSection("sect91");
            await driver.setNextRandomValue(randomValue);
            await driver.clickRandomLink();
        }

        await setup(20, 6);
        // Expect to get +2 and go to sect184
        expect( await driver.choiceIsEnabled("sect184") ).toBe(true);
        await setup(19, 7);
        expect( await driver.choiceIsEnabled("sect184") ).toBe(false);
    });

});

test("endurance", async () => {
    await driver.setupBookState(13, Language.ENGLISH);
    await driver.setDisciplines([]);
    await driver.setEndurance(10);
    await driver.goToSection("sect92");
    expect( (await driver.getActionChart()).currentEndurance ).toBe(5);
});

test("death", async () => {
    await driver.setupBookState(13, Language.ENGLISH);
    await driver.pick("healingpotion");
    await driver.setDisciplines([GndDiscipline.Deliverance]);
    await driver.goToSection("sect99");
    expect( (await driver.getActionChart()).currentEndurance ).toBe(0);
    expect( await (await driver.getElementById("mechanics-death")).isDisplayed() ).toBe(true);

    // Expect do not use objects or curing button
    await driver.goToActionChart();
    expect( await GameDriver.isClickable( await driver.getElementById("achart-restore20Ep") ) ).toBe(false);
    expect( await driver.getUseObjectLink("healingpotion") ).toBe(null);
});
