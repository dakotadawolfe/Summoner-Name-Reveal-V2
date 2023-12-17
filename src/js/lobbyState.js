// Importing other modules
import { delay, sumArrayElements } from './utils.js';
import { getRankedStatsForPuuids } from './rankedStats.js';
import { getMatchDataForPuuids } from './matchData.js';
import { getChampionSelectChatInfo, postMessageToChat } from './chatService.js';
import { create } from './api.js';

// Handles the Champion Select phase in the game lobby
async function handleChampionSelect() {
    try {
        await delay(5000); // Delay for synchronization
        const clientStuff = await create("GET", "/riotclient/region-locale");
        const region = clientStuff.webRegion;
        const chatInfo = await getChampionSelectChatInfo();

        if (!chatInfo) return;

        const participants = await create("GET", "//riotclient/chat/v5/participants");
        const lobby = participants.participants.filter(participant => participant.cid.includes('champ-select'));
        const puuids = lobby.map(player => player.puuid);

        const matchData = await getMatchDataForPuuids(puuids);
        const ranks = await getRankedStatsForPuuids(puuids);

        const displayData = lobby.map((player, index) => formatPlayerData(player, ranks[index], matchData[index]));

        for (const data of displayData) {
            await postMessageToChat(chatInfo.id, data);
        }

        const urlnames = lobby.map(player => encodeURIComponent(`${player.game_name}#${player.game_tag}`)).join('%2C');
        const opggLink = `https://www.op.gg/multisearch/${region}?summoners=${urlnames}`;
        await postMessageToChat(chatInfo.id, opggLink);

    } catch (error) {
        console.error('Error in Champion Select phase:', error);
    }
}

// Formats player data for display
function formatPlayerData(player, rank, matchData) {
    const winRates = calculateWinRate(matchData.winList);
    const mostCommonRoles = mostCommonRole(matchData.laneList);
    const kdaRatios = calculateKDA(matchData.killList, matchData.assistsList, matchData.deathsList);

    return `${player.game_name} - ${rank} - ${winRates} - ${mostCommonRoles} - ${kdaRatios}`;
}

// Updates the lobby state based on the current game phase
async function updateLobbyState(message) { 
    try {
        const data = JSON.parse(message.data);
        if (data[2].data === "ChampSelect") {
            await handleChampionSelect();
        }
        // Additional game phases can be handled here
    } catch (error) {
        console.error('Error updating lobby state:', error);
    }
}

// Calculates the win rate from match data
function calculateWinRate(winList) {
    if (!winList || winList.length === 0) return "N/A";

    const winCount = winList.filter(result => result === "true").length;
    const totalGames = winList.length;
    const winRate = (winCount / totalGames) * 100;
    return `${winRate.toFixed(2)}%`;
}

// Determines the most common role from match data
function mostCommonRole(rolesList) {
    if (!rolesList) return "N/A";
	
	
    const roleCounts = rolesList.reduce((acc, role) => {
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});

    let maxCount = 0, mostCommonRoles = [];
    for (const role in roleCounts) {
        if (roleCounts[role] > maxCount) {
            mostCommonRoles = [role];
            maxCount = roleCounts[role];
        } else if (roleCounts[role] === maxCount) {
            mostCommonRoles.push(role);
        }
    }

    return mostCommonRoles.join('/');
}

// Calculates the KDA ratio from match data
function calculateKDA(killsArray, assistsArray, deathsArray) {
    const totalKills = sumArrayElements(killsArray.map(kills => typeof kills === 'string' ? kills.split(',').map(Number) : [kills]).flat());
    const totalAssists = sumArrayElements(assistsArray.map(assists => typeof assists === 'string' ? assists.split(',').map(Number) : [assists]).flat());
    const totalDeaths = sumArrayElements(deathsArray.map(deaths => typeof deaths === 'string' ? deaths.split(',').map(Number) : [deaths]).flat());

    let kda = totalDeaths === 0 ? 'PERFECT' : ((totalKills + totalAssists) / totalDeaths).toFixed(2);
    return `${kda} KDA`;
}



export { updateLobbyState };