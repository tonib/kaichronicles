/// <reference path="../external.ts" />

/**
 * Metadata about books and Project Aon web structure
 */
const projectAon = {

    /**
     * Books metadata
     */
    supportedBooks: [

        // Book 1:
        {
            // English title
            title_en: 'Flight from the Dark',
            // English book code
            code_en: '01fftd',

            // Spanish title
            title_es: 'Huida de la oscuridad',
            // Spanish code
            code_es: '01hdlo',

            // Illustrators folders to download
            illustrators: [ 'chalk' ],

            // Authors biographies (.inc files in [LANGUAGECODE]/xml )
            biographies: [ 'jdbiolw' , 'gcbiolw' ],

            // Zip size, in bytes
            zipSize: 4887076
        },

        // Book 2:
        {
            title_en: 'Fire on the Water',
            code_en: '02fotw',

            title_es: 'Fuego sobre agua',
            code_es: '02fsea',

            illustrators: [ 'chalk' ],

            biographies: [ 'jdbiolw' , 'gcbiolw' ],

            zipSize: 5117979
        }, 

        // Book 3:
        {
            title_en: 'The Caverns of Kalte',
            code_en: '03tcok',

            title_es: 'Las Cavernas del Kalte',
            code_es: '03lcdk',

            illustrators: [ 'chalk' ],

            biographies: [ 'jdbiolw' , 'gcbiolw' ],

            zipSize: 4178493
        }, 

        // Book 4:
        {
            title_en: 'The Chasm of Doom',
            code_en: '04tcod',

            title_es: 'El Abismo maldito',
            code_es: '04eam',

            illustrators: [ 'chalk' ],

            biographies: [ 'jdbiolw' , 'gcbiolw' ],

            zipSize: 4408246
        }, 

        // Book 5:
        {
            title_en: 'Shadow on the Sand',
            code_en: '05sots',

            title_es: 'El Desierto de las Sombras',
            code_es: '05eddls',

            illustrators: [ 'chalk' ],

            biographies: [ 'jdbiolw' , 'gcbiolw' ],

            zipSize: 4183069
        },

        // Book 6:
        {
            title_en: 'The Kingdoms of Terror',
            code_en: '06tkot',

            title_es: 'La Piedra de la Ciencia',
            code_es: '06lpdlc',

            illustrators: [ 'chalk' ],

            biographies: [ 'jdbiolw' , 'gcbiolw' ],

            zipSize: 3088890
        },

        // Book 7:
        {
            title_en: 'Castle Death',
            code_en: '07cd',

            title_es: 'Muerte en el Castillo',
            code_es: '07meec',

            illustrators: [ 'chalk' ],

            biographies: [ 'jdbiolw' , 'gcbiolw' ],

            zipSize: 3129146
        },

        // Book 8:
        {
            title_en: 'The Jungle of Horrors',
            code_en: '08tjoh',

            title_es: 'La Jungla de los Horrores',
            code_es: '08ljdlh',

            illustrators: [ 'chalk' ],

            biographies: [ 'jdbiolw' , 'gcbiolw' ],

            zipSize: 3537081
        }

        ///////////////////////////////////////
        /*
        // Book 9 (NOT IMPLEMENTED / Nobody working on it):
        {
            title_en: 'The Cauldron of Fear',
            code_en: '09tcof',

            title_es: 'El Caldero del Miedo',
            code_es: '09ecdm',

            illustrators: [ 'williams' ],

            biographies: [ 'jdbiolw' , 'bwbiolw' ],
            
            zipSize: 2839095
        },

        // Book 10 (NOT IMPLEMENTED / Work in progress (Toni) ):
        {
            title_en: 'The Dungeons of Torgar',
            code_en: '10tdot',

            title_es: 'Las Mazmorras de Torgar',
            code_es: '10lmdt',

            illustrators: [ 'williams' ],

            biographies: [ 'jdbiolw' , 'bwbiolw' ],
            
            zipSize: 3079362
        },
        
        // Book 11 (NOT IMPLEMENTED / Nobody working on it):
        {
            title_en: 'The Prisoners of Time',
            code_en: '11tpot',

            title_es: 'Prisioneros del Tiempo',
            code_es: '11pdt',

            illustrators: [ 'williams' ],

            biographies: [ 'jdbiolw' , 'bwbiolw' ],
            
            zipSize: 3007751
        },

        // Book 12 (NOT IMPLEMENTED / Nobody working on it):
        {
            title_en: 'The Masters of Darkness',
            code_en: '12tmod',

            title_es: 'Los Señores de la Oscuridad',
            code_es: '12lsdlo',

            illustrators: [ 'williams' ],

            biographies: [ 'jdbiolw' , 'bwbiolw' ],
            
            zipSize: 3180171
        }
        */

    ],

    /**
     * Returns the title of a book on a given language
     * @param bookNumber Book number, 1-index based
     * @param language Language code ("es" or "en")
     */
    getBookTitle: function( bookNumber : number, language : string ) : string {
        return projectAon.supportedBooks[bookNumber-1][ 'title_' + language ];
    },

    /**
     * Returns the number of the last supported book (1-based index)
     */
    getLastSupportedBook: function() {
        return projectAon.supportedBooks.length;
    }

};

// Do not use Typescript modules here, plain node.js modules for browser JS compatiblity (oh javascript...)
try {
    if (typeof exports !== 'undefined')
        exports.projectAon = projectAon;
}
catch(e) {
    console.log(e);
}
