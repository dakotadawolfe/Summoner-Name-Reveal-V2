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