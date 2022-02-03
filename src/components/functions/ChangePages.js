const electron = require('electron');
const app = electron.app;
const fs = require('fs')

let launcherPath = app.getPath('appData') + '\\KarasiaLauncher\\'

function GoToMinecraftLogin(mainWindow) {
    mainWindow.loadURL(`file://${__dirname}/../../views/Minecraft/login.html`)
    if (fs.existsSync(launcherPath)) {
        if (fs.existsSync(launcherPath + '\\infos.json')) {
            let rawdata = fs.readFileSync(launcherPath + '\\infos.json');
            let student = JSON.parse(rawdata);
            mainWindow.webContents.send('savedID', {student})
        }
    }else{
        fs.mkdirSync(launcherPath)
    }
}

function GoToSatisfactory(mainWindow) {
    mainWindow.loadURL(`file://${__dirname}/../../views/Satisfactory/main.html`)
}

function GoToFactorio(mainWindow) {
    mainWindow.loadURL(`file://${__dirname}/../../views/Factorio/main.html`)
}

module.exports = {
    GoToMinecraftLogin,
    GoToFactorio,
    GoToSatisfactory
}