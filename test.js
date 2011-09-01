// Copyright 2011 OpenHamilton.  All Rights Reserved.

/**
 * @fileoverview Desktop widget implementation of Dowsing that
 * can be embedded into any modern browser.  The data is served
 * from a series of Google Fusion Tables
 * @author gavin.schulz@gmail.com (Gavin Schulz)
 */


var Dowsing = {
    /**
     * The base url we're serving the widget from 
     * @type {string}
     */
    baseUrl: 'http://openhamilton.ca/dowsing/desktop/',

    /**
     * Google Fusion Table Map Layers
     * @type {google.maps.FusionTablesLayer}
     */
    layer : [
        null,
        null,
        null,
        null,
        null
    ],

    /**
     * IDs of the Google Fusion Tables that store the required data
     * @type {number}
     */
    tableid : [
        1170238,
        1156706,
        1171176,
        1171298,
        1171364
    ],
    /**
     * Location to initially center map on 
     * @type {google.maps.LatLng}
     */
    center: null,

    /**
     * Zoom level to start map on
     * @type {number}
     */
    zoom: 11,

    /**
     * Geocoding object instance
     * @type {google.maps.Geocoder}
     */
    geocoder: null,

    /**
     * The Google Map object instance
     * @type {google.maps.Map}
     */
    map: null,

    /**
     * HTML element that is holding the {Dowsing.map}
     * @type {HTMLelement}
     */
    map_canvas: null,

    /**
     */
    info_window: null,

    /**
     * Height of the Dowsing widget
     * @type {number}
     */
    height: 0,

    /**
     * Width of the Dowsing widget
     * @type {number}
     */
    width: 0,

    /**
     * HTML element that the Dowsing widget is being inserted into
     * @type {HTMLelement}
     */
    elem: null
};

/**
 * The main entry point of Dowsing when embedded
 * Loads the google maps API and our custom stylesheet
 */
Dowsing.display = function() {
    this.elem = document.getElementById('dowsing_canvas');

    // Ensures the element exists in the DOM, otherwise try again in a second
    if (this.elem === null) {
        setTimeout(Dowsing.display(), 1000);
        return;
    }

    var script  = document.createElement("script");
    script.type = "text/javascript";
    script.src  = "http://maps.google.com/maps/api/js?sensor=false&callback=Dowsing.show";
    document.body.appendChild(script);

    var css = document.createElement("link");
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("type", "text/css");
    css.setAttribute("media", "all");
    css.setAttribute("href", this.baseUrl + "style.css");
    document.body.appendChild(css);
};

/**
 * Creates the header toolbar and appends it to the widget
 */
Dowsing.header = function() {

    //DOM Fragments work faster than everyhing else. and are safer.
    //Speed's really important as this script works as a remote plugin
    var node = document.createDocumentFragment().createElement('div');
        node.setAttribute("id",    "dowsing_header");
        node.setAttribute("class", "grad_box");
        
    var inputElement  = node.appendChild(document.createElement("input"));
        inputElement.setAttribute("id",    "dowsing_address");
        inputElement.setAttribute("class", "text_input");
        inputElement.setAttribute("value", "Enter an address...");
        inputElement.setAttribute("type",  "text");
        inputElement.addEventListener('focus', function () {
            if (this.value == 'Enter an address...') {
                this.value='';
            }
        });
        inputElement.addEventListener('blur', function () {
            if (this.value === '') {
                this.value='Enter an address...';
            }
        });
        
        //This one is a new event, it's for when a user hits ENTER inside the text box.
        inputElement.addEventListener('keyup', function (e) {
            if (e.keyCode == 13) {
                Dowsing.zoomToAddress();
            }
        });
    
    var submitElement = node.appendChild(document.createElement("input"));
        submitElement.setAttribute("id",    "dowsing_search");
        submitElement.setAttribute("class", "button input");
        submitElement.setAttribute("value", "Search");
        submitElement.setAttribute("type",  "submit");
        submitElement.addEventListener('click', function () {
            Dowsing.zoomToAddress();
        });
    
    var resetElement  = node.appendChild(document.createElement("input"));
        resetElement.setAttribute("id",    "dowsing_reset");
        resetElement.setAttribute("class", "button input");
        resetElement.setAttribute("value", "Reset");
        resetElement.setAttribute("type",  "submit");
        resetElement.addEventListener('click', function () {
            Dowsing.reset();
        });
    
    this.elem.appendChild(node.cloneNode(true));
};

/**
 * Creates the bottom legend toolbar and append it to the widget
 */
