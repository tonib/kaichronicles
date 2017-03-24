
// Build a production to upload to Project Aon

const fs = require('node-fs-extra');
const klawSync = require( 'klaw-sync' );
const uglifyJS = require( 'uglify-js' );
const preprocess = require( 'preprocess' );
const child_process = require('child_process');
const process = require('process');

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
    fs.copySync('src/www/index.html', 'dist/src/www/index.html' );
    preprocess.preprocessFileSync( 'dist/src/www/index.html' , 'dist/src/www/index.html' , 
        context);
}

/**
 * Minimize javascript files
 */
function minifyJavascript() {

    // Get all .js files on js directory
    var jsFiles = klawSync( 'dist/src/www/js' , {nodir: true} );
    console.log("Minfiying js files:");
    var jsPaths = [];
    jsFiles.forEach((f) => {
        console.log(f.path);
        jsPaths.push(f.path);
    });

    // Minify files:
    var result = uglifyJS.minify( jsPaths );

    // Write finified file
    fs.writeFileSync( 'dist/src/www/kai.min.js' , result.code );

    // Remove the unninified js files:
    console.log('Delete unnimified js files');
    fs.removeSync('dist/src/www/js');

}

/** 
 * Builds a production version of the application
 */
function buildAndroidApp() {

    // Update HTML to use the minified js AND cordova
    console.log('Updating index.html for Cordova app');
    preprocessIndexPage(true);

    // Go to root dir
    process.chdir('dist/src');

    try {
        // Run cordova command line
        console.log('Building Android app');
        child_process.execFileSync('cordova', ['clean', 'android'] , {stdio:[0,1,2]} );
        child_process.execFileSync('cordova', ['build', 'android'] , {stdio:[0,1,2]} );

        // Copy the apk to the web root
        // TODO: Sign the apk to upload to the google play
        console.log('Copy the generated apk to the web root');
        fs.copySync( 'platforms/android/build/outputs/apk/android-debug.apk' , 
            'kai.apk' );
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

    console.log('Prepare www dir');
    fs.renameSync( 'dist/src/www', 'dist/www' );
    fs.removeSync( 'dist/src' );
}

recreateDist();
minifyJavascript();
buildAndroidApp();
prepareDistDirectory();

