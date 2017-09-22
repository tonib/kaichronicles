
/**
 * Tools to validate book mechanics
 */

import libxml = require( 'libxmljs' );
import fs = require('node-fs-extra');

// OK, this is, again, insane (oh javascript...). I cannot import the projectAon const for node.js and use it on
// the browser at the same time, if I use Typescript modules. So, fuck off:
// TODO: Change projectAon from const to class, so we can do a cast, and then keep the Typescript safety
declare var require;
const projectAon = require( '../model/projectAon.js' ).projectAon;

function validateBookXml( path : string ) {

    console.log('Loading ' + path + ' ...');
    const xmlText : string = fs.readFileSync( path , 'utf8' );
    const xmlDoc = libxml.parseXml(xmlText);
    
    console.log('Validating...');
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
    validateBookXml( 'src/www/data/mechanics-' + i + '.xml' );
