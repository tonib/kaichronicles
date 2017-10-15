/// <reference path="../../external.ts" />

/**
 * Translations table
 */
class Translations {

    /**
     * Spanish translations
     */
    private readonly es = {

        //////////////////////////////////////
        // Action chart / object tables
        //////////////////////////////////////
        
        'actionChart' : 'Carta de Acción',
        'combatSkill' : 'Destreza en el Combate',
        'endurancePoints' : 'Puntos de Resistencia',
        'actionBeltPouch' : 'Bolsa (Máx. 50)',
        'kaiDisciplines' : 'Diciplinas del Kai',
        'weapons' : 'Armas',
        'currentWeapon' : 'Arma actual:',
        'backpackItems' : 'Objetos de Mochila',
        'meals' : 'Comidas',
        'specialItems' : 'Objetos Especiales',
        'noneFemenine' : 'Ninguna',
        'noneMasculine' : 'Ninguno',
        'disciplineDescription' : 'Descripción de la disciplina',
        'goldCrowns' : 'Coronas de Oro',
        'arrows' : 'Flechas',
        'current' : 'Actual',
        'backpackLost' : 'Has perdido tu mochila',
        'buyObject' : 'Comprar objeto',
        'pickObject' : 'Coger objeto',
        'sellObject' : 'Vender objeto',
        'use': 'Usar',
        'setCurrentWeapon' : 'Establecer como arma actual',
        'dropObject' : 'Dejar objeto',
        'confirmSell' : '¿Seguro que quieres vender el objeto por {0} Coronas de Oro?',
        'confirmUse' : '¿Estás seguro que quieres usar "{0}"?',
        'confirmDrop' : '¿Seguro que quieres dejar "{0}"?',
        'noEnoughMoney' : 'No tienes suficiente dinero',
        'confirmBuy' : '¿Seguro que quieres comprar el objeto por {0} Coronas de Oro?',
        'msgGetObject' : 'Has cogido "{0}"',
        'msgDropObject' : 'Has dejado "{0}"',
        'msgGetMeal' : 'Has cogido {0} comidas',
        'msgDropMeal' : 'Has dejado {0} comidas',
        'msgGetMoney' : 'Has cogido {0} Coronas de Oro',
        'msgGetArrows' : 'Has cogido {0} Flechas',
        'msgDropMoney' : 'Has perdido {0} Coronas de Oro',
        'msgDropArrows' : 'Has perdido {0} Flechas',
        'msgEndurance' : '{0} Puntos de Resistencia',
        'msgCombatSkill' : '{0} Destreza en el Combate',
        'msgCurrentWeapon' : 'Tu arma actual es ahora "{0}"',
        'msgIncompatible' : 'Ya tienes un "{0}"',
        'msgNoMoreWeapons' : 'No puedes coger mas armas',
        'msgAlreadyBackpack' : 'Ya tienes una mochila',
        'msgNoMoreBackpackItems' : 'No puedes coger mas Objetos de Mochila',
        'msgNoMoreSpecialItems' : 'No puedes coger mas Objetos Especiales',
        'noWeapon' : 'Sin arma',
        'weaponskill' : 'Dominio Manejo Armas',
        'weaponmastery' : 'Maestría Manejo Armas',
        'mindblast' : 'Ataque Psíquico',
        'psisurge' : 'Acometida Psíquica',
        'countAsObjects'  : '(Cuenta como {0} objetos)',
        'annotations' : 'Anotaciones',
        'circleFire' : 'Círculo de Fuego',
        'circleLight' : 'Círculo de Luz',
        'circleSolaris' : 'Círculo de Solaris',
        'circleSpirit' : 'Círculo del Espíritu',
        'circles' : 'Círculos de la Ciencia:',
        'dropMoney' : 'Dejar dinero',
        'pickMoney' : 'Coger dinero',
        'amount' : 'Cantidad',
        'maxSpecialItems' : 'A partir de este libro, el número máximo de Objetos Especiales que puedes ' + 
            'llevar es de 12. Podrás dejar el resto en un lugar seguro del monasterio del Kai, o dejarlo aquí. ' +
            'Si se deja aquí, el objeto se perderá. Por favor, deja los Objetos Especiales antes de continuar.',

        //////////////////////////////////////
        // Combats
        //////////////////////////////////////

        'combatRatio' : 'PUNTUACIÓN EN EL COMBATE',
        'randomTable' : 'Tabla de la Suerte',
        'randomTableSmall' : 'T.S.',
        'loneWolf': 'Lobo Solitario',
        'combatSkillUpper' : 'DESTREZA EN EL COMBATE',
        'enduranceUpper' : 'RESISTENCIA',
        'playTurn' : 'Jugar turno',
        'eludeCombat' : 'Eludir combate',
        'deathLetter' : 'M',
        'mechanics-combat-psisurge' : 'Acometida Psíquica: +4 DC, -2 R por asalto',

        //////////////////////////////////////
        // Meals
        //////////////////////////////////////

        'meal' : 'Comida',
        'useHunting' : 'Usar la disciplina de Caza',
        'eatBackpackMeal' : 'Comer una comida de la mochila',
        'eatBackpackObject' : 'Comer',
        'buyMeal' : 'Comprar comida',
        'doNotEat' : 'No comer (-3 RESISTENCIA)',

        //////////////////////////////////////
        // Death
        //////////////////////////////////////

        'msgDeath' : 'Tu vida y tu misión terminan aquí',
        'deathRestartBook' : 'Haz click aquí para reiniciar el libro',
        'deathLoadGame' : 'Haz click aquí para cargar un juego salvado',

        //////////////////////////////////////
        // Number picker
        //////////////////////////////////////

        'npWrongValue' : 'Valor erroneo para "{0}"',
        'npMinValue' : 'El valor mínimo para "{0}" es {1}',
        'npMaxValue' : 'El valor máximo para "{0}" es {1}',

        //////////////////////////////////////
        // Game setup
        //////////////////////////////////////

        'chooseNumberOn' : 'Elige un numero en la',
        'determineCS' : 'para determinar tu Destreza en el Combate',
        'determineE' : 'para determinar tu Resistencia',
        'combatSkillSet' : 'Tu Destreza en el Combate es {0}',
        'enduranceSet' : 'Tus puntos de Resistencia son {0}',
        'selectNDisciplines' : 'Por favor, selecciona <span id="mechanics-nDisciplines"></span> disciplinas antes de continuar.',
        'selectNWeapons' : 'Por favor, selecciona <span id="mechanics-setDisciplines-weaponsmax">3</span> armas para Maestría en el Manejo de Armas',
        'choose' : 'Elige',
        'maxDisciplines' : 'Sólo puede elegir {0} disciplinas',
        'onlyNWeapons' : 'Sólo puedes elegir {0} armas',

        //////////////////////////////////////
        // Special sections
        //////////////////////////////////////

        'beltPouch' : 'Bolsa',
        'moneyWon' : 'Dinero ganado',
        'numberToBet' : 'Numero a apostar',
        'crownsToBet' : 'Coronas a apostar',
        'play' : 'Jugar',
        'playerDices' : 'Dados de {0}',
        'playerNumber' : 'Jugador {0}',
        'targetPoints' : 'BLANCOS LOBO SOLITARIO:',
        'number' : 'Número {0}',
        'shoot' : 'Disparo',
        'adganaUse' : 'Uso de adgana, número Tabla Suerte: {0}',

        //////////////////////////////////////
        // About page
        //////////////////////////////////////

        'about' : 'Acerca del libro',
        'forSommerlund' : '¡Por Sommerlund y el Kai!',
        'dedication' : 'Dedicatoria',
        'gameMechanics' : 'Mecanicas del juego',
        'aboutKaiChronicles' : 'Mecánicas del juego escritas por Toni Bennasar, Timendum y Michael Terry. El código está bajo licencia MIT. Contien partes de código de <a href="https://lonewolfadventures.projectaon.org">Lone Wolf Adventures</a>, creado por Liquid State Limited.',
        'distribution' : 'Distribución',
        'distributionInfo' : 'Libro distribuido por el <a href="https://www.projectaon.org">Proyecto Aon</a>, bajo la <a href="#projectAonLicense">licencia del Proyecto Aon</a>.',
        'about-authors' : 'Sobre los autores del libro',
        
        //////////////////////////////////////
        // Main menu
        //////////////////////////////////////

        'appInfo' : 'Esto es una aplicación para jugar a los librojuegos de Lobo Solitario, del 1 al 7.',
        'browsersWarning' : 'Sólo se soportan las últimas versiones de Chrome y Firefox. Otros navegadores o versiones no están soportados (pueden funcionar... o no).',
        'historyWarning' : 'Ten en cuenta que si borras el historial de tu navegador, perderás la partida actual. Puedes guardar la partida actual a un archivo en <i>Ajustes &gt; Guardar juego</i>.',
        'androidInfo' : 'Puedes jugar a esto en una aplicación Android (versión mínima 4.4.2). Descárgala en el <a href="https://play.google.com/store/apps/details?id=org.projectaon.kaichronicles">Google Play</a>.',
        'haveFun' : '¡Divierte!',
        'continueGame' : 'Continuar el juego',
        'newGame' : 'Nuevo juego',
        'downloadBooks' : 'Descargar libros',

        //////////////////////////////////////
        // New game
        //////////////////////////////////////

        'book' : 'Libro',
        'language' : 'Idioma',
        'english' : 'Ingles',
        'spanish' : 'Español',
        'agreeLicense' : 'Estoy de acuerdo con los términos de la licencia del Proyecto Aon',
        'youMustAgree' : 'Has de estar de acuerdo con la licencia para poder continuar',
        'licenseText' : 'Texto de la licencia',
        'startGame' : 'Iniciar juego',
        'noDownloadedBooks' : 'No se ha descargado ningún libro. Ve a "Descargar libros" en el menú principal',

        //////////////////////////////////////
        // Settings
        //////////////////////////////////////

        'settings' : 'Ajustes',
        'saveGame' : 'Guardar partida',
        'restartBook' : 'Reiniciar libro',
        'downloading' : 'Descargando',
        'downloadingWait' : 'Descargando el libro, por favor, espere...',
        'fileName' : 'Nombre archivo',
        'close' : 'Cerrar',
        'wrongFileName' : 'El nombre de archivo contiene carácteres no válidos',
        'gameSaved' : 'Partida guardada',
        'confirmRestart' : '¿Seguro que quieres reiniciar el libro?',
        'randomTableValues' : 'Valores de la Tabla de la Suerte',
        'computerGenerated' : 'Generados por ordenador',
        'manual' : 'Manuales',

        //////////////////////////////////////
        // Template (Main page)
        //////////////////////////////////////

        'CS' : 'D.C.',
        'E' : 'R.',
        'map' : 'Mapa',

        //////////////////////////////////////
        // Map
        //////////////////////////////////////

        'map-clickinfo' : 'Haz click en el mapa para ajustar al tamaño de la pantalla / restaurar a su tamaño original.',
        'map-changezoom' : 'Cambiar zoom:',

        //////////////////////////////////////
        // Download books
        //////////////////////////////////////

        'applyChanges' : 'Aplicar cambios',
        'selectBooks' : 'Selecciona los libros que quieres descargar del <a href="https://www.projectaon.org">Proyecto Aon</a>.',
        'noChangesSelected' : 'No se han seleccionado cambios',
        'confirmChanges' : '¿Seguro que quieres hacer los cambios seleccionados?',
        'deletingBook' : 'Borrando libro {0}',
        'bookDeleted' : 'Libro {0} borrado',
        'deletionFailed' : 'Borrado del libro {0} fallido: {1}',
        'downloadingBook' : 'Descargando libro {0}',
        'bookDownloaded' : 'Libro {0} descargado',
        'downloadFailed' : 'Descarga del libro {0} fallida: {1}',
        'processFinishedErrors' : '¡Proceso finalizado con errores!',
        'size' : 'Tam.',
        'noInternet' : 'No hay conexión a Internet',
        'cancel' : 'Cancelar',
        'processCancelled' : 'Proceso cancelado',

        //////////////////////////////////////
        // Kai monastery safekeeping
        //////////////////////////////////////

        'kaiMonasteryStorage' : 'Objetos en el monasterio del Kai',
        'kaiMonastery' : 'Monasterio del Kai',
        'kaiMonasteryInfo' : 'Aquí puedes guardar objetos en custodia en el monasterio del Kai. Los objetos ' + 
            'dejados aquí estarán disponibles cuando continues al próximo libro, en la sección "Equipo".',
        'backToEquipment' : 'Volver a la sección de Equipo',

        //////////////////////////////////////
        // Others
        //////////////////////////////////////

        'tableAvailableObjects' : 'Objetos disponibles:',
        'tableSellObjects' : 'Vender objetos:',
        'doMealFirst' : 'Haz primero la comida',
        'kaiChronicles' : 'Crónicas del Kai',
        'gameRules' : 'Reglas del juego',
        'loadGame' : 'Cargar juego',
        'confirmDeleteSave' : '¿Seguro que quiere borrar el juego guardado {0}?',
        'projectAonLicense' : 'Licencia del Proyecto Aon',
        'combatTables' : 'Tablas de Combate',
        'mainMenu' : 'Menú principal',
        'bookNotDownloaded' : 'El libro {0} no está descargado',
        'noSavedGames' : 'No se encontraron juegos guardados',
        'maximumPick' : 'Sólo puedes coger {0} objetos',
        'zeroIgnored' : 'Cero ignorado'
    };

