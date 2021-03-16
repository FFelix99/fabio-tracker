// Imports
// #####################################################################################################################

const discord = require('discord.js')
const fs = require('fs')

// Variablen
// #####################################################################################################################

const client = new discord.Client()

let CLIENT_TOKEN = JSON.parse(fs.readFileSync('./private/discord_client_token.json')).token

// Funktionen
// #####################################################################################################################

/**
 * Initialisiere den Bot
 * @returns {Promise} resolved wenn login Prozess fertig
 */

let initializeDiscordClient = () => {

    return new Promise((res, rej) => {
        client.login(CLIENT_TOKEN)
        client.once('ready', () => {
            res()
        })
    })

}

exports.initializeDiscordClient = initializeDiscordClient

/**
 * Sende eine Nachricht in einen spezifischen Channel
 * @param {String} msg Nachricht
 * @param {String} channelName Channel Name
 */

let sendMessage = (msg, channelName) => {

    let sendChannel = null;

    // Durchlaufe alle möglichen Text-Channel und filtere nach
    // dem Channel Name
    client.channels.cache.forEach(val => {

        if (val.name == channelName) {
            sendChannel = val;
        }

    })

    sendChannel.send(msg)

}

exports.sendMessage = sendMessage

/**
 * Führe eine Funktion für einen bestimmten Befehl aus
 * @param {string} command Befehl
 * @param {function} listener Auszuführende Funktion
 */

let onCommand = (command, listener) => {

    client.on('message', (msg) => {

        if (msg.content == command) {
            listener(msg)
        }

    })

}

exports.onCommand = onCommand