
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
            illustrators: [ 'chalk' ]
        },

        // Book 2:
        {
            title_en: 'Fire on the Water',
            code_en: '02fotw',

            title_es: 'Fuego sobre agua',
            code_es: '02fsea',

            illustrators: [ 'chalk' ]
        }, 

        // Book 3:
        {
            title_en: 'The Caverns of Kalte',
            code_en: '03tcok',

            title_es: 'Las Cavernas del Kalte',
            code_es: '03lcdk',

            illustrators: [ 'chalk' ]
        }, 

        // Book 4:
        {
            title_en: 'The Chasm of Doom',
            code_en: '04tcod',

            title_es: 'El Abismo maldito',
            code_es: '04eam',

            illustrators: [ 'chalk' ]
        }, 

        // Book 5:
        {
            title_en: 'Shadow on the Sand',
            code_en: '05sots',

            title_es: 'El Desierto de las Sombras',
            code_es: '05eddls',

            illustrators: [ 'chalk' ]
        }
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
