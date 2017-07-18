// External declarations

declare var gameView:any;
declare var template:any;
declare var cordovaApp:any;
declare var projectAon:any;
declare var SectionRenderer:any;
declare var views:any;
declare var routing:any;
declare var gameController:any;
declare var setupMechanics:any;
declare var randomMechanics:any;
declare var mealMechanics:any;
declare var numberPickerMechanics:any;
declare var specialSectionsMechanics:any;
declare var setupController:any;

declare var $:any;
declare var jQuery:any;

declare var toastr:any;

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
    replaceAll(find : string, replace : string) : string
}