    /**
     * English translations
     */
    private readonly en = {

        //////////////////////////////////////
        // Action chart / object tables
        //////////////////////////////////////

        'actionChart' : 'Action Chart',
        'noneFemenine' : 'None',
        'noneMasculine' : 'None',
        'disciplineDescription' : 'Discipline description',
        'goldCrowns' : 'Gold Crowns',
        'arrows' : 'Arrows',
        'current' : 'Current',
        'backpackLost' : 'You have lost your backpack',
        'buyObject' : 'Buy object',
        'pickObject' : 'Get object',
        'sellObject' : 'Sell object',
        'use': 'Use',
        'setCurrentWeapon' : 'Set as current weapon',
        'dropObject' : 'Drop object',
        'confirmSell' : 'Are you sure you want to sell the object for {0} Gold Crowns?',
        'confirmUse' : 'Are you sure you want to use "{0}"?',
        'confirmDrop' : 'Are you sure you want to drop "{0}"?',
        'noEnoughMoney' : 'You don\'t have enough money',
        'confirmBuy' : 'Are you sure you want to buy the object for {0} Gold Crowns?',
        'msgGetObject' : 'You get "{0}"',
        'msgDropObject' : 'You drop "{0}"',
        'msgGetMeal' : 'You get {0} meals',
        'msgDropMeal' : 'You drop {0} meals',
        'msgGetMoney' : 'You get {0} Gold Crowns',
        'msgGetArrows' : 'You get {0} Arrows',
        'msgDropMoney' : 'You lost {0} Gold Crowns',
        'msgDropArrows' : 'You lost {0} Arrows',
        'msgEndurance' : '{0} Endurance Points',
        'msgCombatSkill' : '{0} Combat Skill',
        'msgCurrentWeapon' : 'Your current weapon is now "{0}"',
        'msgIncompatible' : 'You already have a "{0}"',
        'msgNoMoreWeapons' : 'You cannot get more weapons',
        'msgAlreadyBackpack' : 'You already have a Backpack',
        'msgNoMoreBackpackItems' : 'You cannot get more Backpack Items',
        'msgNoMoreSpecialItems' : 'You cannot get more Special Items',
        'noWeapon' : 'No weapon',
        'weaponskill' : 'Weaponskill',
        'weaponmastery' : 'Weaponmastery',
        'mindblast' : 'Mindblast',
        'psisurge' : 'Psi-surge',
        'countAsObjects'  : '(Counts as {0} items)',
        'circleFire' : 'Circle of Fire',
        'circleLight' : 'Circle of Light',
        'circleSolaris' : 'Circle of Solaris',
        'circleSpirit' : 'Circle of the Spirit',
        'dropMoney' : 'Drop money',
        'pickMoney' : 'Pick money',
        'amount' : 'Amount',

        //////////////////////////////////////
        // Combats
        //////////////////////////////////////

        'randomTable' : 'Random Number Table',
        'combatSkillUpper' : 'COMBAT SKILL',
        'enduranceUpper' : 'ENDURANCE',
        'loneWolf': 'Lone Wolf',
        'deathLetter' : 'K',

        //////////////////////////////////////
        // Number picker
        //////////////////////////////////////

        'npWrongValue' : 'Wrong value for "{0}"',
        'npMinValue' : 'Minimum value for "{0}" is {1}',
        'npMaxValue' : 'Maximum value for "{0}" is {1}',

        //////////////////////////////////////
        // Game setup
        //////////////////////////////////////

        'combatSkillSet' : 'Your Combat Skill is {0}',
        'enduranceSet' : 'Your Endurance Points are {0}',
        'maxDisciplines' : 'You can choose only {0} disciplines',
        'onlyNWeapons' : 'You can select only {0} weapons',

        //////////////////////////////////////
        // Special sections
        //////////////////////////////////////

        'playerDices' : '{0} dices',
        'playerNumber' : 'Player {0}',
        'number' : 'Number {0}',
        'adganaUse' : 'Adgana use, Random Table number: {0}',

        //////////////////////////////////////
        // About page
        //////////////////////////////////////

        'about' : 'About the book',

        //////////////////////////////////////
        // New game
        //////////////////////////////////////

        'youMustAgree' : 'You must agree the licence to continue',
        'noDownloadedBooks' : 'There are no downloaded books. Go to "Download books" on the main menu',

        //////////////////////////////////////
        // Settings
        //////////////////////////////////////

        'settings' : 'Settings',
        'wrongFileName' : 'The file name contains invalid characters',
        'gameSaved' : 'Game saved',
        'confirmRestart' : 'Are you sure you want to restart the book?',
        'close' : 'Close',

        //////////////////////////////////////
        // Template (Main page)
        //////////////////////////////////////

        'CS' : 'C.S.',
        'E' : 'E.',
        'map' : 'Map',

        //////////////////////////////////////
        // Download books
        //////////////////////////////////////

        'noChangesSelected' : 'No changes selected',
        'confirmChanges' : 'Are you sure you want to do the selected changes?',
        'deletingBook' : 'Deleting book {0}',
        'bookDeleted' : 'Book {0} deleted',
        'deletionFailed' : 'Book {0} deletion failed: {1}',
        'downloadingBook' : 'Downloading book {0}',
        'bookDownloaded' : 'Book {0} downloaded',
        'downloadFailed' : 'Book {0} download failed: {1}',
        'processFinishedErrors' : 'Process finished with errors!',
        'noInternet' : 'There is no Internet connection',
        'cancel' : 'Cancel',
        'processCancelled' : 'Process cancelled',

        //////////////////////////////////////
        // Others
        //////////////////////////////////////

        'doMealFirst' : 'Please, do the Meal first',
        'kaiChronicles' : 'Kai Chronicles',
        'confirmDeleteSave' : 'Are you sure you want to delete the save game {0} ?',
        'projectAonLicense' : 'Project Aon license',
        'combatTables' : 'Combat Tables',
        'mainMenu' : 'Main Menu',
        'bookNotDownloaded' : 'Book {0} is not downloaded',
        'noSavedGames' : 'No saved games found',
        'maximumPick' : 'You can pick only {0} objects',
        'zeroIgnored' : 'Zero ignored'

    };

