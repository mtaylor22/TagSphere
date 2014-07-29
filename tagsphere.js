(function (window, undefined) {
	var $tagsphere = function (size, BIGGEST_SIZE, SMALLEST_SIZE) {
        if ( window === this ) {
            return new $tagsphere(size, BIGGEST_SIZE, SMALLEST_SIZE);
        }
        this.BIGGEST_SIZE = BIGGEST_SIZE;
        this.SMALLEST_SIZE = SMALLEST_SIZE;
        $tagsphere.prototype.x_speed = 0;
		$tagsphere.prototype.y_speed = 0;
		this.size = size;
		$tagsphere.prototype.center = {'x': Math.floor(this.size/2), 'y': Math.floor(this.size/2)};
		this.tags = [];

		var $this = this;
		$(".tagsphere > li").each(function () {
			var p = $tagsphere.prototype.position_to_point($tagsphere.prototype.random_position());
			var p = {};
			p.lon = Math.random()*2*Math.PI;
			p.lat = Math.random()*2*Math.PI;
			var rad = size/2;
			p.x = rad * Math.cos(p.lon) * Math.cos(p.lat);
			p.y = rad * Math.sin(p.lat) * Math.sin(p.lon);
			p.z = rad * Math.sin(p.lat);
			p.tag = $(this).html();
		    $this.tags.push(p);
		});
		$(".tagsphere").hide();
		$('#tagsphere-holder').css({'background-color': '#DDD', 'width': this.size+'px', 'height': this.size+'px'});
		var max_width=0;
		var center = $tagsphere.prototype.center;
		this.tags.forEach(function (tag, i) {
		    $('#tagsphere-holder').append('<span class="tag" id="tag-'+i+'">' + tag.tag + '</span>');
		    $('#tag-'+i).css({'position': 'absolute', 'left': center.x+'px', 'top': center.y+'px', 'margin-left':tag.x+'px', 'margin-top': tag.y+'px'})
		    .css({'font-size': BIGGEST_SIZE+'px'});
			tag.width = $('#tag-'+i).width();
			tag.height = $('#tag-'+i).height();
			if (tag.width > max_width){
				max_width = tag.width;
			}
			$('#tag-'+i + ' a').css({'color': "rgba(0,0,0,"+((tag.z+size/2)/(size*1.5))+")", 'font-size': ((BIGGEST_SIZE - SMALLEST_SIZE) *(tag.z+size/2)/(size) + SMALLEST_SIZE) +  "px"});
		});
		$('#tagsphere-holder').css('padding', max_width/2);
		$tagsphere.prototype.center.x+=max_width/2;
		$tagsphere.prototype.center.y+=max_width/2;
		$('.tag').css({'left': $tagsphere.prototype.center.x+'px', 'top': $tagsphere.prototype.center.y+'px'});

		$(document).mousemove(function(e){
		    var $div = $("#tagsphere-holder");
		    var div_x = e.pageX - $div.offset().left;
		    var inside_x = (div_x  > 0 && div_x < $div.outerWidth());
		    var div_y = e.pageY - $div.offset().top;
		    var inside_y = (div_y  > 0 && div_y < $div.outerHeight());
		    var inside = (inside_x && inside_y);
		    if (inside){
		    	$tagsphere.prototype.x_speed = (div_x - $tagsphere.prototype.center.x)/( $div.outerWidth()/2);
		    	$tagsphere.prototype.y_speed = -1*(div_y - $tagsphere.prototype.center.y)/$div.outerHeight();
		    } else {
		    	if (Math.abs($tagsphere.prototype.x_speed) > .1 || Math.abs($tagsphere.prototype.y_speed) > .1){
		    		$tagsphere.prototype.y_speed/=2
		    		$tagsphere.prototype.x_speed/=2;
		    	}
		    }
		});	
        return this;
    };
    $tagsphere.fn = $tagsphere.prototype = {

	random_position: function(){
		var point = {};
		point.lon = Math.random()*2*Math.PI;
		point.lat = Math.random()*2*Math.PI;
		return point;
	},
    position_to_point: function(point){
		rad = this.size/2;
	    point.x = rad * Math.cos(point.lon) * Math.cos(point.lat);
	    point.y = rad * Math.sin(point.lat) * Math.sin(point.lon);
	    point.z = rad * Math.sin(point.lat);
	    return point;
	},
    distance_styling: function(point){
		var c = "rgba(0,0,0, "+(point.z+this.size/2)/(this.size*1.5)+")";
		var s = (this.BIGGEST_SIZE - this.SMALLEST_SIZE) *(point.z+this.size/2)/(this.size) + this.SMALLEST_SIZE +  "px";
		return {'color': c, 'font-size': s};
    },
	rotate: function($this){
	    $this.tags.forEach(function(t, i){
			t.lat+=$this.x_speed/Math.PI 
			t.lat %= 2*Math.PI;
			t.lon+=$this.y_speed/Math.PI; 
			t.lon %= 2*Math.PI;
			t = $this.position_to_point(t);
			t.width = $('#tag-'+i).width();
			t.height = $('#tag-'+i).height();
			$('#tag-'+i).css({'position': 'absolute', 'left': $tagsphere.prototype.center.x-t.width/2+'px', 'top': $tagsphere.prototype.center.y-t.height/2+'px', 'margin-left':t.x+'px', 'margin-top': t.y+'px'} ,1000)
	        .css($this.distance_styling(t));
	        $('#tag-'+i + ' a').css($this.distance_styling(t));
		});
	},
	start: function(){
		$this = this;
		setInterval(function(){$this.rotate($this)}, 100);
		return this;
	}
    };
    window.$tagsphere = $tagsphere;
})(window);