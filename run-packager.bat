REM clean build folders
echo Cleaning...
rmdir /S /Q build dist
rmdir /S /Q frontend\\dist
del packages\\*.exe

REM build frontend
echo Building frontend...
cd frontend
call npm run build:windows 
cd ../

REM compile python into executable
echo Building executable...
pyinstaller build-windows.spec

REM create installer
echo Building installer...
iscc package-windows.iss

REM final cleanup
echo Cleaning extras...
rmdir /S /Q build