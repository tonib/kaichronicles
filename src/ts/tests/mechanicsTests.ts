
/**
 * Tools to validate book mechanics
 */

import libxml = require( 'libxmljs' );
import fs = require('node-fs-extra');
declare var process;

console.log("* Mechanics tests");

console.log("Loading XSD...");
const xsd : string = fs.readFileSync( 'src/ts/tests/mechanics.xsd' , 'utf8' );
const xsdDoc = libxml.parseXml(xsd);

console.log("Loading XML...");
const xmlText : string = fs.readFileSync( 'src/ts/tests/test_file.xml' , 'utf8' );
const xmlDoc = libxml.parseXml(xmlText);

console.log("Validating...");
try {
    if( xmlDoc.validate(xsdDoc) )
        console.log('XML OK!');
    else {
        console.log('Do\'h!');
        console.log( xmlDoc.validationErrors );
    }
}
catch(e) {
    console.log(e);
}

/*
var xsd = '<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"><xs:element name="comment"><xs:complexType><xs:all><xs:element name="author" type="xs:string"/><xs:element name="content" type="xs:string"/></xs:all></xs:complexType></xs:element></xs:schema>';
var xml_valid = '<?xml version="1.0"?><comment><author>author</author><content>nothing</content></comment>';
var xml_invalid = '<?xml version="1.0"?><comment>A comment</comment>';

var xsdDoc = libxml.parseXml(xsd);
var xmlDocValid = libxml.parseXml(xml_valid);
var xmlDocInvalid = libxml.parseXml(xml_invalid);

console.log(xmlDocValid.validate(xsdDoc), true);
console.log(xmlDocValid.validationErrors.length, 0);
console.log(xmlDocInvalid.validate(xsdDoc), false);

console.log(xmlDocInvalid.validationErrors.length, 2);
console.log(xmlDocInvalid.validationErrors);
*/

