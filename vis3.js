
function filterVis3(d) {
    let launchedDate = new Date(d.launched);

    return (categories.includes(d.main_category)
        && d.state != "live"
        && d.state != "undefined"
        && d.state != "suspended"
        && launchedDate >= startDate
        && launchedDate <= endDate
        && d.backers >= minBackers
        && d.backers <= maxBackers);
}

var svg3Clicked = false;

function drawVis3(width, height, svgToUse, dif){

    var priceline = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); });

    let x = d3.scaleTime().range([0, width-75]);
    let y = d3.scaleLinear().range([height - 50, 40]);
    // Get the data
    d3.csv("data/short.csv", function(error, data) {
        let newData = data.filter(filterVis3);

        let nested_data = d3.nest()
            .key(function (d) {
                return d.main_category;
            })
            .key(function (d) {
                let launchedDate = new Date(d.launched);
                return (launchedDate.getMonth()+1) + "/" + launchedDate.getFullYear();
            })
            .rollup(function (leaves) {
                return d3.sum(leaves, function(d){
                    return d.backers;
                })
            })
            .entries(newData);


        let states = [];
        for (let i =0; i < nested_data[0].values.length; i++){
            states.push(nested_data[0].values[i].key);
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

        let max = 0;
        nested_data.forEach(function (d) {
            d.values.forEach(function(v){
                v.date = new Date(sliceYearMonth(v.key));
                v.category = d.key;
                if (v.value > max){
                    max = v.value;
                }
                // console.log(v.key)
            })

            d.values.sort(function(a,b){

                return a.date - b.date;
            });

        });


        // Scale the range of the data
        x.domain([startDate, endDate]).nice();

        y.domain([0, max]).nice();


        // set the colour scale
        var color = d3.scaleOrdinal(d3.schemeCategory10);

        legendSpace = width/nested_data.length; // spacing for the legend

        // Loop through each symbol / key
        nested_data.forEach(function(d,i) {

            svgToUse.append("path")
                .attr("class", "line")
                .attr("transform", "translate(50,0)")
                .style("stroke", function() { // Add the colours dynamically
                    return d.color = color(d.key); })
                .attr("id", 'tag' + dif +d.key.replace(/\s+/g, '')) // assign an ID
                .attr("d", priceline(d.values));

            // Add the Legend
            svgToUse.append("text")
                .attr("x", (legendSpace/2)+i*legendSpace)  // space legend
                .attr("y", height + (margin.bottom/2))
                .attr("class", "legend")    // style the legend
                .style("fill", function() { // Add the colours dynamically
                    return d.color = color(d.key); })
                .on("click", function(){
                    // Determine if current line is visible
                    var active   = d.active ? false : true,
                        newOpacity = active ? 0 : 1;
                    // Hide or show the elements based on the ID
                    d3.select("#tag" + dif +d.key.replace(/\s+/g, ''))
                        .transition().duration(100)
                        .style("opacity", newOpacity);
                    // Update whether or not the elements are active
                    d.active = active;
                })
                .text(d.key);

        });


        // Add the X Axis
        let newHeight = height - 50;
        svgToUse.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(50," + newHeight + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)" );

        // Add the Y Axis
        svgToUse.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(50,0)")
            .call(d3.axisLeft(y));

        svgToUse.append("text")
            .attr("x",40 )
            .attr("y", 25)
            .style("text-anchor", "middle")
            // .attr("transform", "translate(" + width/2 + ",80)")
            .text("#Backers");
    });

}


svg3.on('dblclick', function() {

    if ( ! svg3Clicked) {

        svg3Clicked = true;

        let svg = preview.append("svg")
            .style('width', previewWidth)
            .style('height', previewHeight);

        drawVis3(previewWidth,
            previewHeight - 50,
            svg, 1);

    } else {
        svg3Clicked = false;

        preview.selectAll("svg").remove();
    }
});