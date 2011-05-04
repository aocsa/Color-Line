/**
 * --------------------------------------------------------------------
 * CL.widget.ticker
 * Author: Ole Aasen, ole.aasen@colorline.no
 * Copyright (c) 2010 Color Line AS
 * licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * --------------------------------------------------------------------
 */

CL.widget.ticker = (function () {
	var c = { // internal config
   	$widget : $(".wTicker")
	};

	c.$widget.each(function(index) {

		var items = $(this).find(".item"),
			maxHeight = 0;

		items.each(function(){
			if($(this).height() > maxHeight){
				maxHeight = $(this).height();
			}
		});

		if($(this).hasClass("size3col")){
			$(this).height(maxHeight+50);
			$(this).find(".item").height(maxHeight+50);
		}else{
			$(this).height(maxHeight+10);
			$(this).find(".item").height(maxHeight+10);
		}


		if($(this).find("section").size() > 1){
			var ticker = $(this).scrollable({
				circular: true,
				speed:600,
				vertical: true
			}).autoscroll(5000);
		}
  });


	return{
		config: c
	};
}());