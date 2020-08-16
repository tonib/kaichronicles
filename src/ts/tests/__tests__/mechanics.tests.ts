import { GameDriver } from "../gameDriver";
import { Dir } from "fs-extra";
import { Language } from "../../state";
import { KaiDiscipline, MgnDiscipline, GndDiscipline } from "../../model/disciplinesDefinitions";
import { BookSeriesId } from "../../model/bookSeries";
import { Disciplines } from "../../model/disciplines";

// Selenium web driver
const driver: GameDriver = new GameDriver();

GameDriver.globalSetup();

jest.setTimeout(200000);

// Initial setup
beforeAll( async () => {
    await driver.setupBrowser();
});

// Final shutdown
afterAll( async () => {
    await driver.close();
});

test("Mindblast Kai series", async () => {
    await driver.setupBookState(1, Language.ENGLISH);
    await driver.setDisciplines( [ KaiDiscipline.Mindblast] );
    await driver.goToSection("sect63");
    expect( await driver.getTextByCss(".mechanics-combatRatio")).toBe("2");
});

test("Mindblast Kai series - noMindblast", async () => {
    await driver.setupBookState(1, Language.ENGLISH);
    await driver.setDisciplines( [ KaiDiscipline.Mindblast] );
    await driver.goToSection("sect133");
    expect( await driver.getTextByCss(".mechanics-combatRatio") ).toBe("-5");
});

async function testPsiSurge(sectionId: string, expectedCombatRatioMindblast: string,
                            expectedCRWithSurge: string, expectedSurgeLoss: number, minEpForSurge: number) {
    await driver.goToSection(sectionId);

    // Expect mindblast bonus
    expect( await driver.getTextByCss(".mechanics-combatRatio") ).toBe(expectedCombatRatioMindblast);

    // Check use Kai Surge. Expect CS increase
    await driver.cleanClickAndWait( await driver.getElementByCss(".psisurgecheck input") );
    expect( await driver.getTextByCss(".mechanics-combatRatio") ).toBe(expectedCRWithSurge);

    // Play turn. Expect EP loss
    await driver.setEndurance(15);
    await driver.setNextRandomValue(0);
    await driver.cleanClickAndWait( await driver.getElementByCss(".mechanics-playTurn") );
    expect( (await driver.getActionChart()).currentEndurance ).toBe(15 + expectedSurgeLoss);

    // Expect Kai Surge to be enabled with minimum EP
    await driver.setEndurance(minEpForSurge);
    await driver.goToSection(sectionId);
    let surgeCheck = await driver.getElementByCss(".psisurgecheck input");
    expect( await surgeCheck.isEnabled() ).toBe(true);
    expect( await surgeCheck.getAttribute("checked") ).toBeTruthy();

    // Expect Kai Surge to be disabled and unchecked with 6 EP
    await driver.setEndurance(minEpForSurge - 1);
    await driver.goToSection(sectionId);
    surgeCheck = await driver.getElementByCss(".psisurgecheck input");
    expect( await surgeCheck.isEnabled() ).toBe(false);
    expect( await surgeCheck.getAttribute("checked") ).toBeFalsy();
}

test("Psi Surge Magnakai series", async () => {
    await driver.setupBookState(6, Language.ENGLISH);
    await driver.setDisciplines( [ MgnDiscipline.PsiSurge ] , BookSeriesId.Magnakai );
    await testPsiSurge("sect47", "-5", "-3", -2, 7);
});

test("Psi Surge Magnakai series - Mentora", async () => {
    await driver.setupBookState(6, Language.ENGLISH);

    // Mentora = 9 disciplines
    const disciplines = Disciplines.getSeriesDisciplines(BookSeriesId.Magnakai).clone();
    disciplines.removeValue(MgnDiscipline.Divination);
    await driver.setDisciplines( disciplines , BookSeriesId.Magnakai );

    await testPsiSurge("sect47", "1", "4", -1, 5);
});

test("Mindblast Magnakai series - loyalty bonus", async () => {
    await driver.setupBookState(6, Language.ENGLISH);
    await driver.setDisciplines( [] );
    await driver.setDisciplines( [ KaiDiscipline.Mindblast ], BookSeriesId.Kai);
    await driver.goToSection("sect47");
    expect( await driver.getTextByCss(".mechanics-combatRatio") ).toBe("-5");
});

test("Kai Surge Grand Master series", async () => {
    await driver.setupBookState(13, Language.ENGLISH);
    await driver.setDisciplines( [ GndDiscipline.KaiSurge ] , BookSeriesId.GrandMaster );
    await testPsiSurge("sect11", "-2", "2", -1, 7);
});

test("Psi Surge Grand Master series - loyalty bonus", async () => {
    await driver.setupBookState(13, Language.ENGLISH);
    await driver.setDisciplines( [ MgnDiscipline.PsiSurge ] , BookSeriesId.Magnakai );
    await testPsiSurge("sect11", "2", "5", -1, 5);
});
