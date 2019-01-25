var freqSelected = document.querySelector('input[name="editList"]:checked').value;

$("#slider").dateRangeSlider({
    bounds:{
        min: new Date(2014, 0, 1),
        max: new Date(2017, 11, 31)
    },
    defaultValues:{
        min: defaultStartDate,
        max: defaultEndDate
    }});

$("#slider").bind("valuesChanged", function(e, data){

    freqSelected = document.querySelector('input[name="editList"]:checked').value;
//    console.log(freqSelected);


    var min = new Date(convertDate(data.values.min));
    var max = new Date(convertDate(data.values.max));

    /* First redraw small svg */
    svg4.selectAll("*").remove();

    drawVis4(min, max,
        widthGlobal,
        heightGlobal,
        svg4, 0);

    /* If the big svg is enabled, redraw it too */
    if (svg4Clicked){
        preview.selectAll("*").remove();

        let svg = preview.append("svg")
            .style('width', previewWidth)
            .style('height', previewHeight);

        drawVis4(min, max,
            previewWidth- margin.left - margin.right - scale,
            previewHeight - margin.top - margin.bottom - scale,
            svg, 1);
    }

});

function convertDate(date){
    var day = date.getDate();
    var month = date.getMonth()+1;
    var year = date.getFullYear();

    var newDate = month + "/" + day + "/" + year;
    return newDate;
}









