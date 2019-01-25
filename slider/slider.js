$("#slider").dateRangeSlider({
    bounds:{
        min: new Date(2014, 0, 1),
        max: new Date(2018, 11, 31)
    },
    defaultValues:{
        min: new Date(2015, 1, 1),
        max: new Date(2016, 11, 31)
    }});

$("#slider").bind("valuesChanging", function(e, data){

    var min = convertDate(data.values.min);
    var max = convertDate(data.values.max);
});

function convertDate(date){
    var day = date.getDate();
    var month = date.getMonth()+1;
    var year = date.getFullYear();

    var newDate = month + "/" + day + "/" + year;
    return newDate;
}