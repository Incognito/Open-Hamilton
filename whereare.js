/*
  WhereAre
    The widget to help build things with google maps JS APIv3 and Static APIv2.

    ..........................
    ..........................
    ..Implementation details..
    ..........................
    ..........................
    
    
    Further documentation assets are located on the GitHub hosting page.... TBA.
    
    
  Copyright 2011 Brian Graham. All rights reserved.
    
    The MIT License (MIT)
    
    Permission is hereby granted, free of charge, to any person obtaining a copy of this software
    and associated documentation files (the "Software"), to deal in the Software without restriction, 
    including without limitation the rights to use, copy, modify, merge, publish, distribute, 
    sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is 
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all copies or 
    substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING 
    BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
    DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(function(conf) {
  /* This will be required regardless-- todo: 1) name conventions, 2) css reset, 3) see if I can use last-run-script tag instead of document.write()... */
  document.write("<div id='mapPlugin'></div>");
  /* Retruns object that parses config options and default options from a JSON array.
      Attemps to merge: over-ride default with config values, ignore options from config
      that wern't defined in defaults.
        Works recursively, assignment emulates XOR.
  */
  var confMerge= function(conf, defaults) {
    //Options will be the new set of values. Need to determine if Options is array or object.
    var options = {};
    if ((conf == "[object Array]") && (defaults == "[object Array]")) {
      //You can't merge an array and an object with each-other.
      return conf || defaults;
    } else {
      if (defaults.length === "undefined") {
        //Oprtions is an object.
        options = {};
      }else {
        //Oprtions is an array.
        options = [];
      }
    }

    //Cycle through all objects in default
    for (var i in defaults) {
      //Ensure object exits
      if (defaults.hasOwnProperty(i)) {

        //If this was listed in the conf
        if (conf.hasOwnProperty(i)) {
          switch (typeof defaults[i]) {
            case "null"     :
            case "boolean"  :
            case "number"   :
            case "string"   :
              //Deal with bool/num/str
              options[i] = conf[i] || defaults[i];
              break;

            case "function" :
              //Deal with functions
              options[i] = conf[i] || defaults[i];
              break;

            case "object"   :
              //Deal with objects and arrays
              options[i] = confMerge(conf[i], defaults[i]) || defaults[i];
              break;

            default         :
            case "undefined":
            case "xml"      :
              //Deal with weird stuff
              options[i] = null;
              break;
          }
        //If this wasn't listed in the conf, assign default
        } else {
          options[i] = defaults[i];
        }
      }
    }
    return options;
  };
  
  /* Returns IMG Node with generated static maps from Google's "Static Maps APIv2"
        http://code.google.com/apis/maps/documentation/staticmaps/
      Input is documented on GitHub with the rest of this project, 
      but in the same design of the defaults inside the function.
  */
  var buildStaticGoogleMap= function(conf){
    var options = confMerge(conf, {
      center   : [43.24895389686911, -79.86236572265625],  //Geographic coordinates (I haven't built in support for address strings)
      zoom     : 11,                                       //Zoom level on the map.
      sensor   : false,                                    //Sensor should be false unless on GPS enabled device
      size     : [100,100],                                //Pixel size of output map
      scale    : 1,                                        //Image scale (ie, strech resolution quality)
      maptype  : "roadmap",                                //Pick from: roadmap, satellite, terrain, hybrid
      //The next four return string literals of whatever was provided, as they can be very complex.
      style    : "", //http://code.google.com/apis/maps/documentation/staticmaps/#StyledMaps
      markers  : "", //http://code.google.com/apis/maps/documentation/staticmaps/#Markers
      path     : "", //http://code.google.com/apis/maps/documentation/staticmaps/#Paths
      visible  : ""  //http://code.google.com/apis/maps/documentation/staticmaps/#Viewports
    });

    var baseURL = "http://maps.googleapis.com/maps/api/staticmap?";
    for (var i in options) {
      if (options.hasOwnProperty(i)) {
        baseURL += i + "=";
        //Manage special case encoding, ie, center is one param that is encoded as 100x100, rather than individual x/y coords.
        switch (i) {
          case "center":
            baseURL += options[i][0] + "," +options[i][1];
            break;
          case "size":
            baseURL += options[i][0] + "x" +options[i][1];
            break;
          default:
            baseURL += options[i];
        }
          baseURL += "&";
      }
    }
    //Crete the dom node and return the node to be used elsewhere.
    var ele;
    ele = document.createElement("img");
    ele.src= baseURL;
    ele.alt= "Loading static map preloader";
    return ele;
  };

  /* Configure display options */
  var options = confMerge(conf, {
    /* Configure layers to put in this impelmentation 
    Layers are an array of objects that contain groups of data sets
      Groups hold arrays of data lables and Fusion Table IDs
    */
    "layers" : [
      { "name" : "Water",
        "data"   : [
        {
          "name" : "Beach",
          "table" : 1 
        },
        {
          "name" : "Outdoor Pool",
          "table" : 1 
        },
        {
          "name" : "Indoor Pool",
          "table" : 1 
        },
        {
          "name" : "Splash Pad",
          "table" : 1 
        },
        {
          "name" : "Wading Pool",
          "table" : 1
        }
      ]},
      { "name" : "Parks",
        "data"   : [
        {
          "name" :  "Parks",
          "table" : 1
        },
        {
          "name" :  "Waterfalls",
          "table" : 1
        },
        {
          "name" :  "Conservation",
          "table" : 1
        },
        {
          "name" :  "Trails",
          "table" : 1
        }
      ]},
      { "name" : "Bus Stops",
        "data"   : [
        {
          "name" : "HSR",
          "table" : 1
        },
        {
          "name" : "B-Line",
          "table" : 1
        },
        {
          "name" : "GO",
          "table" : 1
        }
      ]}
    ],
    /* Configure display options */
    "display" : {
      "height"  : 400,        /* Height as Pixels as an int */
      "width"   : 960,        /* Width  as Pixels as an int */
      "sideBarWidth"  : (25/100),   /* Percentage of width.height to be used for side-bar (decimals between 0 and 1.)*/
      "sideBarPosition" : "left",   /* "left", "right", "top", "bottom" of the box, where the map appears opposite to this */
      "style" : "white"       /* Style of the box. See style object for style types, or import your own style. */
    },
    /* Configuration for google map at time of intialization */
    "map" : {
      "zoom"  : 11,
      "center" : [43.24895389686911, -79.86236572265625]
    },
    /* functions for callback features */
    "callbacks" : {
      "before"  : function(){},
      "success" : function(){},
      "error"   : function(){}
    }
  });
  
  /*
  Todo: Build the divs based on settings.
  load from image API first...
  when JS api is ready, replace... (if device supports google interactive maps).
  */
  var sideBarSize = [];
  var mapSize = [];
  switch (options.display.sideBarPosition) {
    case "right" :
      mapSize[0]     = (Math.floor(options.display.width * (1 - options.display.sideBarWidth)));
      mapSize[1]     = (options.display.height);
      sideBarSize[0] = (Math.ceil(options.display.width  * options.display.sideBarWidth));
      sideBarSize[1] = (options.display.height);
      break;
    case "top"   :
      mapSize[0]     = (Math.floor(options.display.height * (1 - options.display.sideBarWidth)));
      mapSize[1]     = (options.display.width);
      sideBarSize[0] = (Math.ceil(options.display.height  * options.display.sideBarWidth));
      sideBarSize[1] = (options.display.width);
      break;
    case "bottom":
      mapSize[0]     = (Math.floor(options.display.height * (1 - options.display.sideBarWidth)));
      mapSize[1]     = (options.display.width);
      sideBarSize[0] = (Math.ceil(options.display.height  * options.display.sideBarWidth));
      sideBarSize[1] = (options.display.width);
      break;
    default:
    case "left"  :
      mapSize[0]     = (Math.floor(options.display.width * (1 - options.display.sideBarWidth)));
      mapSize[1]     = (options.display.height);
      sideBarSize[0] = (Math.ceil(options.display.width  * options.display.sideBarWidth));
      sideBarSize[1] = (options.display.height);
      break;
  }
  
  /*Base elements that will hold the widget */
  var baseEle =  document.createDocumentFragment();
  var staticMapIMG = buildStaticGoogleMap({
    center   : options.map.center,
    zoom     : options.map.zoom,
    size     : mapSize
  });
  
  var mapHolder = document.createElement("div");
  var sideBar   = document.createElement("div");
  
  sideBar.className   = "mapControls"
  mapHolder.className = "mapViewport"
  
  mapHolder.appendChild(staticMapIMG);
  
  switch (options.display.sideBarPosition) {
    case "top"   :
    case "left"  :
      baseEle.appendChild(sideBar);
      baseEle.appendChild(mapHolder);
      break;
    default: 
    case "bottom":
    case "right" :
      baseEle.appendChild(mapHolder);
      baseEle.appendChild(sideBar);
      break;
  }
  
  /*Generate menu HTML and buttons, returns element to append child to sideBar*/
  sideBar.appendChild((function() {
    var subList, listItem, subListItem;
    var mainList = document.createElement("ul");
    for (var i=0; i<options.layers.length; i++) {
      listItem = document.createElement("li");
      listItem.appendChild(document.createTextNode(options.layers[i].name));
      subList = document.createElement("ul")
      for (var j=0; j<options.layers[i].data.length; j++) {
        subListItem = document.createElement("li");
        subListItem.appendChild(document.createTextNode(options.layers[i].data[j].name));
        subList.appendChild(subListItem);
      }
      listItem.appendChild(subList)
      mainList.appendChild(listItem);
    }
    return mainList
  })());
  /*
  1) beam in content
  2) run conf or defaults
  3) draw divs -- Can I check script elements instead of running doc write? Check that...
  4) Maps initalize
  5) Layers
  6) ????
  7) Profit!
  */
  document.getElementById("mapPlugin").appendChild(baseEle);
})({
  //Configuration
});

