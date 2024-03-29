## Kai Chronicles

**November 2021: Kai Chronicles app is no longer published**

Kai Chronicles is a game player for Lone Wolf game books. Only books 1 - 13 are
playable. The game player can run as a website or Android app.  ~~You can play it at 
[https://www.projectaon.org/staff/toni](https://www.projectaon.org/staff/toni) or download
the app from [Google Play](https://play.google.com/store/apps/details?id=org.projectaon.kaichronicles)~~.

~~This repository does not contain game books data. Data must be downloaded from the 
[Project Aon web site](https://www.projectaon.org). 
**REMEMBER** that game books data is under the
[Project Aon license](https://www.projectaon.org/en/Main/License), so:~~

* ~~You cannot put this application on a public web server (only on your local machine, for
  your own use). The only place where this game can be published is on the Project Aon 
  web site~~
* ~~You cannot redistribute the game books data in any way~~

The Android older supported version is 5.1 (API 22). The web is tested with the
latest version of Chrome and Firefox. Other browsers or/and older versions may don't 
work.

## Setup

Compile Typescript
```bash
npm install
npm run ts    # This compiles for node.js, generates code in src/js
npm run build # This compiles for browser, generates code in www/js
```

Download the Project Aon game data:
```bash
npm run downloaddata
```
This will require Node.js (any recent version), zip command and the SVN client on your path

### Setup web site

```bash
npm run serve
```
Open your browser on http://localhost:5000.

### Setup Android app

Install [Cordova 9.0 Android requeriments](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#installing-the-requirements). Then:
```bash
npm run cordova-prepare
npm run cordova-build
```

This will generate a file src/platforms/android/build/outputs/apk/android-debug.apk with the
Android app.

You can test the app with the emulator. Open it with Android Studio and then:

```bash
npm run cordova-run
```

Cordova is installed as NPM requirement, so any other command is available from node_modules. Example:
```bash
node_modules/cordova/bin/cordova plugin list
```

By default, this app will download the books from the Project Aon web. If you need  to download the books from your
private web server, you can change it in BookDownloadState.ts, method "downloadAsync".

### Setup a Docker image
Optional method for running a local website only to play the game
 * Download and install [Docker](https://docs.docker.com/install/) and make sure it's is in your PATH environment variable
 * Using a terminal (Linux or iOS) or PowerShell (Windows 10) navigate to the project's directory
 * Type `docker build -t kai:1.0 .`
 * Type `docker run -p 8080:8080 kai:1.0`
 * Open http://localhost:8080
 
 More information about this method [here](./doc/README-docker.md)

### Developing 

Game rules for each book are located at [www/data](www/data). "mechanics-X" are the game rules
for the book X. "objects.xml" are the game objects

There is (unfished) documentation for [rules](doc/README-mechanics.md), [object formats](doc/README-objects.md) and
[save game file format](doc/README-savegames.md).

The game rules implementation are at src/ts/controller/mechanics and www/controller/mechanics.

If you add "?debug=true" to the game URL, some debug tools will appear.
You also can use the browser Developer Tools to prepare the Action Chart to test individual sections.
For example, in the console you can execute things like:
```javascript
kai.actionChartController.pick('axe')
kai.actionChartController.increaseMoney(-10)
```

There are some scripts for development:

```bash
npm run downloaddata [booknumber] # Download books data from the Project Aon. Specify "booknumber" to download a single book
npm run lint          # Runs tslint over the Typescript code
npm run prepareversion [ -- [--debug] [KEYSTOREPASSWORD] ] # Prepare a version to upload on "dist" dir.
npm run cleandist     # Delete the "dist" dir
npm run ts            # Compile Typescript code for execution with node.js
npm run build         # Compile and pack Typescript code for execution with browser
npm run cleants       # Remove all code generated by the Typescript compiler
npm run reviewchanges BOOKNUMBER LANGUAGE # Compare the currently publised app book version with the latest version on the PAON SVN
npm run test          # Run tests
```

"npm run prepareversion" will generate a version to upload to the Google Play and the Project Aon 
website on the "dist" directory. Then "KEYSTOREPASSWORD" is the password for the keystore. If 
it's not specified, an unsigned .apk will be generated. I suspect it's not a good idea to publish 
keystores on github. Option "--debug" will generate a debuggable version

"npm run reviewchanges" is useful to check book changes from the last app publised version. It requires commands iconv, dwdiff, and less on your path.

A "guide" to develop new books can be found at [doc/README-developing.md](doc/README-developing.md)

### Tests

Tests are run with Selenium Web Driver and Jest. Currently tests will run only with Chrome, and Selenium will need a "browser driver". See
https://www.selenium.dev/documentation/en/webdriver/driver_requirements for installation instructions. Tests are located at src/ts/tests.
Be sure Typescript for node.js is compiled before running tests:

```bash
npm run ts
npm run test
```

### License

MIT. This application uses the following third-party code / resources:

* The HTML rendering, books XML processing and Project Aon license HTML contains code
  taken from Lone Wolf Adventures, by Liquid State Limited
* The Lone Wolf logo and splashes are taken directly, or adapted, from the 
  [Spanish Project Aon](https://projectaon.org/es)
* Button icons are create by [Delapouite](http://delapouite.com/), 
  [Lorc](http://lorcblog.blogspot.com/) and [Willdabeast](http://wjbstories.blogspot.com/),
  and distributed from [http://game-icons.net/](http://game-icons.net/) 
  ([CC License](https://creativecommons.org/licenses/by/3.0/))
* [Bootstrap](http://getbootstrap.com/) (MIT)
* [Toastr](https://github.com/CodeSeven/toastr) (MIT)
* [FileSaver.js](https://github.com/eligrey/FileSaver.js/) (MIT)
* [jQuery](https://jquery.com/) (jQuery license)
* [Apache Cordova](https://cordova.apache.org/) (Apache license)
* [xml.js](https://github.com/kripken/xml.js/), code taken from 
  [http://syssgx.github.io/xml.js/](http://syssgx.github.io/xml.js/) ([CC License](https://creativecommons.org/licenses/by/3.0/))
* [cordova-plugin-zip](https://github.com/MobileChromeApps/cordova-plugin-zip) ([License](https://github.com/MobileChromeApps/cordova-plugin-zip/blob/master/LICENSE))
* [cordova-plugin-zeep](https://github.com/FortuneN/cordova-plugin-zeep) (Apache License 2.0)
* [cordova-filechooser](https://github.com/don/cordova-filechooser) (Apache License 2.0)
* [cordova-plugin-copytodownload](https://github.com/tonib/cordova-plugin-copytodownload) (MIT)
* [cordova-plugin-document-contract](https://github.com/danjarvis/cordova-plugin-document-contract) (MIT)

~~Thanks to [LSI](http://www.lsisoluciones.com) for letting us use its Google Play account for this app.~~
