require('babel-polyfill');
const d3 = require('d3');
const pako = require('pako');
const {get, set} = require('idb-keyval');

document.querySelector('#startAnalysis').addEventListener('click', () => {
    getAndDrawPRDistribution(document.querySelector('#dateWanted').value);
});

/**
 * Retrieve data from GHArchive (using Cors anywhere to avoid cors issues)
 * Uncompress gz with Pako (only lib who can ungz in Browser)
 * return a PROMISE (see usage below)
 *
 * @param {*} date (2015-01-01-15) (year-month-day-hour)
 * @returns
 */
async function getFromGHArchive(date) {
    const cached = await get(date);
    if(cached){
        console.log('retrieved from cache');
        return cached;
    }

    return new Promise((resolve, reject) => {
        console.log("Starting download from GHArchive for date", date);

        const ghArchiveURL = `https://cors-anywhere.herokuapp.com/http://data.gharchive.org/${date}.json.gz`;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', ghArchiveURL, true);
        xhr.responseType = 'arraybuffer';
        xhr.onprogress = (e) => {
            if (e.lengthComputable && (e.loaded / e.total) === 1) {
                console.log("Downloaded from GHArchive for date", date);
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
                            resolve(parsed);
                        }).catch((err) => {console.log("error while saving in cache", err)});
            } else {
                reject();
            }
        };

        xhr.send(null);
    });
}

/* 
    EventTypes doc : https://developer.github.com/v3/activity/events/types/ 
*/
const eventTypes = {
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

function buildEvents(objects){
    // Using a set to avoid duplicates
    const types = new Set();
    objects.forEach((object) => {
        types.add(object.type);
    })
    return types;
}

function getAndDrawPRDistribution(date){
    if(!date){
        return;
    }

    return getFromGHArchive(date).then((parsedObjects) => {
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

        drawPie(languages);
        console.log(`Languages distribution in pull requests :`, languages);
        document.querySelector('#debug').innerHTML = JSON.stringify(languages, null, 2);
    });
}

/*
    Simple pie chart with D3
*/
function drawPie(data){
    const width = 540;
    const height = 540;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select("#pie_chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal()
	.range(["#2C93E8","#838690","#F56C4E", "#002FA7", "#FF0000"]);

    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);

    const arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);
    
    const labelArc = d3.arc()
	.outerRadius(radius - 40)
	.innerRadius(radius - 40);

    const g = svg.selectAll("path")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc")
        
    g.append("path")
        .attr("fill", (d, i) => color(i))
        .attr("d", arc)
        .attr("stroke", "white")
        .each(function(d) { this._current = d; });

    g.append("text")
        .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
        .text(function(d) { return d.data.language ? d.data.language : 'Undefined';})
        .style("fill", "#fff");
}
