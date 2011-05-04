/**
 * --------------------------------------------------------------------
 * CL.widget.booking aka bookingElement
 * Author: Ole Aasen, ole.aasen@colorline.no
 * Copyright (c) 2010 Color Line AS
 * licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * --------------------------------------------------------------------
 */
CL.widget.booking = (function (){
	var c = { // internal config
		appState : null, // before | during | after
		$module : $(".wBooking"),
		debug : false,
		dates: {
			today: null,
			cutA : null,
			cutB : null,
			calA : null,
			calB : null
		},
		calOutbound : null,
		calInbound : null,
		agent : {
			valid: false,
			active: false
		},
		dateDeliminator:"/",
		activeBooking : null, // ibook | ibe | illegal  --> only valid when appState = during
		activeTriptype: null, // oneway | return | returnCruise | daytrip (internal use, really returnCruise) | allinc (internal use, really returnCruise + param AllInclusive)
		activeRoute: null // OSL|KEL | KEL|OSL | LAR|HIR | HIR|LAR | KRS|HIR | HIR|KRS | SAD|SMD | SMD|SAD
	},
	config = CL.widget.booking.config, // dependant on this

	makeDateObj = function(str){
		var s = str.split(c.dateDeliminator);
		return new Date(s[2],(Number(s[1])-1),s[0]);
	},

	initAppState = function(){
		var parentH = c.$module.parent().height();
		// active modules states
		if(config.modules.agent){c.$module.addClass("agent");c.agent.active=true;}
		if(config.modules.systemDown){c.$module.addClass("system-down");}
		if(config.modules.cc){c.$module.addClass("cc");}

		// width state
		if(c.$module.width() > 350){c.$module.addClass("wide-state");}
		else if(c.$module.width() <= 350 && c.$module.width() >= 180){c.$module.addClass("normal-state");}
		else if(c.$module.width() < 180){c.$module.addClass("narrow-state");}
		//alert("parent: "+parentH+" , bookingelement: "+c.$module.height());
		//if(parentH > 365){c.$module.find("form").height(c.$module.parent().height()-35);}

		// current date period
		c.dates.cutA = makeDateObj(config.dates.migrationDateA);
		c.dates.cutB = makeDateObj(config.dates.migrationDateB);
		c.dates.today = makeDateObj(config.dates.today);
		c.dates.calA = c.dates.today;
		c.dates.calB = c.dates.today;

		if(c.dates.today < c.dates.cutA){
			c.appState = "before";
			c.activeBooking = "ibook";
			c.$module.addClass("ibook");
		}else if(c.dates.today >= c.dates.cutA && c.dates.today < c.dates.cutB){
			c.appState = "during";
			c.activeBooking = "ibook";
			c.$module.addClass("ibook");
		}else if(c.dates.today >= c.dates.cutB){
			c.appState = "after";
			c.activeBooking = "ibe";
			c.$module.addClass("ibe");
		}
		c.activeTriptype = c.$module.find("input[name='BEtriptype']:checked").val();
		c.$module.addClass(c.activeTriptype);
	},

	initRoute = function(){
		var outElm = "",
			outElms = "",
			inElm = "",
			inElms = "",
			outSel= "",
			inSel= "",
			selHtml= "selected='selected'",
			routes = config.routes.length,
			n;
		for (var i=0;i<routes;i++){
			if(config.routes[i].ibeCode){
				if(config.defaultRoute == config.routes[i].id){
					outSel = selHtml;
					updateRoute(config.routes[i].ibeCode);
				}else{
					outSel = "";
				}
				//outSel = (BEconfig.defaultRoute === BEconfig.routes[i].id) ? selHtml : '';
				outElm = $('<option value="'+config.routes[i].id+'" '+outSel+'>'+config.routes[i].name+'</option>');
				outElm.data("c",config.routes[i]);
				c.$module.find('#BEoutboundRoute').append(outElm);
			}
		}
		for (i=0;i<routes;i++){
			if(config.routes[i].ibeCode){
				inSel = (c.$module.find("select option:selected").val() === config.routes[i].returnRoute) ? selHtml : '';
				inElm = $('<option value="'+config.routes[i].id+'" '+inSel+'>'+config.routes[i].name+'</option>');
				inElm.data("c",config.routes[i]);
				c.$module.find('#BEinboundRoute').append(inElm);
			}
		}
	},

	initCal = function(){
		// outbound calendar
		c.calOutbound = c.$module.find('#BEoutboundDate')
			.datepicker({
				dateFormat: 'dd/mm/yy',
				numberOfMonths: 2,
				firstDay: 1,
				minDate: c.dates.today,
				maxDate: "+12M",
				onSelect:function(){
					updateCal();
					updateActiveBooking();
					updateTriptype();
				}
			});
		c.calOutbound.datepicker("setDate",c.dates.calA);

		// inbound calendar
		var tt = c.activeTriptype,
			calB = null,
			addDays = 0;
		calB = new Date(c.dates.calA.getFullYear(),c.dates.calA.getMonth(),c.dates.calA.getDate()+addDays);
		c.calInbound = c.$module.find('#BEinboundDate')
			.datepicker({
				dateFormat: 'dd/mm/yy',
				numberOfMonths: 2,
				firstDay: 1,
				minDate: calB,
				maxDate: "+12M",
				onSelect: function(){
					updateActiveBooking();
				}
			});
		c.calInbound.datepicker("setDate",calB);
	},

	initEvents = function(){
		c.$module.find("#BEoutboundRoute")
			.change(function(){
				updateTriptype();
				updateIbook();
				updateCal();
			})
			.trigger('change');
		c.$module.find("#BEagentCode")
			.change(function(){
				validateAgent();
			});
		c.$module.find("#BEtriptype").delegate("input", "change", function(){
			updateTriptype();
			updateIbook();
			updateCal();
			updateActiveBooking();
		});
		c.$module.find("#BEagentError a,#BEsubmitError a")
			.click(function(e){
         	e.preventDefault();
				$(this).parent().parent().fadeOut("slow");
			});
		c.$module.find("#BEsubmitBtn")
			.click(function(e){
         	e.preventDefault();
				if(c.activeBooking === "ibook"){
					submitIbook();
				}else{
					submitIbe();
				}
			});
		c.$module.find("#BEttr > input").trigger("click");
		if(c.$module.hasClass("wide-state")){
			c.$module.find("h2")
				.click(function(e){
					//e.preventDefault();
					c.$module.find('#BEform').fadeToggle("slow");
				});
		}
	},

	updateIbook = function(){
		if(c.activeBooking === "ibook"){
			var outboundVal = $(c.$module).find("#BEoutboundRoute").val(),
				noPackages = config.packages.length,
				pack = "",
				packages = "",
				triptype = c.$module.find("#BEtriptype input[name='BEtriptype']:checked").val();
			c.$module.find('#BEibookTravelPackages').children().remove();
			for(var i = 0;i<noPackages;i++){
				var validPack = (triptype === "return" || (config.packages[i].returntrip === "false" && triptype === "oneway")) ? true : false;
				if(config.packages[i].routeId === outboundVal && validPack){
					pack = $('<option value="'+config.packages[i].productId+'">'+config.packages[i].name+'</option>');
					pack.data("c",config.packages[i]);
					c.$module.find('#BEibookTravelPackages').append(pack);
				}
			}
		}
	},

	updateCal = function(){
		var dateA = c.calOutbound.datepicker("getDate"),
			dateB = c.calInbound.datepicker("getDate"),
			calIn = c.calInbound,
			calOut = c.calOutbound;

		calIn.datepicker("option","minDate", dateA);
		if(c.$module.hasClass("cruise")){
			if(c.activeTriptype === "return"){
				dateA.setDate(dateA.getDate()+1);
				if(dateA >= dateB){
					calIn.datepicker("setDate",dateA);
				}
				calIn.datepicker("option","minDate", dateA);
			}else if(c.activeTriptype === "oneway"){
				calIn.datepicker("setDate",dateA);
			}else if(c.activeTriptype === "returnCruise"){
				dateA.setDate(dateA.getDate()+1);
				calIn.datepicker("setDate",dateA);
			}else if(c.activeTriptype === "allinc"){
				dateA.setDate(dateA.getDate()+1);
				calIn.datepicker("setDate",dateA);
			}

		}else if(c.$module.hasClass("superspeed") || c.$module.hasClass("sweden") ){
			if(c.activeTriptype === "return"){
				if(dateA > dateB){
					calIn.datepicker("setDate",dateA);
				}
			}else if(c.activeTriptype === "oneway"){
				calIn.datepicker("setDate",dateA);
			}else if(c.activeTriptype === "daytrip"){
				calIn.datepicker("setDate",dateA);
			}
		}
	},

	updateActiveBooking = function(){
		var dateA = c.calOutbound.datepicker("getDate"),
			dateB = c.calInbound.datepicker("getDate");

		if(c.appState === "during"){
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
		}
	},

	updateRoute = function(val){
		var $outboundChosen = c.$module.find("#BEoutboundRoute option:selected"),
			activeRoute = (val) ? val : $outboundChosen.data("c").ibeCode;
		c.activeRoute = activeRoute;
		c.$module.find("#BEinboundRoute>option[disabled],#BEinboundRoute, #BEinboundDate").removeAttr("disabled");

		if(activeRoute.indexOf("OSL") !== -1){ // cruise
			c.$module.addClass("cruise").removeClass("superspeed").removeClass("sweden");
			if (c.activeTriptype == "daytrip"){
				c.$module.find("#BEttr > input").trigger("click");
				updateTriptype();
			}
			if(c.activeTriptype == "returnCruise" || c.activeTriptype == "allinc"){
				c.$module.find("#BEinboundRoute, #BEinboundDate").attr("disabled","disabled");
			}
			c.$module.find("#BEinboundRoute>option").each(function(){
				if($(this).data("c").returnRoute === $outboundChosen.val()){
					$(this).attr("selected","selected");
				}else{
					$(this).attr("disabled","disabled");
				}
			});
		}else if(activeRoute.indexOf("HIR") !== -1){ // superspeed
			c.$module.addClass("superspeed").removeClass("cruise").removeClass("sweden");
			if (c.activeTriptype == "returnCruise" || c.activeTriptype == "allinc"){
				c.$module.find("#BEttr > input").trigger("click");
				updateTriptype();
			}
			if(c.activeTriptype == "daytrip"){
				c.$module.find("#BEinboundRoute, #BEinboundDate").attr("disabled","disabled");
			}
			c.$module.find("#BEinboundRoute>option").each(function(){
				if($(this).data("c").returnRoute === $outboundChosen.val()){
					$(this).attr("selected","selected");
				}else if($(this).data("c").ibeCode.indexOf("OSL") !== -1){
					$(this).attr("disabled","disabled");
				}
			});
		}else if(activeRoute.indexOf("SAD") !== -1){ // sweden
			c.$module.addClass("sweden").removeClass("superspeed").removeClass("cruise");
			if (c.activeTriptype == "returnCruise" || c.activeTriptype == "allinc"){
				c.$module.find("#BEttr > input").trigger("click");
				updateTriptype();
			}
			if(c.activeTriptype == "daytrip"){
				c.$module.find("#BEinboundRoute, #BEinboundDate").attr("disabled","disabled");
			}
			c.$module.find("#BEinboundRoute>option").each(function(){
				if($(this).data("c").returnRoute === $outboundChosen.val()){
					$(this).attr("selected","selected");
				}else if($(this).data("c").ibeCode.indexOf("OSL") !== -1){
					$(this).attr("disabled","disabled");
				}
			});
		}
	},

	updateTriptype = function(){
		var trip = c.$module.find("input[name='BEtriptype']:checked").val();
		c.activeTriptype = trip;

		// oneway | return | returnCruise | daytrip | allinc
		c.$module.removeClass("oneway").removeClass("return").removeClass("returnCruise").removeClass("daytrip").removeClass("allinc").addClass(trip);

		if((c.activeTriptype == "daytrip" || c.activeTriptype == "returnCruise" || c.activeTriptype == "allinc") && c.activeBooking == "ibook"){
			c.$module.find("#BEttr > input").trigger("click");
			updateTriptype();
		}
		updateRoute();
	},

	validateAgent = function(){
		$.ajax({
			type: "POST",
			url: "/agent.jsp",
			dataType: "json",
  			cache: false,
			data: "agentId=" + c.$module.find("#BEagentCode").val(),
			success: function(obj){
				// obj contains obj.agentValid & obj.agentName
				if(obj.agentValid){
					c.agent.valid = true;
					c.$module.addClass("agent-valid").removeClass("agent-invalid");
				}else{

					c.$module.addClass("agent-invalid").removeClass("agent-valid");
				}
			},
			error: function(){
				c.$module.addClass("agent-invalid").removeClass("agent-valid");
			}
		});

	},

	displayError = function(errorType){
		if(errorType == "agent"){
			c.$module.find("#BEagentError").fadeIn("medium");
		}else if(errorType == "ibeSubmit"){
			c.$module.find("#BEsubmitError").fadeIn("medium");
		}
	},

	submitIbe = function(){
		var url = config.baseUrlIbe,
			promoCode = c.$module.find("#BEpromoCode>input.bePromoCode").val(),
			outboundDate = $.datepicker.formatDate('dd/mm/y', c.calOutbound.datepicker("getDate")),
			inboundDate = $.datepicker.formatDate('dd/mm/y', c.calInbound.datepicker("getDate")),
			adults = Number(c.$module.find("#BeIbeTravelersAdults").val()),
			children = Number(c.$module.find("#BeIbeTravelersChildren").val()),
			infants = Number(c.$module.find("#BeIbeTravelersInfants").val()),
			seniors = Number(c.$module.find("#BeIbeTravelersStudent").val()),
			vehicles = Number(c.$module.find("#BeIbeVehicles").val()),
			maxPeopleInCabin = 4,
			peopleInCabin = 0,
			adultsInCabin = 0,
			seniorsInCabin = 0,
			childrenInCabin = 0,
			infantsInCabin = 0,
			adultsLeft = adults,
			seniorsLeft = seniors,
			childrenLeft = children,
			infantsLeft = infants,
			peopleLeft = 0,
			totCabins = 0,
			totPeople = 0,
			totLeft = 0,
			i = 1,
			j = 0;

		if(adults>0 || seniors>0) { // should check for a flag for validated promoCode...
			url += "?fromEntryPoint=true&SearchType=X";
			if(c.activeTriptype === "return"){url += "&TripType=return";
			}else if(c.activeTriptype === "oneway"){url += "&TripType=oneway";
			}else if(c.activeTriptype === "returnCruise"){url += "&TripType=returnCruise";
			}else if(c.activeTriptype === "allinc"){url += "&TripType=returnCruise&AllInclusive=true";
			}else if(c.activeTriptype === "daytrip"){url += "&TripType=returnCruise";}

			url += "&OutboundOrigin=" + c.activeRoute.substring(0,3); //
			url += "&OutboundDestination=" + c.activeRoute.substring(4,7);  //
			url += "&OutboundDate=" + outboundDate; // dd/mm/yy
			if(c.$module.hasClass("cruise")){
				totPeople = adults+seniors+children+infants;
				peopleLeft = totPeople;
				totLeft = totPeople;
				totCabins = Math.ceil(totPeople/maxPeopleInCabin);
				url += "&NumCabins=" + totCabins;
				for(i;i<=totCabins;i++){
					peopleInCabin = 0;
					adultsInCabin = 0;
					seniorsInCabin = 0;
					childrenInCabin = 0;
					infantsInCabin = 0;
					while(peopleInCabin<maxPeopleInCabin && peopleLeft){
						if(infantsLeft && (peopleInCabin < maxPeopleInCabin)){
							infantsInCabin++;
							infantsLeft--;
							peopleLeft--;
							peopleInCabin++;
						}
						if(adultsLeft && peopleInCabin < maxPeopleInCabin){
							adultsInCabin++;
							adultsLeft--;
							peopleLeft--;
							peopleInCabin++;
						}
						if(seniorsLeft && peopleInCabin < maxPeopleInCabin){
							seniorsInCabin++;
							seniorsLeft--;
							peopleLeft--;
							peopleInCabin++;
						}
						if(childrenLeft && peopleInCabin < maxPeopleInCabin){
							childrenInCabin++;
							childrenLeft--;
							peopleLeft--;
							peopleInCabin++;
						}
					}
					if(infantsLeft >0 && (!adultsLeft || !seniorsLeft)){
						if(adultsInCabin > 1){
							adultsInCabin--;
							adultsLeft++;
							peopleLeft++;
						}else if(adultsInCabin === 1 && seniorsInCabin === 1){
							adultsInCabin--;
							adultsLeft++;
							peopleLeft++;
						}else if(seniorsInCabin > 1){
							seniorsInCabin--;
							seniorsLeft++;
							peopleLeft++;
						}
					}
					url += "&CabinADT"+i+"=" + adultsInCabin;
					url += "&CabinSEN"+i+"=" + seniorsInCabin;
					url += "&CabinCHD"+i+"=" + childrenInCabin;
					url += "&CabinINF"+i+"=" + infantsInCabin;
				}
			}else{
				url += "&NumADT=" + adults;
				if(seniors>0){url += "&NumSEN=" + seniors;}
				if(children>0){url += "&NumCHD=" + children;}
				if(infants>0){url += "&NumINF=" + infants;}
			}
			if(vehicles>0 && c.activeTriptype != "returnCruise" && c.activeTriptype != "allinc"){
				url += "&NumVehicles="+ vehicles;
				for(i=1;i<=vehicles;i++){
					url += "&VehicleType"+i+"=SCAR" ;
					url += "&VehicleLength"+i+"=5" ;
				}
			}
			if(c.activeTriptype != "oneway"){
				url += "&InboundOrigin=" + c.$module.find("#BEinboundRoute option:selected").data("c").ibeCode.substring(0,3);  //
				url += "&InboundDestination=" + c.$module.find("#BEinboundRoute option:selected").data("c").ibeCode.substring(4,7);  //
				url += "&InboundDate=" + inboundDate; // dd/mm/yy
			}
		}else{
			displayError("ibeSubmit");
			return false;
		}
		if(c.debug){
			alert(url);
		}
		location.href = url;
	},

	submitIbook = function(){
		var url = config.baseUrlIbook + "?",
			promoCode = c.$module.find("#BEpromoCode>input.bePromoCode").val(),
			outboundDate = $.datepicker.formatDate('ymmdd', c.calOutbound.datepicker("getDate")),
			inboundDate = $.datepicker.formatDate('ymmdd', c.calInbound.datepicker("getDate")),
			pack = c.$module.find("#BEibookTravelPackages option:selected").data("c").url,
			agentNo = c.$module.find("#BEagentCode").val();
		if(config.modules.promoCode && promoCode) { // should check for a flag for validated promoCode...
			url += "kampanjekode=" + promoCode; //standard campaign codes...
		} else if(pack) { // chosen package has own url to go to
			url = pack;
		} else {
			var turRetur = c.$module.find("#BEttr>input:checked").size() > 0 ? "y": "n";
			url += "dato_ut=" + outboundDate; // enten yymm, eller yymmdd
			url += "&dato_hjem=" + inboundDate; // enten yymm, eller yymmdd
			url += "&linje_ut=" + c.$module.find("#BEoutboundRoute option:selected").data("c").mapperCode; //gyldige verdier er: KIEL:OSLO, HIRT:LARV, HIRT:KRIS, STRM:SAND
			url += "&linje_hjem=" + c.$module.find("#BEinboundRoute option:selected").data("c").mapperCode;  //gyldige verdier er: KIEL:OSLO, HIRT:LARV, HIRT:KRIS, STRM:SAND
			url += "&produktkode=" + c.$module.find("#BEibookTravelPackages option:selected").data("c").productId; //heltall, ID på produkt hentet fra oversikten her: http://web01.colorline.no/apt/tcode/
			url += "&turretur=" + turRetur; //y/n
			if(c.$module.find("#BEcolorclub:checked").size() > 0){url += "&colorclub=y&section=616";}
			if(c.agent.active){
				if(c.agent.valid){
					url += "&agent=" + agentNo + "&turkode=n";
				}else{
					displayError("agent");
					return false;
				}
			}
		}
		if(c.debug){
			alert(url);
		}
		window.location.href = url;
	},

	init = function(){
		if(config.modules === "undefined"){
			return false;
		}
		c.debug = (config.debug == "true") ? true : false;
		initAppState();
		initRoute();
		initCal();
		initEvents();

		updateIbook();
		updateTriptype();

		if(c.$module.hasClass("normal-state")){c.$module.find('#BEform').fadeIn();} // show all content after all the initializing stuff
	};

	//$(document).ready(function(){
		init();
	//});


	return{
		jsConfig: c,
		cmsConfig: config
	};
}());