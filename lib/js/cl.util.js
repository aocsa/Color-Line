/**
 * --------------------------------------------------------------------
 * Color Line utilities
 * Author: Ole Aasen, frontend@oleaasen.com
 * Copyright (c) 2010 Color Line AS
 * licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * --------------------------------------------------------------------
 */

/* extending array */
Array.prototype.contains = function ( val) {
	var i = this.length;
	while (i--){
		if (this[i] === val){return true;}
	}
	return false;
};
Array.prototype.min = function(){
	return Math.min.apply(Math,this);
};
Array.prototype.max = function(){
	return Math.max.apply(Math,this);
};
/*
CL.util = (function () {
    var method1 = function(){
            alert("ole");
        },
        method2 = function(){
            alert("dole");
        };
    return{
        method2: method2
    };
}());
*/