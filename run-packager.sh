#!/bin/bash

# clean build folders
echo Cleaning...
rm -rf build dist
rm -rf frontend/dist
rm *.dmg
rm packages/*.dmg
mkdir packages

# build frontend
echo Building frontend...
(cd frontend && npm run build)

# compile python into executable
echo Building executable...
if [[ "$OSTYPE" == "darwin"* ]]; then
    python build-macos.py py2app
elif [[ "$OSTYPE" == "msys" ]]; then # use MinGW
    pyinstaller build-windows.spec
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    pyinstaller build-linux.spec --onefile
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
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
               "packages/Bean Counter Installer.dmg" dist
elif [[ "$OSTYPE" == "msys" ]]; then # use MinGW
    echo Windows packager not implemented yet
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo Linux packager not implemented yet
fi

# final cleanup
echo Cleaning extras...
rm -rf build
rm -rf dist/intermediate
