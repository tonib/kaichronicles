
function test(xx: number){
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
