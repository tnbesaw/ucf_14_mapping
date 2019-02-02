// ******************************************************************
//
// Returns a color for the magnitude ... higher is darker
//
// ******************************************************************
function getColor(d) {
  return d > 5 ? '#641E16' :
      d > 4  ? '#A93226' :
      d > 3  ? '#D98880' :
      d > 2  ? '#85C1E9' :
      d > 1  ? '#82E0AA' :
               '#F9E79F' 
};

// ******************************************************************
//
// Create the tile layers that will be the background of our map
//
// ******************************************************************
var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
});

var basicmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
});

var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

// Create a baseMaps object 
var baseMaps = {
  "Satellite": satellitemap,
  "Grayscale": lightmap,
  "Outdoors": basicmap
};


// ******************************************************************
//
// Initialize all of the LayerGroups we'll be using
//
// ******************************************************************
var layers = {
  FAULT_LINES: new L.LayerGroup(),
  EARTHQUAKES: new L.LayerGroup()
};

// Create an overlayMaps object to hold the layers
var overlays = {
  "Fault Lines": layers.FAULT_LINES,
  "Earthquakes": layers.EARTHQUAKES 
};


// ******************************************************************
//
// Create Map
//
// ******************************************************************
// Create the map with our layers
var map = L.map("map-id", {
  center: [37.00, -115.00],
  zoom: 4,
  layers: [
    layers.FAULT_LINES,
    layers.EARTHQUAKES
  ]
});

// Add our tile layer to the map ... the saltellite will be the default
satellitemap.addTo(map);

// Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
 L.control.layers(baseMaps, overlays, {
  collapsed: false
}).addTo(map);


// ******************************************************************
//
// Create Legend
//
// ******************************************************************
// Create a legend to display information about our map
var legend = L.control({
   position: "bottomright" 
});

// When the layer control is added, insert a div with the class of "legend"
legend.onAdd = function() {
  var div = L.DomUtil.create("div", "info legend");
  var magRange = [0, 1, 2, 3, 4, 5]
  var labels = [];
  var from;
  var to;

  // loop through magRange and add (push) html formatted descriptive text for each range value to array
  for (var i = 0; i < magRange.length; i++) {
    from = magRange[i];
    to = magRange[i + 1];

    labels.push(
      '<div><i style="background:' + getColor(from + 1) + '"></i> ' +
      from + (to ? '&ndash;' + to : '+') + "</div>");
  }

  div.innerHTML = "<h4>Magnitude</h4>" + labels.join('');
  return div;
};

// Adding legend to the map
legend.addTo(map);


// ***********************************************
//
// Create Earthquake Markers
//
// ***********************************************
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(data) {

  // Pull the features ... assign to named variable 
  let quakes = data.features;

  // Loop through the stations array
  for (let index = 0; index < quakes.length; index++) {
    let quake = quakes[index];

    // For each station, create a marker and bind a popup with the station's name
    let quakeMarker = L.circle([quake.geometry.coordinates[1], quake.geometry.coordinates[0]], {
      fillOpacity: 0.8,
      stroke: false,
      color: getColor(quake.properties.mag),
      fillColor: getColor(quake.properties.mag),
      // Adjust radius
      radius: Math.pow(quake.properties.mag, 2) * 5000
    }).bindPopup("<h4 class='popTitle'>" + quake.properties.place +
      "</h4><hr><div class='popDetail'><b>Magnitude:</b> " + quake.properties.mag + "<br><b>Date:</b> " + new Date(quake.properties.time) + "</div>");

    // Add the marker to the predefined layer
    quakeMarker.addTo(layers.EARTHQUAKES)
  };  
});


// ***********************************************
//
// Add Fault data to Layer
//  
// ***********************************************
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(data) {

  L.geoJson(data, {
    style: function(feature) {
      return {
        stroke: true,
        color: "red",
        weight: 1
      };
    }
  }).addTo(layers.FAULT_LINES);
});