/**
 * --------------------------------------------------------------------
 * Color Line js app
 * Author: Ole Aasen, frontend@oleaasen.com
 * Copyright (c) 2010 Color Line AS
 * licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * --------------------------------------------------------------------
 */

var CL = CL || {};
CL.namespace = function(ns_string){
    var parts = ns_string.split('.'),
        parent = CL,
        i;
    if(parts[0] === "CL"){
        parts = parts.slice(1);
    }

    for(i=0;i<parts.length;i+=1){
        if(typeof parent[parts[i]] === "undefined"){
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }
    return parent;
};
CL.namespace("CL.util");
CL.namespace("CL.widget.booking");
CL.namespace("CL.widget.booking.config");
CL.namespace("CL.widget.dropdown");
CL.namespace("CL.widget.lightbox");
CL.namespace("CL.widget.linklist");
CL.namespace("CL.widget.media");
CL.namespace("CL.widget.menu");
CL.namespace("CL.widget.offer");
CL.namespace("CL.widget.splash");
CL.namespace("CL.widget.splash.config");
CL.namespace("CL.widget.ticker");
