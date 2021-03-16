// Imports
// #####################################################################################################################

const discordHandler = require('./lib/discord-handler')
const stringHandler = require('./lib/string-handler')
const leagueHandler = require('./lib/league-handler')

// Einstellungen
// #####################################################################################################################

const COOLDOWN_STRING = 'Ich bin gerade auf Cooldown (2min)'
const CHANNEL_NAME    = 'fabio-tracker'

// Variablen
// #####################################################################################################################

const ONE_MINUTE = 1000 * 60

let commandOnCooldown = false
let currentMatchId = 0

// Funktionen
// #####################################################################################################################

/**
 * Starte den Befehls Cooldown
 */

let startCooldown = () => {

    commandOnCooldown = true

    setTimeout(() => {
        commandOnCooldown = false
    }, ONE_MINUTE * 2)

}

/**
 * Frage alle 3 Minuten ab ob sich Fabio in einem neuen Spiel befindet. Falls ja soll eine Nachricht in den
 * fabio-tracker Channel gesendet werden
 * @returns null
 */

let update = async () => {

    if (commandOnCooldown) {
        return
    }

    // Prüfe ob er aktuell eine Runde SoloQ spielt
    let gameData = await leagueHandler.getCurrentMatch()

    // Falls nein beende die Funktion
    if (gameData == null) {
        console.log('Nicht ingame')
        return
    }

    // Prüfe nun ob sich die gameId im Vergleich zur vorherigen Abfrage
    // geändert hat
    if (currentMatchId != gameData.gameId) {

        currentMatchId = gameData.gameId

        console.log('Neue Runde')

        // Starte den Befehlscooldown, so kann es zu keinem Verstoß gegen das Datenlimit kommen
        startCooldown()

        // Sende den Infostring in den Channel
        let infoString = await stringHandler.getInfoString()
        discordHandler.sendMessage(infoString, CHANNEL_NAME)

    } else {
        console.log('Gleiche Runde')
    }

}

// Initialisierung
// #####################################################################################################################

discordHandler.initializeDiscordClient().then(() => {

    // Gebe den Info String aus, wenn -fabio eingegeben wird
    discordHandler.onCommand('-fabio', async (msg) => {

        // Falls sich der Befehl auf Cooldown befindet soll die Funktion
        // abgebrochen werden
        if (commandOnCooldown) {
            msg.channel.send(COOLDOWN_STRING)
            return
        }

        startCooldown()

        // Gebe den Infostring in den Channel aus
        let infoString = await stringHandler.getInfoString()
        msg.channel.send(infoString)

    })

    update()

    // Starte das Interval zur Überprüfung ob Fabio Ingame ist
    setInterval(() => {update()}, ONE_MINUTE * 3)

})
