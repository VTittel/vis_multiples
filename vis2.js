var scale = 30;

var margin = {top: 50, right: 60, bottom: 60, left: 60};

var widthGlobal = 400;
var heightGlobal = 400;

var previewWidth = 810;
var previewHeight = 810;

var categories = ["Food", "Games", "Publishing"];
var catStartDate = new Date(2014, 1, 1);
var catEndDate = new Date(2015, 1, 1);

var svg2Clicked = false;

var svg1 = d3.select('#vis1 svg');
var svg2 = d3.select("#vis2 svg");
var preview = d3.select('#preview');

// control variables
var controlsVis1 = d3.select('#controlsVis1');
var controlsVis2 = d3.select('#controlsVis2');

controlsVis2.style('display', 'none');

function filterCriteria(d) {
    let launchedDate = new Date(d.launched);

    return (categories.includes(d.main_category)
        && d.state != "live"
        && d.state != "undefined"
        && d.state != "suspended"
        && launchedDate >= catStartDate
        && launchedDate <= catEndDate);
}

function drawVis2(width, height, svgToUse){

    const x = d3.scaleBand()
        .rangeRound([0, width])

    const y = d3.scaleLinear()
        .rangeRound([height, 0])

    const z = d3.scaleOrdinal(d3.schemeCategory10)


    const xAxis = d3.axisBottom()
        .scale(x)

    const yAxis = d3.axisRight()
        .scale(y)

    d3.queue()
        .defer(d3.csv, "data/short.csv")
        .await(proc);

    function proc(error, data) {
        let newData = data.filter(filterCriteria);

        let nested_data = d3.nest()
            .key(function (d) {
                return d.main_category;
            })
            .key(function (d) {
                return d.state;
            })
            .rollup(function (leaves) {
                return d3.sum(leaves, function(d){
                    return d.usd_pledged_real;
                })
            })
            .entries(newData);

        var states = [];
        for (let i =0; i < nested_data[0].values.length; i++){
            states.push(nested_data[0].values[i].key);
        }

        nested_data.forEach(function(d){
            let i = 0;
            states.forEach(c => {
                if (d.values[i] != null){
                    d[c] = d.values[i].value;
                }
                else{
                    d[c] = 0;
                }

                i++;
            });

            i = 0;

        });

        const layers = d3.stack()
            .keys(states)
            (nested_data);

        x.domain(layers[0].map(d => d.data.key));

        y.domain([0, d3.max(layers[layers.length - 1], d => (d[0] + d[1]) )]).nice();

        const layer = svgToUse.selectAll('layer')
            .data(layers)
            .enter()
            .append('g')
            .attr('class', 'layer')
            .style('fill', (d, i) => (z(i)));

        layer.selectAll('rect')
            .data(d => d)
            .enter()
            .append('rect')
            .attr('x', d => x(d.data.key))
            .attr('y', d => y(d[0] + d[1]))
            .attr('height', d => y(d[0]) - y(d[1] + d[0]))
            .attr('width', x.bandwidth() - 1)
            .attr('transform', `translate(${margin.left},${margin.bottom + 10})`);

        svgToUse.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(${margin.left - 15},${height + margin.bottom + 25})`)
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-45)");


        svgToUse.append('g')
            .attr('class', 'axis axis--y')
            .attr('transform', `translate(${width + margin.left},${margin.bottom + 10})`)
            .attr("width", 100)
            .call(yAxis);

        var legend = svgToUse.append('g')
            .attr('class', 'axis text')
            .attr('transform', 'translate(' + (12) + ', 5)');

        legend.selectAll('rect')
            .data(states)
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr('y', function(d, i){
                return i * 18;
            })
            .attr('width', 12)
            .attr('height', 12)
            .style('fill', (d, i) => (z(i)));


        legend.selectAll('text')
            .data(states)
            .enter()
            .append('text')
            .text(function(d){
                return d;
            })
            .attr('x', 18)
            .attr('y', function(d, i){
                return i * 18;
            })
            .attr('text-anchor', 'start')
            .attr('alignment-baseline', 'hanging');

    }

}

drawVis2(widthGlobal - margin.left -margin.right - scale,
    heightGlobal - margin.top - margin.bottom - scale,
    svg2);

svg2.on('click', function() {

    if ( ! svg2Clicked) {

        // show/hide controls
        controlsVis1.style('display', 'none');
        controlsVis2.style('display', 'block');

        svg2Clicked = true;

        let width = 810;
        let height = 810;

        let svg = preview.append("svg")
            .style('width', width)
            .style('height', height);

        drawVis2(width- margin.left - margin.right - scale,
            height - margin.top - margin.bottom - scale,
            svg);

    } else {
        svg2Clicked = false;

        preview.selectAll("svg").remove();
    }
});
