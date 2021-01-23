#!/bin/bash

# clean build folders
echo Cleaning...
rm -rf build dist
rm -rf frontend/dist

# build frontend
echo Building frontend...
(cd frontend && npm run build)

# compile python into executable
echo Building executable...
python build-macos.py py2app