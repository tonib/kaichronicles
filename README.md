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

## Setup

Download the Project Aon game data:
```bash
    cd www/data/
    ruby downloadProjectAonData.rb
```

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
    cordova build android
```

This will generate a file platforms/android/build/outputs/apk/android-debug.apk with the
Android app.

### License

MIT. This application uses the following third-party code:

* [Bootstrap](http://getbootstrap.com/) (MIT)
* [Toastr](https://github.com/CodeSeven/toastr) (MIT)
* [FileSaver.js](https://github.com/eligrey/FileSaver.js/) (MIT)
* [jQuery](https://jquery.com/) (jQuery license)
* The file www/images/logo-white-bg-40.png is an awful adaptation of the logo image of the 
  spanish Project Aon
* The file www/model/sectionRenderer.js contains code taken from Lone Wolf Adventures, 
  from Liquid State Limited
