/**
 * --------------------------------------------------------------------
 * CL.widget.lightbox
 * Author: Ole Aasen, ole.aasen@colorline.no
 * Copyright (c) 2010 Color Line AS
 * licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * --------------------------------------------------------------------
 */

CL.widget.lightbox = (function () {
	$(".wLightbox").overlay({
		mask: '#0b315f',
		onBeforeLoad: function() {
			var wrap = this.getOverlay().find(".wrapper");
			wrap.load(this.getTrigger().attr("href"));
		}
	});
	
	return{
		//method2: method2
	};
}());
