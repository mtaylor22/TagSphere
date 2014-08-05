(function (window, options, callback) {
	var $tagsphere = function (holder, options, callback) {
        if ( window === this ) {
            return new $tagsphere(holder, options, callback);
        }
        //options processing
        this.options = options;
        this.callback = callback;
        if (options.border) $('#'+holder).css("border-width", "20px"); else if (options.border == false) $('#'+this.holder).css("border-width", "");
        if (options.bordercolor)  $('#'+holder).css("border-color", options.bordercolor);
        if (options.borderwidth) $('#'+this.holder).css("border-width", options.borderwidth);
        if (options.backgroundcolor)  $('#'+holder).css("background-color", options.backgroundcolor);
       	if (options.tag){
       		if (options.tag.font) $('#'+holder + ' .tstag').css('font-family', options.tag.font);
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
			return($this.init());
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

		this.start();
		if (this.callback) this.callback();
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
    	var color = (this.options.color) ? hexToRgb(this.options.color): hexToRgb("000");
		var color_str = "rgba("+color.r+","+color.g+","+color.b+", "+calculated_opacity.toFixed(4)+")";
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
			$('#'+$this.holder+' #tstag-'+i).css({'left': newleft+'px', 'top': newtop+'px', 'margin-left':t.x+'px', 'margin-top': t.y+'px', 'z-index':Math.round(t.z)});
	        $('#'+$this.holder+' #tstag-'+i + ' a').css($this.distance_styling(t));
		});
	},

	//stops rotation
	stop: function(){
		if (this.interval){
			clearInterval(this.interval);
			this.interval = undefined;
		}
		return this;
	},
	//stops rotation
	start: function(){
		var $this = this;
		this.interval = setInterval(function(){$this.rotate($this)}, ($this.options.refresh) ? $this.options.refresh : 100);
		return this;
	},
	//destroy items
	clear: function(callback){
		this.tags=[];
		$('#'+this.holder+' .tstag').fadeOut().promise().done(function(){this.remove();if (callback) callback();});
		return this;
	},
	load: function(url){
		var $this = this;
		$.getJSON(url, function(data){
			data.forEach(function(tag){
				var p = $this.position_to_point($this.random_position());
				if (tag.type=="onclick")
					p.tag = "<a onclick='" + tag.link + "'>" + tag.tag + "</a>";
				else
					p.tag = "<a href='" + tag.link + "'>" + tag.tag + "</a>";
			    $this.tags.push(p);
			});
		});
		return this.init();
	},
	//update TagSphere with new options
	update: function(options){
		this.options = options;
        if (options.border) $('#'+this.holder).css("border-width", "20px"); else if (options.border == false) $('#'+this.holder).css("border-width", "");
        if (options.borderwidth) $('#'+this.holder).css("border-width", options.borderwidth);
        if (options.bordercolor)  $('#'+this.holder).css("border-color", options.bordercolor);
        if (options.backgroundcolor)  $('#'+this.holder).css("background-color", options.backgroundcolor);
       	if (options.tag){
       		if (options.tag.font) $('#'+this.holder + ' .tstag').css('font-family', options.tag.font);
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
		this.center = {'x': Math.floor((this.size)/2), 'y': Math.floor((this.size)/2)};
		$('#'+this.holder).css({'width': this.size+'px', 'height': this.size+'px'});
		var $this = this;
		this.stop();
		$('#'+this.holder+' .tstag').fadeOut().promise().done(function(){this.remove();$this.init()});
	}
    };
    window.$tagsphere = $tagsphere;
})(window);

/*
	Thanks to Tim Down @ StackOverflow
	http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
*/
function hexToRgb(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}