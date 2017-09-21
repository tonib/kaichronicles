
/**
 * Tools to validate book mechanics
 */

import libxml = require( 'libxmljs' );
import fs = require('node-fs-extra');
declare var process;

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

validateBookXml( 'src/www/data/mechanics-1.xml' );
validateBookXml( 'src/www/data/mechanics-2.xml' );
