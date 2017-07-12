// External declarations

declare var state:any;
declare var gameView:any;
declare var mechanicsEngine:any;
declare var template:any;
declare var objectsTable;
declare var actionChartController;

declare var $:any;
declare var jQuery:any;

declare var toastr:any;

// commons.js: 
interface Window { getUrlParameter( parmName : string ) : string }
interface Array<T> { 
    removeValue( value : T ) : boolean;
    contains( value : T ) : boolean;
    clone() : Array<T>;
}
