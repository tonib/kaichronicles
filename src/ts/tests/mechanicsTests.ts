/**
 * node.js script to validate all books
 * TODO: This will no go any further. No way to execute $.parseXml from node.js, errors loading non exported symbols...
 * TODO: Try to run this at the browser
 */

import libxml = require( 'libxmljs' );
import fs = require('node-fs-extra');

const JS_DIR = '../../../js/';

// OK, this is, again, insane (oh javascript...). I cannot import the projectAon const for node.js and use it on
// the browser at the same time, if I use Typescript modules. So, fuck off:
declare var require, global;
global.projectAon = require( JS_DIR + 'ts-generated/model/projectAon.js' ).projectAon;

/**
 * Validate a book
 * @param bookNumber Book number to validate
 */
function validateBookXml( bookNumber : number ) {

    const path = 'src/www/data/mechanics-' + bookNumber + '.xml';
    console.log('Loading ' + path + ' ...');
    const xmlText : string = fs.readFileSync( path , 'utf8' );
    const xmlDoc = libxml.parseXml(xmlText);
    
    console.log('Validating mechanics XML...');
    try {
        if( xmlDoc.validate(xsdDoc) )
            console.log('XML OK!');
        else {
            console.log('Do\'h!');
            console.log( xmlDoc.validationErrors );
        }
    }
    catch(e) {
        console.log( 'Error validating: ' + e.toString() );
    }
}

console.log("* Mechanics tests");

console.log("Loading XSD...");
const xsd : string = fs.readFileSync( 'src/ts/tests/mechanics.xsd' , 'utf8' );
const xsdDoc = libxml.parseXml(xsd);

for(let i=1; i<= projectAon.supportedBooks.length; i++)
    validateBookXml( i );
