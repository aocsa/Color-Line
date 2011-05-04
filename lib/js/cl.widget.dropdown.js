CL.widget.dropdown = (function (){
	var c = { // config
		elmClass : "wDropdown",
		$elm : $(".wDropdown"),
		contentPostfix : "Content"
	};

	if(typeof c.$elm === "undefined"){return false;}

	c.$elm.each(function(){
		var arrClasses = $(this).attr("class").split(" "),
			i = 0,
			length = arrClasses.length,
			$tmp = null,
			$content = null;

		for(i=0;i<length;i++){
			$tmp = $("."+arrClasses[i]+c.contentPostfix);
			if(arrClasses[i] !== c.elmClass && $tmp.size() > 0){
				$content = $tmp;
				$content.css({
					"left": $(this).position().left + "px",
					"top": ($(this).height()+$(this).position().top-5) + "px"
				});
				break;
			}
		}

		$(this).find("a").click(function(e){
			e.preventDefault();
			$content.fadeToggle("slow");
		});
	});

	return{
		config: c
	};
}());