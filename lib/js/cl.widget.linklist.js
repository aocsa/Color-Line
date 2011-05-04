CL.widget.linklist = (function(){
	var c = { // internal config
   	$widget : $(".wLinklist>li")
	};

	c.$widget.find("a").each(function(index) {
		if($(this).attr("target") === "_blank"){
			$(this).parent().addClass("external");
		}
	});

	return{
		config: c
	};
}());