// External declarations

declare var template:any;
declare var cordovaApp:any;
declare var views:any;
declare var routing:any;
declare var setupView:any;

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

// Cordova
declare const LocalFileSystem;
declare const FileTransfer;

// cordova-plugin-zip (Cordova plugin)
declare const zip;

// cordova-plugin-zeep (Cordova plugin)
declare const Zeep;

// cordova-plugin-copytodownload (Cordova plugin)
declare const CopyToDownload;

// com.megster.cordova.FileChooser (Cordova plugin)
declare const fileChooser;

// commons.js: 
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

// Mixed:
interface Window { 
    // commons.js: 
    getUrlParameter( parmName : string ) : string 

    // Cordova:
    requestFileSystem;
}
