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

        "actionChart" : "Carta de Acción",
        "combatSkill" : "Destreza en el Combate",
        "endurancePoints" : "Puntos de Resistencia",
        "actionBeltPouch" : "Bolsa (Máx. 50)",
        "kaiDisciplines" : "Diciplinas del Kai",
        "weapons" : "Armas",
        "currentWeapon" : "Arma actual:",
        "backpackItems" : "Objetos de Mochila",
        "meals" : "Comidas",
        "specialItems" : "Objetos Especiales",
        "noneFemenine" : "Ninguna",
        "noneMasculine" : "Ninguno",
        "disciplineDescription" : "Descripción de la disciplina",
        "goldCrowns" : "Coronas de Oro",
        "arrows" : "Flechas",
        "current" : "Actual",
        "backpackLost" : "Has perdido tu mochila",
        "buyObject" : "Comprar objeto",
        "pickObject" : "Coger objeto",
        "sellObject" : "Vender objeto",
        "use": "Usar",
        "setCurrentWeapon" : "Establecer como arma actual",
        "dropObject" : "Dejar objeto",
        "confirmSell" : "¿Seguro que quieres vender el objeto por {0} Coronas de Oro?",
        "confirmUse" : '¿Estás seguro que quieres usar "{0}"?',
        "confirmDrop" : '¿Seguro que quieres dejar "{0}"?',
        "noEnoughMoney" : "No tienes suficiente dinero",
        "confirmBuy" : "¿Seguro que quieres comprar el objeto por {0} Coronas de Oro?",
        "msgGetObject" : 'Has cogido "{0}"',
        "msgDropObject" : 'Has dejado "{0}"',
        "msgGetMeal" : "Has cogido {0} comidas",
        "msgDropMeal" : "Has dejado {0} comidas",
        "msgGetMoney" : "Has cogido {0} Coronas de Oro",
        "msgGetArrows" : "Has cogido {0} Flechas",
        "msgDropMoney" : "Has perdido {0} Coronas de Oro",
        "msgDropArrows" : "Has perdido {0} Flechas",
        "msgEndurance" : "{0} Puntos de Resistencia",
        "msgCombatSkill" : "{0} Destreza en el Combate",
        "msgCurrentWeapon" : 'Tu arma actual es ahora "{0}"',
        "msgIncompatible" : 'Ya tienes un "{0}"',
        "msgNoMoreWeapons" : "No puedes coger mas armas",
        "msgAlreadyBackpack" : "Ya tienes una mochila",
        "msgNoMoreBackpackItems" : "No puedes coger mas Objetos de Mochila",
        "msgNoMoreSpecialItems" : "No puedes coger mas Objetos Especiales",
        "noWeapon" : "Sin arma",
        "weaponskill" : "Dominio Manejo Armas",
        "weaponmastery" : "Maestría Manejo Armas",
        "grdweaponmastery" : "Gran Maestría en el Manejo de Armas",
        "mindblast" : "Ataque Psíquico",
        "psisurge" : "Acometida Psíquica",
        "countAsObjects"  : "(Cuenta como {0} objetos)",
        "annotations" : "Anotaciones",
        "circleFire" : "Círculo de Fuego",
        "circleLight" : "Círculo de Luz",
        "circleSolaris" : "Círculo de Solaris",
        "circleSpirit" : "Círculo del Espíritu",
        "circles" : "Círculos de la Ciencia:",
        "dropMoney" : "Dejar dinero",
        "pickMoney" : "Coger dinero",
        "amount" : "Cantidad",
        "maxSpecialItems" : "A partir de este libro, el número máximo de Objetos Especiales que puedes " +
            "llevar es de 12. Podrás dejar el resto en un lugar seguro del monasterio del Kai, o dejarlo aquí. " +
            "Si se deja aquí, el objeto se perderá. Por favor, deja los Objetos Especiales antes de continuar.",
        "noQuiversEnough" : "No tienes suficientes Carcajes (sólo 6 Flechas por Carcaj)",
        "restore20EPMagnakaiButton": "Medicina: +20 R (sólo si R 6 o menos, cada 100 días)",
        "restore20EPGrdMasterButton": "Sanación: +20 R (sólo si R 8 o menos, cada 20 días)",
        "confirm20EP": "Esta habilidad solo puede ser usada una vez cada 100 días. ¿Continuamos?",
        "confirm20EPGrdMaster": "Esta habilidad solo puede ser usada una vez cada 20 días. ¿Continuamos?",
        "more" : "Más",
        "fightUnarmed" : "Luchar desarmado",
        "permanent" : "Permanente",
        "usageCount" : "(se puede usar {0} veces)",

        //////////////////////////////////////
        // Combats
        //////////////////////////////////////

        "combatRatio" : "PUNTUACIÓN EN EL COMBATE",
        "randomTable" : "Tabla de la Suerte",
        "randomTableSmall" : "T.S.",
        "loneWolf": "Lobo Solitario",
        "combatSkillUpper" : "DESTREZA EN EL COMBATE",
        "enduranceUpper" : "RESISTENCIA",
        "playTurn" : "Jugar turno",
        "eludeCombat" : "Eludir combate",
        "deathLetter" : "M",
        "mechanics-combat-psisurge" : 'Acometida Psíquica: +<span class="psisurgebonus">4</span> DC, ' +
            '-<span class="psisurgeloss">2</span> R por asalto',
        "sectionModifier" : "Modificador sección",
        "objectsUse" : "Uso objetos",
        "enemyMindblast" : "Ataque psíquico enemigo",

        //////////////////////////////////////
        // Meals
        //////////////////////////////////////

        "meal" : "Comida",
        "useHunting" : "Usar la disciplina de Caza",
        "eatBackpackMeal" : "Comer una Comida de la Mochila",
        "eatBackpackObject" : "Comer",
        "buyMeal" : "Comprar comida",
        "doNotEat" : "No comer (-3 RESISTENCIA)",

        //////////////////////////////////////
        // Death
        //////////////////////////////////////

        "msgDeath" : "Tu vida y tu misión terminan aquí",
        "deathRestartBook" : "Haz click aquí para reiniciar el libro",
        "deathLoadGame" : "Haz click aquí para cargar un juego salvado",

        //////////////////////////////////////
        // Number picker
        //////////////////////////////////////

        "npWrongValue" : 'Valor erroneo para "{0}"',
        "npMinValue" : 'El valor mínimo para "{0}" es {1}',
        "npMaxValue" : 'El valor máximo para "{0}" es {1}',

        //////////////////////////////////////
        // Game setup
        //////////////////////////////////////

        "chooseNumberOn" : "Elige un numero en la",
        "determineCS" : "para determinar tu Destreza en el Combate",
        "determineE" : "para determinar tu Resistencia",
        "combatSkillSet" : "Tu Destreza en el Combate es {0}",
        "enduranceSet" : "Tus puntos de Resistencia son {0}",
        "selectNDisciplines" : 'Por favor, selecciona <span id="mechanics-nDisciplines"></span> disciplinas antes de continuar.',
        "selectNWeapons" : 'Por favor, selecciona <span id="mechanics-setDisciplines-weaponsmax">3</span> armas para Maestría en el Manejo de Armas',
        "choose" : "Elige",
        "maxDisciplines" : "Sólo puede elegir {0} disciplinas",
        "onlyNWeapons" : "Sólo puedes elegir {0} armas",
        "actionchartinfo" : "<p>" +
            "Las siguientes secciones explican como jugar con los libros en papel. Esta aplicación es una adaptación de los " +
            'librojuegos,  y no necesitarás escribir nada en la Carta de Acción (excepto en el campo de "Anotaciones"). La ' +
            "aplicación intenta hacer toda la contabilidad del juego.</p>" +
            "<p>En la Carta de Acción puedes consultar tus estadisticas y gestionar tu inventario (usar o dejar objetos, " +
            "cambiar tu arma actual, ...).</p>" +
            '<p>Cada vez que vean un texto azul en negrita como este "<a class="random action">Un texto</a>" en el texto ' +
            "del libro, es una acción. Normalmente será elegir un número de la Tabla de la Suerte. Pincha en el para hacer " +
            "dicha acción.</p>" +
            '<p>Los textos en azul que no estén en negrita como este "<a>Un texto</a>" son enlaces a otros sitios (p.ej. a ' +
            "la Carta de Acción, o al mapa, ...). Si pinchas en ellos irás allí.</p>" +
            "Al final de esta página encontrás dos enlaces para elegir tu Destreza en el Combate y Resistencia. Pincha en " +
            "ellos antes de continuar a la siguiente sección.</p>",

        //////////////////////////////////////
        // Special sections
        //////////////////////////////////////

        "beltPouch" : "Bolsa",
        "moneyWon" : "Dinero ganado",
        "numberToBet" : "Numero a apostar",
        "crownsToBet" : "Coronas a apostar",
        "play" : "Jugar",
        "playerDices" : "Dados de {0}",
        "playerNumber" : "Jugador {0}",
        "targetPoints" : "BLANCOS LOBO SOLITARIO:",
        "number" : "Número {0}",
        "shoot" : "Disparo",
        "adganaUse" : "Uso de adgana, número Tabla Suerte: {0}",
        "heads" : "Cara",
        "tails" : "Cruz",

        //////////////////////////////////////
        // About page
        //////////////////////////////////////

        "about" : "Acerca del libro",
        "forSommerlund" : "¡Por Sommerlund y el Kai!",
        "dedication" : "Dedicatoria",
        "gameMechanics" : "Mecanicas del juego",
        "aboutKaiChronicles" : "Mecánicas del juego escritas por Toni Bennasar, Timendum, Michael Terry, Javier Fernández-Sanguino, James Koval, Rendall, Garrett Scott y Julian Egelstaff. El código está bajo licencia MIT. Contien partes de código de Lone Wolf Adventures, creado por Liquid State Limited.",
        "distribution" : "Distribución",
        "distributionInfo" : 'Libro distribuido por el <a href="https://www.projectaon.org">Proyecto Aon</a>, bajo la <a href="#projectAonLicense">licencia del Proyecto Aon</a>.',
        "about-authors" : "Sobre los autores del libro",
        "webPlay" : 'Puedes jugar a este juego en un navegador web en <a class="breakable" href="https://www.projectaon.org/staff/toni">https://www.projectaon.org/staff/toni</a>.',

        //////////////////////////////////////
        // Main menu
        //////////////////////////////////////

        "appInfo" : "Esto es una aplicación para jugar a los librojuegos de Lobo Solitario, del 1 al 13.",
        "browsersWarning" : "Sólo se soportan las últimas versiones de Chrome y Firefox. Otros navegadores o versiones no están soportados (pueden funcionar... o no).",
        "historyWarning" : "Ten en cuenta que si borras el historial de tu navegador, perderás la partida actual. Puedes guardar la partida actual a un archivo en <i>Ajustes &gt; Guardar juego</i>.",
        "androidInfo" : 'Puedes jugar a esto en una aplicación Android (versión mínima 5.0). Descárgala en el <a href="https://play.google.com/store/apps/details?id=org.projectaon.kaichronicles">Google Play</a>.',
        "haveFun" : "¡Divierte!",
        "continueGame" : "Continuar el juego",
        "newGame" : "Nuevo juego",
        "downloadBooks" : "Descargar libros",
        "privacy" : "Política de privacidad",
        "menu-changecolor" : "Cambiar color",

        //////////////////////////////////////
        // New game
        //////////////////////////////////////

        "book" : "Libro",
        "language" : "Idioma",
        "english" : "Ingles",
        "spanish" : "Español",
        "agreeLicense" : "Estoy de acuerdo con los términos de la licencia del Proyecto Aon",
        "youMustAgree" : "Has de estar de acuerdo con la licencia para poder continuar",
        "licenseText" : "Texto de la licencia",
        "startGame" : "Iniciar juego",
        "noDownloadedBooks" : 'No se ha descargado ningún libro. Ve a "Descargar libros" en el menú principal',

        //////////////////////////////////////
        // Settings
        //////////////////////////////////////

        "settings" : "Ajustes",
        "saveGame" : "Guardar partida",
        "restartBook" : "Reiniciar libro",
        "downloading" : "Descargando",
        "downloadingWait" : "Descargando el libro, por favor, espere...",
        "fileName" : "Nombre archivo",
        "close" : "Cerrar",
        "wrongFileName" : "El nombre de archivo contiene carácteres no válidos",
        "gameSaved" : "Partida guardada",
        "confirmRestart" : "¿Seguro que quieres reiniciar el libro?",
        "randomTableValues" : "Valores de la Tabla de la Suerte",
        "computerGenerated" : "Generados por ordenador",
        "manual" : "Manuales",
        "extendedCRT" : "¿Usar Tablas de Combate Extendidas (LW club newsletter 29)?",
        "Yes" : "Sí",
        "No" : "No",
        "colorTheme" : "Tema de color",
        "settings-light" : "Dia",
        "settings-dark" : "Noche",

        //////////////////////////////////////
        // Template (Main page)
        //////////////////////////////////////

        "CS" : "D.C.",
        "E" : "R.",
        "map" : "Mapa",

        //////////////////////////////////////
        // Map
        //////////////////////////////////////

        "map-clickinfo" : "Haz click en el mapa para ajustar al tamaño de la pantalla / restaurar a su tamaño original.",
        "map-changezoom" : "Cambiar zoom:",

        //////////////////////////////////////
        // Download books
        //////////////////////////////////////

        "applyChanges" : "Aplicar cambios",
        "selectBooks" : 'Selecciona los libros que quieres descargar del <a href="https://www.projectaon.org">Proyecto Aon</a>.',
        "noChangesSelected" : "No se han seleccionado cambios",
        "confirmChanges" : "¿Seguro que quieres hacer los cambios seleccionados?",
        "deletingBook" : "Borrando libro {0}",
        "bookDeleted" : "Libro {0} borrado",
        "deletionFailed" : "Borrado del libro {0} fallido: {1}",
        "downloadingBook" : "Descargando libro {0}",
        "bookDownloaded" : "Libro {0} descargado",
        "downloadFailed" : "Descarga del libro {0} fallida: {1}",
        "processFinishedErrors" : "¡Proceso finalizado con errores!",
        "size" : "Tam.",
        "noInternet" : "No hay conexión a Internet",
        "cancel" : "Cancelar",
        "processCancelled" : "Proceso cancelado",
        "confirmCancel" : "¿Seguro que quiere cancelar?",

        //////////////////////////////////////
        // Kai monastery safekeeping
        //////////////////////////////////////

        "kaiMonasteryStorage" : "Objetos en el monasterio del Kai",
        "kaiMonastery" : "Monasterio del Kai",
        "kaiMonasteryInfo" : "Aquí puedes guardar objetos en custodia en el monasterio del Kai. Los objetos " +
            'dejados aquí estarán disponibles cuando continues al próximo libro, en la sección "Equipo". Para guardarlos, ve ' +
            'a la <a href="#actionChart">Carta de Acción</a> y deja los objetos que quieres guardar.',
        "backToEquipment" : "Volver a la sección de Equipo",

        //////////////////////////////////////
        // Load game
        //////////////////////////////////////

        "loadGame" : "Cargar juego",
        "fileDeleted" : "{0} borrado",
        "confirmDeleteSave" : "¿Seguro que quiere borrar el juego guardado {0}?",
        "noSavedGames" : "No se encontraron juegos guardados",
        "exportedDownloads" : "Juegos exportados a Descargas",
        "importedGames" : "{0} juegos importados",
        "exportGames" : "Exportar juegos guardados...",
        "importGames" : "Importar juegos guardados...",
        "importExtensionsError" : 'Sólo se pueden importar archivos con extensión "zip" o "json"',
        "confirmSavedOverwrite" : "Las siguientes partidas se sobreescribirán. ¿Seguro que quiere continuar?:\n{0}",
        "confirmExport" : 'Esto creará un archivo Zip con todos los juegos guardados en "Descargas". ' +
            "Esto puede ser útil para copiar tus juegos guardados a otro dispositivo, o como copia de seguridad. ¿Continuamos?",
        "infoImport" : "Con esta función puedes importar juegos guardados a la aplicación. Esto puede ser útil para copiar " +
            "tus juegos guardados desde otro dispositivo. Puedes seleccionar ficheros con " +
            'extensión "json" (un juego guardado) o "zip" (múltiples juegos guardados)',
        "fileslistExplain" : "Pincha en un juego de la lista para recuperarlo. Puedes guardar el juego actual en " +
            "<i>Ajustes &gt; Guardar partida</i>.",
        "exportImportGames" : "Exportar / importar partidas",
        "exportImportGamesExplain": "Puedes exportar e importar las partidas guardadas en la aplicación. Esto puede ser útil " +
            "para copiarlas desde / hacia otros dispositivos.",
        "errorExporting" : "Error exportando juegos guardados",
        "noGamesToExport" : "No hay ninguna partida guardada que exportar",

        //////////////////////////////////////
        // Others
        //////////////////////////////////////

        "tableAvailableObjects" : "Objetos disponibles:",
        "tableSellObjects" : "Vender objetos:",
        "doMealFirst" : "Haz primero la comida",
        "kaiChronicles" : "Crónicas del Kai",
        "gameRules" : "Reglas del juego",
        "projectAonLicense" : "Licencia del Proyecto Aon",
        "combatTables" : "Tablas de Combate",
        "mainMenu" : "Menú principal",
        "bookNotDownloaded" : "El libro {0} no está descargado",
        "maximumPick" : "Sólo puedes coger {0} objetos",
        "zeroIgnored" : "Cero ignorado",
        "faq" : "Preguntas frecuentes"
    };

    /**
     * English translations
     */
    private readonly en = {

        //////////////////////////////////////
        // Action chart / object tables
        //////////////////////////////////////

        "actionChart" : "Action Chart",
        "noneFemenine" : "None",
        "noneMasculine" : "None",
        "disciplineDescription" : "Discipline description",
        "goldCrowns" : "Gold Crowns",
        "arrows" : "Arrows",
        "current" : "Current",
        "backpackLost" : "You have lost your backpack",
        "buyObject" : "Buy object",
        "pickObject" : "Get object",
        "sellObject" : "Sell object",
        "use": "Use",
        "setCurrentWeapon" : "Set as current weapon",
        "dropObject" : "Drop object",
        "confirmSell" : "Are you sure you want to sell the object for {0} Gold Crowns?",
        "confirmUse" : 'Are you sure you want to use "{0}"?',
        "confirmDrop" : 'Are you sure you want to drop "{0}"?',
        "noEnoughMoney" : "You don't have enough money",
        "confirmBuy" : "Are you sure you want to buy the object for {0} Gold Crowns?",
        "msgGetObject" : 'You get "{0}"',
        "msgDropObject" : 'You drop "{0}"',
        "msgGetMeal" : "You get {0} meals",
        "msgDropMeal" : "You drop {0} meals",
        "msgGetMoney" : "You get {0} Gold Crowns",
        "msgGetArrows" : "You get {0} Arrows",
        "msgDropMoney" : "You lost {0} Gold Crowns",
        "msgDropArrows" : "You lost {0} Arrows",
        "msgEndurance" : "{0} Endurance Points",
        "msgCombatSkill" : "{0} Combat Skill",
        "msgCurrentWeapon" : 'Your current weapon is now "{0}"',
        "msgIncompatible" : 'You already have a "{0}"',
        "msgNoMoreWeapons" : "You cannot get more weapons",
        "msgAlreadyBackpack" : "You already have a Backpack",
        "msgNoMoreBackpackItems" : "You cannot get more Backpack Items",
        "msgNoMoreSpecialItems" : "You cannot get more Special Items",
        "noWeapon" : "No weapon",
        "weaponskill" : "Weaponskill",
        "weaponmastery" : "Weaponmastery",
        "grdweaponmastery" : "Grand Weaponmastery",
        "mindblast" : "Mindblast",
        "psisurge" : "Psi-surge",
        "kaisurge" : "Kai-surge",
        "countAsObjects"  : "(Counts as {0} items)",
        "circleFire" : "Circle of Fire",
        "circleLight" : "Circle of Light",
        "circleSolaris" : "Circle of Solaris",
        "circleSpirit" : "Circle of the Spirit",
        "dropMoney" : "Drop money",
        "pickMoney" : "Pick money",
        "amount" : "Amount",
        "noQuiversEnough" : "You don't have enough Quivers (only 6 Arrows per Quiver)",
        "confirm20EP": "This ability can only be used once every 100 days. Continue?",
        "confirm20EPGrdMaster": "This ability can only be used once every 20 days. Continue?",
        "more" : "More",
        "permanent" : "Permanent",
        "usageCount" : "(can be used {0} times)",

        //////////////////////////////////////
        // Combats
        //////////////////////////////////////

        "randomTable" : "Random Number Table",
        "combatSkillUpper" : "COMBAT SKILL",
        "enduranceUpper" : "ENDURANCE",
        "loneWolf": "Lone Wolf",
        "deathLetter" : "K",
        "sectionModifier" : "Section modifier",
        "objectsUse" : "Objects use",
        "enemyMindblast" : "Enemy mindblast",

        //////////////////////////////////////
        // Number picker
        //////////////////////////////////////

        "npWrongValue" : 'Wrong value for "{0}"',
        "npMinValue" : 'Minimum value for "{0}" is {1}',
        "npMaxValue" : 'Maximum value for "{0}" is {1}',

        //////////////////////////////////////
        // Game setup
        //////////////////////////////////////

        "combatSkillSet" : "Your Combat Skill is {0}",
        "enduranceSet" : "Your Endurance Points are {0}",
        "maxDisciplines" : "You can choose only {0} disciplines",
        "onlyNWeapons" : "You can select only {0} weapons",

        //////////////////////////////////////
        // Special sections
        //////////////////////////////////////

        "playerDices" : "{0} dices",
        "playerNumber" : "Player {0}",
        "number" : "Number {0}",
        "adganaUse" : "Adgana use, Random Table number: {0}",
        "heads" : "Heads",
        "tails" : "Tails",

        //////////////////////////////////////
        // About page
        //////////////////////////////////////

        "about" : "About the book",

        //////////////////////////////////////
        // New game
        //////////////////////////////////////

        "youMustAgree" : "You must agree the licence to continue",
        "noDownloadedBooks" : 'There are no downloaded books. Go to "Download books" on the main menu',

        //////////////////////////////////////
        // Settings
        //////////////////////////////////////

        "settings" : "Settings",
        "wrongFileName" : "The file name contains invalid characters",
        "gameSaved" : "Game saved",
        "confirmRestart" : "Are you sure you want to restart the book?",
        "close" : "Close",

        //////////////////////////////////////
        // Template (Main page)
        //////////////////////////////////////

        "CS" : "C.S.",
        "E" : "E.",
        "map" : "Map",

        //////////////////////////////////////
        // Download books
        //////////////////////////////////////

        "noChangesSelected" : "No changes selected",
        "confirmChanges" : "Are you sure you want to do the selected changes?",
        "deletingBook" : "Deleting book {0}",
        "bookDeleted" : "Book {0} deleted",
        "deletionFailed" : "Book {0} deletion failed: {1}",
        "downloadingBook" : "Downloading book {0}",
        "bookDownloaded" : "Book {0} downloaded",
        "downloadFailed" : "Book {0} download failed: {1}",
        "processFinishedErrors" : "Process finished with errors!",
        "noInternet" : "There is no Internet connection",
        "cancel" : "Cancel",
        "processCancelled" : "Process cancelled",
        "confirmCancel" : "Are you sure you want to cancel?",

        //////////////////////////////////////
        // Load game
        //////////////////////////////////////

        "noSavedGames" : "No saved games found",
        "confirmDeleteSave" : "Are you sure you want to delete the save game {0} ?",
        "fileDeleted" : "{0} deleted",
        "exportedDownloads" : "Saved games exported to Downloads",
        "importedGames" : "{0} games imported",
        "importExtensionsError" : 'Only files with extension "zip" or "json" can be imported',
        "confirmSavedOverwrite" : "Following saved games will be overwritten. Are you sure you want to continue?:\n{0}",
        "confirmExport" : 'This will create a Zip file with all your saved games at "Downloads". ' +
            "This can be useful to copy your saved games to other device, or as a backup. Continue?",
        "infoImport" : "With this function you can import saved games to the application. " +
            "This can be useful to copy your saved games from other device. You can select files with " +
            'extension "json" (single saved games) or "zip" (multiple saved games)',
        "errorExporting" : "Error exporting saved games",
        "noGamesToExport" : "There is no saved game to export",

        //////////////////////////////////////
        // Others
        //////////////////////////////////////

        "doMealFirst" : "Please, do the Meal first",
        "kaiChronicles" : "Kai Chronicles",
        "projectAonLicense" : "Project Aon license",
        "combatTables" : "Combat Tables",
        "mainMenu" : "Main Menu",
        "bookNotDownloaded" : "Book {0} is not downloaded",
        "maximumPick" : "You can pick only {0} objects",
        "zeroIgnored" : "Zero ignored",
        "gameRules" : "Game rules"

    };

    /**
     * Returns a DOM view translated to the current language
     * @param {DOM} view The view to translate
     * @param {boolean} doNotClone True if the view should be modified. False, if a clone of the view
     * should be returned
     */
    public translateView( view: String , doNotClone: Boolean = false ) {

        var table = this[state.language];
        if ( !table ) {
            // Translation not available
            return view;
        }

        var $clonedView;
        if ( doNotClone ) {
            $clonedView = $(view);
        } else {
            $clonedView = $(view).clone();
        }

        // Translate the view
        this.translateTags( $clonedView , table );
        return $clonedView;
    }

    /**
     * Translate an HTML fragment
     * @param  $tags jQuery selector of tags to translate
     * @param table Translations table to use. If null, the current language will be used
     */
    public translateTags( $tags: any , table: { [key: string]: string } = null ) {

        if ( !table ) {
            table = this[state.language];
            if ( !table ) {
                // Translation not available
                return;
            }
        }

        var $translatedTags = $tags
            .find("[data-translation]")
            .addBack("[data-translation]");
        for (var i = 0; i < $translatedTags.length; i++ ) {
            var $t = $($translatedTags[i]);
            var translationId = $t.attr("data-translation");
            var html = table[ translationId ];
            if ( html ) {
                $t.html( html );
            }
        }
    }

    /**
     * Get a translated message
     * @param {string} textId The text it to get
     * @param {Array<object>} replacements Replacements to do on the message. It can be null
     * @returns {string} The text
     */
    public text( textId: string , replacements: any[] = null ): string {
        try {
            var table = this[state.language];
            if ( !table ) {
                // Use english as default
                table = this.en;
            }

            var text = table[textId];
            if ( !text ) {
                console.log("Text code not found: " + textId);
                text = textId;
            }

            if ( replacements ) {
                for (var i = 0; i < replacements.length; i++) {
                    text = text.replaceAll( "{" + i + "}" , replacements[i].toString() );
                }
            }
            return text;
        } catch (e) {
            console.log(e);
            return textId;
        }
    }

}

/**
 * The translations singleton
 */
const translations = new Translations();
