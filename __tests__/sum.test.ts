import {Builder, By, until} from "selenium-webdriver";

function sum(a: number, b: number): number {
    return a + b;
}

test("adds 1 + 2 to equal 3", () => {
    expect(sum(1, 2)).toBe(3);
});

test("test selenium", () => {
    return (async function myFunction() {
        const driver = await new Builder().forBrowser("chrome").build();

        await driver.get("http://localhost/ls/?debug=true#game");

        (await driver.findElement(By.id("menu-new"))).click();

        await (await driver.wait(until.elementLocated(By.id("newgame-start")), 10000)).click();
    })();
});
