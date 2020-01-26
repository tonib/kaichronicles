
/*
function test(xx: number) {
    if (xx == 10) {
        console.log("Is ten");
    } else {
        console.log("Is NOT ten");
    }
}

let x: any;
const r = 100;
// x = ( r < 1000 ? '10' : 10 );
x = "10";
test(x);
*/

// Test arrow functions
class Test {

    public x = 0;

    public increment() {
        this.x++;
    }

    public incrementWithArrow() {
        const f = () => { this.x++; };
        f();
    }

}

const x = new Test();
x.increment();
console.log(x.x);
x.incrementWithArrow();
console.log(x.x);
