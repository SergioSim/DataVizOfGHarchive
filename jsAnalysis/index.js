const d3 = require('d3');
const pako = require('pako');

/**
 * Retrieve data from GHArchive (using Cors anywhere to avoid cors issues)
 * Uncompress gz with Pako (only lib who can ungz in Browser)
 * return a PROMISE (see usage below)
 *
 * @param {*} date (2015-01-01-15) (year-month-day-hour)
 * @returns
 */
function getFromGHArchive(date) {
    console.log("Starting download from GHArchive for date", date);

    return new Promise((resolve, reject) => {
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
                resolve(parsed);
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

/*
    Usage sample :
    As with any promise, you have to return it basically, but launched without beeing returned works also for demo reasons
*/
const currentDate = "2018-01-01-15";
getFromGHArchive(currentDate).then((parsedObjects) => {
    // console.log('Your objects', parsedObjects);
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
    document.querySelector('#receivedData').innerHTML = JSON.stringify(languages, null, 2);
});

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

    const color = d3.scaleOrdinal(["#66c2a5","#fc8d62","#8da0cb",
        "#e78ac3","#a6d854","#ffd92f"]);

    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    var labelArc = d3.arc()
	.outerRadius(radius - 40)
	.innerRadius(radius - 40);

    var g = svg.selectAll("path")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc")
        
    g.append("path")
        .attr("fill", (d, i) => color(i))
        .attr("d", arc)
        .attr("stroke", "white")
        .attr("stroke-width", "6px")
        .each(function(d) { this._current = d; });

    g.append("text")
        .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
        .text(function(d) { return d.data.language;})
        .style("fill", "#fff");
}