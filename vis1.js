/* JS file for first vis technique */
/* Initial parameters */
preview = d3.select('#preview');
var benefits = "Yes";

let colorScheme = d3.schemeReds[6];
colorScheme.unshift("#eee")
let colorScale = d3.scaleThreshold()
    .domain([1, 6, 11, 26, 101, 1001])
    .range(colorScheme);

var svg1 = d3.select("#vis1 svg");

let width = svg1.attr("width");
let height = svg1.attr("height");


/* Drawing functions */
function drawStuff(svgParam, path, mapdata){


// Load external data and boot
    d3.queue()
        .defer(d3.json, "http://enjalot.github.io/wwsd/data/world/world-110m.geojson")
        .defer(d3.csv, "data/ksprojects2018.csv")
        .await(ready);

    function ready(error, topo, data) {
        if (error) throw error;
        // Draw the map
        var countObj = {};
        var dat = [];
        data.forEach(function(d){
            if (d.Country === "US"){
                d.Country = "USA";
            }
            if (d.Country === "GB"){
                d.Country = "GBR";
            }
            if (d.benefits === benefits){
                var key = d.Country + benefits;
                if (!countObj[key]){
                    countObj[key] = {
                        Country: d.Country,
                        FormalEducation: benefits,
                        count: 0
                    };
                }
                countObj[key].count++;
            }

        });

        Object.keys(countObj).forEach(function(key) {
            dat.push(countObj[key]);
        });

        dat.sort((a, b) => a.Country.localeCompare(b.Country));
        let countries = dat.map(a => a.Country);
        let counts = dat.map(a => a.count);

        let i;

        for (i = 0; i < countries.length; i++){
            mapdata.set(countries[i], counts[i]);
        }

        // console.log(data);
        svgParam.append("g")
            .attr("class", "countries")
            .selectAll("path")
            .data(topo.features)
            .enter().append("path")
            .attr("fill", function (d){
                d.total = mapdata.get(d.properties.name) || 0;
                // Set the color
                return colorScale(d.total);
            })
            .attr("d", path);
    }
}


/* Make the small graph */


function drawSmall(){
// Map and projection
    let projection = d3.geoNaturalEarth()
        .scale(width / 5 / Math.PI)
        .translate([width / 5, height / 5])
    let path = d3.geoPath()
        .projection(projection);
// Data and color scale
    let mapdata = d3.map();
// Legend
    let g = svg1.append("g")
        .attr("class", "legendThreshold")
        .attr("transform", "translate(20,20)");
    g.append("text")
        .attr("class", "caption")
        .attr("x", 0)
        .attr("y", -4)
        .text("Degrees");
    let labels = ['0', '1-5', '6-10', '11-25', '26-100', '101-1000', '> 1000'];
    let legend = d3.legendColor()
        .labels(function (d) { return labels[d.i]; })
        .shapePadding(4)
        .scale(colorScale);
    svg1.select(".legendThreshold")
        .call(legend);

    drawStuff(svg1, path, mapdata);
}

drawSmall();

function drawBig(){
    let width = preview.node().getBoundingClientRect()['width'];
    let height = preview.node().getBoundingClientRect()['height'];

    let svg = preview.append("svg")
        .style('width', width)
        .style('height', height);


    // Map and projection
    let projection = d3.geoNaturalEarth()
        .scale(width / 2 / Math.PI)
        .translate([width / 2, height / 2])
    let path = d3.geoPath()
        .projection(projection);
    // Data and color scale
    let mapdata = d3.map();
    // Legend
    let g = svg.append("g")
        .attr("class", "legendThreshold")
        .attr("transform", "translate(20,20)");
    g.append("text")
        .attr("class", "caption")
        .attr("x", 0)
        .attr("y", -4)
        .text("Degrees");
    let labels = ['0', '1-5', '6-10', '11-25', '26-100', '101-1000', '> 1000'];
    let legend = d3.legendColor()
        .labels(function (d) { return labels[d.i]; })
        .shapePadding(4)
        .scale(colorScale);
    svg.select(".legendThreshold")
        .call(legend);

    drawStuff(svg, path, mapdata);
}


