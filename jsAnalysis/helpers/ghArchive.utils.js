// Used to ungz
const pako = require('pako');
// Used for easy caching in IndexedDB
const { get, set } = require('idb-keyval');

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
 * @param {*} date (2015-01-01-15) (year-month-day-hour)
 * @returns promise who contains parsed data
 */
export async function getFromGHArchive(date) {
    const cached = await get(date);
    if(cached){
        console.log('retrieved from cache');
        return cached;
    }

    return new Promise((resolve, reject) => {
        console.log("Starting download from GHArchive for date", date);
        this.style.display = 'block';

        const ghArchiveURL = `https://cors-anywhere.herokuapp.com/http://data.gharchive.org/${date}.json.gz`;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', ghArchiveURL, true);
        xhr.responseType = 'arraybuffer';
        xhr.onprogress = (e) => {
            if (e.lengthComputable) {
                this.max = e.total;
                this.value = e.loaded;
            }
        }
        xhr.onload = (e) => {
            if (xhr.status == 200) {
                const data=pako.inflate(new Uint8Array(xhr.response),{to:'string'});
                const objects = data.split('\n');
                const parsed = [];
                for(const githubEvent of objects){
                    try {
                        const json = JSON.parse(githubEvent);
                        parsed.push(json);
                    } catch(err){
                        // console.log('invalid object', err, githubEvent);
                    }
                }


                return set(date, parsed)
                        .then(() => {
                            console.log(`Inserted parsed events into IndexedDB for ${date}`)
                            this.style.display = 'none';
                            resolve(parsed);
                        }).catch((err) => {console.log("error while saving in cache", err)});
            } else {
                reject();
            }
        };

        xhr.send(null);
    });
}