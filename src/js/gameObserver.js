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

export { observeQueue };
