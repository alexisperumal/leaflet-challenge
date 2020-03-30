// Alexis Perumal, 3/28/20
// Code leveraged from the leaflet Tutorial at https://leafletjs.com/examples/quick-start/

function createMap(earthquakes) {

    // Create the tile layer that will be the background of our map
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.light",
      accessToken: API_KEY
    });

    // Setup the Base Map, the tile layer
    var streetmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        // id: 'mapbox/satellite-v9',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });

    // Setup the Base Map, the tile layer
    var satmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/satellite-v9',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });
  
    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
      "Light Map": lightmap,
      "Stree Map": streetmap,
      "Satelite Map": satmap
    };
  
    // Create an overlayMaps object to hold the bikeStations layer
    var overlayMaps = {
      "Earthquakes": earthquakes
    };
  
    // Create the map object with options
    var map = L.map("mapid", {
      center: [40.73, -100],
      zoom: 4,
      layers: [lightmap, earthquakes]
    });
  
    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);

    return(map);
  }
  


  function createMarkers(response) {
  
    // Pull the "features" property off of response.data
    var eq_list = response.features;
  
    // Initialize an array to hold bike markers
    var eqMarkers = [];
  
    // Loop through the stations array
    for (var index = 0; index < eq_list.length; index++) {
      var eq = eq_list[index];
  
      // For each station, create a marker and bind a popup with the station's name
      let milliseconds = eq.properties.time; // USGS time in milliseconds since Unix epoch
      let dateObject = new Date(milliseconds);
      let humanDateFormat = dateObject.toUTCString();
    //   let humanDateFormat = dateObject.toLocaleString();

      var eqMarker = L.circle([eq.geometry.coordinates[1], eq.geometry.coordinates[0]], {
            color:"black",
            weight: 1,
            opacity: .3,
            fillColor:"orange",
            fillOpacity: 0.3,
            radius: Math.pow(eq.properties.mag, 2) * 10000
            })
        .bindPopup(
            "<h3>" + eq.properties.title +"<h3>" +
            // "<h3>" + eq.properties.time +"<h3>" +
            "<h3>" + humanDateFormat + "<h3>"  // Human readable date and time.
            // "<h3>" + eq.properties.mag + "</h3>"
            );
  
      // Add the marker to the bikeMarkers array
      eqMarkers.push(eqMarker);
    }
  
    // Create a layer group made from the bike markers array, pass it into the createMap function
    createMap(L.layerGroup(eqMarkers));
  }
  
  
// main():

// Perform an API call to the Citi Bike API to get station information. Call createMarkers when complete

// Build query URL
const usgs_base_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/"

const lookback_options = {
    "H": "hour",
    "D": "day",
    "W": "week",
    "M": "month"
}

const eq_filter = {
    "Sig": "significant",
    "M4.5+": "4.5",
    "M2.5+": "2.5",
    "M1.0+": "1.0",
    "All": "all"
}

let query_url = `${usgs_base_url}${eq_filter['All']}_${lookback_options['W']}.geojson`

// console.log(`query_url: ${query_url}`)

d3.json(query_url, createMarkers);
  