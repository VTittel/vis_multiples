var svg1 = d3.select('#vis1 svg');

function filterVis1(d){
    let launchedDate = new Date(d.launched);

    return (categories.includes(d.main_category)
        && d.state != "live"
        && d.state != "undefined"
        && d.state != "suspended"
        && launchedDate >= catStartDate
        && launchedDate <= catEndDate);
}


/*
d3.csv('data/trends.csv', function(err, d){
    if(err) console.log(err);
    //console.log(d)

    var nested_data = d3.nest()
        .key(function(d) { return d.year; })
        .entries(d);

    //console.log(nested_data);

    var mqpdata = nested_data.map(function(d){
        var obj = {
            month: new Date(d.key, 0, 1)
        }

        d.values.forEach(function(v){
            obj[v.elec_type] = v.paila;
            console.log(d.paila)
        })

        return obj;
    })

    console.log(mqpdata)

    //buildStreamGraph(mqpdata);

})


function buildStreamGraph(mqpdata) {
    var data = mqpdata;


    var stack = d3.stack()
        .keys(["AE", "AREN", "BBT", "BC", "BME", "CE", "CH", "CM", "CS", "ECE", "EV", "HU", "ID", "IE", "IMGD", "MA", "ME", "MG", "PH", "RBE", "SSPS"])
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetWiggle);

    var series = stack(data);

    var width = 850,
        height = 500;

    var x = d3.scaleTime()
        .domain(d3.extent(data, function(d){ return d.month; }))
        .range([100, width]);

// setup axis
    var xAxis = d3.axisBottom(x);

    var y = d3.scaleLinear()
        .domain([0, d3.max(series, function(layer) { return d3.max(layer, function(d){ return d[0] + d[1];}); })])
        .range([height/2, -200]);

    var color = d3.scaleLinear()
        .range(["#51D0D7", "#31B5BB"]);

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var area = d3.area()
        .x(function(d) { console.info('in area function', d); return x(d.data.month); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })
        .curve(d3.curveBasis);

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.selectAll("path")
        .data(series)
        .enter().append("path")
        .attr("d", area)
        .style("fill", function() { return color(Math.random()); })
        .on('mouseover', function(d){
            d3.select(this).style('fill',d3.rgb( d3.select(this).style("fill") ).brighter());
            d3.select("#major").text(d.key);
            tooltip.transition()
                .duration(700)
                .style("opacity", 1);
            tooltip.html("Cantidad: " + "#familiares")
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

    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis);

    var xAxisGroup = svg.append("g").call(xAxis);
}

*/

d3.csv('data/short.csv', function(err, d){
    if(err) console.log(err);
    //console.log(d)

    let dataVis1 = d.filter(filterVis1);


    dataVis1 = d3.nest()
        .key(function (d) {

                    let launchedDate2 = new Date(d.launched);
                    return (launchedDate2.getFullYear());



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

    console.log(dataVis1)

    var mod_data = dataVis1.map(function(d){
        let temp = d.key;
        let initial = temp.split(/\//);
        let temp2 = [initial[1], initial[0], initial[2]].join('/');

        var obj = {
            month: new Date(d.key, 0, 1)
        }

        //   console.log(d)
        categories.forEach(function(v){
            let found = false;
            d.values.forEach(function(vn){
                if (v === vn.key){
                    found = true;
                    obj[vn.key] = vn.value;
                }
            })

            if (!found){
                obj[v] = 0;
            }
        })

        return obj;
    })

    console.log(mod_data)
    var data = mod_data;

    var stack = d3.stack()
        .keys(categories)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetWiggle);

    var series = stack(mod_data);
    console.log(series)

    var width = 400,
        height = 400;

    var x = d3.scaleTime()
        .domain(d3.extent(data, function(d){ return d.month; }))
        .range([100, width]);

// setup axis
    var xAxis = d3.axisBottom(x);

    var y = d3.scaleLinear()
        .domain([0, d3.max(series, function(layer) { return d3.max(layer, function(d){ return d[0] + d[1];}); })])
        .range([height/2, -200]);

    var color = d3.scaleLinear()
        .range(["#51D0D7", "#31B5BB"]);

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var area = d3.area()
        .x(function(d) { return x(d.data.month); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })
        .curve(d3.curveBasis);

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");


    svg1.selectAll("path")
        .data(series)
        .enter().append("path")
        .attr("d", area)
        .style("fill", function() { return color(Math.random()); })
        .on('mouseover', function(d){
            d3.select(this).style('fill',d3.rgb( d3.select(this).style("fill") ).brighter());
            d3.select("#major").text(d.key);
            tooltip.transition()
                .duration(700)
                .style("opacity", 1);
            tooltip.html("Cantidad: " + "#familiares")
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

    svg1.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis);

    var xAxisGroup = svg1.append("g").call(xAxis);
})

/*
d3.csv('data/short.csv', function(err, data) {


    let dataVis1 = data.filter(filterVis1);


    dataVis1 = d3.nest()
        .key(function (d) {
            return d.launched;

            switch(freqSelected){
                case "Days":
                    return d.launched;

                case "Months":
                    let launchedDate1 = new Date(d.launched);
                    return (launchedDate1.getMonth()+1) + "/" + launchedDate1.getFullYear();

                case "Years":
                    let launchedDate2 = new Date(d.launched);
                    return (launchedDate2.getFullYear());

            }

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

    //console.log(dataVis1)

    var mod_data = dataVis1.map(function(d){
        let temp = d.key;
        let initial = temp.split(/\//);
        let temp2 = [initial[1], initial[0], initial[2]].join('/');

        var obj = {
            month: new Date(d.key)
        }

     //   console.log(d)
        categories.forEach(function(v){
            let found = false;
            d.values.forEach(function(vn){
                if (v === vn.key){
                    found = true;
                    obj[vn.key] = vn.value;
                }
            })

            if (!found){
                obj[v] = 0;
            }
        })

        return obj;
    })

    var stack = d3.stack()
        .keys(categories)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetWiggle);

    var series = stack(mod_data);

    console.log(series)
    var width = 400,
        height = 400;

    var x = d3.scaleTime()
        .domain(d3.extent(mod_data, function(d){return d.month; }))
        .range([50, width-50]);

// setup axis
    var xAxis = d3.axisBottom(x);

    var y = d3.scaleLinear()
        .domain([0, d3.max(series, function (layer) {
            return d3.max(layer, function (d) {
                return d[0] + d[1];
            });
        })])
        .range([height / 2, -200]);


    var color = d3.scaleLinear()
        .range(["#51D0D7", "#31B5BB"]);

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var area = d3.area()
        .x(function (d) {
            return x(d.data.month);
        })
        .y0(function (d) {
            return y(d[0]);
        })
        .y1(function (d) {
            return y(d[1]);
        })
        .curve(d3.curveBasis);

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip2");

    svg1.selectAll("path")
        .data(series)
        .enter().append("path")
        .attr("d", area)
        .style("fill", function () {
            return color(Math.random());
        })
        .on('mouseover', function (d) {
            d3.select(this).style('fill', d3.rgb(d3.select(this).style("fill")).brighter());
            d3.select("#major").text(d.key);
            tooltip.transition()
                .duration(700)
                .style("opacity", 1);
            tooltip.html("Category : " + d.key)
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on('mouseout', function (d) {
            d3.select(this).style('fill',
                d3.rgb(d3.select(this).style("fill")).darker());
            d3.select("#major").text("Mouse over");
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })

    svg1.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis);

    var xAxisGroup = svg1.append("g").call(xAxis);

}) */
