
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

- ERROR:
  There is a bug picking quivers in game section. If there are two quivers, one with 6 arrows and other with 4. If you pick first
  the one with 4 arrows, the remaining quiver changes its number of arrows from 6 to 4....

## Development / refactorings
- State load: Items stored in inventory restore poins were strings. Now are ActionChartItem -> do the conversion
- Drop items by slot position SHOULD BE REWRITTEN: Keep in mind count usages left
- Objects with multiple uses ("sabito") will cannot be dropped: They need a new rule "use", to decrease the usage count. This can,
  or not, drop the object
- Indent common.ts

## Other
- Move all bonuses calculation from ActionChart to a new class
- Add option to jump from one book to other (debugging, loyalty bonuses)
- UPLOAD NEW VERSION 1.11.1
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


* Create a default inventory (Magnakai books)
```
actionChartController.drop('all')
actionChartController.pick('backpack')

actionChartController.pick('sword')
actionChartController.pick('bow')

actionChartController.increaseMoney(15)

actionChartController.pick('meal')
actionChartController.pick('meal')

actionChartController.pick('rope')
actionChartController.pick('comb')
actionChartController.pick('brasskey')
actionChartController.pick('whip')
actionChartController.pick('laumspurmeal')
actionChartController.pick('hourglass')

actionChartController.pick('sommerswerd')
actionChartController.pick('quiver')
actionChartController.pick('shield')
actionChartController.pick('map')
actionChartController.pick('helmet')
actionChartController.pick('chainmail')
actionChartController.pick('leatherwaistcoat')
actionChartController.pick('daggerofvashna')

actionChartController.increaseArrows(5)
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
