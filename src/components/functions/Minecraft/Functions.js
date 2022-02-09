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


async function checkLauncherPaths(launcherPath, launcherJavaPath, launcherModsPath) {
    const arrayPath = [launcherPath, launcherModsPath, launcherJavaPath]

    arrayPath.forEach(element => {
        if (!fs.existsSync(element)) {
            fs.mkdirSync(element)
        } else {
            console.log('Dossier déjà existant')
        }
    })
}

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
        await downloadJava(launcherJavaPath, event)
    }
}

async function checkMods(launcherPath, launcherModsPath, event) {

    let jsonMods = []
    let folderMods = []
    let i = 0
    let state = false

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

        let numberMods = difference.length
        for await(const element of difference) {
            const downloadMissedMods = new Downloader({
                url: "http://193.168.146.71/mods/" + element,
                directory: launcherModsPath,
                maxAttempts: 3
            })

            await downloadMissedMods.download()
            i++
            event.sender.send('MissedModsDownload', {
                numberMods
            })

            if(i === numberMods){
                state = true
            }
        };

        return state

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

async function downloadModsList(launcherPath) {
    const downloadModsList = new Downloader({
        url: "http://193.168.146.71/modsList.json",
        directory: launcherPath,
    });

    await downloadModsList.download()

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

async function saveRam(ram, launcherPath) {

    if (fs.existsSync(launcherPath + 'infos.json')) {
        let rawdata = fs.readFileSync(launcherPath + 'infos.json')

        let student = JSON.parse(rawdata);

        if (student.infos[0].ram === ram) {
            return false
        } else {
            student.infos[0].ram = ram
            let json = JSON.stringify(student)
            fs.writeFileSync(launcherPath + 'infos.json', json)
        }
    } else {
        let ID = {
            "infos": [{
                ram: ram
            }]
        }
        let datsa = JSON.stringify(ID)
        fs.writeFileSync(launcherPath + 'infos.json', datsa)
    }
}

async function launchGameWithMS(result, javaExePath, RootPath, mainWindow, event) {

    console.log('test1')
    fs.unlinkSync(RootPath + 'modsList.json')
    let opts

    console.log('test2')
    fs.readFile(RootPath + 'infos.json', (err, data) => {
        if (err) {
            console.log(err)
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
            launcher.launch(opts);
        }

        let student = JSON.parse(data);
        console.log(student.infos[0].ram)

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
                max: student.infos[0].ram,
                min: "4G"
            }
        }
        launcher.launch(opts);
    })

    launcher.on('progress', (e) => {
        console.log(e)
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
        console.log(e)
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

async function launchGame(MSResult, launcherPath, launcherJavaPath, launcherModsPath, mainWindow, event) {
    await checkLauncherPaths(launcherPath, launcherJavaPath, launcherModsPath)
    await checkForge(launcherPath, event)
    await checkJava(launcherJavaPath, event)
    await checkMods(launcherPath, launcherModsPath, event).then(state => {
        if(state == true){
            launchGameWithMS(MSResult, launcherJavaPath, launcherPath, mainWindow, event)
        }
    })
}

module.exports = {
    saveRam,
    checkLauncherPaths,
    checkForge,
    checkJava,
    checkMods,
    downloadForge,
    downloadJava,
    downloadModsList,
    launchGameWithMS,
    searchObj,
    launchGame,
}