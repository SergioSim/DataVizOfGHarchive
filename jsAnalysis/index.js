// Used to make an ES2015+ ready environment on current browsers
require("@babel/polyfill");

// HTML Elements
const downloadProgress = document.querySelector('#downloadProgress');
const debugZone = document.querySelector('#debug');
const startButton = document.querySelector('#startAnalysis');
const dateField = document.querySelector('#dateWanted');

// UI Listeners
startButton.addEventListener('click', () => {
    const dateWanted = document.querySelector('#dateWanted').value;
    getAndDrawPRDistribution(dateWanted);
});

const acc = document.querySelectorAll(".accordion");
for(const accordion of acc){
    accordion.addEventListener('click', () => {
        accordion.classList.toggle('active');
        const panel = accordion.nextElementSibling;
        if (panel.style.display === "block") {
            panel.style.display = "none";
        } else {
            panel.style.display = "block";
        }
    })
}

// Custom helpers 
// D3 Related should be exported from that package
const { drawPie } = require('./helpers/d3.utils');
// GHArchive utils
const { eventTypes, getFromGHArchive } = require('./helpers/ghArchive.utils');
// Just a simple @override in Java, but in JS it's just a one liner :D
const download = (date) => getFromGHArchive(date, downloadProgress);

// Analysis #1 Languages distributions in Pull requests for a given date
function getAndDrawPRDistribution(date){
    if(!date){
        return;
    }

    return download(date).then((parsedObjects) => {
        // Filtering every pullRequest
        const pullRequests = parsedObjects.filter((object) => object.type === eventTypes.pullRequest);

        // Instanciate a new languages object
        const languages = [];
        // Used to know if we should increment or decrement
        const languageSet = new Set();
        // foreach pr
        pullRequests.forEach((pr) => {
            // find language
            const languageUsed = pr.payload.pull_request.base.repo.language;
            // If our set doesn't contains language
            if(!languageSet.has(languageUsed)){
                // add language
                languageSet.add(languageUsed);
                // push this language
                languages.push({language: languageUsed, count: 1});
            } else {
                // Find language in languages array
                const lang = languages.find((langage) =>  langage.language === languageUsed);
                // increment
                lang.count++;
            }
        });
        // Sort languages in ascending order
        languages.sort((a,b) => a.count - b.count);
        // draw d3 pie
        drawPie(languages);
        dateField.style.border = "";

        // @tools debug
        console.log(`Languages distribution in pull requests :`, languages);
        debugZone.style.display = "block";
        debugZone.innerHTML = JSON.stringify(languages, null, 2);
    }).catch((err) => {
        dateField.style.border = "1px solid red";
    });
}