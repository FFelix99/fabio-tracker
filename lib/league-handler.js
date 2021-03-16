// Imports
// #####################################################################################################################

const fs = require('fs')
const axios = require('axios').default

// Variablen
// #####################################################################################################################

const RIOT_API_KEY = JSON.parse(fs.readFileSync('./private/api_key.json')).key
const SUMMONER     = JSON.parse(fs.readFileSync('./private/summoner.json'))

const SUMMONER_ID = SUMMONER.id
const ACCOUNT_ID  = SUMMONER.accountId

const QUEUE_TYPE = 'RANKED_SOLO_5x5'
const MAX_LOSING_STREAK = 10

// Private Funktionen
// #####################################################################################################################

/**
 * Prüfe ob ein gegebenes Match ein win für Fabio war
 * @param {long} gameId 
 * @returns {Promise} true wenn win, false sonst
 */

let isWin = async (gameId) => {

    return new Promise((resolve, reject) => {

    let MATCH_URL = `https://euw1.api.riotgames.com/lol/match/v4/matches/${gameId}?api_key=${RIOT_API_KEY}`

    axios.get(MATCH_URL).then(response => {

        let data          = response.data
        let participants  = data.participantIdentities
        let participantId = null
        let onTeam        = null

        // Erhalte Fabios participant ID
        participants.forEach(val => {

            if (val.player.accountId == ACCOUNT_ID) {
                participantId = val.participantId 
            }

        })

        // Erhalte Fabios Team
        data.participants.forEach(val => {

            if (val.participantId == participantId) {
                onTeam = val.teamId
            }

        })

        let win = null

        // Prüfe ob er gewonnen hat
        if (onTeam == '100') {
            win = data.teams[0].win
        } else {
            win = data.teams[1].win
        }

        if (win == 'Fail') {
            resolve(false)
        }

        resolve(true)

        }).catch(err => reject(err))

    })

}

/**
 * Erhalte Fabios Match History
 * @returns {Promise} Array der Matches
 */

let getMatchHistory = () => {

    let HISTORY_URL = `https://euw1.api.riotgames.com/lol/match/v4/matchlists/by-account/${ACCOUNT_ID}?queue=420&api_key=${RIOT_API_KEY}`

    return new Promise((res, rej) => {

        axios.get(HISTORY_URL)
        .then(response => {

            let history = response.data.matches
            res(history)

        })
        .catch(err => {
            rej(err)
        })

    })

}

// Öffentliche Funktionen
// #####################################################################################################################

/**
 * Erhalte Fabios akuelles Match
 * @returns {Promise} res mit null wenn in keinem SoloQ Game, sonst mit der Game Data
 */

let getCurrentMatch = () => {

    return new Promise((res, rej) => {

        let MATCH_URL = `https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${SUMMONER_ID}?api_key=${RIOT_API_KEY}`

        axios.get(MATCH_URL)
        .then(response => {

            let data = response.data

            if (data.gameQueueConfigId == 420) {
                res(data)
            } else {
                res(null)
            }

        }).catch(err => res(null))


    })

}

exports.getCurrentMatch = getCurrentMatch

/**
 * Prüfe ob Fabio gerade auf einer Losing Streak ist
 * @returns {Promise} resolved mit der Anzahl der verlorenen Games (0 für keine)
 */

let getLosingStreak = () => {

    return new Promise(async (res, rej) => {

        let matchHistory = await getMatchHistory()
        let losingStreak;

        for (let i = 0; i < MAX_LOSING_STREAK; i++) {

            let gameId = matchHistory[i].gameId   
            let win = await isWin(gameId)

            if (win == true) {
                losingStreak = i;
                break;
            }

        }

        res(losingStreak)

    })

}

exports.getLosingStreak = getLosingStreak

/**
 * Erhalte Fabios aktuellen SoloQ Rang und seine Winrate
 * @returns {Promise} resolved mit {tier: 'GOLD', rank: 'IV', LP: 30, winrate: 55}
 */

let getRank = () => {

    let RANK_URL = `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${SUMMONER_ID}?api_key=${RIOT_API_KEY}`

    return new Promise(async (res, rej) => {

        axios.get(RANK_URL)
        .then(response => {

            let data = response.data

            data.forEach(val => {

                if (val.queueType == QUEUE_TYPE) {

                    let totalGames = val.wins + val.losses
                    let winrate = Math.floor((val.wins / totalGames) * 1000) / 10

                    let rankObj = {
                        tier: val.tier,
                        rank: val.rank,
                        LP: val.leaguePoints,
                        winrate: winrate
                    }
                    
                    res(rankObj)

                }

            })

        })

    })

}

exports.getRank = getRank