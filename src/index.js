/**
 * Sets up a WebSocket connection to observe the game queue.
 * @param {function} callback - Callback function to handle incoming WebSocket messages.
 */
async function observeQueue(callback) {
    try {
        const ws = initializeWebSocket();

        ws.onopen = () => subscribeToGameFlow(ws);
        ws.onmessage = callback;
        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };
    } catch (error) {
        console.error('Error observing game queue:', error);
    }
}

/**
 * Initializes and returns a WebSocket connection.
 * @returns {WebSocket} - Initialized WebSocket connection.
 */
function initializeWebSocket() {
    const uri = getWebSocketURI();
    return new WebSocket(uri, 'wamp');
}

/**
 * Retrieves the URI for the WebSocket connection from the document.
 * @returns {string} - The URI for the WebSocket connection.
 */
function getWebSocketURI() {
    const linkElement = document.querySelector('link[rel="riot:plugins:websocket"]');
    if (!linkElement) {
        throw new Error('WebSocket link element not found');
    }
    return linkElement.href;
}

/**
 * Subscribes to the game flow phase using the provided WebSocket connection.
 * @param {WebSocket} ws - The WebSocket connection.
 */
function subscribeToGameFlow(ws) {
    const endpoint = "/lol-gameflow/v1/gameflow-phase".replaceAll("/", "_");
    ws.send(JSON.stringify([5, 'OnJsonApiEvent' + endpoint]));
}




/**
 * Delays execution for a specified number of milliseconds.
 * @param {number} t - Time in milliseconds to delay.
 * @returns {Promise} - A promise that resolves after the delay.
 */
const delay = (t) => new Promise((resolve) => setTimeout(resolve, t));

/**
 * Converts a Roman numeral string to its equivalent number.
 * @param {string} roman - Roman numeral string.
 * @returns {number} - Equivalent number.
 */
function romanToNumber(roman) {
    const romanNumerals = {
        I: 1,
        V: 5,
        X: 10,
        L: 50,
        C: 100,
        D: 500,
        M: 1000
    };
    let number = 0;
    let prevValue = 0;

    for (let i = roman.length - 1; i >= 0; i--) {
        const currentValue = romanNumerals[roman[i]];
        number += currentValue < prevValue ? -currentValue : currentValue;
        prevValue = currentValue;
    }

    return number;
}

/**
 * Sums the elements of an array.
 * @param {Array<number>} array - Array of numbers to sum.
 * @returns {number} - Sum of the array elements.
 */
function sumArrayElements(array) {
    if (!Array.isArray(array)) {
        console.error('Expected an array, received:', array);
        return 0; // or other appropriate default value
    }
    return array.reduce((sum, num) => sum + num, 0);
}

function createPopup() {
    const sidebarHtml = `
        <div id="infoSidebar" style="z-index: 9999; position: fixed; top: 0; left: 0; width: 282px; height: 100%; background-color: #1e2328; padding: 20px; border-right: 1px solid #C8A660; box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2); color: white; display: none; overflow-y: auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <div id="sidebarContent">Loading... <br> This may take a few seconds.</div>
        </div>
        <button id="toggleButton" style="position: fixed; top: 625px; left: 325px;
	color: #cdbe91;
    font-size: var(--font-size, 14px);
    font-family: var(--font-family, var(--font-display));
    font-weight: bold;
    letter-spacing: 1px;
    align-items: center;
    box-sizing: border-box;
    justify-content: center;
    white-space: nowrap;
    padding: 5px 1.3em;
    height: var(--flat-button-height);
    width: var(--flat-button-width);
    min-height: var(--flat-button-min-height);
    cursor: pointer;
    -webkit-user-select: none;
    box-shadow: 0 0 1px 1px #010a13, inset 0 0 1px 1px #010a13;
    background: #1e2328;
    background-image: initial;
    background-position-x: initial;
    background-position-y: initial;
    background-size: initial;
    background-repeat-x: initial;
    background-repeat-y: initial;
    background-attachment: initial;
    background-origin: initial;
    background-clip: initial;
    background-color: rgb(30, 35, 40);
    border: 1px solid #C8A660;">Summoner Name Reveal V2</button>
    `;

    document.body.insertAdjacentHTML('beforeend', sidebarHtml);

    // Add event listener to the toggle button
    document.getElementById('toggleButton').addEventListener('click', toggleSidebar);
}




function populateContent(content, linkHTML, iframeDocument) {
    const result = `<p style="font-size: 12px">${content.join('<br>')}</p>`;
    const extra = `<p style="font-size: 10px">This is a beta overlay, if you would like to configure certain options, this is now possible. Please visit <a href="https://github.com/dakota1337x/Summoner-Name-Reveal-V2" target="_blank" style="color: gold;">here</a> to find out more information.</p>`;
    document.getElementById('sidebarContent').innerHTML = result + linkHTML + extra; // Update content display
}


window.toggleSidebar = function() {
    const sidebar = document.getElementById('infoSidebar');
    sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
};


function removeSidebar() {
    const sidebar = document.getElementById('infoSidebar');
    const toggleButton = document.getElementById('toggleButton');
    if (sidebar) {
        sidebar.remove();
    }
    if (toggleButton) {
        toggleButton.remove();
    }
}

// Importing other modules

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
async function getMatchDataForPuuids(puuidArray) {
    try {
        const promises = puuidArray.map(puuid => queryMatch(puuid, 0, 21));
        return await Promise.all(promises);
    } catch (error) {
        console.error('Error fetching match data for multiple PUUIDs:', error);
        return [];
    }
}




// Importing other modules

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




// Importing other modules

/**
 * Retrieves information about the champion select chat.
 * @returns {Object|null} - The chat information object or null if not found.
 */
