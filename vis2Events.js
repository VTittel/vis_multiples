var button_my_button = "#submitCategory";

$(button_my_button).click(function(){

    /*
    let startDateString = document.querySelector('input[name="startDateVis2"]').value;
    let endDateString = document.querySelector('input[name="endDateVis2"]').value;

    defaultStartDate = new Date(startDateString.replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
    defaultEndDate = new Date(endDateString.replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
    */
    var tempArr = [];
    [].forEach.call(document.querySelectorAll('input[name="category"]:checked'), function(cb) {
        tempArr.push(cb.value)
    });

    categories = tempArr;

    /* Redraw small svg first */
    svg2.selectAll("*").remove();

    drawVis2(widthGlobal - margin.left -margin.right - scale,
        heightGlobal - margin.top - margin.bottom - scale,
        svg2);

    /* If the big svg is enabled, redraw it too */
    if (svg2Clicked){
        preview.selectAll("*").remove();

        let svg = preview.append("svg")
            .style('width', previewWidth)
            .style('height', previewHeight);

        drawVis2(previewWidth- margin.left - margin.right - scale,
            previewHeight - margin.top - margin.bottom - scale,
            svg);
    }

});

function toDate(dateStr) {
    const [day, month, year] = dateStr.split("-")
    return new Date(year, month - 1, day)
}
