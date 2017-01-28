##Kai Chronicles

This is a game player for Lone Wolf game books. Only books 1 and 2 are playable right
now. It runs as a website or Android app.

This repository does not contain game books data. It must to be downloaded from the 
Project Aon web site. **REMEMBER** that game books data is under the
[Project Aon license](https://www.projectaon.org/en/Main/License), so:

* You cannot put this application on a public web server (only on your local machine, for
  your own use). The only place where this game can be published is on the Project Aon 
  web site
* You cannot redistribute the game books data in any way

The Android older version supported is the 4.4.2 (API 19). The web is tested with the 
latest version of Chrome and Firefox. So, other browsers or/and older versions maybe don't 
work

## Setup

Download the Project Aon game data:
```bash
    cd www/data/
    ruby downloadProjectAonData.rb
```
This will require ruby (any recent version), and the SVN client

### Setup web site

* Put the folder www on your private web server
* Open http://localhost/[dir-for-www]/index.html

Done. If you have Firefox, you dont need a web server. You can open directly the 
file www/index.html. This will not work with Chrome (see 
http://stackoverflow.com/questions/10752055/cross-origin-requests-are-only-supported-for-http-error-when-loading-a-local)

### Setup Android app

Install Cordova (https://cordova.apache.org/) and the Android requeriments
(https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html). Then:
```bash
    cordova platform add android
    cordova plugin add cordova-plugin-file
    cordova plugin add cordova-plugin-splashscreen
    cordova build android
```

This will generate a file platforms/android/build/outputs/apk/android-debug.apk with the
Android app.

You can test it with the emulator:

```bash
    cordova emulate android
```

There is a bug with Android on Cordova 6.4 with the app icons. If the app icon don't appear,
read this:
http://stackoverflow.com/questions/40351434/cordova-android-6-4-0-creates-res-folder-top-level-not-inside-platforms-android


### Developing 

Game rules for each book are located at www/data. "mechanics-X" are the game rules
for the book X. "objects.xml" are the game objects

The game rules implementation are at www/controller/mechanics/mechanicsEngine.js

If you add "?debug=true" to the game URL, they will appear some debug tools.
You also can use the browser Developer Tools to prepare the Action Chart to test sections.
So, in the console you can execute things like:
```javascript
actionChartController.pick('axe')
actionChartController.increaseMoney(-10)
```

### License

MIT. This application uses the following third-party code:

* [Bootstrap](http://getbootstrap.com/) (MIT)
* [Toastr](https://github.com/CodeSeven/toastr) (MIT)
* [FileSaver.js](https://github.com/eligrey/FileSaver.js/) (MIT)
* [jQuery](https://jquery.com/) (jQuery license)
* Logos, icons and splashes are taken directly, or adapted, from the Spanish Project Aon 
  (https://projectaon.org/es)
* The HTML rendering, books XML processing and Project Aon license HTML contain code
  taken from Lone Wolf Adventures, by Liquid State Limited
