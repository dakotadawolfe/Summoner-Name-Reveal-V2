/**
 * @name {Summoner Name Reveal V2}
 * @author Dakota1337
 * @link https://github.com/dakota1337x/Summoner-Name-Reveal-V2/releases
 */


// Importing other modules
import { observeQueue } from './js/gameObserver.js';
import { updateLobbyState } from './js/lobbyState.js';

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
