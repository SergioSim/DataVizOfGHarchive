import * as d3 from 'd3';
import materialColors from './materialColors';

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
        .text(function(d) { return d[label] ? d[label] : "Non défini"});
    
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
export function drawLine(data, date, idchart, text, value, donut = true, replace = false){
    let width = window.innerWidth;
    if(width > 600){
        width = window.innerWidth / 2;
    }
    const height = width;
    const marginTop = 100;
    
    const n = data.length;
    
    const xScale = d3.scaleLinear()
                    .domain([0, n-1]) // input
                    .range([0, width]); // output

    //const xScale = d3.scaleTime().rangeRound([0, width]);
    
    const yScale = d3.scaleLinear()
                    .domain([0, Math.max.apply(Math, data.map(function(o) { return o; }))]) // input 
                    .range([height, 0]); // output

    const line = d3.line()
                    //.x(function(d) { return xScale(d.date)})
                    .x(function(d) { return xScale(d.x); }) // set the x values for the line generator
                    .y(function(d) { return yScale(d.y); }) // set the y values for the line generator 
                    .curve(d3.curveMonotoneX); // apply smoothing to the line

    const dataset = d3.range(data.length).map(function(d) {
        return {
            "x": d,
            "y": data[d]
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
    .attr("cx", function(d) { return xScale(d.x) })
    .attr("cy", function(d) { return yScale(d.y) })
    .attr("r", 5)
    .on("mouseover", function(a, b, c) {
  		console.log(a)
	})
    .on("mouseout", function() {  });
}

function zoomIn(datum,anchor){
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