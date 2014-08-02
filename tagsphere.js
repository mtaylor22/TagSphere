(function (window, undefined) {
	var $tagsphere = function (holder, options) {
        if ( window === this ) {
            return new $tagsphere(holder, options);
        }
        //options processing
        this.options = options;
        if (options.border) $('#'+holder).css("border-width", "20px");
        if (options.bordercolor)  $('#'+holder).css("border-color", options.bordercolor);
        if (options.backgroundcolor)  $('#'+holder).css("background-color", options.backgroundcolor);
       	if (options.tag){
       		if (options.tag.font) $('.tstag').css('font-family', options.tag.font);
		   	$(".tstag").hover(function(){
		       	if (options.tag.borderstyle) $(this).css("border-style", options.tag.borderstyle);
		       	if (options.tag.backgroundcolor) $(this).css("background-color", options.tag.backgroundcolor);
		       	if (options.tag.borderwidth) $(this).css("border-width", options.tag.borderwidth);
		   	}, function(){
		       	if (options.tag.borderstyle) $(this).css("border-style", "");
		       	if (options.tag.backgroundcolor) $(this).css("background-color", "");
		       	if (options.tag.borderwidth) $(this).css("border-width", "");	   		
		   	});
       	}
       	if (options.biggestsize) this.BIGGEST_SIZE = options.biggestsize;
       	if (options.smallestsize) this.SMALLEST_SIZE = options.smallestsize;
       	if (options.size) this.size = options.size;

       	//consideration of arguments
        this.x_speed = 0;
		this.y_speed = 0;
		this.center = {'x': Math.floor((this.size)/2), 'y': Math.floor((this.size)/2)};
		this.tags = [];
		this.holder = holder;

		//set up environment
		$('#'+holder+" .tagsphere").hide();
		$('#'+holder).css({'width': this.size+'px', 'height': this.size+'px'});

		//Add tags to ts
		var $this = this;
		if (options.extjson){
			$.getJSON(options.extjson, function(data){
				data.forEach(function(tag){
					var p = $this.position_to_point($this.random_position());
					if (tag.type=="onclick")
						p.tag = "<a onclick='" + tag.link + "'>" + tag.tag + "</a>";
					else
						p.tag = "<a href='" + tag.link + "'>" + tag.tag + "</a>";
				    $this.tags.push(p);
				});
			}).promise().done(function(){return $this.init();});
		} else {
			$('#'+holder+" .tagsphere > li").each(function () {
				var p = $this.position_to_point($this.random_position());
				p.tag = $(this).html();
			    $this.tags.push(p);
			});
			$this.init();
		}
		//Repeats the rotate function, which updates
        return this;
    };
    $tagsphere.fn = $tagsphere.prototype = {
    init: function(){
 		//add tags
		//determine the largest tag width to ensure tags don't extend beyond the boundaries of the circle.
		//this relies on the width property of the span element, and using padding to compensate half of the largest width
		var max_width=0;
		var $this = this;
		this.tags.forEach(function (tag, i) {
		    $('#'+$this.holder).append('<span class="tstag" id="tstag-'+i+'">' + tag.tag + '</span>');
		    $('#'+$this.holder+' #tstag-'+i).css({'margin-left':tag.x+'px', 'margin-top': tag.y+'px', 'font-size': $this.BIGGEST_SIZE+'px'});
			tag.width = $('#'+$this.holder+' #tstag-'+i).width();
			if (tag.width > max_width){
				max_width = tag.width;
			}
			$this.distance_styling(tag);
		});
		//now that we've acquired max_width ... 
		$('#'+this.holder).css('padding', max_width/2);
		this.max_width = max_width;
		this.center.x+=max_width/2;
		this.center.y+=max_width/2;
		$('#'+this.holder+' .tstag').css({'left': this.center.x+'px', 'top': this.center.y+'px'});

		// Handling mouse tracking
		var $this=this;
		$(document).mousemove(function(e){
		    var $holder = $('#'+$this.holder);
		    var div_x = e.pageX - $holder.offset().left;
		    var div_y = e.pageY - $holder.offset().top;
		    var inside_y = (div_y  > 0 && div_y < $holder.outerHeight());
		    var inside_x = (div_x  > 0 && div_x < $holder.outerWidth());

		    // If the mouse is inside the div
		    if (inside_x && inside_y){
		    	$this.x_speed = (($this.options.mousespeed) ? $this.options.mousespeed : 1)*(div_x - $this.center.x)/$holder.outerWidth();
		    	$this.y_speed = -1*(($this.options.mousespeed) ? $this.options.mousespeed : 1)*(div_y - $this.center.y)/$holder.outerHeight();
		    } else {

		    	// Handles slowing of tags after mouse leaves
		    	if (Math.abs($this.x_speed) > .1 || Math.abs($this.y_speed) > .1){
		    		$this.y_speed/=2
		    		$this.x_speed/=2;
		    	}
		    }
		});
		var $this = this;
		setInterval(function(){$this.rotate($this)}, ($this.options.refresh) ? $this.options.refresh : 100);
		return this;	

    },
    //Generate a random latitude and longitude 
	random_position: function(){
		var point = {};
		point.lon = Math.random()*2*Math.PI;
		point.lat = Math.random()*2*Math.PI;
		return point;
	},

	//Converts latitude and longitude to a 3d point on the sphere
    position_to_point: function(point){
		var rad = this.size/2;
	    point.x = -1 * rad * Math.sin(point.lat);
	    point.y = (rad) * Math.sin(point.lon) * Math.cos(point.lon);
	    point.z = -1 * rad * Math.cos(point.lat) * Math.cos(point.lon);
	    point.x = point.x.toFixed(2);
	    point.y = point.y.toFixed(2);
	    point.z = point.z.toFixed(2);
	    return point;
	},

	//Styles the tag based on depth
    distance_styling: function(point){
    	var calculated_opacity = (.05+1.5*Math.max((point.z+this.size/2)/(this.size), 0));
		var color_str = "rgba(0,0,0, "+calculated_opacity.toFixed(4)+")";
		var calculated_size = (this.BIGGEST_SIZE - this.SMALLEST_SIZE) *(point.z+this.size/2)/(this.size) + this.SMALLEST_SIZE;
		var size_str = calculated_size.toFixed(2) +  "px";
		return {'color': color_str, 'font-size': size_str};
    },

    //handles updating and mechanizes rotation
	rotate: function($this){
	    $this.tags.forEach(function(t, i){
			t.lat+=$this.x_speed/Math.PI;
			t.lat %= 2*Math.PI;
			t.lon+=$this.y_speed/Math.PI; 
			t.lon %= 2*Math.PI;
			t = $this.position_to_point(t);
			t.width = $('#'+$this.holder+' #tstag-'+i).width();
			t.height = $('#'+$this.holder+' #tstag-'+i).height();
			var newleft = $this.center.x-t.width/2;
			var newtop = $this.center.y-t.height/2;
			$('#'+$this.holder+' #tstag-'+i).css({'left': newleft+'px', 'top': newtop+'px', 'margin-left':t.x+'px', 'margin-top': t.y+'px'});
	        $('#'+$this.holder+' #tstag-'+i + ' a').css($this.distance_styling(t));
		});
	},
    };
    window.$tagsphere = $tagsphere;
})(window);