Dowsing.legend = function() {
    var legend       = document.createElement('div');
    legend.id        = 'dowsing_legend';
    legend.className = 'grad_box';

    //It's preferable if you use the DOM methods that create fragments and append children, but I wanted to demonstrate a better method than +=.
    //This method uses arrays, it's a bit more readable, and lets you work a bit easier... it's still far worse than using the DOM methods I've shown above.
    var contents = [];
    contents.push('<ul id="dowsing_list">');
    contents.push('<li><img src="' + this.baseUrl + 'sm_red.png"    class="dowsing_image"/>Beach</li>');
    contents.push('<li><img src="' + this.baseUrl + 'sm_pink.png"   class="dowsing_image"/>Outdoor Pool</li>');
    contents.push('<li><img src="' + this.baseUrl + 'sm_yellow.png" class="dowsing_image"/>Indoor Pool</li>');
    contents.push('<li><img src="' + this.baseUrl + 'sm_purple.png" class="dowsing_image"/>Splash Pad</li>');
    contents.push('<li><img src="' + this.baseUrl + 'sm_green.png"  class="dowsing_image"/>Wading Pool</li>');
    contents.push('</ul>');
    contents.push('<div class="clearfix"></div>');

    legend.innerHTML = contents.join("");
    this.elem.appendChild(legend);
};

/**
 * Initializes some class variables and then draws the 
 * widget into the specified div
 */
Dowsing.show = function () {
    /* Center our map on Hamilton */
    this.center = new google.maps.LatLng(43.24895389686911, -79.86236572265625);

    /* Get ourselves a geocoder for use at a later time */
    this.geocoder = new google.maps.Geocoder();

    /*Shortcutting assignment if DosingConfig was not set.*/
    this.config(DowsingConfig || { height: 600, width: 958 } );

    this.header();

    this.map_canvas    = document.createElement('div');
    this.map_canvas.id = 'dowsing_map_canvas';
    /* 
     * 44px = the height of the header
     * 28px = the height of the legend
     */
    this.map_canvas.style.height = (this.height - 44 - 28) + "px";
    this.map_canvas.style.width  = this.width + "px";
    this.elem.appendChild(this.map_canvas);

    this.legend();    

    /* Draw a new google map */
    this.map = new google.maps.Map(this.map_canvas, {
        center    : this.center,
        zoom      : this.zoom,
        mapTypeId : google.maps.MapTypeId.ROADMAP
    });
    
    /* Styling information for Fusion Table Layers */
    var style = [{
        featureType : 'all',
        elementType : 'all',
        stylers     : [{
            saturation : -57
        }]
    }];

    this.info_window = new google.maps.InfoWindow(); 

    // Add each fusion table as a new layer on the map
    function runFusionTablesLayer(from, select) {
        select = select || 'Lat';
        return new google.maps.FusionTablesLayer({
            "query" : {
                "select" : select,
                "from"   : from
            },    
            "map" : this.map,
            "suppressInfoWindows" : true
        });
    }
    
    //Assign data for all fusion tables
    for (var i=0; i<this.tableid.length; i++){
        this.layer[i] = runFusionTablesLayer(this.tableid[i]);
        
        //Add event listener for all layers.
        google.maps.event.addListener(this.layer[i], 'click', this.windowControl);
    }
};

/**
 * Defines the handler for display the info 
 * window pop-ups when the user clicks on a point
 * @param {event} event An event created by clicking on an icon on the google map
 */
Dowsing.windowControl = function(event) {
    Dowsing.info_window.setOptions({
        content     : event.infoWindowHtml,
        position    : event.latLng,
        pixelOffset : event.pixelOffset
    });
    Dowsing.info_window.open(Dowsing.map);
};

/**
 * Called when a user searches their address
 * Makes a geocode call and centers map on location
 * and increases zoom level
 */
Dowsing.zoomToAddress = function() {
    var self = this;
    /* Use the geocoder to geocode the address */
    this.geocoder.geocode({ 'address' : document.getElementById("dowsing_address").value }, function(results, status) {
        /* If the status of the geocode is OK */
        if (status == google.maps.GeocoderStatus.OK) {
            /* Change the center and zoom of the map */
            self.map.setCenter(results[0].geometry.location);
            self.map.setZoom(14);
        }
    });
};

/**
 * Reset the zoom & center values
 */
Dowsing.reset = function() {
    this.map.setCenter(this.center);
    this.map.setZoom(this.zoom);
    document.getElementById('dowsing_address').value = 'Enter an address...';
};

/**
 * Gets the configuration options and
 * parse them to setup up the canvas
 * @param {object} options A Dowsing config object containing any special configured value
 */
Dowsing.config = function( options ) {
    /* Check what configuration options were defined */
    this.height = (!options.height || (options.height < 400) ) ? 400 : options.height;
    this.width  = (!options.width  || (options.width  < 500) ) ? 500 : options.width;

    this.elem.style.height = this.height + "px";
    this.elem.style.width  = this.width  + "px";
};

// Add the widget canvas to the page via DOM manipulation in a clojure to avoid global namespace
// This is faster and *safer* than document.write, which is awkard cross-browser, and can be a form of eval().
(function(){
    var element  = document.createElement("div");
    element.setAttribute("id", "dowsing_canvas");
    element.setAttribute("style", "height:0px;width:0px;"); //I'd almost always advise *against* in-line styles such as this. Define this in style.css and remove this line.
    document.body.appendChild(element);

    // Display the widget
})();
Dowsing.display();
