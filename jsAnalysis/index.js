// Used to make an ES2015+ ready environment on current browsers
require("@babel/polyfill");

// HTML Elements
const downloadProgress = document.querySelector('#downloadProgress');
const debugZone = document.querySelector('#debug');
const startButton = document.querySelector('#startAnalysis');
startButton.addEventListener('click', () => {
    const dateWanted = document.querySelector('#dateWanted').value;
    getAndDrawPRDistribution(dateWanted);
});

const { drawPie } = require('./helpers/d3.utils');
const { eventTypes, getFromGHArchive } = require('./helpers/ghArchive.utils');
const download = getFromGHArchive.bind(downloadProgress);

// Analysis #1 Languages distributions in Pull requests for a given date
function getAndDrawPRDistribution(date){
    if(!date){
        return;
    }

    return download(date).then((parsedObjects) => {
        // Filtering every pullRequest
        const pullRequests = parsedObjects.filter((object) => {
            return object.type === eventTypes.pullRequest
        });

        // Instanciate a new languages object
        const languages = [];
        const languageSet = new Set();
        // foreach pr
        pullRequests.forEach((pr) => {
            // find language
            const languageUsed = pr.payload.pull_request.base.repo.language;
            if(!languageSet.has(languageUsed)){
                languageSet.add(languageUsed);
                languages.push({language: languageUsed, count: 1});
            } else {
                const lang = languages.find((langage) => {
                    return langage.language === languageUsed;
                })
                lang.count++;
            }
        });
        languages.sort((a,b) => (a.count > b.count) ? 1 : ((b.count > a.count) ? -1 : 0));
        drawPie(languages);
        console.log(`Languages distribution in pull requests :`, languages);
        debugZone.style.display = "block";
        debugZone.innerHTML = JSON.stringify(languages, null, 2);
    });
}