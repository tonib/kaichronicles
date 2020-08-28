
/**
 * Build a production to upload to Project Aon
 * Run this as "npm run prepareversion [ -- [--debug] [KEYSTOREPASSWORD] ]
 */ 

const fs = require('fs-extra');
const klawSync = require( 'klaw-sync' );
const uglifyJS = require( 'uglify-js' );
const preprocess = require( 'preprocess' );
const child_process = require('child_process');
const process = require('process');
const path = require('path');

// TODO: See what to do with this script
throw "TODO: This script needs to be changed";

/**
 * The keystore to sign the apk (absolute path to the project root)
 */
const KEYSTORE_PATH = process.cwd() + '/keystore/projectaon.keystore';

/**
 * Recreate the dist directory
 */
function recreateDist() {

    console.log("Deleting dist dir");
    fs.removeSync('dist');

    console.log("Creating dist dir");
    fs.mkdirSync('dist');

    console.log("Copying src to dist");
    fs.copySync( 'src' , 'dist/src' );

    // Remove xmllint.js: too big for production (2.2 MB) and only used for tests
    fs.removeSync( 'dist/www/lib/xmllint.js');
}

/**
 * Preprocess the index.html file
 * @param {boolean} includeCordova True to include the cordova.js. Only for the App version
 */
function preprocessIndexPage(includeCordova) {

    var context = { PRODUCTION: 'true' };
    if( includeCordova )
        context.CORDOVA = 'true';

    // Copy the original index.html
    fs.copySync('www/index.html', 'dist/www/index.html' );
    preprocess.preprocessFileSync( 'dist/www/index.html' , 'dist/www/index.html' , 
        context);
}

/**
 * Minimize javascript files
 */
function minifyJavascript() {

    // Get all .js files on js directory
    var jsFiles = klawSync( 'dist/www/js' , {nodir: true} );
    console.log("Minfiying js files:");
    var jsPaths = {};
    jsFiles.forEach((f) => {
        console.log(f.path);
        jsPaths[f.path] = fs.readFileSync( f.path , 'utf8' );
    });

    // Minify files:
    var result = uglifyJS.minify( jsPaths );
    if( result.error )
        throw JSON.stringify( result.error );
    if( result.warnings )
        console.log( 'WARNINGS!!!! : ' + result.warnings );

    // Write minified file
    fs.writeFileSync( 'dist/www/kai.min.js' , result.code );

    // Remove the unninified js files:
    console.log('Delete unnimified js files');
    fs.removeSync('dist/www/js');

}

/**
 * Get the APK sign password.
 * It's passed as the first parameter on the command line. If it does not exists
 * this function will return null.
 * The keystore is expected to be at KEYSTORE_PATH. If this 
 * file does not exists, this function will return null.
 */
function getApkSignPassword() {

    var pwd = null;
    if( process.argv.length >= 3 ) {
        pwd = process.argv[ process.argv.length - 1 ];
        if( pwd.startsWith('--') )
            // Option, not the password:
            pwd = null;
    }

    if( pwd == null ) {
        console.log('Password for keystore was not specified on command line (Unsigned apk)');
        return null;
    }

    // accessSync throws if any accessibility checks fail (oh javascript...)
    // Do not use relative paths, it fails with Cordova 8 when I build a release version and the I do a cordova clean (oh Cordova...)
    var keystoreExists;
    try {
        fs.accessSync(KEYSTORE_PATH);
        keystoreExists = true;
    }
    catch(e) {}

    if( !keystoreExists ) {
        console.log(KEYSTORE_PATH + ' does not exists (Unsigned apk)');
        return null;
    }

    console.log('Keystore pwd is "' + pwd + '"');
    return pwd;
}

/** 
 * Builds a production version of the application
 */
function buildAndroidApp() {

    // Update HTML to use the minified js AND cordova
    console.log('Updating index.html for Cordova app');
    preprocessIndexPage(true);

    // Delete the project aon data
    console.log('Deleting Project Aon data');
    fs.removeSync('dist/www/data/projectAon');

    // Get the password to sign the apk
    var pwd = getApkSignPassword();

    // Go to root dir
    process.chdir('dist/src');

    try {
        // Run cordova command line
        console.log('Building Android app');

        // Clean
        child_process.execFileSync('cordova', ['clean', 'android'] , {stdio:[0,1,2]} );

        var params = ['build', 'android' ];

        // Check if we are compiling for debug
        var debug = false;
        if( process.argv.indexOf( '--debug' ) >= 0 ) {
            params.push( '--debug' );
            debug = true;
            console.log('Building DEBUG');
        }
        else
            params.push( '--release' );

        // Compile
        if( pwd ) {
            // cordova build android --release -- --keystore=ROOTPROJECTPATH/keystore/projectaon.keystore --storePassword=PASSWORD --alias=projectaon --password=PASSWORD
            console.log('Building SIGNED');
            params.push( '--' );
            params.push( '--keystore=' + KEYSTORE_PATH );
            params.push( '--storePassword=' + pwd );
            params.push( '--password=' + pwd );
            params.push( '--alias=projectaon' );
        }
        else
            console.log('Building UNSIGNED');
        console.log( 'cordova ' + params.join( ' ' ) );
        child_process.execFileSync('cordova', params , {stdio:[0,1,2]} );

        // Copy apk to dist root
        // File is generated at platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
        //                      platforms/android/app/build/outputs/apk/release/app-release.apk
        //                      platforms/android/app/build/outputs/apk/debug/app-debug.apk
        //                      ...
        var src = 'platforms/android/app/build/outputs/apk/', dst = 'kai';
        if( debug ) {
            src += 'debug/app-debug';
            dst += '-DEBUG';
        }
        else {
            src += 'release/app-release';
        }
        if( !pwd ) {
            if( !debug )
                src += '-unsigned';
            dst += '-UNSIGNED';
        }
        src += '.apk';
        dst += '.apk';

        console.log( 'Copying ' + src + ' to dist/' + dst );
        fs.copySync( src , '../' + dst );
    }
    catch(e) {
        console.log(e);
    }

    // Go back
    process.chdir('../..');
}

/**
 * Prepare the dist/www directory, and remove unused stuff
 */
function prepareDistDirectory() {

    // Update HTML to use the minified js WITHOUT cordova.js
    console.log('Updating index.html for www');
    preprocessIndexPage(false);

    // Copy Project Aon data
    console.log('Copying Project Aon data');
    fs.copySync('www/data/projectAon', 'dist/www/data/projectAon' );

    //console.log('Prepare www dir');
    //fs.renameSync( 'dist/src/www', 'dist/www' );
    //fs.removeSync( 'dist/src' );

}

/**
 * Join views on a single file
 */
function joinViews() {
    console.log("Join HTML views on a single file");

    // Get all .html files on views dir
    var viewFiles = klawSync( 'dist/www/views' , {nodir: true} );
    var joinedFileContent = '';
    viewFiles.forEach((f) => {
        console.log( f.path );
        var fileText = fs.readFileSync( f.path , 'utf8' );
        joinedFileContent += '\n<div class="htmlpage" id="' + 
            path.basename( f.path ) + '">\n' + fileText + "\n</div>\n";
    });
    joinedFileContent = "<div>\n" + joinedFileContent + "\n</div>\n";

    // Write joined file
    fs.writeFileSync( 'dist/www/views.html' , joinedFileContent );

    // Delete views directory
    fs.removeSync( 'dist/www/views' );
}

recreateDist();
minifyJavascript();
joinViews();
buildAndroidApp();
prepareDistDirectory();