    /**
     * Returns a DOM view translated to the current language
     * @param {DOM} view The view to translate
     * @param {boolean} doNotClone True if the view should be modified. False, if a clone of the view
     * should be returned
     */
    public translateView( view , doNotClone ) {

        var table = this[state.language];
        if( !table )
            // Translation not available
            return view;
 
        var $clonedView;
        if( doNotClone )
            $clonedView = $(view);
        else
            $clonedView = $(view).clone();

        // Translate the view
        this.translateTags( $clonedView , table );
        return $clonedView;
    }

    /**
     * Translate an HTML fragment
     * @param  $tags jQuery selector of tags to translate
     * @param table Translations table to use. If null, the current language will be used
     */
    public translateTags( $tags : any , table : { [key : string] : string } = null ) {

        if( !table ) {
            table = this[state.language];
            if( !table )
                // Translation not available
                return;
        }

        var $translatedTags = $tags
            .find('[data-translation]')
            .addBack('[data-translation]');
        for(var i=0; i<$translatedTags.length; i++ ) {
            var $t = $($translatedTags[i]);
            var translationId = $t.attr('data-translation');
            var html = table[ translationId ];
            if( html )
                $t.html( html );
        }
    }

    /**
     * Get a translated message
     * @param {string} textId The text it to get
     * @param {Array<object>} replacements Replacements to do on the message. It can be null
     * @returns {string} The text
     */
    public text( textId : string , replacements : Array<any> = null ) : string {
        try {
            var table = this[state.language];
            if( !table )
                // Use english as default
                table = this.en;
                
            var text = table[textId];
            if( !text ) {
                console.log('Text code not found: ' + textId);
                text = textId;
            }

            if( replacements ) {
                for(var i=0; i<replacements.length; i++)
                    text = text.replaceAll( '{' + i + '}' , replacements[i].toString() );
            }
            return text;
        }
        catch(e) {
            console.log(e);
            return textId;
        }
    }

}

/**
 * The translations singleton
 */
const translations = new Translations();
