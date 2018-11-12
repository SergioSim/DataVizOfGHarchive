const d3 = require('d3');
const materialColors = require('./materialColors').default;

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
            .append("div").classed("horizontal-bar-graph-value-bar", true)
              .style("background-color", function(d, i) { return d.color ? d.color : color(i) })
              .text(function(d) { return d[value] ? d[value] : "0" })
              .transition()
                .duration(1000)
                .style("min-width", function(d) { return x(d[value]) + "%" });
}