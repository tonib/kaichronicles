// External declarations

declare var template:any;
declare var cordovaApp:any;
declare var projectAon:any;
declare var views:any;
declare var routing:any;
declare var setupController:any;
declare var cordovaFS:any;

declare var $:any;
declare var jQuery:any;

declare var toastr:any;

declare var saveAs:any;

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
