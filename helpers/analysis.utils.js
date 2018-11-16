import { 
    eventTypes, 
    getFromGHArchive, 
    filterDataByEvent
} from '../helpers/ghArchive.utils';
// Common english words (to be continued..)
import commonWords from '../helpers/commonWords';

export function meanIssue(values) {
    let total = 0, i;
    for (i = 0; i < values.length; i += 1) {
        total += values[i];
    }
    return total / values.length;
};

export function parsePullRequestsLanguages(pullRequests, progress) {
    const languages = [];
    // Used to know if we should increment or decrement
    const languageSet = new Set();
    // foreach pr
    pullRequests.forEach((pr) => {
        // find language
        const languageUsed = pr.payload.pull_request.base.repo.language;
        const repoTitle = pr.payload.pull_request.base.repo.name;
        const repoSize = pr.payload.pull_request.base.repo.size;
        // If our set doesn't contains language
        if (!languageSet.has(languageUsed)) {
            // add language
            languageSet.add(languageUsed);
            // push this language
            languages.push({ language: languageUsed, count: 1, repoTitles: [repoTitle], repoSizes: [repoSize] });
        }
        else {
            // Find language in languages array
            const lang = languages.find((langage) => langage.language === languageUsed);
            // increment
            lang.count++;
            lang.repoSizes.push(repoSize);
            lang.repoTitles.push(repoTitle);
        }
        progress.add(1);
    });
    // Sort languages in ascending order
    languages.sort((a, b) => a.count - b.count);
    return languages;
}

export async function parseCommonWordsInCommits(date, count, progress){
    const events = await getFromGHArchive(date, progress);
    const pushEvents = filterDataByEvent(events, eventTypes.push);
    progress.total(pushEvents.length);
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
                    if(!commitWords[i+1]){
                        break;
                    }
                    const cleanRegex = /[^A-Za-z]+/g;
                    const wordA = word.toLowerCase().trim().replace(cleanRegex, "");;
                    const wordB = commitWords[i + 1].toLowerCase().trim().replace(cleanRegex, "");;
                    const isTherePairOfWord = 
                        wordA !== undefined 
                        && wordB !== undefined;

                    if(wordA.length < 3){
                        continue;
                    }
                    if(commonWords.indexOf(wordA) !== -1) {
                        // debugger;
                        continue;
                    } 
                    if (!isTherePairOfWord)
                        continue;
                    // to lowercase to avoid "add", "Add"
                    const wordPair = wordA + " " + wordB;
                    // filter if length 0 for one of word
                    if (wordPair.split(' ').length === 1)
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
                progress.add(1);
            }
        }
    }
    // Map -> Array
    const words = Object.keys(wordsMap).map(e => wordsMap[e]);
    // Sort in descending order
    const wordsSorted = words.sort((wordA, wordB) => wordB.occurences - wordA.occurences);
    // Take only count
    const part = wordsSorted.splice(0, count);
    console.log({
        context: 'textClassification',
        samples: words.length,
        classes: 'commits words'
    });
    return part;
}

export function convertMS( milliseconds ) {
    let day, hour, minute, seconds;

    seconds = Math.floor(milliseconds / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;

    return {
        day: day,
        hour: hour,
        minute: minute,
        seconds: seconds
    };
}