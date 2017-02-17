
/**
 * Translations table
 */
var translationsTable = {

    /**
     * Spanish translations
     */
    es: {

        //////////////////////////////////////
        // Messages
        //////////////////////////////////////

        

        //////////////////////////////////////
        // Action chart
        //////////////////////////////////////
        
        'actionChart' : 'Carta de Acción',
        'combatSkill' : 'Destreza en el Combate',
        'endurancePoints' : 'Puntos de Resistencia',
        'beltPouch' : 'Bolsa (Máx. 50)',
        'kaiDisciplines' : 'Diciplinas del Kai',
        'weapons' : 'Armas',
        'currentWeapon' : 'Arma actual:',
        'backpackItems' : 'Objetos de Mochila',
        'meals' : 'Comidas',
        'specialItems' : 'Objetos Especiales'
    },

    /**
     * English translations
     */
    en: {

        //////////////////////////////////////
        // Messages
        //////////////////////////////////////

    },

    /**
     * Returns a DOM view translated to the current language
     * @param {DOM} view The view to translate
     */
    translateView: function( view ) {

        var table = translationsTable[state.language];
        if( !translationsTable[state.language] )
            // Translation not available
            return view;
 
        var $clonedView = $(view).clone();

        // Translate the view
        var translatedTags = $clonedView
            .find('[data-translation]')
            .addBack('[data-translation]');
        for(var i=0; i<translatedTags.length; i++ ) {
            var translationId = $(translatedTags[i]).attr('data-translation');
            var html = table[ translationId ];
            if( html )
                $(translatedTags[i]).html( html );
        }

        return $clonedView;
    }

};
