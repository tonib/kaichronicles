# Script to prepare a build to upload Project Aon

# Clean and rebuild Android apk
cd src
rm www/kai.apk
cordova clean android
cordova build android

# Copy the apk to upload to Project Aon
cp platforms/android/build/outputs/apk/android-debug.apk www/kai.apk

# Download this on you test Android device to test the apk:
# http://[LOCALPCIP]/[KAICHRONICLESDIR]/kai.apk
