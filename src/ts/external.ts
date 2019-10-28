// External declarations
interface JQuery {
    getNumber(): number;
    setNumber(value: number): void;
    getTitle(): string;
    bindNumberEvents(): void;
    fireValueChanged(): void;
    getMinValue(): number;
    getMaxValue(): number;
    isValid(): boolean;
    setEnabled(enabled: boolean): void;
    isEnabled(): boolean;
    initializeValue(): void;
}

declare var cordovaApp:any;
declare var routing:any;

// index.html:
declare const ENVIRONMENT : string;

// toastr.js
declare var toastr:Toastr;

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
    startsWith( text : string ) : boolean;
}
declare function ajaxErrorMsg(context : any, jqXHR : any, textStatus : string, errorThrown : string);

// Mixed:
interface Window { 
    // commons.js: 
    getUrlParameter( parmName : string ) : string 

    // Cordova:
    requestFileSystem;

    // Cordova:
    resolveLocalFileSystemURI;
   
    // cordova-plugin-document-contract (Cordova plugin)
    plugins : {
        DocumentContract;
    }
    
}
