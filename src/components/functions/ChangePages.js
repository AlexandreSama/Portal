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

module.exports = {
    GoToMinecraftLogin,
    GoToVpsMonitoring,
    GoToSatisfactory,
    GoToMain
}