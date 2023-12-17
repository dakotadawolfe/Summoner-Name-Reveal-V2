// Importing other modules
import { create } from './api.js';
import { romanToNumber } from './utils.js';

/**
 * Fetches ranked stats for a given player ID (PUUID).
 * @param {string} puuid - Player's unique identifier.
 * @returns {Object|null} - The ranked stats of the player or null in case of an error.
 */
async function fetchRankedStats(puuid) {
    const url = `/lol-ranked/v1/ranked-stats/${puuid}`;
    try {
        return await create('GET', url);
    } catch (error) {
        console.error('Error fetching ranked stats for puuid:', puuid, error);
        return null;
    }
}

/**
 * Retrieves ranked stats for multiple player IDs.
 * @param {Array<string>} puuidArray - Array of player IDs.
 * @returns {Array<Object>} - Array of ranked stats for each player.
 */
async function getRankedStatsForPuuids(puuidArray) {
    try {
        const rankedStatsArray = await Promise.all(puuidArray.map(fetchRankedStats));
        return rankedStatsArray.map(extractSimplifiedStats);
    } catch (error) {
        console.error('Error fetching ranked stats for multiple PUUIDs:', error);
        return [];
    }
}

/**
 * Extracts and simplifies ranked stats for a player.
 * @param {Object} stats - The ranked stats object for a player.
 * @returns {string} - Simplified representation of the player's ranked stats.
 */
function extractSimplifiedStats(stats) {
    if (!stats || !stats.queueMap) return "Unranked";

    const soloQueueStats = stats.queueMap["RANKED_SOLO_5x5"];
    const flexQueueStats = stats.queueMap["RANKED_FLEX_SR"];

    return determineRank(soloQueueStats, flexQueueStats);
}

/**
 * Determines a player's rank based on solo and flex queue stats.
 * @param {Object} soloQueueStats - Solo queue statistics.
 * @param {Object} flexQueueStats - Flex queue statistics.
 * @returns {string} - The determined rank of the player.
 */
function determineRank(soloQueueStats, flexQueueStats) {
    if (isValidRank(soloQueueStats)) {
        return formatRank(soloQueueStats);
    } else if (isValidRank(flexQueueStats)) {
        return formatRank(flexQueueStats);
    } else {
        return "Unranked";
    }
}

/**
 * Checks if the given queue stats represent a valid rank.
 * @param {Object} queueStats - Queue statistics.
 * @returns {boolean} - True if the rank is valid, false otherwise.
 */
function isValidRank(queueStats) {
    return queueStats && queueStats.tier && queueStats.division &&
           queueStats.tier !== "NA" && !queueStats.isProvisional;
}

/**
 * Formats the rank information from queue stats.
 * @param {Object} queueStats - Queue statistics.
 * @returns {string} - Formatted rank string.
 */
function formatRank(queueStats) {
    if (["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND"].includes(queueStats.tier)) {
        return `${queueStats.tier[0]}${romanToNumber(queueStats.division)}`;
    }
    return queueStats.tier;
}

export { fetchRankedStats, getRankedStatsForPuuids };
