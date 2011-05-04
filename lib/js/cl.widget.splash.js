CL.widget.splash = (function () {
	var c = { // config
		$module: $(".wSplash"),
		dateDeliminator:"/",
		dates: {},
		ibeUrl: {},
		ibookUrl: {},
		debug : false,
		calOutbound : null,
		calInbound : null,
		activeBooking: null, // ibook | ibe | illegal  --> only valid when appState = during
		activeTriptype: null // oneway | return | returnCruise | daytrip (just for internal SPLASH use)
	},
	config = CL.widget.splash.config, // dependant on this 

	init = function() {
		if(config.modules === "undefined"){
			return false;
		}
		c.debug = (config.debug == "true") ? true : false;

		initAppState(); // define dates and whatnot

		// decode the urls coming into the splash screen
		c.ibeUrl = decodeUrl(config.ibeUrl);
		c.ibookUrl = decodeUrl(config.ibookUrl);
		c.activeTriptype = config.tripType;

		if(!(c.ibeUrl.OutboundOrigin == "OSL" || c.ibeUrl.OutboundOrigin == "KEL") && c.activeTriptype == "returnCruise" ){
			c.activeTriptype = "daytrip";
		}
		initCal(); // set up datepickers based on traveltype
		initEvents(); // add event handlers for the buttons
		updateActiveBooking();
	},

	initAppState = function(){
		c.dates.today = makeDateObj(config.dates.today);
		c.dates.cutA = makeDateObj(config.dates.migrationDateA);
		c.dates.cutB = makeDateObj(config.dates.migrationDateB);
		c.dates.bndA = (config.dates.startBoundary) ? makeDateObj(config.dates.startBoundary) : c.dates.today;
		c.dates.bndB = (config.dates.endBoundary) ? makeDateObj(config.dates.endBoundary) : new Date(c.dates.today.getFullYear(),c.dates.today.getMonth()+12,c.dates.today.getDate());
		c.dates.calA = (c.dates.bndA > c.dates.today) ? c.dates.bndA : c.dates.today;
		c.dates.calB = (c.dates.bndB) ? c.dates.bndB : new Date(c.dates.today.getFullYear(),c.dates.today.getMonth()+12,c.dates.today.getDate());

		if(c.dates.calA < c.dates.cutA){
			c.activeBooking = "ibook";
			c.$module.addClass("ibook");
		}else if(c.dates.calA >= c.dates.cutA && c.dates.calB <c.dates.cutB){
			c.activeBooking = "ibook";
			c.$module.addClass("ibook");
		}else if(c.dates.calA >= c.dates.cutB){
			c.activeBooking = "ibe";
			c.$module.addClass("ibe");
		}
	},

	// move to CL.common
	// TO DO: make more robust if no params in url
	decodeUrl = function(url){
		var aUrl = [],
			aParams = [],
			param = '',
			len = 0,
			i = 0,
			newUrl = {},
			hasPar = (url.indexOf("?") !== -1) ? true : false;

		if(hasPar){
			aUrl = url.split("?");
			aParams = aUrl[1].split("&");
			len = aParams.length;
			for (i=0;i<len;i++) {
				param = aParams[i].split("=");
				newUrl[param[0]] = unescape(param[1]);
			}
			newUrl.baseUrl = aUrl[0];
		}else{
			newUrl.baseUrl = url;
		}
		return newUrl;
	},

	// this is a duplicate from BE module, move to CL.common

	makeDateObj = function(str){
		var s = str.split(c.dateDeliminator);
		return new Date(s[2],(Number(s[1])-1),s[0]);
	},

	formatDate = function(str,format){
		var s = str.split("/");
		if(format === "ibe"){
			return s[0]+"/"+s[1]+"/"+s[2].substring(2,4);
		}else if(format === "ibook"){
			return s[2].substring(2,4)+s[1]+s[0];
		}else{
			return new Date(s[2],(Number(s[1])-1),s[0]);
		}
	},

	initCal = function(){
		$.datepicker.setDefaults({
			dateFormat: 'dd/mm/yy',
			numberOfMonths: 1,
			firstDay: 1,
			showOtherMonths: true,
			selectOtherMonths: true
		});

		// outbound calendar
		c.calOutbound = c.$module.find("#SplashOutbound").datepicker({
			minDate: c.dates.calA,
			maxDate:c.dates.calB,
			onSelect: function( selectedDate ) {
				updateCal("out");
				updateActiveBooking();
			}
		});
		c.calOutbound.datepicker("setDate",c.dates.calA);

		// inbound calendar
		if(c.activeTriptype !== "oneway"){
			var tt = c.activeTriptype,
				calB = null,
				addDays = 0;
			if(tt === "return" || tt === "returnCruise"){addDays = 1;}
			calB = new Date(c.dates.calA.getFullYear(),c.dates.calA.getMonth(),c.dates.calA.getDate()+addDays);
			c.calInbound = c.$module.find("#SplashInbound").datepicker({
				minDate: c.dates.calA,
				maxDate: c.dates.calB,
				onSelect: function(){
					updateCal("in");
					updateActiveBooking();
				}
			});
			c.calInbound.datepicker("setDate",calB);
			c.$module.find(".inBoundHeader").show();
			var dateA = c.calOutbound.datepicker("getDate");
			if(c.activeTriptype === "returnCruise"){
				c.calInbound.datepicker("option","minDate", dateA);
				dateA.setDate(dateA.getDate()+1);
				c.calInbound.datepicker("option","maxDate", dateA);
			}else if(c.activeTriptype === "return" && (c.ibeUrl.OutboundOrigin == "OSL" || c.ibeUrl.OutboundOrigin == "KEL")){
				dateA.setDate(dateA.getDate()+1);
				c.calInbound.datepicker("setDate",dateA);
				c.calInbound.datepicker("option","minDate", dateA);
			}else if(c.activeTriptype === "return" && (c.ibeUrl.OutboundOrigin != "OSL" || c.ibeUrl.OutboundOrigin != "KEL")){
				c.calInbound.datepicker("option","minDate", dateA);
			}else if(c.activeTriptype === "daytrip"){
				c.calInbound.datepicker("option","maxDate", dateA);
			}
		}
	},

	updateCal = function(clicked){
		if(c.activeTriptype !== "oneway"){
			var dateA = c.calOutbound.datepicker("getDate"),
				dateB = c.calInbound.datepicker("getDate"),
				calIn = c.calInbound,
				calOut = c.calOutbound;
			if(clicked === "out"){
				calIn.datepicker("option","minDate", dateA);
				if(c.activeTriptype === "return" && (c.ibeUrl.OutboundOrigin == "OSL" || c.ibeUrl.OutboundOrigin == "KEL")){
					dateA.setDate(dateA.getDate()+1);
					if(dateA >= dateB){
						calIn.datepicker("setDate",dateA);
					}
					calIn.datepicker("option","minDate", dateA);
				}else if(c.activeTriptype === "return" && (c.ibeUrl.OutboundOrigin != "OSL" || c.ibeUrl.OutboundOrigin != "KEL")){
					if(dateA > dateB){
						calIn.datepicker("setDate",dateA);
					}
				}else if(c.activeTriptype === "returnCruise"){
					dateA.setDate(dateA.getDate()+1);
					calIn.datepicker("setDate",dateA);
					calIn.datepicker("option","maxDate", dateA);
				}else if(c.activeTriptype === "daytrip"){
					calIn.datepicker("setDate",dateA);
					calIn.datepicker("option","maxDate", dateA);
				}
			}else{ //clicked = in
				if(c.activeTriptype === "return"){
					if(dateA > dateB){
						dateB.setDate(dateB.getDate()-1);
						calOut.datepicker("setDate",dateB);
					}
				}else if(c.activeTriptype === "returnCruise"){
					dateB.setDate(dateB.getDate()-1);
					calOut.datepicker("setDate",dateB);
				}else if(c.activeTriptype === "daytrip"){
					calOut.datepicker("setDate",dateB);
				}
			}
		}
	},

	updateActiveBooking = function(){
		var dateA = c.calOutbound.datepicker("getDate");
	   if(c.activeTriptype !== "oneway"){
			var dateB = c.calInbound.datepicker("getDate");
		}
		if(c.activeTriptype !== "oneway"){
			if(dateA < c.dates.cutB && dateB < c.dates.cutB){
				c.activeBooking = "ibook";
				c.$module.addClass("ibook").removeClass("ibe").removeClass("illegal");
			}else if(dateA >= c.dates.cutB && dateB >= c.dates.cutB){
				c.activeBooking = "ibe";
				c.$module.addClass("ibe").removeClass("ibook").removeClass("illegal");
			}else{
				c.activeBooking = "illegal";
				c.$module.addClass("illegal").removeClass("ibook").removeClass("ibe");
			}
		}else{
			if(dateA < c.dates.cutB){
				c.activeBooking = "ibook";
				c.$module.addClass("ibook").removeClass("ibe");
			}else if(dateA >= c.dates.cutB){
				c.activeBooking = "ibe";
				c.$module.addClass("ibe").removeClass("ibook");
			}
		}
	},

	initEvents = function(){
		c.$module.find("#SplashSubmit")
			.click(function(e){
         	e.preventDefault();
				if(c.activeBooking === "ibe"){
					submitIbe();
					return false;
				}else if(c.activeBooking === "ibook"){
					submitIbook();
				}else{
					c.$module.find(".errorMsg").fadeIn("slow");
				}
			});
		c.$module.find("#SplashError")
			.click(function(e){
         	e.preventDefault();
				c.$module.find(".errorMsg").fadeOut("slow");
			});
	},

	submitIbe = function(){
		var o = c.ibeUrl,
			url = o.baseUrl,
			split = "",
			i = 0,
			calOut = c.calOutbound.datepicker("getDate"),
			calOutDate = $.datepicker.formatDate('dd/mm/y', calOut);
		if(c.activeTriptype !== "oneway"){
			var calIn = c.calInbound.datepicker("getDate"),
				calInDate = $.datepicker.formatDate('dd/mm/y', calIn);
		}

		for (var x in o) {
			if (o.hasOwnProperty(x) && x !== "baseUrl") {
				split = (i === 0) ? "?" : "&";
				if(x==="OutboundDate"){
					o[x] = calOutDate;
				}
				if(x==="InboundDate" && c.activeTriptype !== "oneway"){
					o[x] = calInDate;
				}
				url += split+x+"="+o[x];
				i++;
			}
		}
		if(typeof o.OutboundDate === "undefined"){
			url+="&OutboundDate="+calOutDate;
		}
		if(c.activeTriptype !== "oneway"){
			if(typeof o.InboundDate === "undefined"){
				url+="&InboundDate="+calInDate;
			}
		}
		if(c.debug){
			alert(url);
		}
		location.href = url;
	},

	submitIbook = function(){
		var o = c.ibookUrl,
			url = o.baseUrl,
			split = "?",
			i = 0,
			calOut = c.calOutbound.datepicker("getDate"),
			calOutDate = $.datepicker.formatDate('ymmdd', calOut);
		if(c.activeTriptype !== "oneway"){
			var calIn = c.calInbound.datepicker("getDate"),
				calInDate = $.datepicker.formatDate('ymmdd', calIn);
		}

		for (var x in o) {
			if (o.hasOwnProperty(x) && x !== "baseUrl") {
				split = (i === 0) ? "?" : "&";
				if(x==="dato_ut"){
					o[x] = calOutDate;
				}
				if(x==="dato_hjem" && c.activeTriptype !== "oneway"){
					o[x] = calInDate;
				}
				url += split+x+"="+o[x];
				i++;
			}
		}
		if(typeof o.dato_ut === "undefined"){
			url+=split+"dato_ut="+calOutDate;
			split="&"
		}
		if(c.activeTriptype !== "oneway"){
			if(typeof o.dato_hjem === "undefined"){
				url+=split+"dato_hjem="+calInDate;
			}
		}
		if(c.debug){
			alert(url);
		}
		location.href = url;
	};

	//$(document).ready(function(){
		init();
	//});

	return{
		jsConfig: c,
		cmsConfig: config
	};
}());