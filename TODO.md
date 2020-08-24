
TODO
====

## Gameplay

- Replace list of items with available object list ??
- Get Magnakai bonuses as specified in the handbook (See Healing for example)
- Get Kai/Magnakai bonuses as specified in the handbook (See Healing for example)
  * https://github.com/tonib/kaichronicles/issues/5
  * https://www.projectaon.org/es/foro3/viewtopic.php?p=27752#p27752
- Book 9, sect189: We should keep the count of the different currencies (Lunes, Gold Crows,...). Also on:
  * book 12, sect43
  * book 12, sect61
- At new game, ask for the random table type
- An extension of the above, consider saving a snapshot of the action chart when starting a book in section 1. Then add that option to restart the book at section 1 if you die. That way, you don't have to go through and re-do Disciplines and equipment. Keep the option to completely restart the book, though, in case you want to pick different Disciplines or equipment options  "General - You are erroneously allowed to use healing items (Laumspur, etc.) in combat sections before combat has started. Healing items are only to be used in combat sections after combat is over (and if you're still alive and not evading combat).
- Add a "random discipline" button that will randomly select the proper number of initial disciplines, as well as your bonus discipline each book from the choices remaining
- Add a Seventh-Sense-like achievement system
- "Restart book" (at Settings / book death): Add the book number you will restart (ex. "Restart book 9"). On confirmation, explain
  you will restart with your previous book Action Chart status

## Android

- Compile android app and test it
- Do not show the license text on Android (the book was already downloaded)
- Fix config.xml plugin versions to use
- package.json should be versioned with git ???

## Bugs

- Bugs reported on Google Play:
  * Finally, finally there's a proper LW game book app. The only problem I've noticed is that it only gives Silver Bow's bonus in the sections of book 6 that specifically mention it, and not at all 'rolls' as it is supposed to.
  * Quiero informar un error. Antes que nada gracias a ustedes descubri esta saga y si alguien no lo hizo todavía lean(jueguen)la YA En el libro 5 
  sección 163 dice:  "Si posees la disciplina de Sexto Sentido, pasa al 144  Si quieres atacar a los guardias, pasa al 174  Si posees la disciplina 
  de Sexto Sentido, pasa al 18" La ultima opcion, la que lleva al 18, debería indicar que deseas permanecer como estás (o sea no atacar). 
  En inglés segun Project Aon: If you wish to remain as you are, turn to 18
  * Excelente..esperando los libros finales, por favor!!! Update: En el libro 12, pagina 133 no hay manera de continuar. La unica opcion disponible 
  para avanzar de pagina esta deshabilitada
