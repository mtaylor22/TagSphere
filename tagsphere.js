
var divPos = {};
var size = 300;
var x_speed = 0;
var y_speed = 0;
var center = {'x': Math.floor(size/2), 'y': Math.floor(size/2)};

$(document).mousemove(function(e){
    var $div = $("#tagsphere-holder");
    var div_x = e.pageX - $div.offset().left;
    var inside_x = (div_x  > 0 && div_x < size);
    var div_y = e.pageY - $div.offset().top;
    var inside_y = (div_y  > 0 && div_y < size);
    var inside = (inside_x && inside_y);
    if (inside){
    	x_speed = (div_x - center.x)/(size/3);
    	y_speed = (div_y - center.y)/(size/3);
    }
});

function random_position(){
	var point = {};
	point.lon = Math.random()*2*Math.PI;
	point.lat = Math.random()*2*Math.PI;
	return point;
}

function position_to_point(point){
	rad = size/2;
    point.x = rad * Math.cos(point.lon) * Math.cos(point.lat);
    point.y = rad * Math.sin(point.lat) * Math.sin(point.lon);
    point.z = rad * Math.sin(point.lat);
    return point;
}
function distance_styling(point){
	var c = "rgba(0,0,0, "+(point.z+size/2)/(size*1.5)+")";
	var s = 16*(point.z+size/2)/(size/2) + "px";
	return {'color': c, 'font-size': s};
}
function tostr(point){
	return "("+point.x+" "+point.y+" "+point.z+")";
}
function tagsstring(){
	var ts;
	tags.forEach(function(a){ts+=tostr(a)});
	return ts;
}

function rotate(){
	tags.forEach(function(t, i){
		t.lat+=x_speed/Math.PI 
		t.lat %= 2*Math.PI;
		t.lon+=y_speed/Math.PI; 
		t.lon %= 2*Math.PI;
		t = position_to_point(t);
		$('#tag-'+i).css({'position': 'absolute', 'left': center.x+'px', 'top': center.y+'px', 'margin-left':t.x+'px', 'margin-top': t.y+'px'} ,1000)
        .css(distance_styling(t));
	});
	setTimeout(rotate, 100);
}
setTimeout(rotate, 1000);

$(function () {
     tags = [];
    $(".tagsphere > li").each(function () {
    	var p = position_to_point(random_position());
    	p.tag = $(this).text();
        tags.push(p);
    });
    $(".tagsphere").hide();
    $('#tagsphere-holder').css({'background-color': '#DDD', 'width': size+'px', 'height': size+'px'});

    tags.forEach(function (tag, i) {
        $('#tagsphere-holder').append('<span id="tag-'+i+'">' + tag.tag + '</span>');
        $('#tag-'+i).css({'position': 'absolute', 'left': center.x+'px', 'top': center.y+'px', 'margin-left':tag.x+'px', 'margin-top': tag.y+'px'})
        .css(distance_styling(tag));
    });
});

