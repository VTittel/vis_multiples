var line = d3.line(),
    //axis = d3.axisLeft(x),
    background,
    foreground,
    extents;

var svg3 = d3.select("#vis3 svg");

var svg3Clicked = false;

var quant_p = function(v){return (parseFloat(v) == v) || (v == "")};

var dimensions = ["main_category", "backers", "country"];
var extents = dimensions.map(function(p) { return [0,0]; });

function drawVis3(width, height, svgToUse){

    var xVis3 = d3.scalePoint().rangeRound([0, width + scale*2]).padding(1),
        yVis3 = {},
        dragging = {};


    d3.csv("data/short.csv", function(error, cars) {



        xVis3.domain(dimensions);

        dimensions.forEach(function(d) {
            var vals = cars.map(function(p) {return p[d];});
            if (vals.every(quant_p)){
                yVis3[d] = d3.scaleLinear()
                    .domain(d3.extent(cars, function(p) {
                        return +p[d]; }))
                    .range([height - scale*2, 0])

            }
            else{
                vals.sort();
                yVis3[d] = d3.scalePoint()
                    .domain(vals.filter(function(v, i) {return vals.indexOf(v) == i;}))
                    .range([height - scale*2, 0],1);
            }

        })

        // Add grey background lines for context.
        background = svgToUse.append("g")
            .attr("class", "background")
            .selectAll("path")
            .data(cars)
            .enter().append("path")
            .attr("d", path)
            .attr('transform', `translate(0, ${scale})`);

        // Add blue foreground lines for focus.
        foreground = svgToUse.append("g")
            .attr("class", "foreground")
            .selectAll("path")
            .data(cars)
            .enter().append("path")
            .attr("d", path)
            .attr('transform', `translate(0, ${scale})`);

        // Add a group element for each dimension.

        var g = svgToUse.selectAll(".dimension")
            .data(dimensions)
            .enter().append("g")
            .attr("class", "dimension")
            .attr("transform", function(d) {  return "translate(" + xVis3(d) + ", " + scale + ")"; })
            .call(d3.drag()
                .subject(function(d) { return {xVis3: xVis3(d)}; })
                .on("start", function(d) {
                    dragging[d] = xVis3(d);
                    dragging[d] = xVis3(d);
                    background.attr("visibility", "hidden");
                })
                .on("drag", function(d) {
                    dragging[d] = Math.min(width, Math.max(0, d3.event.xVis3));
                    foreground.attr("d", path);
                    dimensions.sort(function(a, b) { return position(a) - position(b); });
                    xVis3.domain(dimensions);
                    g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
                })
                .on("end", function(d) {
                    delete dragging[d];
                    transition(d3.select(this)).attr("transform", "translate(" + xVis3(d) + ")");
                    transition(foreground).attr("d", path);
                    background
                        .attr("d", path)
                        .transition()
                        .delay(500)
                        .duration(0)
                        .attr("visibility", null);
                }));



        // Add an axis and title.
        var g = svgToUse.selectAll(".dimension");
        g.append("g")
            .attr("class", "axis")
            .each(function(d) {  d3.select(this).call(d3.axisLeft(yVis3[d]));})
            .append("text")
            .attr("fill", "black")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d) { return d; });

        // Add and store a brush for each axis.
        g.append("g")
            .attr("class", "brush")
            .each(function(d) {
                if(yVis3[d].name == 'r'){
                    // console.log(this);

                    d3.select(this).call(yVis3[d].brush = d3.brushY().extent([[-8, 0], [8,height - scale*2]])
                        .on("brush start", brushstart).on("brush", go_brush).on("brush", brush_parallel_chart)
                        .on("end", brush_end));
                }


                else if(yVis3[d].name == 'n')
                    d3.select(this).call(yVis3[d].brush = d3.brushY().extent([[-8, 0], [15,height - scale*2]])
                        .on("brush start", brushstart).on("brush", go_brush)
                        .on("brush", brush_parallel).on("end", brush_end_ordinal));


            })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);
    });  // closing

    function position(d) {
        var v = dragging[d];
        return v == null ? xVis3(d) : v;
    }

    function transition(g) {
        return g.transition().duration(500);
    }

