const {
    Client,
    Authenticator
} = require('minecraft-launcher-core');
const fs = require('fs')
const AdmZip = require("adm-zip");
const Downloader = require("nodejs-file-downloader");
const launcher = new Client();
const path = require('path');
const msmc = require("msmc");
const fetch = require('node-fetch');


function saveID(launcherPath, email) {
    if (fs.existsSync(launcherPath + 'infos.json')) {

        let rawdata = fs.readFileSync(launcherPath + 'infos.json')

        let student = JSON.parse(rawdata);

        if (student.infos[0].email === email) {
            return false
        } else {
            student.infos.push({
                email: data
            })
            let json = JSON.stringify(student)
            fs.writeFileSync(launcherPath + 'infos.json', json)
        }

    } else {

        let ID = {
            "infos": [{
                email: email
            }]
        }
        let datsa = JSON.stringify(ID)
        fs.writeFileSync(launcherPath + 'infos.json', datsa)

    }
}

// async function checkLauncherPaths(launcherPath, launcherModsPath, launcherJavaPath, event) {

//     if (fs.existsSync(launcherPath)) {

//         if (fs.existsSync(launcherJavaPath)) {

//             if (fs.existsSync(launcherModsPath)) {

//                 return true

//             } else {

//                 fs.mkdirSync(launcherModsPath)

//                 return true

//             }
//         } else {

//             fs.mkdirSync(launcherJavaPath)

//             if (fs.existsSync(launcherModsPath)) {

//                 return true

//             } else {

//                 fs.mkdirSync(launcherModsPath)

//                 return "Dossier crée avec succés"

//             }

//         }
//     } else {

//         fs.mkdirSync(launcherPath)

//         if (fs.existsSync(launcherJavaPath)) {

//             if (fs.existsSync(launcherModsPath)) {

//                 return true

//             } else {

//                 fs.mkdirSync(launcherModsPath)

//                 return "Dossier crée avec succés"
//             }

//         } else {

//             fs.mkdirSync(launcherJavaPath)

//             if (fs.existsSync(launcherModsPath)) {

//                 return true

//             } else {

//                 fs.mkdirSync(launcherModsPath)

//                 return "Dossier crée avec succés"

//             }

//         }
//     }
// }

async function checkForge(launcherPath, event) {

    fs.readFile(launcherPath + 'forge.jar', async (err, file) => {
        if (err) {
            const result = await downloadForge(launcherPath, event)
            if (result) {
                return true
            }
        }
    })
}

async function checkJava(launcherJavaPath, event) {
    const files = fs.readdirSync(launcherJavaPath)
    if (files.length == 0) {
        const result = await downloadJava(launcherJavaPath, event)
        if (result) {
            return true
        }
    }
}

async function checkMods(launcherPath, launcherModsPath, event) {

    let jsonMods = []
    let folderMods = []

    fs.readdirSync(launcherModsPath).forEach(file => {
        folderMods.push(file)
    })

    let modsData = fs.readFileSync(launcherPath + "modsList.json")
    let jsonData = JSON.parse(modsData)

    await jsonData.forEach(element => {
        jsonMods.push(element.name)
    });

    let difference = jsonMods.filter(x => !folderMods.includes(x));

    if (difference.length >= 1) {
        downloadMissedMods(difference, launcherModsPath, event)
    }
}

async function downloadJava(launcherJavaPath, event) {
    const downloadJava = new Downloader({
        url: "http://193.168.146.71/java.zip",
        directory: launcherJavaPath
    })

    await downloadJava.download()

    const zip = new AdmZip(launcherJavaPath + 'java.zip')

    zip.extractAllTo(launcherJavaPath, true)

    fs.unlinkSync(launcherJavaPath + 'java.zip')

    event.sender.send('message', ('Java téléchargé avec succés'))
}

async function downloadForge(launcherPath, event) {
    const downloadForge = new Downloader({
        url: "http://193.168.146.71/forge.jar",
        directory: launcherPath
    })

    await downloadForge.download()

    event.sender.send('message', ('Forge téléchargé avec succés'))
}

async function downloadMissedMods(difference, launcherModsPath, event) {
    difference.forEach(async element => {
        const downloadMissedMods = new Downloader({
            url: "http://193.168.146.71/mods/" + element,
            directory: launcherModsPath
        })

        await downloadMissedMods.download()
    });

    event.sender.send('message', (`${difference.length} Mods manquant téléchargés avec succés`))
}

async function downloadModsList(launcherPath) {
    const downloadModsList = new Downloader({
        url: "http://193.168.146.71/modsList.json",
        directory: launcherPath,
    });

    await downloadModsList.download()

    return "Liste des mods téléchargé avec succés"
}

function searchObj(obj, query) {

    let ramValue

    for (var key in obj) {
        var value = obj[key];

        if (typeof value === 'object') {
            searchObj(value, query);
        }

        if (value === query) {
            ramValue = value
        } else {
            ramValue = undefined
        }

    }

    return ramValue

}

async function getRam(launcherPath) {
    let ram

    fs.readFile(launcherPath + 'infos.json', (err, data) => {
        if (err) {
            ram = undefined
        }
        try {
            let student = JSON.parse(data);
            ram = searchObj(student, 'ram')
        } catch (error) {
            ram = undefined
        }
    })

    return ram
}

async function launchGameWithMS(ram, result, javaExePath, RootPath, mainWindow, event) {

    fs.unlinkSync(RootPath + 'modsList.json')
    let opts

    if (ram === undefined) {
        opts = {
            clientPackage: null,
            authorization: msmc.getMCLC().getAuth(result),
            root: RootPath,
            forge: RootPath + "forge.jar",
            javaPath: path.join(javaExePath + 'bin\\java.exe'),
            version: {
                number: "1.12.2",
                type: "release"
            },
            memory: {
                max: "6G",
                min: "4G"
            }
        }
    } else {
        opts = {
            clientPackage: null,
            authorization: msmc.getMCLC().getAuth(result),
            root: RootPath,
            forge: RootPath + "forge.jar",
            javaPath: path.join(javaExePath + 'bin\\java.exe'),
            version: {
                number: "1.12.2",
                type: "release"
            },
            memory: {
                max: ram,
                min: "4G"
            }
        }
    }

    launcher.launch(opts);

    launcher.on('progress', (e) => {
        let type = e.type
        let task = e.task
        let total = e.total
        event.sender.send('dataDownload', ({
            type,
            task,
            total
        }))
        console.log(e)
    })
    launcher.on('debug', (e) => {
        mainWindow.webContents.send('dataMc', {
            e
        })
    })
    launcher.on('data', (e) => {
        mainWindow.webContents.send('dataMcd', {
            e
        })
        console.log(e)
    })
}

module.exports = {
    checkForge,
    checkJava,
    checkMods,
    downloadForge,
    downloadJava,
    downloadMissedMods,
    downloadModsList,
    launchGameWithMS,
    getRam,
    searchObj,
    saveID
}