const d3 = require('d3');
const materialColors = require('./materialColors');

/*
    Simple pie chart with D3
*/
export function drawPie(data){
    const width = window.innerWidth / 2;
    const height = width;

    const radius = Math.min(width, height) / 2;

    const svg = d3.select("#pie_chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal().range(materialColors.default);

    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);

    const arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);
    
    const labelArc = d3.arc()
	.outerRadius(radius - 80)
	.innerRadius(radius - 80);

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
        .style("fill", "black");
}
