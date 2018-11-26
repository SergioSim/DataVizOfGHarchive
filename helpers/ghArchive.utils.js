// Used to ungz
import pako from 'pako';
// Used for easy caching in IndexedDB
import { get, set } from 'idb-keyval';
import dayjs from 'dayjs';
import { start } from 'repl';
/* 
    EventTypes doc : https://developer.github.com/v3/activity/events/types/ 
*/
export const eventTypes = {
    push: "PushEvent",
    pullRequest: "PullRequestEvent", 
    watch: "WatchEvent", 
    gollum: "GollumEvent", 
    issues: "IssuesEvent", 
    issueComment: "IssueCommentEvent", 
    fork: "ForkEvent", 
    create: "CreateEvent", 
    delete: "DeleteEvent", 
    release: "ReleaseEvent", 
    pullRequestReviewComment: "PullRequestReviewCommentEvent", 
    member: "MemberEvent", 
    commitComment: "CommitCommentEvent", 
    public: "PublicEvent"
};

export function buildEvents(objects){
    // Using a set to avoid duplicates
    const types = new Set();
    objects.forEach((object) => {
        types.add(object.type);
    })
    return types;
}

/**
 * Retrieve data from GHArchive (using Cors anywhere to avoid cors issues)
 * Uncompress gz with Pako (only lib who can ungz in Browser)
 * return a PROMISE (see usage below)
 *
 * @param {string} date (2015-01-01-15) (year-month-day-hour)
 * @param {Progress} progress 
 * @returns promise who contains parsed data
 */
export async function getFromGHArchive(date, progress) {
    const cached = await get(date);
    if(cached){
        console.log('retrieved from cache');
        return cached;
    }

    return new Promise((resolve, reject) => {
        console.log("Starting download from GHArchive for date", date);
        progress.show();

        const ghArchiveURL = `https://cors-anywhere.herokuapp.com/http://data.gharchive.org/${date}.json.gz`;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', ghArchiveURL, true);
        xhr.responseType = 'arraybuffer';
        xhr.onprogress = (e) => {
            if (e.lengthComputable) {
                progress.total(e.total);
                progress.add(e.loaded);
            }
        }
        const onError = function () {
            progress.hide();
            reject();
        };
        
        xhr.onerror = onError;

        xhr.onload = (e) => {
            if (xhr.status == 200) {
                const parsed = parseGithubData(xhr);

                return cacheData(date, parsed, progress, resolve)
                                .catch((err) => {
                                    console.warn("error while saving in cache", err);

                                    onError();
                                });
            } else {
                onError()
                reject();
            }
        };
        
        xhr.send(null);
    });
}

/**
 *
 *
 * @export
 * @param {*} startDate
 * @param {*} endDate
 * @param {*} progress
 * @returns
 */
export async function getPeriodFromGH(startDate, endDate, progress){
    // Split date
    const splittedDate = startDate.split('-');
    // Compute "year-month"
    const yearMonth = splittedDate[0] + '-' + splittedDate[1];
    // Compute "day"
    const startDay = splittedDate[2];

    // Define a new array of a length who equals numberOfHours (to iterate easily)
    const hours = new Array(23);
    
    // Compute user-provided dates using dayjs
    startDate = dayjs(startDate);
    endDate = dayjs(endDate);

    const diff = Math.floor(endDate.diff(startDate, 'day', true));

    /*
    * We use IndexedDB to cache ungzified files from GHArchive
    * As a result, we need to forbid a too big download from the user (to prevent him from himself), 
    * also avoid a browser crash (due to memory issue)
    */
    if(diff >= 31){
        // TODO XXX : Refer to loaded data by Sergio?
        window.alert('You don\'t want to launch this kind of request in a browser');
        return;
    }

    const days = new Array(diff);

    const fullData = {};
    for(let v = 0; v < days.length; v++){
        for(let i = 0; i < hours.length; i++){
            let currentDay = parseInt(startDay) + v;
            if(v < 9){
                currentDay = "0"+(parseInt(startDay)+v);
            }
            try {
                const parsed = await getFromGHArchive(yearMonth + `-${currentDay}-${i}`, progress);
                fullData[`${yearMonth}-${currentDay}-${i}`] = {data: parsed}
            } catch(err){
                console.log(err);
                console.warn('Error while downloading, file not found?', yearMonth, currentDay, i);
                continue;
            }
        }
    }

    return fullData;
}

function cacheData(date, parsed, progress, resolve) {
    return set(date, parsed)
        .then(() => {
            console.log(`Inserted parsed events into IndexedDB for ${date}`);
            progress.hide();
            resolve(parsed);
        });
}

function parseGithubData(xhr) {
    const data = pako.inflate(new Uint8Array(xhr.response), { to: 'string' });
    const objects = data.split('\n');
    const parsed = [];
    for (const githubEvent of objects) {
        try {
            const json = JSON.parse(githubEvent);
            parsed.push(json);
        }
        catch (err) {
            // console.log('invalid object', err, githubEvent);
        }
    }
    return parsed;
}

export function filterDataByEvent(data, eventType){
    return data.filter((object) => object.type === eventType);
}

/**
 * Retrieve data from Our Server
 * Uncompress gz with Pako (only lib who can ungz in Browser)
 * return a PROMISE (see usage below)
 *
 * @param {string} date (2016) (year) or in future year-month-day
 * @param {Progress} progress 
 * @returns promise who contains parsed data
 */
export async function getPreparedData(date, progress) {
    return new Promise((resolve, reject) => {
        // TODO add date handling for 2015:2017
        console.log("Starting download from our Server for date ", date);
        const serverURL = `https://cors-anywhere.herokuapp.com/http://82.255.166.104/tendance`+date+`.json.gz`;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', serverURL, true);
        xhr.responseType = 'arraybuffer';
        const onError = function () {
            reject();
        };
        xhr.onerror = onError;
        xhr.onload = (e) => {
            if (xhr.status == 200) {
                const parsed = parseGithubData(xhr);

                return cacheData(date, parsed, progress, resolve)
                                .catch((err) => {
                                    console.warn("error while saving in cache", err);

                                    onError();
                                });
            } else {
                onError()
                reject();
            }
        };
        xhr.send(null);
    });
}