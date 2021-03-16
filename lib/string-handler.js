// Imports
// #####################################################################################################################

const leagueHandler = require('./league-handler')

// Konstanten
// #####################################################################################################################

const PREFIX_STRING = '```css\n'
const SUFFIX_STRING = '\n```'

const INGAME_STRING = '[!!! Fabio spielt SoloQ !!!]'
const NOT_INGAME_STRING = 'Fabio spielt keine SoloQ'

// Private Funktionen
// #####################################################################################################################

/**
 * Erhalte den Status String ob Fabio gerade SoloQ spielt
 * @returns {String} Status String
 */

let getGameStatusString = async () => {

    try {

        let gameData = await leagueHandler.getCurrentMatch()

        if (gameData == null) {
            return NOT_INGAME_STRING
        }

        return INGAME_STRING

    } catch (e) {

        return '[FEHLER BEI DER ABFRAGE]'

    }

}

/**
 * Erhalte einen String der Fabios aktuelle SoloQ Situation darstellt
 * @returns {String} rankInfo
 */

let getRankInfoString = async () => {

    try {

        let rank = await leagueHandler.getRank()
        return `Er ist gerade #${rank.tier}.${rank.rank} mit #${rank.LP}LP \nbei einer Winrate von ${rank.winrate}%`

    } catch (e) {

        return ''

    }

}

/**
 * Erhalte einen String der Informationen über Fabios Lose / Winstreak liefert
 * @returns {String} Lose/Winstreak Info
 */

let getLosingStreakString = async () => {

    try {

        let losingStreak = await leagueHandler.getLosingStreak()

        if (losingStreak == 0) {
            return `Aktuell befindet er sich auf [keiner Losing Streak]`
        } else {
            return 'Aktuell befindet er sich auf einer [' + losingStreak + ' Games Losing Streak]'
        }

    } catch (e) {

        return ''

    }

}

// Öffentliche Funktionen
// #####################################################################################################################

/**
 * Erhalte einen für Discord formatierten String, welcher Fabios Ranked Erlebnis zusammenfasst
 * @returns {String} Info String
 */

let getInfoString = async () => {

    let completeString = PREFIX_STRING

    let gameStatusString = await getGameStatusString()
    let rankInfoString = await getRankInfoString()
    let losingStreakString = await getLosingStreakString()

    completeString += gameStatusString
    completeString += '\n\n'
    completeString += rankInfoString
    completeString += '\n\n'
    completeString += losingStreakString
    completeString += SUFFIX_STRING

    return completeString

}

exports.getInfoString = getInfoString