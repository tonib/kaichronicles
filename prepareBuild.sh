# Script to prepare a build to upload Project Aon

# Clean and rebuild Android apk
rm www/kai.apk
cordova clean android
cordova build android

# Copy the apk to do the final test on local machine and to upload to Project Aon
cp platforms/android/build/outputs/apk/android-debug.apk /var/www/kai.apk
cp platforms/android/build/outputs/apk/android-debug.apk www/kai.apk

# Download this on you test Android device to test the apk:
# http://[LOCALPCIP]/kai.apk
