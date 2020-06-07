
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
            title_en: "Flight from the Dark",
            // English book code
            code_en: "01fftd",

            // Spanish title
            title_es: "Huida de la oscuridad",
            // Spanish code
            code_es: "01hdlo",

            // Illustrators folders to download
            illustrators: [ "chalk" ],

            // Authors biographies (.inc files in [LANGUAGECODE]/xml )
            biographies: [ "jdbiolw" , "gcbiolw" ],

            // Zip size, in bytes
            zipSize: 4887076,

            // Project AON SVN revision number to use.
            // If == 0, the version at https://www.projectaon.org/data/tags/20151013 will be used
            // If it's not zero, the file at https://www.projectaon.org/data/trunk/ will be used, with this SVN Revision number
            // This is used at downloadProjectAonData.js
            // revision: 0
            revision: 2713      // Upgraded 15/4/2018
        },

        // Book 2:
        {
            title_en: "Fire on the Water",
            code_en: "02fotw",

            title_es: "Fuego sobre agua",
            code_es: "02fsea",

            illustrators: [ "chalk" ],

            biographies: [ "jdbiolw" , "gcbiolw" ],

            zipSize: 5117979,

            /*
                TODO: CURRENTLY UNPUBLISHABLE: App version (current 1.10) should be updated BEFORE use this revision. See mechanics-2.xml > sect299
                If a previous app version is used with the new revision, app will fail
            */
            revision: 0
            // revision: 2713      // Upgraded 15/4/2018
        },

        // Book 3:
        {
            title_en: "The Caverns of Kalte",
            code_en: "03tcok",

            title_es: "Las Cavernas del Kalte",
            code_es: "03lcdk",

            illustrators: [ "chalk" ],

            biographies: [ "jdbiolw" , "gcbiolw" ],

            zipSize: 4178493,

            // revision: 0
            revision: 2713      // Upgraded 15/4/2018
        },

        // Book 4:
        {
            title_en: "The Chasm of Doom",
            code_en: "04tcod",

            title_es: "El Abismo maldito",
            code_es: "04eam",

            illustrators: [ "chalk" ],

            biographies: [ "jdbiolw" , "gcbiolw" ],

            zipSize: 4408246,

            // revision: 0
            revision: 2713     // Upgraded 15/4/2018
        },

        // Book 5:
        {
            title_en: "Shadow on the Sand",
            code_en: "05sots",

            title_es: "El Desierto de las Sombras",
            code_es: "05eddls",

            illustrators: [ "chalk" ],

            biographies: [ "jdbiolw" , "gcbiolw" ],

            zipSize: 4183069,

            /*
                TODO: CURRENTLY UNPUBLISHABLE without patches. Spanish XML revision 2713 has a bug on the map section: Wrong close "illustration" tag
            */
            revision: 0
            // revision: 2713     // Upgraded 12/5/2018
        },

        // Book 6:
        {
            title_en: "The Kingdoms of Terror",
            code_en: "06tkot",

            title_es: "La Piedra de la Ciencia",
            code_es: "06lpdlc",

            illustrators: [ "chalk" ],

            biographies: [ "jdbiolw" , "gcbiolw" ],

            zipSize: 3088890,

            // revision: 0
            revision: 2713     // Upgraded 13/5/2018
        },

        // Book 7:
        {
            title_en: "Castle Death",
            code_en: "07cd",

            title_es: "Muerte en el Castillo",
            code_es: "07meec",

            illustrators: [ "chalk" ],

            biographies: [ "jdbiolw" , "gcbiolw" ],

            zipSize: 3129146,

            revision: 0
        },

        // Book 8:
        {
            title_en: "The Jungle of Horrors",
            code_en: "08tjoh",

            title_es: "La Jungla de los Horrores",
            code_es: "08ljdlh",

            illustrators: [ "chalk" ],

            biographies: [ "jdbiolw" , "gcbiolw" ],

            zipSize: 3537081,

            revision: 0
        },

        // Book 9:
        {
            title_en: "The Cauldron of Fear",
            code_en: "09tcof",

            title_es: "El Caldero del Miedo",
            code_es: "09ecdm",

            illustrators: [ "williams" ],

            biographies: [ "jdbiolw" , "bwbiolw" ],

            zipSize: 2873932,

            revision: 2655
        },

        // Book 10:
        {
            title_en: "The Dungeons of Torgar",
            code_en: "10tdot",

            title_es: "Las Mazmorras de Torgar",
            code_es: "10lmdt",

            illustrators: [ "williams" ],

            biographies: [ "jdbiolw" , "bwbiolw" ],

            zipSize: 3079362,

            revision: 0
        } ,

        ///////////////////////////////////////

        // Book 11 (IN PROGRESS / Toni):
        {
            title_en: "The Prisoners of Time",
            code_en: "11tpot",

            title_es: "Prisioneros del Tiempo",
            code_es: "11pdt",

            illustrators: [ "williams" ],

            biographies: [ "jdbiolw" , "bwbiolw" ],

            zipSize: 3007750,

            revision: 2713
        },

        // Book 12 (Finished, pending of some game tests):
        {
            title_en: "The Masters of Darkness",
            code_en: "12tmod",

            title_es: "Los Señores de la Oscuridad",
            code_es: "12lsdlo",

            illustrators: [ "williams" ],

            biographies: [ "jdbiolw" , "bwbiolw" ],

            zipSize: 3180171,

            revision: 2655
        },

        // Book 13:
        {
            title_en: "The Plague Lords of Ruel",
            code_en: "13tplor",

            title_es: "Los Señores de la Plaga de Ruel",
            code_es: "13lsdlpdr",

            illustrators: [ "williams" ],

            biographies: [ "jdbiolw" , "bwbiolw" ],

            zipSize: 3149799,

            revision: 2752
        },

        // Book 14:
        {
            title_en: "The Captives of Kaag",
            code_en: "14tcok",

            title_es: "Los Cautivos de Kaag",
            code_es: "14lcdk",

            illustrators: [ "williams" ],

            biographies: [ "jdbiolw" , "bwbiolw" ],

            zipSize: 2980342,

            revision: 2752
        },

        // Book 15:
        {
            title_en: "The Darke Crusade",
            code_en: "15tdc",

            illustrators: [ "williams" ],

            biographies: [ "jdbiolw" , "bwbiolw" ],

            zipSize: 2980342,

            revision: 2752
        },

    ],

    /**
     * Returns the title of a book on a given language
     * @param bookNumber Book number, 1-index based
     * @param language Language code ("es" or "en")
     */
    getBookTitle( bookNumber: number, language: string ): string {
        return projectAon.supportedBooks[bookNumber - 1][ "title_" + language ];
    },

    /**
     * Returns the number of the last supported book (1-based index)
     */
    getLastSupportedBook() {
        return projectAon.supportedBooks.length;
    }

};

// Do not use Typescript modules here, plain node.js modules for browser JS compatiblity (oh javascript...)
try {
    if (typeof exports !== "undefined") {
        exports.projectAon = projectAon;
    }
} catch (e) {
    console.log(e);
}
