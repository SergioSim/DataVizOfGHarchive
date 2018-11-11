// Used to make an ES2015+ ready environment on current browsers
require("@babel/polyfill");

const commonWords = require('./helpers/commonWords').default;
const UIUtils = require('./helpers/ui.utils').default;
// Custom helpers 
// D3 Related should be exported from that package
const { drawPie } = require('./helpers/d3.utils');

// HTML Elements
const debugZone = document.querySelector('#debug');
const debugProgress = document.querySelector('#debugProgress');

UIUtils.bindAccordions();

// GHArchive utils
const { eventTypes, getFromGHArchive, filterDataByEvent, getPeriodFromGH } = require('./helpers/ghArchive.utils');
// Analysis #1 Languages distributions in Pull requests for a given date
UIUtils.makeAnalysisContainer('languageDistribution', "Langages les plus utilisés dans les pull requests à une date donnée", 
    async function(){
    const date = this.input.value;
    if(!date) return;

    try {
        const parsedObjects = await getFromGHArchive(date, this.progress);
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
            if (!languageSet.has(languageUsed)) {
                // add language
                languageSet.add(languageUsed);
                // push this language
                languages.push({ language: languageUsed, count: 1 });
            }
            else {
                // Find language in languages array
                const lang = languages.find((langage) => langage.language === languageUsed);
                // increment
                lang.count++;
            }
        });
        // Sort languages in ascending order
        languages.sort((a, b) => a.count - b.count);
        // draw d3 pie
        drawPie(languages, date, this.pie, "language", "count");
        this.input.style.border = "";
        // @tools debug
        console.log(`Languages distribution in pull requests :`, languages);
        debugZone.style.display = "block";
        debugZone.innerHTML = JSON.stringify(languages, null, 2);
    }
    catch (err) {
        this.input.style.border = "1px solid red";
        throw err;
    }
});

UIUtils.makeAnalysisContainer('drawCommonWords', "Mots les plus utilisés dans les commits messages à une heure donnée", 
    async function(){
    // https://developers.google.com/machine-learning/guides/text-classification/step-2
    const date = this.input.value;
    if(!date){
        return;
    }
    try {
        const events = await getFromGHArchive(date, this.progress);
        const pushEvents = filterDataByEvent(events, eventTypes.push);
        const wordsMap = {};
        console.time();
        for (const push of pushEvents) {
            const commits = push.payload.commits;
            for (const commit of commits) {
                const commitMessage = commit.message;
                // Filter merge commits
                if (commitMessage && commitMessage.indexOf('Merge') == -1) {
                    // Split words
                    const commitWords = commitMessage.split(' ');
                    let i = 0;
                    for (const word of commitWords) {
                        const isTherePairOfWord = word !== undefined && commitWords[i + 1] !== undefined;
                        if (!isTherePairOfWord)
                            continue;
                        // to lowercase to avoid "add", "Add"
                        const wordPair = word.toLowerCase() + " " + commitWords[i + 1].toLowerCase();
                        if (wordPair === date.substring(0, date.length - 3))
                            continue;
                        // filter english words
                        if (commonWords.indexOf(wordPair) !== -1)
                            continue;
                        // filter if length 0
                        if (wordPair.length === 0)
                            continue;
                        // Increment or append
                        if (wordsMap[wordPair]) {
                            wordsMap[wordPair].occurences++;
                        }
                        else {
                            wordsMap[wordPair] = { pair: wordPair, occurences: 1 };
                        }
                    }
                    i++;
                }
            }
        }
        // Map -> Array
        const words = Object.keys(wordsMap).map(e => wordsMap[e]);
        // Sort in descending order
        const wordsSorted = words.sort((wordA, wordB) => wordB.occurences - wordA.occurences);
        // Take only 20
        const firstTwentyWords = wordsSorted.splice(0, 20);
        console.log({
            context: 'textClassification',
            samples: words.length,
            classes: 'commits words'
        });
        drawPie(firstTwentyWords, date, this.pie, "pair", "occurences");
        console.timeEnd();
        console.log(firstTwentyWords);
    }
    catch (err) {
        this.input.style.border = "1px solid red";
        throw err;
    }
});

UIUtils.bindAccordions();

// getPeriodFromGH("2018-01", 1, 10, debugProgress);