/*
  WhereAre
    The widget to help show where things are on google maps. Extensable for other uses.

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

(function(conf){

  /* Configure display options */
  var defaults = {
    /* Configure layers to put in this impelmentation 
    Layers are an array of objects that contain groups of data sets
      Groups hold arrays of data lables and Fusion Table IDs
    
    */
    "layers" : [
      { "Water"   : [
        { "Beach"    : 1 },
        { "Outdoor Pool" : 1 },
        { "Indoor Pool"  : 1 },
        { "Splash Pad"   : 1 },
        { "Wading Pool"  : 1 }
      ]},
      {"Parks"   : [
        { "Parks" : 1},
        { "Waterfalls" : 1},
        { "Conservation" : 1},
        { "Trails" : 1}
      ]},
      { "Bus Stops" : [
        { "HSR"  : 1},
        { "B-Line" : 1},
        { "GO"   : 1}
      ]}
    ],
    /* Configure display options */
    "display" : {
      "height"  : 400,        /* Height as Pixels as an int */
      "width"   : 400,        /* Width  as Pixels as an int */
      "sideBarWidth"  : (25/100),   /* Percentage of width.height to be used for side-bar (decimals between 0 and 1.)*/
      "sideBarPosition" : "left",   /* "left", "right", "top", "bottom" of the box, where the map appears opposite to this */
      "style" : "white",        /* Style of the box. See style object for style types, or import your own style. */
    },
    /* Configuration for google map at time of intialization */
    "map" : {
      "zoom"  : 11,
      "focus" : [43.24895389686911, -79.86236572265625],
    },
    /* functions for callback features */
    "callbacks" : {
      "before"  : function(){},
      "success" : function(){},
      "error"   : function(){}
    }
  };
  
  /*
  1) beam in content
  2) run conf or defaults
  3) draw divs
  4) Maps initalize
  5) Layers
  6) ????
  7) Profit!
  */

})({
  //Configuration
});

document.write("blah...");