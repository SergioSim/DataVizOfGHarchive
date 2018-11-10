const d3 = require('d3');
const pako = require('pako');
const data = require('./data.json');

/**
 * Retrieve data from GHArchive (using Cors anywhere to avoid cors issues)
 * Uncompress gz with Pako (only lib who can ungz in Browser)
 * return a PROMISE (see usage below)
 *
 * @param {*} date (2015-01-01-15) (year-month-day-hour)
 * @returns
 */
function getFromGHArchive(date) {
    return new Promise((resolve, reject) => {
        const ghArchiveURL = `https://cors-anywhere.herokuapp.com/http://data.gharchive.org/${date}.json.gz`;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', ghArchiveURL, true);
        xhr.responseType = 'arraybuffer';
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
    Usage sample :
    As with any promise, you have to return it basically, but launched without beeing returned works also for demo reasons
*/
getFromGHArchive("2018-01-01-15").then((parsedObjects) => {
    console.log('Your objects', parsedObjects);
});

/* in a function context : */
function drawThing(){
    return getFromGHArchive("2018-01-01-15").then((parsedObjects) => {
        console.log('Your objects', parsedObjects);
        // code to draw here
    });
}

/*
    Simple pie chart with D3 (and fake data given in data.json)
*/
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

function arcTween(a) {
    const i = d3.interpolate(this._current, a);
    this._current = i(1);
    return (t) => arc(i(t));
}

d3.selectAll("input")
    .on("change", update);

function update(val = this.value) {
    const path = svg.selectAll("path")
        .data(pie(data[val]));
    path.transition().duration(200).attrTween("d", arcTween);
    path.enter().append("path")
        .attr("fill", (d, i) => color(i))
        .attr("d", arc)
        .attr("stroke", "white")
        .attr("stroke-width", "6px")
        .each(function(d) { this._current = d; });
}

update("oranges");