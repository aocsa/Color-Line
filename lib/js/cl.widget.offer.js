/**
 * --------------------------------------------------------------------
 * jQuery organize plugin
 * Author: Ole Aasen, ole.aasen@colorline.no
 * Copyright (c) 2010 Color Line AS
 * licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * --------------------------------------------------------------------
 */

CL.widget.offer = (function () {
	/**** Set defaults and objects *************************************************************************************/
	var $widget = $(".bFilterElm");
	var $offercontainer = $widget.parent().parent();
	var $tabcontainer = $widget.parent().prev();
	var $tabs = $tabcontainer.children();
	var aFilters = [];
	var aTabs = [];
	var aThemes = [];
	var i = 0;
	var j = 0;
	var k = 0;
	var iMax = 0;
	var jMax = 0;
	var kMax = 0;

	var sortGroups = function(){
		return function(a,b){
			return Number(a.getOrder()) > Number(b.getOrder()) ? 1 : -1;
		}
	};
	var sortGroupsElms = function(){
		return function(a,b){
			return Number($(a).attr("data-order")) > Number($(b).attr("data-order")) ? 1 : -1;
		}
	};
	var changeImgSrc = function($obj){
		var $img = $obj.find("img");
		if($img.attr("src") !== undefined){
			var imgSrc = $($img).attr("src").split("/");
			imgSrc[jQuery.inArray("landscape_3col",imgSrc)] = "offer_6col";
			var alteredSrc = imgSrc.join("/");
			$img.attr("src",alteredSrc);
			$img.css("display","inline");
		}
	};

	var oFilter = function(spec){
		var that = {};
		that.groupNames = [];
		that.groups = [];
		that.members = [];
		that.hasChildren = false;
		that.getName = function(){
			return spec.displayName;
		};
		that.getId = function(){
			return spec.id;
		};
		that.getLyr = function(){
			return spec.lyr;
		};
		that.getButton = function(){
			return spec.button;
		};
		that.getChildId = function(){
			return spec.childId;
		};
		that.getTabType = function(){
			return spec.tabType;
		};
		that.getGroups = function(){
			return that.groups;
		};
		that.getMembers = function(){
			return that.members;
		};
		that.hasMembers = function(){
			return that.hasChildren;
		};
		that.addMember = function(elm){ //jQuery elm
			/* if member is part of group, and this group doesn't exists, add group */
			var i = 0;
			if(!that.groupNames.contains($(elm).attr("data-group"))){
				that.groups[that.groups.length] = oGroup({
					name: $(elm).attr("data-group"),
					parentElm: that.getName(),
					order: $(elm).attr("data-grouporder")
				});
				that.groupNames[that.groupNames.length] = $(elm).attr("data-group");
			}
			/* add member to his group */
			for(i;i<that.groups.length;i++){
				if(that.groups[i].getName() === $(elm).attr("data-group")){
					that.groups[i].addMember(elm);
				}
			}
			that.hasChildren = true;
			that.members[that.members.length] = elm; /* add this to memberlist */
		};
		return that;
	};
	var oGroup = function(spec){
		var that = {};
		that.members = []; // jQuery objects
		that.parentElm = {}; // oFilter object
		that.getName = function(){
			return spec.name;
		};
		that.getOrder = function(){
			return spec.order;
		};
		that.getMembers = function(){
			return that.members;
		};
		that.addMember = function(elm){
			that.members[that.members.length] = elm;
		};
		return that;
	};
	var oTheme = function(spec){
		var that = {};
		that.minPrice = 999999999999;
		that.minPriceTxt = "";
		that.getName = function(){
			return spec.name;
		};
		that.getId = function(){
			return spec.id;
		};
		that.getChildContainer = function(){
			return spec.childContainer;
		};
		that.getMinPrice = function(){
			return that.minPrice;
		};
		that.getMinPriceTxt = function(){
			return that.minPriceTxt;
		};
		that.setMinPrice = function(price,priceTxt){
			if(that.minPrice > Number(price)){
				that.minPrice = Number(price);
				that.minPriceTxt = priceTxt;
			}
		};
		return that;
	};
	var oTab = function(spec){
		var that = {};
		that.getName = function(){
			return spec.name;
		};
		that.getId = function(){
			return spec.id;
		};
		that.getChildContainer = function(){
			return spec.childContainer;
		};
		return that;
	};

	/**** Set tabs ******************************************************************************************/
	$tabs
		.each(function(index){
			var lyrId = "bFilter_"+$(this).attr("data-tab");
			var tabType;
			if($(this).attr("data-tab").indexOf("theme") !== -1){
				aThemes[aThemes.length] = oTheme({
					id: $(this).attr("data-tab"),
					name: $(this).children().text(),
					childContainer: "#bFilter_"+$(this).attr("data-tab")
				});
				tabType = "theme";
				$(this).addClass("theme");
			}
			if($(this).attr("data-tab").indexOf("tab") !== -1){
				aTabs[aTabs.length] = oTab({
					id: $(this).attr("data-tab"),
					name: $(this).children().text(),
					childContainer: "#bFilter_"+$(this).attr("data-tab")
				});
				tabType = "tab";
			}
			var lyr = $('<div id="'+lyrId+'" class="box bFilterContent '+tabType+'">');
			var thisHash = "#"+$(this).attr("data-tab");
			if($(this).attr("data-tab") !== "all"){
				lyr.appendTo($offercontainer);
			}
			$(this).attr("data-content",aFilters.length);
			aFilters[aFilters.length] = oFilter({
				id: $(this).attr("data-tab"),
				lyr: lyr,
				button: $(this),
				displayName: $(this).children().text(),
				childId: lyrId,
				tabType: tabType
			});
			if(window.location.hash === thisHash){
				$(this).addClass("selected");
				$("#"+lyrId).show();
			}
			if(index === 0){ // the all tab always has children...
				aFilters[index].hasChildren = true;
				if(window.location.hash === ""){
					$(aFilters[index].getButton()).addClass("selected");
				}else if(window.location.hash !== "" && window.location.hash !== "#all"){
					$("#"+lyrId).hide();
				}
			}
		}).click(function(){
		  var tabContent = "#"+aFilters[$(this).attr("data-content")].getChildId();
			$(".bFilterContent").hide("fast");
			$(tabContent).show("slow");
			$($tabs).removeClass("selected");
			$(this).addClass("selected");
			window.location.hash = "#"+$(this).attr("data-tab");
			return false;
		});

	/**** Loop offers and group them ++ *********************************************************************/
	$widget.each(function(){
		if($(this).hasClass("pri")){changeImgSrc($(this));}
		for(i = 0, iMax = aFilters.length; i < iMax; i++){
			if($(this).attr("data-tab") === aFilters[i].getId()){
				aFilters[i].addMember($(this));
				$('<div class="lineInfo">'+aFilters[i].getName()+'</div>').appendTo($(this).children());
			}
		}
		if($(this).attr("data-theme") !== ""){
			var $clone = $(this).clone().removeClass("pri");
			$clone.appendTo("#bFilter_"+$(this).attr("data-theme"));
		}
	});

	/**** Groups ********************************************************************************************/
	for(i = 0, iMax = aFilters.length; i < iMax; i++){
		var tmpGroups = aFilters[i].getGroups().sort(sortGroups());
		for(j = 0, jMax = tmpGroups.length; j < jMax; j++){
			var groupObj = $('<div class="box bFilterGroup"><h2>'+tmpGroups[j].getName()+'</h2></div>').appendTo(aFilters[i].getLyr());
			var tmpGroupMembers = tmpGroups[j].getMembers();
			tmpGroupMembers.sort(sortGroupsElms());

			for(k = 0, kMax = tmpGroupMembers.length; k < kMax; k++){
				var $clone = $(tmpGroupMembers[k]).clone().removeClass("pri");
				if($clone.hasClass("large")){changeImgSrc($clone);}
				$clone.appendTo(groupObj);
			}
		}
		if(!aFilters[i].hasMembers() && aFilters[i].getTabType() === "tab"){
			aFilters[i].getButton().hide();
		}
	}
	/**** Themes ********************************************************************************************/
	for(i = 0, iMax = aThemes.length; i < iMax; i++){
		var selector = aThemes[i].getChildContainer()+" .priceOffer > .price";
		var childElms = $(aThemes[i].getChildContainer()+" .bFilterElm").size();
		var jChildNo = $(".bFilterBtn[data-tab="+aThemes[i].getId()+"] .themeNo");
		var ChildNoTxt = childElms+" "+$(jChildNo).text();
		var jMinPrice = $(".bFilterBtn[data-tab="+aThemes[i].getId()+"] .themeMinPrice");
		var minPriceTxt = jMinPrice.text();
		var noOfPri = (childElms < 2) ? childElms : 2;
		$(selector).each(function(){
			var tmpPrice = $(this).text().split(",");
			var dec = (tmpPrice[tmpPrice.length-1] === "-") ? "0" : tmpPrice[tmpPrice.length-1];
			var modPrice = tmpPrice[0]+"."+dec;
			aThemes[i].setMinPrice(modPrice,$(this).text());
		});
		if(childElms > 0){
			$(".bFilterBtn[data-tab="+aThemes[i].getId()+"]").show();
			$(aThemes[i].getChildContainer()+" .bFilterElm").each(function(index){
				if(noOfPri > index){
					$(this).addClass("pri");
					changeImgSrc($(this));
				}
			})
		}
		jChildNo.text(ChildNoTxt);
		jMinPrice.text(minPriceTxt+aThemes[i].getMinPriceTxt());
	}

	/**** Finishing touches *******************************************************************************/
	$(".bFilterNav").css("visibility","visible");
	if(window.location.hash === ""){$("#bFilter_all").show();}


    return{
        //method1: method1
    };
}());