#!/bin/bash

# clean build folders
echo Cleaning...
rm -rf build dist
rm -rf frontend/dist
rm *.dmg

# build frontend
echo Building frontend...
(cd frontend && npm run build)

# compile python into executable
echo Building executable...
python build-macos.py py2app

# MAC OS DMG APP DISTRIBUTOR
echo Building DMG...
create-dmg --volname "Bean Counter Installer" \
           --volicon assets/logo.icns \
           --background assets/dmg_background.png \
           --window-pos 200 120 \
           --window-size 600 400 \
           --icon-size 100 \
           --icon "Bean Counter.app" 100 200 \
           --hide-extension "Bean Counter.app" \
           --app-drop-link 500 200 \
           "Bean Counter Installer.dmg" dist

# final cleanup
echo Cleaning extras...
rm -rf build
rm -rf dist/intermediate