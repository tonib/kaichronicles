
/**
 * Translations table
 */
var translations = {

    /**
     * Spanish translations
     */
    es: {

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
        'specialItems' : 'Objetos Especiales',
        'msgDropCoin' : '¿Seguro que quieres dejar 1 Corona de Oro?',
        'noneFemenine' : 'Ninguna',
        'noneMasculine' : 'Ninguno',
        'disciplineDescription' : 'Descripción de la disciplina',
        'goldCrowns' : 'Coronas de Oro',
        'current' : 'Actual',
        'backpackLost' : 'Has perdido tu mochila'
    },

    /**
     * English translations
     */
    en: {

        //////////////////////////////////////
        // Action chart
        //////////////////////////////////////

        'msgDropCoin' : 'Are you sure you want to drop 1 Golden Crown?',
        'noneFemenine' : 'None',
        'noneMasculine' : 'None',
        'disciplineDescription' : 'Discipline description',
        'goldCrowns' : 'Gold Crowns',
        'current' : 'Current',
        'backpackLost' : 'You have lost your backpack'
    },

    /**
     * Returns a DOM view translated to the current language
     * @param {DOM} view The view to translate
     */
    translateView: function( view ) {

        var table = translations[state.language];
        if( !translations[state.language] )
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
    },

    /**
     * Get a translated message
     * @param {string} textId The text it to get
     * @returns {string} The text
     */
    text: function( textId ) {
        var table = translations[state.language];
        if( !table )
            // Use english as default
            table = translations['en'];
            
        var text = table[textId];
        if( !text )
            text = textId;
        return text;
    }

};
