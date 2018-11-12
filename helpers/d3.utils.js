const d3 = require('d3');
const materialColors = require('./materialColors').default;

/*
    Simple pie chart with D3
*/
export function drawPie(data,date,idchart, text, value, donut = true){
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
        .innerRadius((donut ? radius - 130 : 0));
    
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
        .attr("transform", function(d) {
          return "translate(" + arc.centroid(d) + ")";
        })
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .attr("fill", "#fff")
          .text(function(d,i) { return d.data[text] ? d.data[text] : 'Undefined';})

    svg.append("text")
        .attr("x", 0)             
        .attr("y", - height/2 - marginTop/2)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text(date);
}