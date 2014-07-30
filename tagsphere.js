(function (window, undefined) {
	var $tagsphere = function (holder, size, BIGGEST_SIZE, SMALLEST_SIZE, border) {
        if ( window === this ) {
            return new $tagsphere(holder, size, BIGGEST_SIZE, SMALLEST_SIZE, border);
        }
        if (border) $('#'+holder).css("border-width", "20px");
        this.BIGGEST_SIZE = BIGGEST_SIZE;
        this.SMALLEST_SIZE = SMALLEST_SIZE;
        this.x_speed = 0;
		this.y_speed = 0;
		this.size = size;
		this.center = {'x': Math.floor((this.size)/2), 'y': Math.floor((this.size)/2)};
		this.tags = [];
		this.holder = holder;

		var $this = this;
		$('#'+holder+" .tagsphere > li").each(function () {
			var p = $this.position_to_point($this.random_position());
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
		$('#'+holder+" .tagsphere").hide();
		$('#'+holder).css({'width': this.size+'px', 'height': this.size+'px'});
		var max_width=0;
		var center = this.center;
		this.tags.forEach(function (tag, i) {
		    $('#'+holder).append('<span class="tag" id="tag-'+i+'">' + tag.tag + '</span>');
		    $('#'+holder+' #tag-'+i).css({'position': 'absolute', 'left': center.x+'px', 'top': center.y+'px', 'margin-left':tag.x+'px', 'margin-top': tag.y+'px'})
		    .css({'font-size': BIGGEST_SIZE+'px'});
			tag.width = $('#'+holder+' #tag-'+i).width();
			tag.height = $('#'+holder+' #tag-'+i).height();
			if (tag.width > max_width){
				max_width = tag.width;
			}
			$('#'+holder+' #tag-'+i + ' a').css({'color': "rgba(0,0,0,"+((tag.z+size/2)/(size*1.5))+")", 'font-size': ((BIGGEST_SIZE - SMALLEST_SIZE) *(tag.z+size/2)/(size) + SMALLEST_SIZE) +  "px"});
		});
		$('#'+holder).css('padding', max_width/2);
		this.center.x+=max_width/2;
		this.center.y+=max_width/2;
		$('#'+holder+' .tag').css({'left': this.center.x+'px', 'top': this.center.y+'px'});
		var $this=this;
		$(document).mousemove(function(e){
		    var $div = $('#'+holder);
		    var div_x = e.pageX - $div.offset().left;
		    var inside_x = (div_x  > 0 && div_x < $div.outerWidth());
		    var div_y = e.pageY - $div.offset().top;
		    var inside_y = (div_y  > 0 && div_y < $div.outerHeight());
		    var inside = (inside_x && inside_y);
		    if (inside){
		    	$this.x_speed = (div_x - $this.center.x)/( $div.outerWidth()/2);
		    	$this.y_speed = -1*(div_y - $this.center.y)/$div.outerHeight();
		    } else {
		    	if (Math.abs($this.x_speed) > .1 || Math.abs($this.y_speed) > .1){
		    		$this.y_speed/=2
		    		$this.x_speed/=2;
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
		var rad = this.size/2;
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
			t.width = $('#'+$this.holder+' #tag-'+i).width();
			t.height = $('#'+$this.holder+' #tag-'+i).height();
			var newleft = $this.center.x-t.width/2;
			var newtop = $this.center.y-t.height/2;
			$('#'+$this.holder+' #tag-'+i).css({'left': newleft+'px', 'top': newtop+'px', 'margin-left':t.x+'px', 'margin-top': t.y+'px'})
	        .css($this.distance_styling(t));
	        $('#'+$this.holder+' #tag-'+i + ' a').css($this.distance_styling(t));
		});
	},
	start: function(){
		var $this = this;
		setInterval(function(){$this.rotate($this)}, 100);
		return this;
	}
    };
    window.$tagsphere = $tagsphere;
})(window);