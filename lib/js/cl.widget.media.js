CL.widget.media = (function(){
	var c = {
		$widget : $(".wMedia"),
		$video : null,
		$images : null,
		$panorama : null,
		activeMedia : null // video | images | panorama
	};

	var init = function() {
		c.$video = c.$widget.find(".media.video");
		c.$images = c.$widget.find(".media.images");
		c.$panorama = c.$widget.find(".media.panorama");

		c.$widget.find(".mediaNav").tabs(c.$widget.find(".mediaTabs>.media"));

		if(c.$widget.hasClass("video")){
			c.$widget.find(".mediaNav>.video").click();

		}else if(c.$widget.hasClass("images")){
			c.$widget.find(".mediaNav>.images").click();

		}else if(c.$widget.hasClass("panorama")){
			c.$widget.find(".mediaNav>.panorama").click();
		}

		if(c.$video.size() > 0){video();}
		if(c.$images.size() > 0){images();}
		if(c.$panorama.size() > 0){panorama();}
	};

	var video = function(){
		var videoplayer = c.$video.find(".player")
			.flowplayer(
			{
				src: "/lib/swf/flowplayer-3.2.7.swf",
				wmode: 'opaque',
				version: [9, 115],
				onFail: function()  {
					c.$video.find(".player").text =
						"You need the latest Flash version to view MP4 movies. " +
						"Your version is " + this.getVersion()
					;
				}
			},{
				clip: {
					url: c.$video.data("src"),
					autoplay: false,
					autoBuffering: true
				}
			})
			.hover(function() {
				c.$video.find(".bg").show();
				c.$video.find(".info").show();
			}, function() {
				c.$video.find(".bg").hide();
				c.$video.find(".info").hide();
			});

	};

	var images = function(){
		var imageGallery = c.$images
			.scrollable({
				circular: true,
				mousewheel: true,
				speed:600,
				keyboard: 'static'
			})
			.autoscroll({
				interval: 4000,
				autopause: false
			})
			.hover(function(){
				var $that = $(this);
				$that.find(".bg").fadeTo("fast",0.4,function(){
      			$that.find(".info").show();
      			$that.find(".nav").show();
    			});
			}, function() {
				$(this).find(".info").hide();
				$(this).find(".nav").hide();
				$(this).find(".bg").fadeOut("fast");
			})
			.delegate(".items a", "click", function(e){
				e.preventDefault();
			});

			/* events for not built-in controls: */
			c.$images.find(".play").click(function(e){
				e.preventDefault();
				imageGallery.data("scrollable").play();
				$(this).hide();
				c.$images.find(".pause").show();
			});
			c.$images.find(".pause").click(function(e){
				e.preventDefault();
				imageGallery.data("scrollable").pause();
				$(this).hide();
				c.$images.find(".play").show();
			});
			c.$images.find(".fullscreen").click(function(e){
				var activeImg = imageGallery.data("scrollable").getIndex(),
					$lowres = imageGallery.data("scrollable").getItems().clone();

				e.preventDefault();

				$("#Lightbox").overlay({
					mask: '#0b315f',
					load: true,
					onBeforeLoad: function() {
						var h = 760,
							w = 1280,
							hMax = $(window).height(),
							wMax = $(window).width(),
							hLb = 0,
							wLb = 0,
							wImg = 1280;
						if(h<=hMax){
							if(w<=wMax){
								hLb = h;
						      wLb = w;
							}else{
								wLb = w;
								hLb = wLb*(9/16)+40;
							}
						}else{
							if(w<=wMax){
								hLb = hMax;
						      wLb = hLb*(16/9);
							}else{
								wLb = wMax;
								hLb = wLb*(9/16)+40;
							}
						}
						wImg = wLb;

						$lowres.each(function(){
							$(this)
								.removeAttr("rel")
								.find("img")
									.attr("src",$(this).attr("href"))
									.attr("width",wImg);
						});

						$("#Lightbox")
							.height(hLb)
							.width(wLb)
							.find(".wrapper")
							.addClass("wGallery")
							.html($lowres)
							.wrapInner("<div class='items'></div>")
							.append("<button class='prev'></button><button class='next'></button>")
							.scrollable({
								circular: true,
								mousewheel: true,
								speed:300,
								keyboard: 'static'
							})
							.autoscroll({
								interval: 4000,
								autoplay: false,
								autopause: false
							})
							.delegate(".items a", "click", function(e){
								e.preventDefault();
							});

					}
				});

			});

	};

	var panorama = function(){
		c.$panorama.find(".player").flashembed("/lib/swf/krpano.swf", {
			xml: c.$panorama.data("src")
		});
	};

	$(document).ready(function(){
		init();
	});

	return{
		config: c
	};
}());