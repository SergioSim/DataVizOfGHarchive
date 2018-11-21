import * as d3 from 'd3';
import materialColors from './materialColors';
import { getDates } from './analysis.utils';
const langNames = new Set();
/*
    Simple pie chart with D3
*/
export function drawPie(data,date, idchart, text, value, donut = true, replace = false){
    let width = 330;
    const height = 430;

    if(window.innerWidth < 330){
        width = window.innerWidth;
        height = width + 100
    }

    if(replace){
        const node = document.querySelector('#'+idchart.id);
        if(node.hasChildNodes()){
            const isHere = node.classList.contains('pie')
            if(isHere){
                node.removeChild(node.childNodes[0]);
            }
        }
    }

    const marginTop = 100;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(idchart)
            .append("svg")
            .attr("id", "pie"+idchart.id.replace('charts-', ''))
            .attr("width", width)
            .attr("height", height + marginTop)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2 + marginTop})`);

    const color = d3.scaleOrdinal().range(materialColors);

    const pie = d3.pie()
        .value(d => d[value])
        .sort(null);

    const arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius((donut ? radius - 120 : 0));
    
    const g = svg.selectAll("path")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc")

    svg.exit().remove();
        
    g.append("path")
        .attr("fill", (d, i) => color(i))
        .attr("d", arc)
        .attr("stroke", "white")
        .each(function(d) { this._current = d; });

      g.append("text")
        .attr("transform", function(d) {
          return "translate(" + arc.centroid(d) + ")";
        })
        .attr("dy", ".35em")
        .style("text-anchor", "middle").attr("startOffset", "50%")
        .attr("fill", "#000")
          .text(function(d,i) { return (d.data[text] ? d.data[text] : 'Undefined') + ' : ' + d.data[value]})

    svg.append("text")
        .attr("x", 0)             
        .attr("y", 0)
        .attr("text-anchor", "middle")  
        .style("font-size", "12px") 
        .style("text-decoration", "underline")  
        .text(date);
}

export function drawHorizontalBarGraph(anchor, series, label, value, replace){
    if(replace){
        const node = document.querySelector('#'+anchor.id);
        if(node.hasChildNodes()){
            const isHere = node.classList.contains('pie')
            if(isHere){
                node.removeChild(node.childNodes[0]);
            }
        }
    }
    const x = d3.scaleLinear()
        .domain([0, d3.max(series, function(d) { return d[value] })])
        .range([0, 100]);
        const color = d3.scaleOrdinal().range(materialColors);
    const segment = d3
        .select(anchor)
        .append("div").classed("horizontal-bar-graph", true)
        .selectAll(".horizontal-bar-graph-segment")
        .attr("id", "pie"+anchor.id.replace('charts-', ''))
        .data(series)
        .enter()
        .append("div").classed("horizontal-bar-graph-label", true);
    
    segment
        .append("div").classed("horizontal-bar-graph-label", true)
        .text(function(d) { return d[label] ? d[label] : "?"});
    
    segment
        .append("div").classed("horizontal-bar-graph-value", true)
        .append("div")
            .on("click",function(d) { zoomIn(d,anchor)})
            .classed("horizontal-bar-graph-value-bar", true)
            .style("background-color", function(d, i) { return d.color ? d.color : color(i) })
            .text(function(d) { return d[value] ? d[value] : "0" })
            .transition()
            .duration(1000)
            .style("min-width", function(d) { return x(d[value]) + "%" });
}

/* Line graph */
export function drawLine(data, idchart, textX, textY, donut = true, replace = false, onMouseOver){
    let width = window.innerWidth;
    if(width > 600){
        width = window.innerWidth / 2;
    }
    const height = width;
    const marginTop = 100;
    
    const n = data.length;
    const max = Math.max(...data.map((d)=>{
        return d["y"].day;
    }));

    const parsedStartDate = data[0]["x"].split("-");
    const parsedEndDate = data[n-1]["x"].split("-");

    const startDate = new Date(parsedStartDate[0],parsedStartDate[1]-1,parsedStartDate[2],parsedStartDate[3]);
    const endDate = new Date(parsedEndDate[0],parsedEndDate[1]-1,parsedEndDate[2],parsedEndDate[3]);

    const dateRange = getDates(startDate,endDate);
    
    const xScale = d3.scaleTime()
    .domain([startDate,endDate]) // input
    .range([0, width]); // output
    
    const yScale = d3.scaleLinear()
    .domain([0, max]) // input 
    .range([height, 0]); // output

    const line = d3.line()
    .x(function(d,i) { return xScale(dateRange[i]); }) // set the x values for the line generator
    .y(function(d) { return yScale(d["y"].day); }) // set the y values for the line generator 
    .curve(d3.curveMonotoneX); // apply smoothing to the line

    const dataset = d3.range(data.length).map(function(d) {
        return {
            "x": data[d]["x"],
            "y": data[d]["y"]
        }
    });

    const svg = d3.select(idchart)
    .append("svg")
    .attr("width", width)
    .attr("height", height + marginTop)
    .append("g");

    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

    svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

    svg.append("path")
    .datum(dataset) // 10. Binds data to the line 
    .attr("class", "line") // Assign a class for styling 
    .attr("d", line); // 11. Calls the line generator

    svg.selectAll(".dot")
    .data(dataset)
    .enter().append("circle") // Uses the enter().append() method
    .attr("class", "dot") // Assign a class for styling
    .attr("cx", function(d,i) { return xScale(dateRange[i]) })
    .attr("cy", function(d) { return yScale(d["y"].day) })
    .attr("r", 5)
    .on("mouseover", function(a, b, c) {
        onMouseOver(a, b, c);
	})
    .on("mouseout", function() {  });

    svg.append("text")
    .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
    .attr("transform", "translate("+ (-marginTop/2) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
    .text(textY);

    svg.append("text")
    .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
    .attr("transform", "translate("+ (width/2) +","+(height+(marginTop/2))+")")  // centre below axis
    .text(textX);
}


export function drawTendanceGraph(anchor, idata, date){
    // 2. Use the margin convention
    var margin = {top: 50, right: 50, bottom: 50, left: 50}
    let width = window.innerWidth;
    if(width > 600){
        width = window.innerWidth / 2;
    }
    const height = width;
    const theDates = getDates(new Date(2016, 0, 1, 1),new Date(2017, 0, 1, 0));
    var maxNbPR = getMaxNumberOfPR(idata);
    
    var xScale = d3.scaleTime()
        .domain([new Date(2016, 0, 1, 0), new Date(2017, 0, 1, 0)]) // input
        .range([0, width]); // output

    var	yScale = d3.scaleLinear()
        .domain([0, getHeight(idata)]) // input
        .range([height, 0]); // output

    var line = d3.line()
        .x(function(d,i) { return xScale(theDates[i]); }) // set the x values for the line generator
        .y(function(d,i) { return yScale(d); }); // set the y values for the line generator 
    
    const color = d3.scaleOrdinal().range(materialColors);
    const langColors = [];
    Object.keys(idata).forEach(function(lang){
        langColors.push(color(lang));
    });

    var leftBox = d3.select("#" + anchor.id).append("div")
    .attr("class", "left-side");

    var namesBox = leftBox.append("div")
        .attr("class", "names-list-container");
    
    var namesList = namesBox.append("ul")
        .attr("class" , "names-list");

    var rightBox = d3.select("#" + anchor.id).append("div")
    .attr("class", "right-side");

    // Adding the SVG to the page
    var svg = rightBox.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .on("mouseover", function() {
            svg.selectAll('.circles > g')
                .attr('visibility', '')
        })
        .on("mouseout", function(){
            svg
            .selectAll('.circles > g')
            .attr('visibility', 'hidden')
        })
        .on("mousemove",function(){
            const pos = d3.mouse(svg.node());
            if(pos[0] > 0 && pos[0] < width){
                console.log(theDates[parseInt(theDates.length*pos[0]/width, 10)]);
            }
        })
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Calling the x axis in a group tag
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

    // Calling the y axis in a group tag
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

    Object.keys(idata).forEach(function(lan) {
        const theSize = 15 + 15 * idata[lan][0].reduce((a, b) => a + b, 0)/maxNbPR;
        namesList.append("li")
            .attr("id", "lang"+lan.replace(/\s/g,'').replace("#","Sharp").replace("+" ,"p").replace("+" ,"p"))
            .style("font-size",theSize+"px")
            .on("click", function(){
                if (!langNames.has(lan)) {
                    langNames.add(lan);
                    yScale.domain([0, getHeight(idata)]);
                    line = d3.line()
                        .x(function(d,i) { return xScale(theDates[i]); }) // set the x values for the line generator
                        .y(function(d,i) { return yScale(d); }); // set the y values for the line generator 
                    d3.select("#lang"+lan.replace(/\s/g,'').replace("#","Sharp").replace("+","p").replace("+" ,"p"))
                        .attr("class", "selected")
                        .style("background-color", langColors[Object.keys(idata).indexOf(lan)]);

                    svg.selectAll('.thinline').call(lines => lines.attr('d', line));
                    svg.select(".y.axis").call(d3.axisLeft(yScale)); 
                    svg.append("path")
                        .datum(idata[lan][0]) // Binds data to the line 
                        .attr("id", "path"+lan.replace(/\s/g,'').replace("#","Sharp").replace("+","p").replace("+" ,"p"))
                        .attr("class", "thinline") // Assign a class for styling 
                        .attr("style", "transform: none;")
                        .attr('stroke-width', 2)
                        .attr('stroke', function(d) { 
                            console.log(langColors[Object.keys(idata).indexOf(lan)]);
                            return langColors[Object.keys(idata).indexOf(lan)];
                            })
                        .attr("d", line);
                }else{
                    langNames.delete(lan);
                    d3.select("#lang"+lan.replace(/\s/g,'').replace("#","Sharp").replace("+","p").replace("+" ,"p"))
                        .attr("class", "")
                        .style("background-color", "white");
                    d3.select("#path"+lan.replace(/\s/g,'').replace("#","Sharp").replace("+","p").replace("+" ,"p")).remove();
                    d3.select(".right-side").select("svg").select("g").selectAll('.thinline').call(lines => lines.attr('d', line));
                }
                console.log(langNames);
            })
            .html(lan);
    });  
}

function getHeight(idata){
    if(langNames.size == 0){
        return 400;
    }else{
        var maxValues = [];
        langNames.forEach(function(langName){
            maxValues.push(Math.max(...idata[langName][0]))
        });
        console.log(Math.max(...maxValues));
        return Math.max(...maxValues);
    }
}

function getMaxNumberOfPR(idata){
    var count = 0;
    var curr = 0;
    Object.keys(idata).forEach(function(plReq){
        curr = idata[plReq][0].reduce((a, b) => a + b, 0);
        if(count < curr){
            count = curr;
        }
    })
    return count;
}

function zoomIn(datum,anchor){
    if(!datum || !datum.repoTitles){
        return;
    }
    
    const color = d3.scaleOrdinal().range(materialColors);
    const node = document.querySelector('#'+anchor.id);
    if(node.hasChildNodes()){
        node.removeChild(node.childNodes[0]);
    }
    //put this elsewere 
    let index = 0
    const titles = [];
    const dataSet = new Set();
    datum.repoTitles.forEach((title) => {
        // If our set doesn't contains title
        if (!dataSet.has(title)) {
            // add title
            dataSet.add(title);
            // push this title
            titles.push({ title: title, size: datum.repoSizes[index], count: 1});
        }else{
            // Find title in titles set
            const lang = titles.find((t) => t.title === title);
            // add
            lang.size += datum.repoSizes[index];
            lang.count++;
        }
        index++;
    });
    // -----------------------
    let width = window.innerWidth;
    if(width > 600){
        width = window.innerWidth / 2;
    }
    const height = width;
    const marginTop = 100;
    const marginBottom = 30;
    var packLayout = d3.pack();
    var datos = {
        "name": "Titles",
        "children": titles
    }
    const root = d3.hierarchy(datos);
    var packLayout = d3.pack();
    packLayout.size([width,height + marginTop + marginBottom]);
    packLayout.padding(10);
    root.sum(d => {
        return d.count * 10
    });
    packLayout(root);
    console.log(root);

    var packNodes = d3.select("#" + anchor.id)
        .append("svg")
        .style("width", "100%")
        .style("height", height + marginTop + marginBottom + "px")
        .attr("font-size", 10)
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "middle")
        .selectAll('g')
        .data(root.descendants())
        .enter()
        .append('g').attr('class', 'node')
        .attr('transform', d => 'translate('+[d.x, d.y]+')');

    packNodes
        .append('circle')
        .classed('the-node', true)
        .attr('r', d => d.r)
        .attr("fill-opacity", 0.7)
        .attr("fill", d => color(d.data.size));

    packNodes
        .append("text")
        .text(d => d.data.title);
}