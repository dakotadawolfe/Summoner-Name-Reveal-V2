const delay = (t) => new Promise((r) => setTimeout(r, t));

async function create(method, endpoint, action) {
    const initialize = {
        method: method,
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
        },
        ...action ? { body: JSON.stringify(action) } : undefined  
    };

    const request = await fetch(endpoint, initialize);
    const response = await request.json();

    return response;
}

async function queryMatch(puuid, begIndex, endIndex) {
        if (typeof begIndex !== 'number' || isNaN(begIndex)) {
            begIndex = 0;
        }
        if (typeof endIndex !== 'number' || isNaN(endIndex)) {
            endIndex = 5;
        }
        const result = await fetch(
            '/lol-match-history/v1/products/lol/' +
            puuid.toString() +
            '/matches?begIndex=' +
            begIndex.toString() +
            '&endIndex=' +
            endIndex.toString()
        ).then((res) => res.json());
        const matchList = await result.games;
        const gameMode = [];
        const championIds = [];
        const killList = [];
        const deathsList = [];
        const assistsList = [];
        const Minions = [];
        const gold = [];
        const winList = [];
        const causedEarlySurrenderList = [];
        const laneList = [];
        const spell1Id = [];
        const spell2Id = [];
        const items = [];
        const types = [];
        if (matchList === undefined) {
            return false;
        }
        const MList = Object.values(matchList);
        for (let item of MList[5]) {
            gameMode.push(item.queueId);
            championIds.push(item.participants[0].championId);
            killList.push(item.participants[0].stats.kills);
            deathsList.push(item.participants[0].stats.deaths);
            assistsList.push(item.participants[0].stats.assists);
            Minions.push(item.participants[0].stats.neutralMinionsKilled + item.participants[0].stats.totalMinionsKilled);
            gold.push(item.participants[0].stats.goldEarned);
            winList.push(item.participants[0].stats.win);
            causedEarlySurrenderList.push(item.participants[0].stats.causedEarlySurrender);
            laneList.push(item.participants[0].timeline.lane);
            spell1Id.push(item.participants[0].spell1Id);
            spell2Id.push(item.participants[0].spell2Id);
            const tmp_items = [];
            for (let i = 0; i < 7; i++) {
                const itemKey = 'item' + i;
                const itemValue = item.participants[0].stats[itemKey];
                tmp_items.push(itemValue);
            }
            items.push(tmp_items);
            types.push(item.gameType);
        };
        return {
            gameMode: gameMode,
            championId: championIds,
            killList: killList,
            deathsList: deathsList,
            assistsList: assistsList,
            Minions: Minions,
            gold: gold,
            winList: winList,
            causedEarlySurrenderList: causedEarlySurrenderList,
            laneList: laneList,
            spell1Id: spell1Id,
            spell2Id: spell2Id,
            items: items,
            types: types
        };




    }

async function getMatchDataForPuuids(puuidArray) {
    try {
        const promises = puuidArray.map(puuid => queryMatch(puuid, 0, 21));
        const matchDataArray = await Promise.all(promises);
        return matchDataArray; 
    } catch (error) {
        console.error('Error:', error);
        return []; 
    }
}

