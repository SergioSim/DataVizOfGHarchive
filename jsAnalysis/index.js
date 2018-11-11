// Used to make an ES2015+ ready environment on current browsers
require("@babel/polyfill");

const commonWords = require('./helpers/commonWords').default;
const UIUtils = require('./helpers/ui.utils').default;
// HTML Elements
const downloadProgress = document.querySelector('#downloadProgress');
const debugZone = document.querySelector('#debug');

UIUtils.bindAccordions();

// Custom helpers 
// D3 Related should be exported from that package
const { drawPie } = require('./helpers/d3.utils');
// GHArchive utils
const { eventTypes, getFromGHArchive, filterDataByEvent } = require('./helpers/ghArchive.utils');
// Analysis #1 Languages distributions in Pull requests for a given date
UIUtils.makeAnalysisContainer('languageDistribution', "Langages les plus utilisés dans les pull requests à une date donnée", 
function(){
    const date = this.input.value;
    if(!date) return;

    return getFromGHArchive(date, this.progress).then((parsedObjects) => {
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
        drawPie(languages,date, this.pie, "language", "count");
        this.input.style.border = "";

        // @tools debug
        console.log(`Languages distribution in pull requests :`, languages);
        debugZone.style.display = "block";
        debugZone.innerHTML = JSON.stringify(languages, null, 2);
    }).catch((err) => {
        this.input.style.border = "1px solid red";
        throw err;
    });
});

UIUtils.makeAnalysisContainer('drawCommonWords', "Mots les plus utilisés dans les commits messages à une heure donnée", 
function(){
    const date = this.input.value;
    if(!date){
        return;
    }
    return getFromGHArchive(date, this.progress).then((events) => {
        const pushEvents = filterDataByEvent(events, eventTypes.push);

        const wordsMap = {};

        console.time();

        for(const push of pushEvents){
            const commits = push.payload.commits;
            for(const commit of commits){
                const commitMessage = commit.message;
                // Filter merge commits
                if(commitMessage && commitMessage.indexOf('Merge') == -1){
                    // Split words
                    const commitWords = commitMessage.split(' ');
                    for(const word of commitWords){
                        // to lowercase to avoid "add", "Add"
                        const lowerCased = word.toLowerCase();
                        if(lowerCased === date.substring(0, date.length-3)) continue;
                        // filter english words
                        if(commonWords.indexOf(lowerCased) !== -1) continue;
                        // filter if length 0
                        if(lowerCased.length === 0) continue;
                        // Increment or append
                        if(wordsMap[lowerCased]){
                            wordsMap[lowerCased].occurences++;
                        } else {
                            wordsMap[lowerCased] = { word: lowerCased, occurences: 1};
                        }
                    }
                }
            }
        }
        // Map -> Array
        const words = Object.keys(wordsMap).map(e => wordsMap[e]);
        // Sort in descending order
        const wordsSorted = words.sort((wordA, wordB) => wordB.occurences - wordA.occurences);
        // Take only 20
        const firstTwentyWords = wordsSorted.splice(0,20);
        drawPie(firstTwentyWords, date, this.pie, "word", "occurences");
        console.timeEnd();
        console.log(firstTwentyWords);
    }).catch((err) => {
        this.input.style.border = "1px solid red";
        throw err;
    });
});

UIUtils.bindAccordions();