- Save games is not working on Safari
- You are erroneously allowed to apply multiple Alether effects per combat. You are always limited to one (the berries you can purchase in book 6 even explicitly say so).
- You are erroneously allowed to use healing items (Laumspur, etc.) in combat sections before combat has started. Healing items are only to be used in combat sections after combat is over (and if you're still alive and not evading combat).
- Action chart buttons don't work on iPad Safari

- ERROR: Book 8, sect139: 
  ```actionChartController.pick('quiver'); actionChartController.pick('quiver'); actionChartController.increaseArrows(10);```
  Sell Quiver: OBJECTS TABLE TO SELL IS NOT UPDATED !!!!

## Development / refactorings (TO DO NOW)
- Check older savegames with usageCount = undefined in section states, action chart and InventoryState
  Check also savegames from v1.6 (changes for this in ActionChart.fromObject())
- Test load previous savegame / state versions to v1.12 !!!
- In Grand Master books, if you have Psi-surge, check the bonus for Mindblast
- IMPROVE TESTING
- Documentation about new save game format
- Check if there is any VS code plugin to help XML edition with XSL support
- Book 13, sect4, dark mode, sword object: Add margin to right of object images
- Update documentation about testing (now package name is "kai."), and build
- webpack includes jquery and bootstrap stuff into the library. Remove it

## Spanish books erratas to report
- Book 13, sect equipmnt: "tu nueva Carta de Acciónde Gran Maestro" should be "tu nueva Carta de Acción de Gran Maestro" (space)
- Book 13, sect1:
    * '" Me gustaría poder"' should be "Me gustaría poder" (space)
    * 'en tu misión.”dice Rimoah' should be 'en tu misión,” dice Rimoah' (comma, and space)
- Book 13, sect3: sonoroclang should be "sonoro clang" (space)
- Book 13, sect7: domeñado should be dominado
- Book 13, sect8: Asimilación should be Mimetismo
- Book 13, sect9: Asimilación should be Mimetismo
- Book 13, sect16: "si no posees" should be "Si no posees" (uppercase)
- Book 13, sect16: "Hongo Baylon" should be "Hongos del Árbol de Baylon" (description in book 11, sect146)
- Book 13, sect20: "Cunado" should be "Cuando"
- Book 13, sect20: "norte Pasa al 85" should be "norte pasa al 85"
- Book 13, sect31: "y , junto" should be "y, junto" (space)
- Book 13, sect76: "que de dirige hacia" should be "que se dirige"
 
## Other
- Allow to zoom illustrations?
- Add images to disciplines in Action Chart
- Add option to jump from one book to other (debugging, loyalty bonuses)
- FAQ: Add info about change the Random Table
- Add help for "LW club newsletter 29" setting
- Use latest version on PAON data on SVN (a fixed commit number)
  * Review upgrades to book 7+
- Warn about permanent losses (toastr)
- Google play:
  * Desde el punto 118 no puedo avanzar de ninguna manera en la primer historia. Por favor arreglen eso. Excelente libro gracias.
- Object images on book 9+: Use the current book image, if available
- When you cancel a saved games import, it say "error", and it is not
- Check reported bugs on Google play:
  * Saved games removed when adding new books
  * Objects types
  * Others?
- Performance
- "Okay okay. Didn't know about the lone wolf series and went through the 10 programmed books in 2 days. Turns out the rest are online !!! 
   So it won't be as fast to play but I'm definitely continuing. One remark. I'd like to be able to know what was in the Kai monastery at 
   the end so I can continue with that too !"
- Suggestions and bugs on http://projectaon.proboards.com/post/43740
- Keep version number of current downloaded books, and check for book errata fixes
- On "About the book", display the book number
- Allow to select the current bow
- Android application:
  * App lifeciclye
  * Load games page: Show info about saved games
  * Load games page: Remove ".json" extension
  * Save game: Do not be so restrictive with file names characters
  * Replace toastr by Android toasts ???
  * Remove animations from modal dialogs (only for Android, performance...)
- Toasts with images: align text when the text is multiline
- Combats should be sequential: First finish the first one, then the second, etc
- If the hunting is disabled on the current section, show it on some place (Action Chart?)
- Document all rules
- Common performance (Android and web):
  * Rendering performance on book 2 / sect equimpnt
- Test all books / all sections rendering. It should be valid HTML5
  (https://validator.w3.org/docs/api.html)
- Test tags <ch.* /> replacements
- Dialogs with text input: Allow to confirm with the screen keyboard ("go" button)
- Remove the "Alert" text from the message dialog (same for confirms)
- Google Play will require API 26 on november 2018 (upgrade Cordova version?)
- Allow to change the font size / family
  * See http://www.lalit.org/lab/javascript-css-font-detect/
- Tests: Check spanish and english combats: Enemies should have the same statistics
- Remove links to Lone Wolf Adventures
- Add erratas section?
- Add illustrations index?
- Mechanics: Allow to declare a set of rules that can be runned on multiple sections. See book 12, references to sect208 
  ("Sommerswerd stuff", repeated rules)
- Allow to add a concept description for combat skill modifiers rules on combat ratio explanation
- Display concepts for objects usages (Adgana, etc) on combat ratio explanation
- Display book 11 map ("Northern magnamund") somewhere?
- Add music?


Reminders
=========

* DON'T BE RESTRICTIVE WITH CHOICES !!!!

* JsDoc docs: http://usejsdoc.org/

* Emulate with a given emulator name
cordova emulate --target=Android_4_4_2 android
cordova emulate --target=Android_5_0_1 android
cordova emulate --target=Android_6 android
cordova emulate --target=Android_7 android
cordova emulate --target=Android_9 android

* Build project AON xhtml:
  cd [trunk or tag directory]
  export AONDIR=`pwd`
  export LANGS=[laguage ("en" or "es")]
  ./common/scripts/build-xhtml.sh

* Bug with cordova android icons:
  http://stackoverflow.com/questions/40351434/cordova-android-6-4-0-creates-res-folder-top-level-not-inside-platforms-android

* Upload code to github:
  git remote add origin https://github.com/tonib/kaichronicles.git
  git push -u origin master

* Update code from github:
  git pull origin master
  
* Create new tag:
  git tag <tagname>
  git push origin --tags
  
* Android AVD
  cd [android-sdk]
  tools/android avd

* node.js
  Install dependencies: npm install
  Run script: npm run lint
  
* Debug Cordova app on Chrome:
  URL: chrome://inspect/#devices

* Remove plugin code
  cordova plugin remove cordova-plugin-copytodownload

* Cordova plugins list
  cordova plugin list

* Verify Project AON patches:
  - Verify XML changes:
    svn diff | iconv -f ISO-8859-1 | dwdiff --diff-input -c | less -R
  - Verify patch:
    cat [**PATCHFILE**] | iconv -f ISO-8859-1 | dwdiff --diff-input -c | less -R

* Script to check XML differences between PAON SVN versions (to upgrade XML versions):
  TODO: Check differences between spaces options (see https://stackoverflow.com/questions/16423024/how-can-i-diff-2-files-while-ignoring-leading-white-space)
  svn diff -x --ignore-all-space https://www.projectaon.org/data/tags/20151013/es/xml/01hdlo.xml https://www.projectaon.org/data/trunk/es/xml/01hdlo.xml | iconv -f ISO-8859-1 | colordiff | less -R
  svn diff -x --ignore-all-space https://www.projectaon.org/data/tags/20151013/en/xml/01fftd.xml https://www.projectaon.org/data/trunk/en/xml/01fftd.xml | iconv -f ISO-8859-1 | colordiff | less -R

* Set action chart for Kai series completed
state.actionChart.kaiDisciplines.disciplines = [ KaiDiscipline.Camouflage, KaiDiscipline.Hunting , KaiDiscipline.SixthSense , 
KaiDiscipline.Tracking , KaiDiscipline.Healing , KaiDiscipline.Weaponskill , KaiDiscipline.Mindshield , KaiDiscipline.Mindblast , KaiDiscipline.AnimalKinship ];
state.actionChart.kaiDisciplines.weaponSkill = [ "axe" ];

* Set action chart for Magnakai series completed
state.actionChart.magnakaiDisciplines.disciplines = [ MgnDiscipline.Weaponmastery, MgnDiscipline.AnimalControl, MgnDiscipline.Curing, MgnDiscipline.Invisibility, MgnDiscipline.Huntmastery, MgnDiscipline.Pathsmanship, MgnDiscipline.PsiSurge, MgnDiscipline.PsiScreen, MgnDiscipline.Nexus ];
state.actionChart.kaiDisciplines.weaponSkill = [ "dagger", "spear", "mace", "shortsword", "warhammer", "bow",
        "axe", "sword", "quarterstaff" ];

* Create a default inventory (Magnakai books)
```
kai.actionChartController.drop('all')
kai.actionChartController.pick('backpack')

kai.actionChartController.pick('sword')
kai.actionChartController.pick('bow')

kai.actionChartController.increaseMoney(15)

kai.actionChartController.pick('meal')
kai.actionChartController.pick('meal')

kai.actionChartController.pick('rope')
kai.actionChartController.pick('comb')
kai.actionChartController.pick('brasskey')
kai.actionChartController.pick('whip')
kai.actionChartController.pick('laumspurmeal')
kai.actionChartController.pick('larnumaliqueur2')

kai.actionChartController.pick('sommerswerd')
kai.actionChartController.pick('quiver')
kai.actionChartController.pick('shield')
kai.actionChartController.pick('map')
kai.actionChartController.pick('helmet')
kai.actionChartController.pick('chainmail')
kai.actionChartController.pick('leatherwaistcoat')
kai.actionChartController.pick('daggerofvashna')

kai.actionChartController.increaseArrows(5)
```

* Test book images:
```
state.sectionStates.getSectionState().addObjectToSection('axe')
state.sectionStates.getSectionState().addObjectToSection('dagger')
state.sectionStates.getSectionState().addObjectToSection('sword')
state.sectionStates.getSectionState().addObjectToSection('spear')
state.sectionStates.getSectionState().addObjectToSection('mace')
state.sectionStates.getSectionState().addObjectToSection('shortsword')
state.sectionStates.getSectionState().addObjectToSection('quarterstaff')
state.sectionStates.getSectionState().addObjectToSection('warhammer')
state.sectionStates.getSectionState().addObjectToSection('broadsword')
state.sectionStates.getSectionState().addObjectToSection('bow')
state.sectionStates.getSectionState().addObjectToSection('quiver')
state.sectionStates.getSectionState().addObjectToSection('rope')
state.sectionStates.getSectionState().addObjectToSection('largerope')
state.sectionStates.getSectionState().addObjectToSection('taunorwater')
state.sectionStates.getSectionState().addObjectToSection('meal')
state.sectionStates.getSectionState().addObjectToSection('arrow')
```

* Save tests results to file
No format:
npm run test -- --no-color 2> tests_log.txt

JSON:
npm run test -- --json --outputFile=output.json

* Debug Jest
node --inspect-brk node_modules/.bin/jest --runInBand [any other arguments here]
add "debugger" command to the test to debug
open chrome://inspect/ > Open dedicated DevTools for Node
F8 (resume execution)