async function fetchRankedStats(puuid) {
    const url = `/lol-ranked/v1/ranked-stats/${puuid}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching ranked stats for puuid:', puuid, error);
        return null;
    }
}

async function getRankedStatsForPuuids(puuidArray) {
    function romanToNumber(roman) {
        const romanNumerals = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
        let number = 0;
        let prevValue = 0;

        for (let i = roman.length - 1; i >= 0; i--) {
            const currentValue = romanNumerals[roman[i]];

            if (currentValue < prevValue) {
                number -= currentValue;
            } else {
                number += currentValue;
            }

            prevValue = currentValue;
        }

        return number;
    }

    try {
        const promises = puuidArray.map(puuid => fetchRankedStats(puuid));
        const rankedStatsArray = await Promise.all(promises);
        console.log(rankedStatsArray);

        const simplifiedStats = rankedStatsArray.map(stats => {
            if (stats && stats.queueMap && stats.queueMap["RANKED_SOLO_5x5"]) {
                const soloQueueStats = stats.queueMap["RANKED_SOLO_5x5"];
				const fiveQueueStats = stats.queueMap["RANKED_FLEX_SR"];

              
				if (soloQueueStats.tier != "IRON" && soloQueueStats.tier != "BRONZE" && soloQueueStats.tier != "SILVER" && soloQueueStats.tier != "GOLD" && soloQueueStats.tier != "PLATINUM" && soloQueueStats.tier != "EMERALD" && soloQueueStats.tier != "DIAMOND" && soloQueueStats.tier != "NA" && soloQueueStats.tier != ""){
					return `${soloQueueStats.tier[0]}`;
				}
        

        if (soloQueueStats.isProvisional || soloQueueStats.tier == "NA" || !soloQueueStats.tier || !soloQueueStats.division) {
					
					if(fiveQueueStats.isProvisional || fiveQueueStats.tier == "NA" || !fiveQueueStats.tier || !fiveQueueStats.division){
						return "Unranked";
					}

						
						if (fiveQueueStats.tier != "IRON" && fiveQueueStats.tier != "BRONZE" && fiveQueueStats.tier != "SILVER" && fiveQueueStats.tier != "GOLD" && fiveQueueStats.tier != "PLATINUM" && fiveQueueStats.tier != "EMERALD" && fiveQueueStats.tier != "DIAMOND" && fiveQueueStats.tier != "NA" && fiveQueueStats.tier != "" ){
					return `${fiveQueueStats.tier[0]}`;
				}
				else{
					return `${fiveQueueStats.tier[0]}${romanToNumber(fiveQueueStats.division)}`;
				}

						

                   
                } 
				
				
				
				else {
                    return `${soloQueueStats.tier[0]}${romanToNumber(soloQueueStats.division)}`;
                }
            }
            return "Unranked";
        });

        return simplifiedStats;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}


async function getChampionSelectChatInfo() {
    const teamChatInfo = await create('GET', '/lol-chat/v1/conversations');
    return teamChatInfo ? teamChatInfo.find(item => item.type === 'championSelect') : null;
}
  
async function postMessageToChat(chatId, message) {
    const action = {
        body: message,
        type: "celebration"
    };
    await create('POST', `/lol-chat/v1/conversations/${chatId}/messages`, action);
}

async function getMessageFromChat(chatId, message) {
    const action = {
        body: message,
        type: "celebration"
    };
    await create('GET', `/lol-chat/v1/conversations/${chatId}/messages`, action);
}

async function observeQueue(callback) {
    const uri = document.querySelector('link[rel="riot:plugins:websocket"]').href;
    const ws = new WebSocket(uri, 'wamp');

    const endpoint = "/lol-gameflow/v1/gameflow-phase".replaceAll("/", "_");

    ws.onopen = () => ws.send(JSON.stringify([5, 'OnJsonApiEvent' + endpoint]));
    ws.onmessage = callback;
}

function calculateWinRate(winString) {
    if (!winString) return "N/A"; 

    const winArray = winString.split(',');
    if (winArray.length < 5) return "N/A"; 

    const totalGames = winArray.length;
    const winCount = winArray.filter(result => result === "true").length;

    const winRate = Math.round((winCount / totalGames) * 100); 
    return winRate + '%'; 
}

function mostCommonRole(rolesString) {
    if (!rolesString) return "N/A";

    const rolesArray = rolesString.split(',');
    const roleCounts = {};

    
    rolesArray.forEach(role => {
        if (role && role !== "NONE") {
            role = role.toLowerCase();
            roleCounts[role] = (roleCounts[role] || 0) + 1;
        }
    });

    
    let maxCount = 0;
    for (const role in roleCounts) {
        if (roleCounts[role] > maxCount) {
            maxCount = roleCounts[role];
        }
    }

    
    const mostCommonRoles = [];
    for (const role in roleCounts) {
        if (roleCounts[role] === maxCount) {
            mostCommonRoles.push(role.charAt(0).toUpperCase() + role.slice(1));
        }
    }

    return mostCommonRoles.length ? mostCommonRoles.join('/') : "N/A";
}

function sumArrayElements(array) {
    return array.reduce((sum, num) => sum + num, 0);
}

function calculateKDA(killsArray, assistsArray, deathsArray) {
    return killsArray.map((kills, index) => {
        const totalKills = sumArrayElements(kills.split(',').map(Number));
        const totalAssists = sumArrayElements(assistsArray[index].split(',').map(Number));
        const totalDeaths = sumArrayElements(deathsArray[index].split(',').map(Number));

        let kda;
        if (totalDeaths === 0) {
            kda = 'PERFECT KDA'; 
        } else {
            kda = ((totalKills + totalAssists) / totalDeaths).toFixed(2);
        }

        return `${kda} KDA`;
    });
}

async function updateLobbyState(message) { 
    const data = JSON.parse(message.data);
    const phase = data[2];

    if (phase.data === "ChampSelect") {
		
        await delay(5000);
		const clientstuff = await create("GET", "/riotclient/region-locale");
		const region = clientstuff.webRegion;
		const session = await create("GET", "/lol-champ-select/v1/session");
        const gametitle = await create("GET", "/lol-gameflow/v1/session");
		const isRankedGame = gametitle.gameData.queue.isRanked;
		const chatInfo = await getChampionSelectChatInfo();
		const chat = await create('GET', `/lol-chat/v1/conversations/${chatInfo.id}/messages`);
		const participants = await create("GET", "//riotclient/chat/v5/participants");
		const lobby = participants.participants.filter(participant => participant.cid.includes('champ-select'));
		const names = lobby.map(player => `${player.game_name} #${player.game_tag}`);
		const namesonly = lobby.map(player => `${player.game_name}`);
		const puuids = lobby.map(player => `${player.puuid}`);
		const matchData = await getMatchDataForPuuids(puuids);
		const urlnames = names.map(name => encodeURIComponent(name.replace(/%20/g, '+') )).join('%2C');
		//const urlnames = names.map(name => name.replace(/ #/g, '%23').replace(/ /g, '%20').replace(/​∞​​/g, '%E2%80%8B%E2%88%9E%E2%80%8B%E2%80%8B')).join(',');
		const ranks = await getRankedStatsForPuuids(puuids);
		const matchType = matchData.map(history => `${history.gameMode}`);
		const wins = matchData.map(history => `${history.winList}`);
		const roles = matchData.map(history => `${history.laneList}`);
		const kills = matchData.map(history => `${history.killList}`);
		const assists = matchData.map(history => `${history.deathsList}`);
		const deaths = matchData.map(history => `${history.assistsList}`);


const rankedWins = wins.map((winString, index) => {
    if (!winString) return ""; 

    const winArray = winString.split(',');
    const matchTypeArray = matchType[index].split(',');
    
    return winArray
        .filter((_, winIndex) => matchTypeArray[winIndex] === "420")
        .join(',');
});



		const mostCommonRolesArray = roles.map(rolesString => mostCommonRole(rolesString));
		const winRates = wins.map(winString => calculateWinRate(winString));
		const kdaRatios = calculateKDA(kills, assists, deaths);
			

		
		
		const finalArray = names.map((name, index) => `${namesonly[index]} - ${ranks[index]} - ${winRates[index]} - ${mostCommonRolesArray[index]} - ${kdaRatios[index]}`);
		
		console.log(matchData);
		
        if (chatInfo) {
            for (const summname of finalArray) {
                const message = `${summname}`;
                await postMessageToChat(chatInfo.id, message);
            }
			const message2 = `https://www.op.gg/multisearch/${region}?summoners=${urlnames}`;
			
			await postMessageToChat(chatInfo.id, message2);
        }
		
			
    }
}

window.addEventListener('load', () => {
    observeQueue(updateLobbyState);
});
