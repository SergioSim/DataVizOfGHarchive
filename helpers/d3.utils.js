const d3 = require('d3');
const materialColors = require('./materialColors').default;

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

    const color = d3.scaleOrdinal().range(materialColors);

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

export function drawDonut(data, date, id, text, value){
    var seedData = [{
        "label": "React",
        "value": 25,
        "link": "https://facebook.github.io/react/"
      }, {
        "label": "Redux",
        "value": 25,
        "link": "https://redux.js.org/"
      }, {
        "label": "Vue.js",
        "value": 25,
        "link": "https://vuejs.org/"
      }, {
        "label": "AngularJS",
        "value": 25,
        "link": "https://angularjs.org/"
      }, {
        "label": "Meteor",
        "value": 25,
        "link": "https://meteorhacks.com/meteor-js-web-framework-for-everyone"
      }, {
        "label": "Node.js",
        "value": 25,
        "link": "https://nodejs.org/"
      }];
      
      // Define size & radius of donut pie chart
      var width = 450,
          height = 450,
          radius = Math.min(width, height) / 2;
      
      // Define arc colours
      var colour = d3.scaleOrdinal().range(materialColors);
      
      // Determine size of arcs
      var arc = d3.arc()
        .innerRadius(radius - 130)
        .outerRadius(radius - 10);
      
      // Create the donut pie chart layout
      var pie = d3.pie()
        .value(function (d) { return d["value"]; })
        .sort(null);
      
      // Append SVG attributes and append g to the SVG
      var svg = d3.select("#donut-chart")
        .attr("width", width)
        .attr("height", height)
        .append("g")
          .attr("transform", "translate(" + radius + "," + radius + ")");
      
      // Define inner circle
      svg.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 100)
        .attr("fill", "#fff") ;
      
      // Calculate SVG paths and fill in the colours
      var g = svg.selectAll(".arc")
        .data(pie(seedData))
        .enter().append("g")
        .attr("class", "arc")
              
        // Make each arc clickable 
        .on("click", function(d, i) {
          window.location = seedData[i].link;
        });
      
          // Append the path to each g
          g.append("path")
            .attr("d", arc)
            .attr("fill", function(d, i) {
              return colour(i);
            });
      
          // Append text labels to each arc
          g.append("text")
            .attr("transform", function(d) {
              return "translate(" + arc.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .attr("fill", "#fff")
              .text(function(d,i) { return seedData[i].label; })
        
      // g.selectAll(".arc text");
      
      // Append text to the inner circle
      svg.append("text")
        .attr("dy", "-0.5em")
        .style("text-anchor", "middle")
        .attr("class", "inner-circle")
        .attr("fill", "#36454f")
        .text(function(d) { return 'JavaScript'; });
      
      svg.append("text")
        .attr("dy", "1.0em")
        .style("text-anchor", "middle")
        .attr("class", "inner-circle")
        .attr("fill", "#36454f")
        .text(function(d) { return 'is lots of fun!'; });
}

drawDonut();

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