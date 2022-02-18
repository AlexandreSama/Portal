const electron = require('electron');
const app = electron.app;
const fs = require('fs')

let launcherPath = app.getPath('appData') + '\\KarasiaLauncher\\'

function GoToMinecraftLogin(mainWindow) {
    mainWindow.loadURL(`file://${__dirname}/../../views/Minecraft/login.html`)

    if (fs.existsSync(launcherPath)) {
        
    } else {
        fs.mkdirSync(launcherPath)
    }
}

function GoToSatisfactory(mainWindow) {
    mainWindow.loadURL(`file://${__dirname}/../../views/Satisfactory/main.html`)
}

function GoToVpsMonitoring(mainWindow) {
    mainWindow.loadURL(`file://${__dirname}/../../views/vpsmonitor/login.html`)
}

function GoToMain(mainWindow) {
    mainWindow.loadURL(`file://${__dirname}/../../views/main.html`)
}

function GoToMCModList(mainWindow, launcherModsPath){
    mainWindow.loadURL(`file://${__dirname}/../../views/Minecraft/modList.html`)
    mainWindow.webContents.once('dom-ready', () => {
        mainWindow.webContents.send('ModList', launcherModsPath)
    })
}

module.exports = {
    GoToMinecraftLogin,
    GoToMCModList,
    GoToVpsMonitoring,
    GoToSatisfactory,
    GoToMain
}