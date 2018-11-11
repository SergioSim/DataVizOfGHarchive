// Used to make an ES2015+ ready environment on current browsers
require("@babel/polyfill");

const commonWords = require('./helpers/commonWords');

// HTML Elements
const downloadProgress = document.querySelector('#downloadProgress');
const debugZone = document.querySelector('#debug');
// TODO XXX : Cleanup this mess (blurp)
const startButton = document.querySelector('#startAnalysis');
const startButton2 = document.querySelector('#startAnalysis2');
const dateField = document.querySelector('#dateWanted');

// UI Listeners
startButton.addEventListener('click', () => {
    const dateWanted = document.querySelector('#dateWanted').value;
    getAndDrawPRDistribution(dateWanted);
});

startButton2.addEventListener('click', () => {
    const dateWanted = document.querySelector('#dateWanted2').value;
    getAndDrawCommonWords(dateWanted);
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
const { eventTypes, getFromGHArchive, filterDataByEvent } = require('./helpers/ghArchive.utils');
// Just a simple @override in Java, but in JS it's just a one liner :D
const download = (date) => getFromGHArchive(date, downloadProgress);

// Analysis #1 Languages distributions in Pull requests for a given date
function getAndDrawPRDistribution(date){
    if(!date){
        return;
    }

    return download(date).then((parsedObjects) => {
        // Filtering every pullRequest
        const pullRequests = filterDataByEvent(parsedObjects, eventTypes.pullRequest);

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
        drawPie(languages,date,"#pie_chart", "language", "count");
        dateField.style.border = "";

        // @tools debug
        console.log(`Languages distribution in pull requests :`, languages);
        debugZone.style.display = "block";
        debugZone.innerHTML = JSON.stringify(languages, null, 2);
    }).catch((err) => {
        dateField.style.border = "1px solid red";
    });
}

function getAndDrawCommonWords(date){
    const commonEnglishWords = commonWords.default;
    return download(date).then((events) => {
        /*
        David refactor :

        Je ferais une Map de word vers count, 
        pour chaque commit message 
        tu le sépares en words 
        et tu incrémentes le count associé.
        Enfin tu tries la map par count. 
        */
        const pushEvents = filterDataByEvent(events, eventTypes.push);

        const wordsMap = {};

        for(const push of pushEvents){
            const commits = push.payload.commits;
            for(const commit of commits){
                const commitMessage = commit.message;
                if(commitMessage && commitMessage.indexOf('Merge') == -1){
                    const commitWords = commitMessage.split(' ');
                    for(const word of commitWords){
                        const lowerCased = word.toLowerCase();
                        if(lowerCased.length === 0) continue;
                        if(wordsMap[lowerCased]){
                            wordsMap[lowerCased].occurences++;
                        } else {
                            wordsMap[lowerCased] = { word: lowerCased, occurences: 1};
                        }
                    }
                }
            }
        }
        const words = Object.keys(wordsMap).map(e => wordsMap[e]);
        const wordsSorted = words.sort((wordA, wordB) => wordB.occurences - wordA.occurences)
                            .filter((word) => commonEnglishWords.indexOf(word) == -1);// filter english words
        console.log(wordsSorted);
        /* 
        const occurencesSorted = occurencesArr.sort((occA, occB) => occB.occurences - occA.occurences);
        const firstTwentyWords = occurencesSorted.splice(0, 20);
        drawPie(firstTwentyWords, date, "#pie_chartCommonWords", "word", "occurences");
        console.log(firstTwentyWords);*/
    });
}