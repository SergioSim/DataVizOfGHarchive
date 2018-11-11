const d3 = require('d3');
const materialColors = require('./materialColors');

/*
    Simple pie chart with D3
*/
export function drawPie(data,date,idchart, text, value){
    let width = window.innerWidth;
    if(width > 600){
        width = window.innerWidth / 2;
    }
    const height = width;
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
