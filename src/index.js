const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const ipcMain = electron.ipcMain
const fs = require('fs')
const {
  autoUpdater
} = require('electron-updater');
const request = require('request');

//All Called Functions

const functionsPages = require('./components/functions/ChangePages')
const Minecraft = require('./components/functions/Minecraft/Functions')

let mainWindow

function createWindow() {

  mainWindow = new BrowserWindow({
    width: 1800,
    height: 1200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    //icon: `file://${__dirname}/icon.ico`
  }); // on définit une taille pour notre fenêtre

  mainWindow.loadURL(`file://${__dirname}/views/main.html`); // on doit charger un chemin absolu

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  //Quand la page est prête a être chargé
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify()
    let options = {
      url: "https://api.github.com/repos/AlexandreSama/Portal/releases",
      headers: {
        'user-agent': 'node.js',
        'Content-Type': 'application/json'
      }
    }
    request(options, function (error, response, body) {
      if (error) {
        console.log(error)
      }
      mainWindow.webContents.send('githubReleaseData', JSON.parse(body))
    })
  })
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', {
    version: app.getVersion()
  });
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available')
})

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded')
})

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall()
})

//Functions Change Pages

ipcMain.on('GoToMinecraft', (event, data) => {
  functionsPages.GoToMinecraftLogin(mainWindow)
})

ipcMain.on('GoToSatisfactory', (event, data) => {
  functionsPages.GoToSatisfactory(mainWindow)
})

ipcMain.on('GoToFactorio', (event, data) => {
  functionsPages.GoToFactorio(mainWindow)
})

// Minecraft Functions

let launcherPath = app.getPath('appData') + '\\KarasiaLauncher\\'
let launcherModsPath = app.getPath('appData') + '\\KarasiaLauncher\\mods\\'
let launcherJavaPath = app.getPath('appData') + '\\KarasiaLauncher\\Java\\'

ipcMain.on('loginMC', (event, data) => {
  Minecraft.loginMC(data.email, data.password, event, mainWindow)
})

ipcMain.on('saveID', (event, data) => {
  Minecraft.saveID(launcherPath, data.email)
})