import { GameDriver } from "../gameDriver";
import { WebElement, Alert } from "selenium-webdriver";
import { SetupDisciplines, Book, Language, BookSeries, BookSeriesId, KaiDiscipline, state, projectAon } from "../..";

// Selenium web driver
const driver: GameDriver = new GameDriver();

GameDriver.globalSetup();

jest.setTimeout(2000000);

let bookSeries: BookSeries;

// Initial setup
beforeAll( async () => {
    await driver.setupBrowser();
});

// Final shutdown
afterAll( async () => {
    await driver.close();
});

async function getDisciplineCheck(disciplineId: string): Promise<WebElement> {
    return await driver.getElementById(SetupDisciplines.DISCIPLINE_CHECKBOX_ID + disciplineId);
}

async function cleanDisciplinesAndGoToSection() {
    await driver.setDisciplines([]);
    await driver.setWeaponskill([]);
    await driver.goToSection(Book.DISCIPLINES_SECTION);
}

async function testSelectWeaponskill() {

    await driver.goToSection(Book.DISCIPLINES_SECTION);

    // Test Weaponskill discipline
    if (bookSeries.id === BookSeriesId.Kai) {
        // Expect to choose weapon when selection Weaponskill discipline
        await driver.setNextRandomValue(7);
        await (await getDisciplineCheck(KaiDiscipline.Weaponskill)).click();
        const actionChart = await driver.getActionChart();
        expect( actionChart.getWeaponSkill() ).toStrictEqual( [ "sword" ] );

    } else if (bookSeries.id > BookSeriesId.Kai) {
        // Expect to allow to select up n weapons

        // Select weaponskill discipline
        await (await getDisciplineCheck(bookSeries.weaponskillDiscipline)).click();

        // Get weapon checkboxes. Expect 10 checkboxes
        const weaponsChecks = await driver.getElementsByCss(".weaponmastery-chk");
        expect( weaponsChecks.length ).toBe(10);

        // Expect message "select n weapons" to be visible
        const selectWeaponsMsg = await driver.getElementById("mechanics-setDisciplines-NWeapons");
        expect( await selectWeaponsMsg.isDisplayed() ).toBe(true);

        for (let i = 0; i < bookSeries.initialWeaponskillNWeapons; i++) {
            await weaponsChecks[i].click();
        }
        // Expect message "select n weapons" to be hidden
        expect( await selectWeaponsMsg.isDisplayed() ).toBe(false);

        // If you pick other weapon more, expect an error
        await weaponsChecks[bookSeries.initialWeaponskillNWeapons].click();
        const alert = await driver.getAlert();
        expect( alert ).not.toBeNull();
        await alert.accept();
    }
}

async function testSelectDisciplines() {

    await driver.goToSection(Book.DISCIPLINES_SECTION);

    // Test click on each discipline
    const seriesDisciplinesIds = bookSeries.getDisciplines();
    for (const disciplineId of seriesDisciplinesIds) {

        // Check the discipline. Expect to get the discipline
        const disciplineCheck = await getDisciplineCheck(disciplineId);
        await disciplineCheck.click();
        let actionChart = await driver.getActionChart();
        expect( actionChart.getDisciplines() ).toStrictEqual( [ disciplineId ] );

        // Uncheck the discipline. Expect to have no disciplines
        await disciplineCheck.click();
        actionChart = await driver.getActionChart();
        expect( actionChart.getDisciplines() ).toStrictEqual( [] );

        await cleanDisciplinesAndGoToSection();
    }
}

async function testDisciplinesInitialNumber() {

    await driver.goToSection(Book.DISCIPLINES_SECTION);

    // Test to select the initial disciplines number
    const seriesDisciplinesIds = bookSeries.getDisciplines();

    // Do not test "next section" is enabled, it can be disabled because weapons have not been selected
    const selectDisciplinesMsg = await driver.getElementById("mechanics-setDisciplines-NDis");
    for (let i = 0; i < bookSeries.initialNDisciplines; i++) {
        expect( await selectDisciplinesMsg.isDisplayed() ).toBe(true);
        await (await getDisciplineCheck(seriesDisciplinesIds[i])).click();
    }
    expect( await selectDisciplinesMsg.isDisplayed() ).toBe(false);

    // Select other more, and expect an alert
    await (await getDisciplineCheck(seriesDisciplinesIds[bookSeries.initialNDisciplines])).click();
    const alert = await driver.getAlert();
    expect( alert ).not.toBeNull();
    await alert.accept();
}

