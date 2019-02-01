/* Global parameters */
var scale = 30;

var allEnabled = false;

var margin = {top: 50, right: 60, bottom: 50, left: 60};

var widthGlobal = 350;
var heightGlobal = 350;

var previewWidth = 710;
var previewHeight = 710;

var svg1 = d3.select('#vis1 svg');
var svg2 = d3.select("#vis2 svg");
var svg3 = d3.select("#vis3 svg");
var svg4 = d3.select("#vis4 svg");

var preview = d3.select('#preview');

var startDate = new Date(2014, 1, 1);
var endDate = new Date(2015, 1, 1);

var minBackers = 0;
var maxBackers = 20;

var categories = ["Food", "Games", "Publishing"];

var svg1Clicked = false;


function filterVis1(d){
    let launchedDate = new Date(d.launched);

    return (
      //  if (allEnabled)
        categories.includes(d.main_category)
        && d.state != "live"
        && d.state != "undefined"
        && d.state != "suspended"
        && launchedDate >= startDate
        && launchedDate <= endDate
        && d.backers >= minBackers
        && d.backers <= maxBackers);
}

function drawVis1(width, height, svgToUse){
    d3.csv('data/short.csv', function(err, d){

        let dataVis1 = d.filter(filterVis1);

        dataVis1 = d3.nest()
            .key(function (d) {
                let launchedDate = new Date(d.launched);
                return (launchedDate.getMonth()+1) + "/" + launchedDate.getFullYear();
            })
            .key(function (d) {
                return d.main_category;
            })
            .rollup(function (leaves) {
                return d3.sum(leaves, function(d){
                    return d.usd_pledged_real;
                })
            })
            .entries(dataVis1);

        var mod_data = dataVis1.map(function(d){
            let initial = d.key.split(/\//);
            let temp = [initial[1], initial[0], initial[2]].join('/');

            var obj = {
                month: new Date(temp)
            };

            categories.forEach(function(v){
                let found = false;
                d.values.forEach(function(vn){
                    if (v === vn.key){
                        found = true;
                        obj[vn.key] = vn.value;
                    }
                });

                if (!found){
                    obj[v] = 0;
                }
            });

            return obj;
        });

        mod_data.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return a.month - b.month;
        });

        var data = mod_data;

        var stack = d3.stack()
            .keys(categories)
         //   .order(d3.stackOrderNone)


        var series = stack(data);

        console.log(series)

        var x = d3.scaleTime()
            .domain(d3.extent(data, function(d){ return d.month; }))
            .range([margin.left, width - margin.right/2]);

        let x_extent = [startDate, endDate];

// setup axis
        let calendar= d3.timeMonth
            .every(2)
            .range(new Date(x_extent[0]), d3.timeMonth.offset(new Date(x_extent[1])), 1);


        var xAxis = d3.axisBottom(x)
            .tickValues(calendar)
            .tickSizeInner(5)
            .tickFormat(function (d) {
                return timeFormat(d);
            });

        var y = d3.scaleLinear()
            .domain([0, (d3.max(series[series.length - 1], d => (d[0] + d[1]) ))/1.5])
            .nice()
            .range([height/2 - margin.top, -height/2 + margin.bottom]);

        var yAxis = d3.axisLeft(y);

        var color = d3.scaleLinear()
            .range(["#51D0D7", "#31B5BB"]);

        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var area = d3.area()
            .x(function(d) { return x(d.data.month); })
            .y0(function(d) { return y(d[0]); })
            .y1(function(d) { return y(d[1]); })
            .curve(d3.curveBasis);

        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip2");


        svgToUse.selectAll("path")
            .data(series)
            .enter().append("path")
            .attr('transform', `translate(0,${height/2})`)
            .attr("d", area)
            .style("fill", function() { return color(Math.random()); })
            .on('mouseover', function(d){
                d3.select(this).style('fill',d3.rgb( d3.select(this).style("fill") ).brighter());
                d3.select("#major").text(d.key);
                tooltip.transition()
                    .duration(700)
                    .style("opacity", 1);
                tooltip.html("Category: " + d.key)
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on('mouseout', function(d){
                d3.select(this).style('fill',
                    d3.rgb( d3.select(this).style("fill") ).darker());
                d3.select("#major").text("Mouse over");
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })

        svgToUse.append("g")
            .attr("class", "axis axis--x")
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(xAxis)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 4)
            .attr("dy", ".35em")
            .attr("transform", "rotate(-45)")


        svgToUse.append('g')
            .attr('class', 'axis axis--y')
            .attr('transform', `translate(${margin.left},${height/2})`)
            .attr("width", 30)
            .call(yAxis);

    })
}

drawVis1(widthGlobal, heightGlobal, svg1);

svg1.on('click', function() {

    if ( ! svg1Clicked) {

        // show/hide controls
    //    controlsVis1.style('display', 'none');
       // controlsVis2.style('display', 'block');

        svg1Clicked = true;

        let svg = preview.append("svg")
            .style('width', previewWidth)
            .style('height', previewHeight);

        drawVis1(previewWidth,
            previewHeight,
            svg);

    } else {
        svg1Clicked = false;

        preview.selectAll("svg").remove();
    }
});

