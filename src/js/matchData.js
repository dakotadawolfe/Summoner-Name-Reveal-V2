// Importing other modules
import { create } from './api.js';

/**
 * Queries match data for a given player ID (PUUID).
 * @param {string} puuid - Player's unique identifier.
 * @param {number} begIndex - Beginning index for match history query.
 * @param {number} endIndex - Ending index for match history query.
 * @returns {Object|boolean} - Match data object or false if not found.
 */
async function queryMatch(puuid, begIndex = 0, endIndex = 19) {
    try {
        const endpoint = `/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=${begIndex}&endIndex=${endIndex}`;
        const result = await create('GET', endpoint);
        const matchList = result.games.games; // Update this line
        return Array.isArray(matchList) ? extractMatchData(matchList) : false;
    } catch (error) {
        console.error('Error querying match for puuid:', puuid, error);
        return false;
    }
}

/**
 * Extracts and structures match data from the raw match list.
 * @param {Array} matchList - Raw match list data.
 * @returns {Object} - Structured match data.
 */
function extractMatchData(matchList) {
    const data = {
        gameMode: [],
        championId: [],
        killList: [],
        deathsList: [],
        assistsList: [],
        Minions: [],
        gold: [],
        winList: [],
        causedEarlySurrenderList: [],
        laneList: [],
        spell1Id: [],
        spell2Id: [],
        items: [],
        types: []
    };

    matchList.forEach(match => {
        const participant = match.participants[0];
        data.gameMode.push(match.queueId);
        data.championId.push(participant.championId);
        data.killList.push(participant.stats.kills);
        data.deathsList.push(participant.stats.deaths);
        data.assistsList.push(participant.stats.assists);
        data.Minions.push(participant.stats.neutralMinionsKilled + participant.stats.totalMinionsKilled);
        data.gold.push(participant.stats.goldEarned);
        data.winList.push(participant.stats.win ? "true" : "false");
        data.causedEarlySurrenderList.push(participant.stats.causedEarlySurrender);
        data.laneList.push(participant.timeline.lane);
        data.spell1Id.push(participant.spell1Id);
        data.spell2Id.push(participant.spell2Id);

        const tmp_items = [];
        for (let i = 0; i < 7; i++) {
            const itemKey = 'item' + i;
            const itemValue = participant.stats[itemKey];
            tmp_items.push(itemValue);
        }
        data.items.push(tmp_items);
        data.types.push(match.gameType);
    });

    return data;
}

/**
 * Retrieves match data for multiple player IDs.
 * @param {Array<string>} puuidArray - Array of player IDs.
 * @returns {Array<Object>} - Array of match data for each player.
 */
export async function getMatchDataForPuuids(puuidArray) {
    try {
        const promises = puuidArray.map(puuid => queryMatch(puuid, 0, 21));
        return await Promise.all(promises);
    } catch (error) {
        console.error('Error fetching match data for multiple PUUIDs:', error);
        return [];
    }
}
