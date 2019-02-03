var svg4Clicked = false;
//var freqSelected = document.querySelector('input[name="editList"]:checked').value;

var controlsVis1 = d3.select('#controlsVis1');
var controlsVis2 = d3.select('#controlsVis2');


var timeFormat = d3.timeFormat("%m/%d/%Y");

function filterVis4(d) {
    let launchedDate = new Date(d.launched);

    let initial = categories.includes(d.main_category)
        && d.state != "live"
        && d.state != "undefined"
        && d.state != "suspended"
        && launchedDate >= startDate
        && launchedDate <= endDate
        && d.backers >= minBackers
        && d.backers <= maxBackers;

    if (country === "allCountries"){
        return initial;
    } else {
        return ((d.country === country)
            && initial);
    }
}

function drawVis4(widthNew, heightNew, svgToUse, dif){
    d3.csv("data/short.csv", function (err, data) {

        let dataset = data.filter(filterVis4);

        dataset = d3.nest()
            .key(function (d) {
                let launchedDate = new Date(d.launched);
                return (launchedDate.getMonth()+1) + "/" + launchedDate.getFullYear();
                /*
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
                */
            })
            .rollup(function (leaves) {
                return d3.sum(leaves, function(d){
                    return d.usd_pledged_real;
                })
            })
            .entries(dataset);

        function format(val) {

            var formattedValue = val / 1000;

            formattedValue = "$" + formattedValue.toFixed(1) + "K";

            return formattedValue

        }

        function sliceYearMonth(date){
            let month = date.slice(0,2);
            let newDate;

            if (month.includes("/")){
                newDate = month + "1" + "/" + date.slice(-4);
            } else{
                newDate = month + "/" + "1" + "/" + date.slice(-4);
            }

            return newDate;
        }

        function sliceYear(date){
            return ("12/31/" + date);
        }

        dataset.forEach(function (d, i) {
            d.ID = i.toString();
            d.formattedDate = d.key;
            d.Date = new Date(sliceYearMonth(d.key));
            /*
            switch(freqSelected){
                case "Days":
                    d.Date = new Date(d.key);
                    break;

                case "Months":
                    d.Date = new Date(sliceYearMonth(d.key));
                    break;

                case "Years":
                    d.Date = new Date(sliceYear(d.key));
            }
            */

            d.formattedVal = format(d.value);
        });

        var margin = {
            top: 50,
            right: 100,
            bottom: 40,
            left: 10
        };


        svgToUse
            .attr("id", "svg_container")
            .attr("viewBox", `0 0 ${widthNew + 260} ${heightNew}`)
            .attr("preserveAspectRatio", "xMidYMid")
            .append("g")
            .attr("id", "container" + dif)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var width = widthNew + 260 - margin.left - margin.right;
        var height = heightNew - margin.top - margin.bottom;

        let x_extent = [startDate, endDate];

        var x_scale = d3
            .scaleTime()
            .domain(x_extent)
            .range([30, width]);

        var y_extent = d3.extent(dataset, function (d) {
            return d.value;
        })

        var r_scale = d3
            .scaleSqrt()
            .domain(y_extent)
            .range([5, 100]);

        var calendar = d3.timeMonth
            .every(2)
            .range(new Date(x_extent[0]), d3.timeMonth.offset(new Date(x_extent[1])), 1);

        /*
        if (freqSelected === "Years"){
            calendar= d3.timeYear
                .every(1)
                .range(new Date(x_extent[0]), d3.timeYear.offset(new Date(x_extent[1])), 1);
        }else {
            calendar= d3.timeMonth
                .every(2)
                .range(new Date(x_extent[0]), d3.timeMonth.offset(new Date(x_extent[1])), 1);
        }
        */


        var xAxis = svgToUse.append("g").attr("class", "x-axis");
        xAxis.attr("transform", "translate("+margin.right/2+"," + height / 2 + ")")
            .call(
                d3
                    .axisBottom(x_scale)
                    .tickValues(calendar)
                    .tickSizeInner(15)
                    .tickFormat(function (d) {
                        return timeFormat(d);
                    })
            )
            .call(g => g.select(".domain").remove());


        let circles = svgToUse.append('g')
            .attr('class', 'circles')
            .selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle")
            .attr('stroke', '#1d90cf')
            .attr('stroke-width', '0.3')
            .attr('id', function (d) {
                return 'circle' + "_" + d.ID + dif
            })
            .attr("cx", function (d) {
                return x_scale(d.Date);
            })
            .attr("cy", function (d) {
                return height / 2;
            })
            .attr("r", function (d) {
                return r_scale(d.value);
            })
            .attr("fill", function (d) {
                return "#93d2e6";
            })
            .attr('opacity', 0.3)
            .attr('pointer-events', 'none')
            .attr("transform", "translate("+margin.right/2+", 0)");

        let centroids = svgToUse.append('g')
            .attr('class', 'centroids')
            .selectAll("brewski")
            .data(dataset)
            .enter()
            .append("circle")
            .attr('id', function (d) {
                return 'centroid' + "_" + d.ID + dif
            })
            .attr("cx", function (d) {
                return x_scale(d.Date);
            })
            .attr("cy", function (d) {
                return height / 2;
            })
            .attr("r", function (d) {
                return 5;
            })
            .attr("fill", function (d) {
                return "#b3315f";
            })
            .attr('opacity', 0.8)
            .attr("transform", "translate("+margin.right/2+", 0)");

        var tooltip = d3.select("#vis1")
            .append("div")
            .attr("class", "tooltip");

        tooltip
            .append("div")
            .attr("class", "tooltip-date");

        tooltip
            .append("div")
            .attr("class", "tooltip-value");


        centroids.on("mouseover", function (d) {
            // highlight the circle that is involved in this
            d3.select(this).attr("r", 8);

            let getId = d3.select(this).attr('id').split('_')[1];
            let getCircle = d3.select(`#circle_${getId}`)
            getCircle.attr('stroke', '#b3315f')
                .attr('fill', '#b3315f')

            tooltip.select(".tooltip-date").html(d.formattedDate);
            tooltip.select(".tooltip-value").html(d.formattedVal);
            tooltip.style("display", "block");

            tooltip
                .style("top", d3.event.y + height/10 + "px")
                .style("left", d3.event.x  + "px")
                .style("pointer-events", "none");
        });

        centroids.on("mouseout", function () {
            d3.select(this).attr("r", 5);

            var getId = d3.select(this).attr('id').split('_')[1];
            var getCircle = d3.select(`#circle_${getId}`)

            getCircle.attr('stroke', '#1d90cf')
                .attr("fill", "#93d2e6");


            tooltip.style("display", "none");
        });

        let connectors;
        let dxdy;
        let xy;

        let type = d3.annotationCustomType(
            d3.annotationCallout,
            {
                "className": "custom",
                "note": { "lineType": "horizontal" }
            });

        dxdy = [[-60, 56], [20, 112], [16, -100], [-18, 91], [-50, -93]];

        let max5 = dataset.sort(function (x, y) {
            return d3.ascending(x.value, y.value);
        })

        max5 = max5.slice(-5);

        let annotations = max5.map(function (d, i) {
            return {
                note: {
                    label: d.formattedDate,
                    title: d.formattedVal,
                    bgPadding: { "top": 15, "left": 10, "right": 10, "bottom": 10 }
                },
                className: "show-bg",
                x: x_scale(d.Date),
                y: height / 2,
                dx: dxdy[i][0],
                dy: dxdy[i][1]
            }
        });

        let makeAnnotations = d3.annotation()
        //   .editMode(true)
        //also can set and override in the note.padding property
        //of the annotation object
        // .textWrap(140)
            .textWrap(90)
            .notePadding(5)
            .type(type)
            //accessors & accessorsInverse not needed
            //if using x, y in annotations JSON
            .annotations(annotations)

        d3.select("#container" + dif)
            .append("g")
            .attr("class", "annotation-group")
            .style('font-size', 9.5)
            .style("fill", "black")
            //   .style("stroke-dasharray", 5)
            .style('stroke-width', 0.75)
            .attr("transform", "translate(" + (margin.right/2 -5) + ", " + -margin.top + ")")
            .call(makeAnnotations);

        d3.select('.footnote')
            .on('click', function () {
                    connectors = makeAnnotations.annotations().map(function (d) {
                    return d.connector.points
                });

                    dxdy = makeAnnotations.annotations().map(function (d) {
                    return [
                        d._dx, d._dy
                    ];
                });

                    xy = makeAnnotations.annotations().map(function (d) {
                    return [
                        d._x, d._y
                    ];
                })

            })
    });

}


svg4.on('click', function() {

    if ( ! svg4Clicked) {

        preview.selectAll("*").remove();

        svg1Clicked = false;
        svg2Clicked = false;
        svg3Clicked = false;

        svg4Clicked = true;


        let svg = preview.append("svg")
            .style('width', previewWidth)
            .style('height', previewHeight);

        drawVis4(previewWidth- margin.left - margin.right - scale,
            previewHeight - margin.top - margin.bottom - scale,
            svg, 1);

    } else {
        svg4Clicked = false;

        preview.selectAll("*").remove();
    }
});
