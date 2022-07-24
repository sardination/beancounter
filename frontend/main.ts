import { app, BrowserWindow } from "electron";
import * as path from "path";
import { isDevMode } from '@angular/core';
import { PythonShell } from "python-shell";

// TODO: FIND OUT WHAT'S GOING ON HERE WRT DEV/BUNDLED
// TODO: FIGURE OUT HOW TO ALWAYS PROTECT PROD DATA FROM DEV

var pyProc;

// functions for starting the backend python server
function getBackendProgramPath() {
  // if (isDevMode) {
  //   return path.join(__dirname, '../backend', 'run.py');
  // }

  return path.join(__dirname, '../dist', 'run');
}

function startBackendServer() {
  let backendPath = getBackendProgramPath();

  // if (isDevMode) {
  //   let pyProc = require('child_process').spawn('python', [backendPath]);
  //   console.log(pyProc);
  //   return;
  // }

  pyProc = require('child_process').execFile(backendPath);
  if (pyProc == null) {
    console.log("backend server failed to start");
  }
}

function createWindow() {

  // start the backend server:
  // if not in dev mode, then need to simultaneously run
  //    in backend, python run.py (or python manage.py runserver)
  //    in frontend, ng serve
  //    in frontend, npm run start:dev
  if (isDevMode) {
    startBackendServer();
  }

  // Create the browser window.
  const mainWindow = new BrowserWindow();
  mainWindow.maximize();

  // and load the index.html of the app.
  // mainWindow.loadFile(path.join(__dirname, "dist/index.html"));
  mainWindow.loadURL(
    environment.useWebview
      ? 'http://localhost:4200'
      : `file://${path.join(__dirname, 'dist/index.html')}`,
  )

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform == "darwin") {
    if (pyProc) {
      pyProc.kill();
    }
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
