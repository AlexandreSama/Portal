const electron = require('electron');
const Tray = electron.Tray
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
const {
  Client
} = require('ssh2');
const prompt = require('electron-prompt');
const ConfigVps = require('./config.json')
const remoteMain = require('@electron/remote/main')
const nativeImage = require('electron')
// const rpc = require("discord-rpc");
// const client = new rpc.Client({
//   transport: 'ipc'
// });

// client.login({
//   clientId: '256892994504884224'
// }).catch(console.error);

// client.on('ready', () => {
//   console.log('Your presence works now check your discord profile :D')
//   client.request('SET_ACTIVITY', {
//     pid: process.pid,
//     activity: {
//       details: "",
//       state: "",
//       assets: {
//         large_image: config.LargeImage,
//         large_text: config.LargeImageText,
//         small_image: config.SmallImage,
//         small_text: config.SmallImageText,
//       },
//       buttons: [{
//           label: config.Button1,
//           url: config.Url1
//         },
//         {
//           label: config.Button2,
//           url: config.Url2
//         },
//         //labels are the buttons that you wanna provide to your rich presence and urls are the links that leads you when someone press that button
//         //Note the button won't work for you but don't worry it work for others
//       ]
//     }
//   })
// })

remoteMain.initialize()
//All Called Functions

const functionsPages = require('./components/functions/ChangePages')
const Minecraft = require('./components/functions/Minecraft/Functions')
const VpsMonitor = require('./components/functions/VpsMonitor/Functions');
const process = require('process');
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
    icon: __dirname + '/logo.ico'
  }); // on définit une taille pour notre fenêtre

  mainWindow.loadURL(`file://${__dirname}/views/main.html`); // on doit charger un chemin absolu
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
    let appIcon = __dirname + '/logo.ico'
    let tray = new Tray(appIcon)
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

// fs.readdir(data, 'utf8', (err, files) => {
//   var tbodyRef = document.getElementById('ModTable').getElementsByTagName('tbody')[0]
//   files.forEach(element => {
//       var newRow = tbodyRef.insertRow();

//       // Insert a cell at the end of the row
//       var newCell = newRow.insertCell();

//       // Append a text node to the cell
//       var newText = document.createTextNode(element);
//       newCell.appendChild(newText);
//   })
// })

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
    let Data = fs.readFileSync(launcherPath + 'infos.json')
    let DataJson = JSON.parse(Data)
    let ram = DataJson.infos[0].ram
    mainWindow.webContents.once('dom-ready', () => {
      mainWindow.webContents.send('MSData', result.profile)
      mainWindow.webContents.send('DataRam', ram)
    })
  })
  Minecraft.downloadModsList(launcherPath)
})

ipcMain.on('GoToModList', (event, data) => {
  functionsPages.GoToMCModList(mainWindow, launcherModsPath)
})

ipcMain.on('Play', (event, data) => {
  Minecraft.launchGame(MSResult, launcherPath, launcherJavaPath, launcherModsPath, mainWindow, event)
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
    a2fcode: data.A2FCode,
    password: ConfigVps.passwordVpsAlex,
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