/**
 * Delays execution for a specified number of milliseconds.
 * @param {number} t - Time in milliseconds to delay.
 * @returns {Promise} - A promise that resolves after the delay.
 */
export const delay = (t) => new Promise((resolve) => setTimeout(resolve, t));

/**
 * Converts a Roman numeral string to its equivalent number.
 * @param {string} roman - Roman numeral string.
 * @returns {number} - Equivalent number.
 */
export function romanToNumber(roman) {
    const romanNumerals = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
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
export function sumArrayElements(array) {
    if (!Array.isArray(array)) {
        console.error('Expected an array, received:', array);
        return 0; // or other appropriate default value
    }
    return array.reduce((sum, num) => sum + num, 0);
}

export function createPopup() {
    const popupHtml = `
        <div id="namesPopup" style="position: fixed; top: 20%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; background-color: #1a1a1a; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); color: white; display: none; text-align: center; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <div id="namesContent" style="margin-bottom: 10px;">Loading...</div>
            <button style="background-color: #007bff; color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer;" onclick="document.getElementById('namesPopup').style.display='none'">Close</button>
        </div>
    `;

    const body = document.querySelector('body');
    body.insertAdjacentHTML('beforeend', popupHtml);
}

export function populateContent(content, linkHTML, iframeDocument){
	
	const result = `<p style="font-size: 14px">${content.join('<br>')}</p>`;
	const graph = `<p style display: "inline">Name - Rank - Win Rate - Roles - KDA</p>`;
	
	const beta = `<p style ="font-size: 10px" display: "inline">This is a beta overlay, click <a href="https://github.com/dakota1337x/Summoner-Name-Reveal-V2" target="_blank" style="color: gold;">here</a> to see progress.<br>If you are having trouble loading names please use the slow version on github.<br>League chat services might also be down.</p>`;
	document.getElementById('namesContent').innerHTML = graph + result + linkHTML + beta;
        document.getElementById('namesPopup').style.display = 'block';
		
		

        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            a { color: gold !important; }
            .celebration { color: white !important; }
        `;
		
		
		
		
        iframeDocument.head.appendChild(style);
}