// Returns the path for a given data point.
    function path(d) {
        return line(dimensions.map(function(p) { return [position(p), yVis3[p](d[p])]; }));
    }

    function go_brush() {
        d3.event.sourceEvent.stopPropagation();
    }


    invertExtent = function(y) {
        return domain.filter(function(d, i) { return y === range[i]; });
    };


    function brushstart(selectionName) {
        foreground.style("display", "none")


        var dimensionsIndex = dimensions.indexOf(selectionName);

        extents[dimensionsIndex] = [0, 0];

        foreground.style("display", function(d) {
            return dimensions.every(function(p, i) {
                if(extents[i][0]==0 && extents[i][0]==0) {
                    return true;
                }
                return extents[i][1] <= d[p] && d[p] <= extents[i][0];
            }) ? null : "none";
        });
    }



// Handles a brush event, toggling the display of foreground lines.
    function brush_parallel_chart() {

        for(var i=0;i<dimensions.length;++i){


            if(d3.event.target==yVis3[dimensions[i]].brush) {
                //if (d3.event.sourceEvent.type === "brush") return;

                extents[i]=d3.event.selection.map(yVis3[dimensions[i]].invert,yVis3[dimensions[i]]);

            }

        }

        foreground.style("display", function(d) {
            return dimensions.every(function(p, i) {
                if(extents[i][0]==0 && extents[i][0]==0) {
                    return true;
                }
                return extents[i][1] <= d[p] && d[p] <= extents[i][0];
            }) ? null : "none";
        });
    }


    function brush_end(){



        if (!d3.event.sourceEvent) return; // Only transition after input.
        if (!d3.event.selection) return; // Ignore empty selections.


        for(var i=0;i<dimensions.length;++i){

            if(d3.event.target==yVis3[dimensions[i]].brush) {

                extents[i]=d3.event.selection.map(yVis3[dimensions[i]].invert,yVis3[dimensions[i]]);

                extents[i][0] = Math.round( extents[i][0] * 10 ) / 10;
                extents[i][1] = Math.round( extents[i][1] * 10 ) / 10;



                d3.select(this).transition().call(d3.event.target.move, extents[i].map(yVis3[dimensions[i]]));

            }

        }

    }

//   brush for ordinal cases
    function brush_parallel() {


        for(var i=0;i<dimensions.length;++i){

            if(d3.event.target==yVis3[dimensions[i]].brush) {


                var  yScale = yVis3[dimensions[i]];
                var selected =  yScale.domain().filter(function(d){
                    // var s = d3.event.target.extent();
                    var s = d3.event.selection;

                    return (s[0] <= yScale(d)) && (yScale(d) <= s[1])

                });


                var temp = selected.sort();
                extents[i] = [temp[temp.length-1], temp[0]];


            }

        }

        foreground.style("display", function(d) {
            return dimensions.every(function(p, i) {
                if(extents[i][0]==0 && extents[i][0]==0) {
                    return true;
                }
                //var p_new = (y[p].ticks)?d[p]:y[p](d[p]);
                //return extents[i][1] <= p_new && p_new <= extents[i][0];
                return extents[i][1] <= d[p] && d[p] <= extents[i][0];
            }) ? null : "none";
        });
    }




    function brush_end_ordinal(){

        if (!d3.event.sourceEvent) return; // Only transition after input.

        if (!d3.event.selection) return; // Ignore empty selections.

        for(var i=0;i<dimensions.length;++i){

            if(d3.event.target==yVis3[dimensions[i]].brush) {


                var  yScale = yVis3[dimensions[i]];
                var selected =  yScale.domain().filter(function(d){
                    // var s = d3.event.target.extent();
                    var s = d3.event.selection;

                    return (s[0] <= yScale(d)) && (yScale(d) <= s[1])

                });

                var temp = selected.sort();
                extents[i] = [temp[temp.length-1], temp[0]];

                if(selected.length >1)
                    d3.select(this).transition().call(d3.event.target.move, extents[i].map(yVis3[dimensions[i]]));


            }
        }
    }
}

drawVis3(widthGlobal, heightGlobal, svg3)

svg3.on('click', function() {

    if ( ! svg3Clicked) {
        svg3Clicked = true;

        let width = 810;
        let height = 810;

        let svg = preview.append("svg")
            .style('width', width)
            .style('height', height);

        drawVis3(width, height, svg);

    } else {
        svg3Clicked = false;

        preview.selectAll("svg").remove();
    }
});


