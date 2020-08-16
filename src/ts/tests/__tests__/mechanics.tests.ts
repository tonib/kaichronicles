import { GameDriver } from "../gameDriver";
import { Dir } from "fs-extra";
import { Language } from "../../state";
import { KaiDiscipline, MgnDiscipline } from "../../model/disciplinesDefinitions";
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

async function testKaiSurge(mentora: boolean) {
    await driver.setupBookState(6, Language.ENGLISH);

    // Mentora = 9 disciplines
    let disciplines: string[];
    if (mentora) {
        disciplines = Disciplines.getSeriesDisciplines(BookSeriesId.Magnakai).clone();
        disciplines.removeValue(MgnDiscipline.Divination);
        await driver.setDisciplines( disciplines );
    } else {
        disciplines = [ MgnDiscipline.PsiSurge ];
    }
    await driver.setDisciplines( disciplines );
    await driver.goToSection("sect47");

    // Expect mindblast bonus
    expect( await driver.getTextByCss(".mechanics-combatRatio") ).toBe(mentora ? "1" : "-5");

    // Check use Kai Surge. Expect CS increase
    await driver.cleanClickAndWait( await driver.getElementByCss(".psisurgecheck input") );
    expect( await driver.getTextByCss(".mechanics-combatRatio") ).toBe(mentora ? "4" : "-3");

    // Play turn. Expect EP loss
    await driver.setEndurance(15);
    await driver.setNextRandomValue(0);
    await driver.cleanClickAndWait( await driver.getElementByCss(".mechanics-playTurn") );
    expect( (await driver.getActionChart()).currentEndurance ).toBe(mentora ? 14 : 13);

    // Expect Kai Surge to be enabled with minimum EP
    await driver.setEndurance(mentora ? 5 : 7);
    await driver.goToSection("sect47");
    let surgeCheck = await driver.getElementByCss(".psisurgecheck input");
    expect( await surgeCheck.isEnabled() ).toBe(true);
    expect( await surgeCheck.getAttribute("checked") ).toBeTruthy();

    // Expect Kai Surge to be disabled and unchecked with 6 EP
    await driver.setEndurance(mentora ? 4 : 6);
    await driver.goToSection("sect47");
    surgeCheck = await driver.getElementByCss(".psisurgecheck input");
    expect( await surgeCheck.isEnabled() ).toBe(false);
    expect( await surgeCheck.getAttribute("checked") ).toBeFalsy();
}

test("Kai Surge Magnakai series", async () => {
    await testKaiSurge(false);
});

test("Kai Surge Magnakai series - Mentora", async () => {
    await testKaiSurge(true);
});

test("Mindblast Magnakai series - loyalty bonus", async () => {
    await driver.setupBookState(6, Language.ENGLISH);
    await driver.setDisciplines( [] );
    await driver.setDisciplines( [ KaiDiscipline.Mindblast ], BookSeriesId.Kai);
    await driver.goToSection("sect47");
    expect( await driver.getTextByCss(".mechanics-combatRatio") ).toBe("-5");
});
