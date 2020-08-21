import { GameDriver } from "../gameDriver";
import { Dir } from "fs-extra";
import { Language } from "../../state";
import { KaiDiscipline, MgnDiscipline, GndDiscipline } from "../../model/disciplinesDefinitions";
import { BookSeriesId, BookSeries } from "../../model/bookSeries";
import { Disciplines } from "../../model/disciplines";
import { CombatMechanics, Book, SetupDisciplines } from "../..";
import { Driver } from "selenium-webdriver/chrome";
import { projectAon } from "../../model/projectAon";
import { WebElement } from "selenium-webdriver";

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
});

test("setDisciplines", async () => {

    async function getDisciplineCheck(disciplineId: string): Promise<WebElement> {
        return await driver.getElementById(SetupDisciplines.DISCIPLINE_CHECKBOX_ID + disciplineId);
    }

    async function cleanDisciplinesAndGoToSection() {
        await driver.setDisciplines([]);
        await driver.setWeaponskill([]);
        await driver.goToSection(Book.DISCIPLINES_SECTION);
    }

    // for (let bookNumber = 1; bookNumber <= projectAon.supportedBooks.length; bookNumber++) {
    for (let bookNumber = 1; bookNumber <= 1; bookNumber++) {

        await driver.setupBookState(bookNumber, Language.ENGLISH);
        await cleanDisciplinesAndGoToSection();

        const bookSeries = BookSeries.getBookNumberSeries(bookNumber);
        if (bookSeries.id === BookSeriesId.Kai) {
            // Expect to choose weapon when selection Weaponskill discipline
            await driver.setNextRandomValue(7);
            await (await getDisciplineCheck(KaiDiscipline.Weaponskill)).click();
            const actionChart = await driver.getActionChart();
            expect( actionChart.getWeaponSkill() ).toStrictEqual( [ "sword" ] );

            await cleanDisciplinesAndGoToSection();
        }

        // Test click on each discipline
        for (const disciiplineId of bookSeries.getDisciplines()) {

            // Check the discipline. Expect to get the discipline
            const disciplineCheck = await getDisciplineCheck(disciiplineId);
            await disciplineCheck.click();
            let actionChart = await driver.getActionChart();
            expect( actionChart.getDisciplines() ).toStrictEqual( [ disciiplineId ] );

            // Uncheck the discipline. Expect to have no disciplines
            await disciplineCheck.click();
            actionChart = await driver.getActionChart();
            expect( actionChart.getDisciplines() ).toStrictEqual( [] );

            await cleanDisciplinesAndGoToSection();
        }

    }
});
