
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
            title_en: 'Flight from the Dark',
            code_en: '01fftd',

            title_es: 'Huida de la oscuridad',
            code_es: '01hdlo',

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
     * Returns an array with the book titles on a given language code
     */
    getBookTitles: function(language) {
        var titles = [];
        for( var i=0; i<projectAon.supportedBooks.length; i++)
            titles.push( projectAon.supportedBooks[i][ 'title_' + language ] );
        return titles;
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
