const mysql = require('mysql2')
async function CheckUserDatabase(data, mainWindow, event, host, user, password) {

    const connection = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: 'vpsmonitor'
    })
    connection.connect();
    console.log('check !')
    connection.query(`SELECT password FROM users WHERE username = "${data.username}"`, async function (error, results, fields) {
        if (error) {
            console.log('erreur !')
            console.log(error)
            event.sender.send('Error-Login')
        }
        if (results) {
            connection.query(`SELECT * FROM users WHERE username = "${data.username}"`, function (error, results) {
                if (error) {
                    console.log(error)
                }
                if (results) {
                    mainWindow.loadURL(`file://${__dirname}/../../../views/vpsmonitor/panels.html`)
                    mainWindow.webContents.once('dom-ready', () => {
                        mainWindow.webContents.send('userData', results[0])
                    })
                }
            })
        }
    })
}

module.exports = {
    CheckUserDatabase
}