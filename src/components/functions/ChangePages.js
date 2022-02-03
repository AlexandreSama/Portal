function GoToMinecraftLogin(mainWindow) {
    mainWindow.loadURL(`file://${__dirname}/views/Minecraft/login.html`)
}

function GoToSatisfactory(mainWindow) {
    mainWindow.loadURL(`file://${__dirname}/views/Satisfactory/main.html`)
}

function GoToFactorio(mainWindow) {
    mainWindow.loadURL(`file://${__dirname}/views/Factorio/main.html`)
}

module.exports = {GoToMinecraftLogin, GoToFactorio, GoToSatisfactory}