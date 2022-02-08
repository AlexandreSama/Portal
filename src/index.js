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
const msmc = require("msmc");
const fetch = require('node-fetch');
const mysql = require('mysql2')
const { Client } = require('ssh2');
const prompt = require('electron-prompt');
const ConfigVps = require('./config.json')
const remoteMain = require("@electron/remote/main");

//All Called Functions

const functionsPages = require('./components/functions/ChangePages')
const Minecraft = require('./components/functions/Minecraft/Functions')
const VpsMonitor = require('./components/functions/VpsMonitor/Functions')
let MSResult

let mainWindow

function createWindow() {

  mainWindow = new BrowserWindow({
    width: 1800,
    height: 1200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    //icon: `file://${__dirname}/icon.ico`
  }); // on définit une taille pour notre fenêtre

  mainWindow.loadURL(`file://${__dirname}/views/main.html`); // on doit charger un chemin absolu
  remoteMain.initialize()
  remoteMain.enable(mainWindow.webContents) 

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


// Updates Parts

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

//Pages Parts

ipcMain.on('GoToMinecraft', (event, data) => {
  functionsPages.GoToMinecraftLogin(mainWindow)
})

ipcMain.on('GoToSatisfactory', (event, data) => {
  functionsPages.GoToSatisfactory(mainWindow)
})

ipcMain.on('GoToVpsMonitor', (event, data) => {
  functionsPages.GoToVpsMonitoring(mainWindow)
})

ipcMain.on('GoToMain', (event, data) => {
  functionsPages.GoToMain(mainWindow)
})

// Minecraft Parts

let launcherPath = app.getPath('appData') + '\\KarasiaLauncher\\Minecraft\\'
let launcherModsPath = app.getPath('appData') + '\\KarasiaLauncher\\Minecraft\\mods\\'
let launcherJavaPath = app.getPath('appData') + '\\KarasiaLauncher\\Minecraft\\Java\\'

ipcMain.on('loginMS', (event, data) => {
  msmc.setFetch(fetch)
  msmc.fastLaunch("raw", (update) => {

  }).then(result => {
    if (msmc.errorCheck(result)) {
      console.log(result.reason)
      return;
    }
    result.profile
    MSResult = result
    mainWindow.loadURL(`file://${__dirname}/../src/views/Minecraft/main.html`)
    mainWindow.webContents.once('dom-ready', () => {
      mainWindow.webContents.send('MSData', result.profile)
    })
  })
  Minecraft.downloadModsList(launcherPath)
})

ipcMain.on('Play', async (event, data) => {
  Minecraft.checkLauncherPaths(launcherPath, launcherJavaPath, launcherModsPath)
  await Minecraft.checkForge(launcherPath, event)
  await Minecraft.checkJava(launcherJavaPath, event)
  await Minecraft.checkMods(launcherPath, launcherModsPath, event)
  await Minecraft.launchGameWithMS(MSResult, launcherJavaPath, launcherPath, mainWindow, event)
})
ipcMain.on('saveID', (event, data) => {
  Minecraft.saveID(launcherPath, data.email)
})

ipcMain.on('SaveRam', (event, data) => {
  Minecraft.saveRam(data, launcherPath)
})

//VpsMonitor Parts

ipcMain.on('loginVps', (event, data) => {
  VpsMonitor.CheckUserDatabase(data, mainWindow, event, ConfigVps.host, ConfigVps.username, ConfigVps.password)
})

ipcMain.on('VPSPatou', (event, data) => {

  mainWindow.loadURL(`file://${__dirname}/../views/vpsmonitor/panel.html`)
  mainWindow.webContents.once('dom-ready', () => {
    event.sender.send('startSSHPatou', data.A2FCode)
  })
})


ipcMain.on('VPSAlex', (event, data) => {
  mainWindow.loadURL(`file://${__dirname}/views/vpsmonitor/panel.html`)
  let arrayInfos = {
    a2fcode : data.A2FCode,
    password : ConfigVps.passwordVpsAlex,
    config: {
      host: ConfigVps.hostVpsAlex,
      port: ConfigVps.portVpsAlex,
    }
  }
  mainWindow.webContents.once('dom-ready', () => {
    event.sender.send('startSSHAlex', arrayInfos)
  })
})

ipcMain.on('VPSCyril', (event, data) => {
  mainWindow.loadURL(`file://${__dirname}/../views/vpsmonitor/panel.html`)
  mainWindow.webContents.once('dom-ready', () => {
    event.sender.send('startSSHCyril', data.A2FCode)
  })
})