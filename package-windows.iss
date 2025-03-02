[Setup]
AppName=Bean Counter
AppVersion=1.1.1
WizardStyle=modern
DefaultDirName={autopf}\Bean Counter
DefaultGroupName=Bean Counter
UninstallDisplayIcon={app}\Bean Counter.exe
Compression=lzma2
SolidCompression=yes
OutputDir="packages"
OutputBaseFilename=Bean Counter Installer

[Files]
Source: "dist\Bean Counter\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\Bean Counter"; Filename: "{app}\Bean Counter.exe"
