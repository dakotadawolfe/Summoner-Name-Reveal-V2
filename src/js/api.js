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
export async function create(method, endpoint, action) {
    const initialize = {
        method: method,
        headers: API_HEADERS,
        ...action ? { body: JSON.stringify(action) } : undefined  
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
