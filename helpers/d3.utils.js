const d3 = require('d3');
const materialColors = require('./materialColors');

/*
    Simple pie chart with D3
*/
export function drawPie(data,date,idchart, text, value){
    let width = 330;
    const height = 430;

    if(window.innerWidth < 330){
        width = window.innerWidth;
        height = width + 100
    }

    const marginTop = 100;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(idchart)
            .append("svg")
            .attr("width", width)
            .attr("height", height + marginTop)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2 + marginTop})`);

    const color = d3.scaleOrdinal().range(materialColors.default);

    const pie = d3.pie()
        .value(d => d[value])
        .sort(null);

    const arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);
    
    const labelArc = d3.arc()
	.outerRadius(radius + 20)
	.innerRadius(radius + 20);

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
        .text(function(d) { return d.data[text] ? d.data[text] : 'Undefined';})
        .style("fill", "black");

    svg.append("text")
        .attr("x", 0)             
        .attr("y", - height/2 - marginTop/2)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text(date);
}

/* Line graph */
export function drawLine(data,date,idchart, text, value){
    let width = window.innerWidth;
    if(width > 600){
        width = window.innerWidth / 2;
    }
    const height = width;
    const marginTop = 100;
    
    var n = data.length;
    
    var xScale = d3.scaleLinear()
    .domain([0, n-1]) // input
    .range([0, width]); // output
    
    var yScale = d3.scaleLinear()
    .domain([0, 1]) // input 
    .range([height, 0]); // output

    var line = d3.line()
    .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
    .y(function(d) { return yScale(d.y); }) // set the y values for the line generator 
    .curve(d3.curveMonotoneX) // apply smoothing to the line

    var dataset = d3.range(n).map(function(d) {
        return {
            "y": d3.randomUniform(1)()
        }
    })

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
    .attr("cx", function(d, i) { return xScale(i) })
    .attr("cy", function(d) { return yScale(d.y) })
    .attr("r", 5)
      .on("mouseover", function(a, b, c) { 
  			console.log(a) 
        this.attr('class', 'focus')
		})
      .on("mouseout", function() {  })
}