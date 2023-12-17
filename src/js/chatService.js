// Importing other modules
import { create } from './api.js';

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

export { getChampionSelectChatInfo, postMessageToChat, getMessageFromChat };
