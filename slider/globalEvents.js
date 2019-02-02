//var freqSelected = document.querySelector('input[name="editList"]:checked').value;
var button_my_button = "#submitCategory";

$("#sliderDate").dateRangeSlider({
    bounds:{
        min: new Date(2014, 0, 1),
        max: new Date(2017, 11, 31)
    },
    defaultValues:{
        min: startDate,
        max: endDate
    }});

$("#sliderDate").bind("valuesChanged", function(e, data){

   // freqSelected = document.querySelector('input[name="editList"]:checked').value;

    // Get new dates and categories
    startDate = new Date(convertDate(data.values.min));
    endDate = new Date(convertDate(data.values.max));

    updateAllVis();

});

$("#sliderBackers").rangeSlider({
    bounds:{
        min: 0,
        max: 1000
    },
    defaultValues:{
        min: 0,
        max: 20
    }});

$("#sliderBackers").bind("valuesChanged", function(e, data){

    minBackers = data.values.min;
    maxBackers = data.values.max;

    updateAllVis();

});

$(button_my_button).click(function(){

    /*
    let startDateString = document.querySelector('input[name="startDateVis2"]').value;
    let endDateString = document.querySelector('input[name="endDateVis2"]').value;

    defaultStartDate = new Date(startDateString.replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
    defaultEndDate = new Date(endDateString.replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
    */

    updateAllVis();

});

function convertDate(date){
    var day = date.getDate();
    var month = date.getMonth()+1;
    var year = date.getFullYear();

    var newDate = month + "/" + day + "/" + year;
    return newDate;
}

function updateAllVis(){
    var tempArr = [];

    [].forEach.call(document.querySelectorAll('input[name="category"]:checked'), function(cb) {
        if (cb.value === "All"){
            allEnabled = true;
            return;
        }
        tempArr.push(cb.value)
    });

    categories = tempArr;

    /* Update box 1 */
    svg1.selectAll("*").remove();
    drawVis1(widthGlobal, heightGlobal, svg1);

    if (svg1Clicked){
        preview.selectAll("*").remove();

        let svg = preview.append("svg")
            .style('width', previewWidth)
            .style('height', previewHeight);

        drawVis1(previewWidth,
            previewHeight,
            svg, 1);
    }

    /* Update box 2 */
    svg2.selectAll("*").remove();
    drawVis2(widthGlobal - margin.left -margin.right - scale,
        heightGlobal - margin.top - margin.bottom - scale,
        svg2);


    if (svg2Clicked) {
        preview.selectAll("*").remove();

        let svg = preview.append("svg")
            .style('width', previewWidth)
            .style('height', previewHeight);

        drawVis2(previewWidth - margin.left - margin.right - scale,
            previewHeight - margin.top - margin.bottom - scale,
            svg);
    }

    /* Update box 3*/
    svg3.selectAll("*").remove();
    drawVis3(widthGlobal + 10, heightGlobal - 30, svg3, 0);

    if (svg3Clicked) {
        preview.selectAll("*").remove();

        let svg = preview.append("svg")
            .style('width', previewWidth)
            .style('height', previewHeight);

        drawVis3(previewWidth,
            previewHeight - 50,
            svg, 1);
    }

    /* Update box 4 */

    /* First redraw small svg */
    svg4.selectAll("*").remove();

    drawVis4(widthGlobal,
        heightGlobal,
        svg4, 0);

    /* If the big svg is enabled, redraw it too */
    if (svg4Clicked){
        preview.selectAll("*").remove();

        let svg = preview.append("svg")
            .style('width', previewWidth)
            .style('height', previewHeight);

        drawVis4(previewWidth- margin.left - margin.right - scale,
            previewHeight - margin.top - margin.bottom - scale,
            svg, 1);
    }
}








