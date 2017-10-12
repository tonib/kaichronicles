// External declarations

declare var template:any;
declare var cordovaApp:any;
declare var views:any;
declare var routing:any;
declare var setupView:any;
declare var cordovaFS:any;
declare var loadGameView:any;

// index.html:
declare const ENVIRONMENT : string;

// jQuery
declare var $:any;
declare var jQuery:any;

// toastr.js
declare var toastr:any;

// FileSaver.js
declare var saveAs:any;

// node.js
declare var exports;

// Google analytics
declare var ga;

// xmllint.js
declare function validateXML(parms : any) : string;

// commons.js: 
interface Window { 
    getUrlParameter( parmName : string ) : string 
}
interface Array<T> { 
    removeValue( value : T ) : boolean;
    contains( value : T ) : boolean;
    clone() : Array<T>;
}
interface String {
    replaceAll(find : string, replace : string) : string;
    padLeft(padLength : number, padChar : string) : string;
    endsWith(suffix : string);
    isValidFileName() : boolean;
}
declare function ajaxErrorMsg(context : any, jqXHR : any, textStatus : string, errorThrown : string);

