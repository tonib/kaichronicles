# Script to prepare a build to upload Project Aon
# TODO: Do this with a node.js script

# Re-create distribution directory
rm -rf dist
mkdir dist

# Clean and rebuild Android apk
# THIS REQUIRES cordova (https://cordova.apache.org/)
cd src
rm www/kai.apk
cordova clean android
cordova build android

# Copy the apk to upload to Project Aon
cp platforms/android/build/outputs/apk/android-debug.apk www/kai.apk

# Copy the www directory to the distribution directory
cd ..
cp -r src/www dist/www

# Minify js directory
# THIS REQUIRES uglifyjs (https://github.com/mishoo/UglifyJS2)
cd dist/www
mv js js-toremove
cd js-toremove
uglifyjs controller/gameRulesController.js \
         controller/gameRulesController.js \
         controller/setupController.js \
         controller/loadGameController.js \
         controller/actionChartController.js \
         controller/mechanics/randomMechanics.js \
         controller/mechanics/specialSectionsMechanics.js \
         controller/mechanics/setupMechanics.js \
         controller/mechanics/combatMechanics.js \
         controller/mechanics/numberPickerMechanics.js \
         controller/mechanics/mealMechanics.js \
         controller/mechanics/mechanicsEngine.js \
         controller/mainMenuController.js \
         controller/projectAonLicenseController.js \
         controller/settingsController.js \
         controller/aboutController.js \
         controller/testsController.js \
         controller/gameController.js \
         controller/mapController.js \
         controller/newGameController.js \
         state.js \
         routing.js \
         template.js \
         views.js \
         common.js \
         views/setupView.js \
         views/gameView.js \
         views/newGameView.js \
         views/viewsUtils/objectsTable.js \
         views/viewsUtils/translations.js \
         views/viewsUtils/numberPicker.js \
         views/loadGameView.js \
         views/mapView.js \
         views/actionChartView.js \
         views/settingsView.js \
         views/mainMenuView.js \
         cordova-stuff/cordovaApp.js \
         cordova-stuff/cordovaFS.js \
         model/randomTable.js \
         model/combatTable.js \
         model/section.js \
         model/combat.js \
         model/sectionRenderer.js \
         model/book.js \
         model/bookSectionStates.js \
         model/actionChart.js \
         model/sectionState.js \
         model/combatTurn.js \
         model/mechanics.js \
         model/item.js \
         -o ../kai.min.js
# Go back to www
cd ..
rm -rf js-toremove
# TODO: Replace minified files on index.html by the the mified files
# TODO: Remove the reference to cordova.js on the www distribution

# Go back to dist
cd ..

# Go back to root
cd ..

# Download this on you test Android device to test the apk:
# http://[LOCALPCIP]/[KAICHRONICLESDIR]/kai.apk
