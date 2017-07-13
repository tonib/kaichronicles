// External declarations

declare var gameView:any;
declare var mechanicsEngine:any;
declare var template:any;
declare var actionChartController:any;
declare var cordovaApp:any;
declare var projectAon:any;
declare var Section:any;
declare var SectionRenderer:any;
declare var Combat:any;
declare var CombatTurn:any;

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
