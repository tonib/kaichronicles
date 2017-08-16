
/**
 * Metadata about books and Project Aon web structure
 */
var projectAon = {

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

            zipSize: 5117979
        }, 

        // Book 3:
        {
            title_en: 'The Caverns of Kalte',
            code_en: '03tcok',

            title_es: 'Las Cavernas del Kalte',
            code_es: '03lcdk',

            illustrators: [ 'chalk' ],

            zipSize: 4178493
        }, 

        // Book 4:
        {
            title_en: 'The Chasm of Doom',
            code_en: '04tcod',

            title_es: 'El Abismo maldito',
            code_es: '04eam',

            illustrators: [ 'chalk' ],

            zipSize: 4408246
        }, 

        // Book 5:
        {
            title_en: 'Shadow on the Sand',
            code_en: '05sots',

            title_es: 'El Desierto de las Sombras',
            code_es: '05eddls',

            illustrators: [ 'chalk' ],

            zipSize: 4183069
        },

        // Book 6:
        {
            title_en: 'The Kingdoms of Terror',
            code_en: '06tkot',

            title_es: 'La Piedra de la Ciencia',
            code_es: '06lpdlc',

            illustrators: [ 'chalk' ],

            zipSize: 3088890
        }
        
        ///////////////////////////////////////
        /*,

        // Book 7 (REVIEWING):
        {
            title_en: 'Castle Death',
            code_en: '07cd',

            title_es: 'Muerte en el Castillo',
            code_es: '07meec',

            illustrators: [ 'chalk' ],

            zipSize: 3129146
        },

        // Book 8 (NOT IMPLEMENTED):
        {
            title_en: 'The Jungle of Horrors',
            code_en: '08tjoh',

            title_es: 'La Jungla de los Horrores',
            code_es: '08ljdlh',

            illustrators: [ 'chalk' ],

            zipSize: 3537081
        },

        // Book 9 (NOT IMPLEMENTED):
        {
            title_en: 'The Cauldron of Fear',
            code_en: '09tcof',

            title_es: 'El Caldero del Miedo',
            code_es: '09ecdm',

            illustrators: [ 'williams' ],

            zipSize: 2839095
        }*/

    ],

    /**
     * Returns the title of a book on a given language
     */
    getBookTitle: function(bookNumber, language) {
        return projectAon.supportedBooks[bookNumber-1][ 'title_' + language ];
    },

    /**
     * Returns the number of the last supported book (1-based index)
     */
    getLastSupportedBook: function() {
        return projectAon.supportedBooks.length;
    }

};

try {
    if (typeof exports !== 'undefined')
        exports.projectAon = projectAon;
}
catch(e) {
    console.log(e);
}
