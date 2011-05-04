/**
 * --------------------------------------------------------------------
 * CL.widget.slideshow
 * Author: Ole Aasen, ole.aasen@colorline.no
 * Copyright (c) 2010 Color Line AS
 * licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * --------------------------------------------------------------------
 */

CL.widget.slideshow = (function () {
	var c = { // internal config
   	$widget : $(".wSlideshow")
	};
	$(c.$widget).scrollable({
		circular: true
	}).autoscroll(5000);
	return{
		config: c
	};
}());