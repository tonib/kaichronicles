
import {state, ActionChart} from "..";

state.actionChart = new ActionChart();
console.log(state.actionChart);

/*
//import {state} from "../kaiimports";
//import "../kaiimports";
import {Builder, By, until, WebDriver} from "selenium-webdriver";

const state = require( "../../state" ).state as State;
const Book = require( "../../model/book" ).Book;
//import {Book} from  "../../model/book" ;

//import {state} from "../../state"; // < does not work

console.log(Book);
const book = new Book();
console.log(book);


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

        const ac = await driver.executeScript("return state.actionChart");

        console.log(state.actionChart);
        // await driver.close();
    })();

});
*/