async function getChampionSelectChatInfo() {
    try {
        const teamChatInfo = await create('GET', '/lol-chat/v1/conversations');
        return teamChatInfo ? teamChatInfo.find(item => item.type === 'championSelect') : null;
    } catch (error) {
        console.error('Error fetching champion select chat info:', error);
        return null;
    }
}

/**
 * Posts a message to a specified chat.
 * @param {string} chatId - The ID of the chat.
 * @param {string} message - The message to be posted.
 */
async function postMessageToChat(chatId, message) {
    try {
        const action = {
            body: message,
            type: "celebration"
        };
        await create('POST', `/lol-chat/v1/conversations/${chatId}/messages`, action);
    } catch (error) {
        console.error(`Error posting message to chat ${chatId}:`, error);
    }
}

/**
 * Retrieves messages from a specified chat.
 * @param {string} chatId - The ID of the chat.
 */
async function getMessageFromChat(chatId) {
    try {
        await create('GET', `/lol-chat/v1/conversations/${chatId}/messages`);
    } catch (error) {
        console.error(`Error getting messages from chat ${chatId}:`, error);
    }
}




// Importing other modules

// Handles the Champion Select phase in the game lobby
async function handleChampionSelect() {
    try {

        let configfile;
        try {
            const pluginName = getScriptPath()?.match(/\/([^/]+)\/index\.js$/)?.[1]
            console.log(pluginName)
            const response = await fetch(`https://plugins/${decodeURI(pluginName)}/config.json`)
            configfile = await response.json()
            console.log(configfile);
        } catch {
            configfile = {
                textchat: true,
                popup: true,
            };

        }


        if (configfile.popup) {
            createPopup();
        }

        await delay(8000); // Delay for synchronization
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
        const displayData2 = lobby.map((player, index) => formatPlayerData2(player, ranks[index], matchData[index]));

        const iframe = document.getElementById('embedded-messages-frame');
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;




        if (configfile.textchat) {
            for (const data of displayData) {
                await postMessageToChat(chatInfo.id, data);
            }
        }

        const urlnames = lobby.map(player => encodeURIComponent(`${player.game_name}#${player.game_tag}`)).join('%2C');
        const urlnames2 = lobby.map(player => encodeURIComponent(`${player.game_name}#${player.game_tag}`)).join(',');
        const opggLink = `https://www.op.gg/multisearch/${region}?summoners=${urlnames}`;
        const poroLink = `https://porofessor.gg/pregame/${region}/${urlnames2}`;
        const linkHTML = `<p style ="font-size: 12px" display: "inline"><a href="${opggLink}" target="_blank" style="color: gold;">View on OP.GG</a><br><a href="${poroLink}" target="_blank" style="color: gold;">View on Porofessor.gg</a></p>`;

        if (configfile.popup) {
            populateContent(displayData2, linkHTML, iframeDocument);
        }


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

function formatPlayerData2(player, rank, matchData) {
    const winRates = calculateWinRate(matchData.winList);
    const mostCommonRoles = mostCommonRole(matchData.laneList);
    const kdaRatios = calculateKDA(matchData.killList, matchData.assistsList, matchData.deathsList);

    return `${player.game_name} #${player.game_tag} - ${rank} - ${winRates} - ${mostCommonRoles} - ${kdaRatios}`;
}

// Updates the lobby state based on the current game phase
async function updateLobbyState(message) {
    try {
        const data = JSON.parse(message.data);
        if (data[2].data === "ChampSelect") {
            await handleChampionSelect();
        } else {
            removeSidebar();
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
    return `${Math.round(winRate)}%`;
}

// Determines the most common role from match data
function mostCommonRole(rolesList) {
    if (!rolesList) return "N/A";


    const roleCounts = rolesList.reduce((acc, role) => {
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});

    let maxCount = 0,
        mostCommonRoles = [];
    for (const role in roleCounts) {
        if (roleCounts[role] > maxCount) {
            mostCommonRoles = [role];
            maxCount = roleCounts[role];
        } else if (roleCounts[role] === maxCount) {
            mostCommonRoles.push(role);
        }
    }
    if (mostCommonRoles == "NA" || mostCommonRoles == "NONE" || mostCommonRoles == "") {
        return "N/A";
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




// Common headers for API requests
const API_HEADERS = {
    "accept": "application/json",
    "content-type": "application/json",
};

/**
 * Performs an API request using the Fetch API.
 * @param {string} method - The HTTP method (GET, POST, PUT, DELETE, etc.).
 * @param {string} endpoint - The API endpoint URL.
 * @param {Object} [action] - Optional payload for the request.
 * @returns {Object|null} - The JSON response from the API or null in case of an error.
 */
async function create(method, endpoint, action) {
    const initialize = {
        method: method,
        headers: API_HEADERS,
        ...action ? {
            body: JSON.stringify(action)
        } : undefined
    };

    try {
        const request = await fetch(endpoint, initialize);
        if (!request.ok) {
            throw new Error(`HTTP error! status: ${request.status}`);
        }
        return await request.json();
    } catch (error) {
        console.error(`Error in create function for ${method} ${endpoint}: ${error}`);
        return null;
    }
}




// Importing other modules

/**
 * Initializes the application.
 * Sets up the necessary observers and handlers to manage the application state.
 */
async function initializeApp() {
    try {
        // Observes game queue and updates the lobby state accordingly.
        await observeQueue(updateLobbyState);
    } catch (error) {
        // Logs any errors that occur during initialization.
        console.error('Error initializing application:', error);
    }
}

// Ensures that the app initialization starts only after the window is fully loaded.
window.addEventListener('load', initializeApp);