async function testCarryDisciplinesPreviousBook(bookNumber: number) {
    // Test carry disciplines from previous book

    // Go to previous book and setup disciplines
    await driver.setupBookState(bookNumber - 1, Language.ENGLISH);

    const seriesDisciplinesIds = bookSeries.getDisciplines();

    // Setup previous book state with the initial disciplines number (include always weaponskill)
    let disciplinesIds: string[] = seriesDisciplinesIds.clone();
    disciplinesIds.removeValue(bookSeries.weaponskillDiscipline);
    disciplinesIds.unshift(bookSeries.weaponskillDiscipline);
    const nextDisciplineToSelect = disciplinesIds[bookSeries.initialNDisciplines];
    disciplinesIds = disciplinesIds.slice(0, bookSeries.initialNDisciplines);
    await driver.setDisciplines( disciplinesIds );

    const nextWeaponId = SetupDisciplines.magnakaiWeapons[bookSeries.initialWeaponskillNWeapons];
    const weaponskill = SetupDisciplines.magnakaiWeapons.slice(0, bookSeries.initialWeaponskillNWeapons);
    await driver.setWeaponskill(weaponskill);

    // Go to current book
    await driver.goToSection( state.mechanics.getLastSectionId() );
    await driver.cleanClickAndWait( await driver.getElementById("game-nextBook") );
    await driver.goToSection(Book.DISCIPLINES_SECTION);

    // Expect previously selected disciplines checkboxes to be disabled
    for (const disciplineId of disciplinesIds) {
        expect( await (await getDisciplineCheck(disciplineId)).isEnabled() ).toBe(false);
    }

    // Expect message "Select n disciplines" to be visible
    const selectDisciplinesMsg = await driver.getElementById("mechanics-setDisciplines-NDis");
    expect( await selectDisciplinesMsg.isDisplayed() ).toBe(true);

    // Expect you can't go to the next section
    const nextSectButton = await driver.getElementById("game-nextSection");
    expect( await GameDriver.isClickable(nextSectButton) ).toBe(false);

    // Select next discipline. Expect message "Select n disciplines to be visible" to be hidden
    await (await getDisciplineCheck(nextDisciplineToSelect)).click();
    expect( await selectDisciplinesMsg.isDisplayed() ).toBe(false);

    // Try to select other weapon. Expect an alert
    const lastDiscipline = seriesDisciplinesIds[seriesDisciplinesIds.length - 1];
    await (await getDisciplineCheck(lastDiscipline)).click();
    let alert = await driver.getAlert();
    expect( alert ).not.toBeNull();
    await alert.accept();

    if (bookSeries.id > BookSeriesId.Kai) {
        // Expect message "Select n weapons" to  be visible
        const selectWeaponsMsg = await driver.getElementById("mechanics-setDisciplines-NWeapons");
        expect( await selectWeaponsMsg.isDisplayed() ).toBe(true);

        // Expect selected Weaponskill weapons checkboxes previously selected to be disabled
        for (const weaponId of weaponskill) {
            const weaponChkCurSel = await driver.getElementById(SetupDisciplines.WEAPON_CHECKBOX_ID + weaponId);
            expect( await weaponChkCurSel.isEnabled() ).toBe(false);
        }

        // Select next weapon
        await( await driver.getElementById(SetupDisciplines.WEAPON_CHECKBOX_ID + nextWeaponId) ).click();

        // Expect message to be hidden
        expect( await selectWeaponsMsg.isDisplayed() ).toBe(false);

        // Try to select other weapon. Expect an alert
        await (await driver.getElementById(SetupDisciplines.WEAPON_CHECKBOX_ID +
            SetupDisciplines.magnakaiWeapons[SetupDisciplines.magnakaiWeapons.length - 1])).click();
        alert = await driver.getAlert();
        expect( alert ).not.toBeNull();
        await alert.accept();
    }

    // Expect to be allowed to go to the next section
    expect( await GameDriver.isClickable(nextSectButton) ).toBe(true);
}

describe("setDisciplines", () => {

    for (let bookNumber = 1; bookNumber <= projectAon.supportedBooks.length; bookNumber++) {
    // for (let bookNumber = 7; bookNumber <= 7; bookNumber++) {

        describe("Book " + bookNumber, () => {

            beforeEach( async () => {
                await driver.setupBookState(bookNumber, Language.ENGLISH);
                bookSeries = BookSeries.getBookNumberSeries(bookNumber);

                await driver.setDisciplines([]);
                await driver.setWeaponskill([]);
            });

            test("Select weaponskill", testSelectWeaponskill);
            test("Select disciplines", testSelectDisciplines);
            test("Select initial disciplines number", testDisciplinesInitialNumber);
            if (!BookSeries.isSeriesStart(bookNumber)) {
                test("Carry disciplines from previous book", async () => { await testCarryDisciplinesPreviousBook(bookNumber); });
            }
        });
    }
});
