// Alexis Perumal, 3/28/20
// Code leveraged from the leaflet Tutorial at https://leafletjs.com/examples/quick-start/
// Step 2 data on tectonic plates: https://github.com/fraxen/tectonicplates
// Please consider giving Hugo Ahlenius, Nordpil and Peter Bird credit and recognition as a data source.
// https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_boundaries.json

function createMap(earthquakes, grades, labels, faults) {
    // earthquakes is a L.layerGroup which incudes an array of earthquake data.
    // colors and labels store values for the marker legend.
    // faults is a L.layerGroup which incudes an array of faults data as polylines.

    // console.log('Inside createMap(), faults: ', faults);

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
      "Street Map": streetmap,
      "Satelite Map": satmap
    };
  
    // Create an overlayMaps object to hold the bikeStations layer
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "Faults": faults
    };
  
    // Create the map object with options
    var map = L.map("mapid", {
      // center: [40.73, -100], // Center on the Continental US
      center: [45, -135], // Center on the Eastern Pacific / US West Coast
      // center: [40.73, 0], // Center on the Prime Meridian
      zoom: 4,
      layers: [lightmap, earthquakes, faults]
    });
  
    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);

    // Create a legend which will be attached to the map.
    // Code from: https://leafletjs.com/examples/choropleth/
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');

        // div.innerHTML = "<p>Hi</p>";
        inner_html_str = "";
        for (var i = 0; i<grades.length-1; i++) {
            inner_html_str += `<i style="background:${grades[i]}"></i>${labels[i]}<br>`;
        }
        inner_html_str += `<i style="background:${grades[i]}"></i>${labels[i]}`;
        div.innerHTML = inner_html_str;

        return div
    };

    legend.addTo(map);

    return(map);
  }
  
  // function error(err) {
  //   console.log(err);
  // }

  // Step 2 in the promise chain, called by createMarkers (earthquakes), will call createMap()
  function createFaultlines(earthquakes, grades, labels) {

    // Fault data JSON URL
    faults_URL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

    d3.json(faults_URL, function(data) {
      var faults_array = data.features;
      var faults = [];

      // console.log('faults_array', faults_array);
      // console.log('faults_array[0]', faults_array[0]);
      // console.log('faults_array[0].geometry', faults_array[0].geometry);
      // console.log('faults_array[0].geometry.coordinates', faults_array[0].geometry.coordinates);

      for (i=0; i<faults_array.length; i++) {
        // faults.push(faults_array[i].geometry.coordinates);

        // Read the fault data (long, lat) and make a new array with (lat, long)
        fault_long_lat = faults_array[i].geometry.coordinates;
        fault_lat_long = [];
        for(j=0; j<fault_long_lat.length; j++) {
          fault_lat_long.push([fault_long_lat[j][1],fault_long_lat[j][0]]);
        }
        // var polyline = L.polyline(faults_array[i].geometry.coordinates, {color: 'green'});
        var polyline = L.polyline(fault_lat_long, {color: 'gray', opacity: 0.6, smoothFactor: 1, weight: 7})
          .bindPopup(
            `<h3>${faults_array[i].properties.Name} (${faults_array[i].properties.LAYER})</h3>` +
            `<p>Source: ${faults_array[i].properties.Source}</p>`
            // "<h3>" + faults_array[i].properties.Name +"</h3>" +
            // "<p>" + "oh" + "</p>"  // Human readable date and time.
          );
        faults.push(polyline);
      }

      // console.log('faults', faults);
      // console.log('faults.length', faults.length)

      createMap(earthquakes, grades, labels, L.layerGroup(faults));
    });
  }


  function createMarkers(response) {

    // let colors = ["lightblue", "gray", "lightgreen", "yellow", "orange", "red"];
    let colors = ["gray", "lightgreen", "yellow", "orange", "darkorange", "red"];
    let labels = ["< 0", "1-2", "2-3", "3-4", "4-5", "5+"];
  
    // Pull the "features" property off of response.data
    var eq_list = response.features;
  
    // Initialize an array to hold bike markers
    var eqMarkers = [];

    let markerColor = "";
  
    // Loop through the stations array
    for (var index = 0; index < eq_list.length; index++) {
      var eq = eq_list[index];
  
      // For each station, create a marker and bind a popup with the station's name
      let milliseconds = eq.properties.time; // USGS time in milliseconds since Unix epoch
      let dateObject = new Date(milliseconds);
      let humanDateFormat = dateObject.toUTCString();
    //   let humanDateFormat = dateObject.toLocaleString();

      let magnitude = eq.properties.mag;

      if (magnitude < 0) {
        markerColor = colors[0];
      } else if (magnitude < 1) {
        markerColor = colors[1];
      } else if (magnitude < 2) {
        markerColor = colors[2];
      } else if (magnitude < 3) {
        markerColor = colors[3];
      } else if (magnitude < 4) {
        markerColor = colors[4];
      } else if (magnitude < 5) {
        markerColor = colors[4];
      } else {
        markerColor = colors[5];
      }

      var eqMarker = L.circle([eq.geometry.coordinates[1], eq.geometry.coordinates[0]], {
            color:"black",
            weight: 1,
            opacity: .3,
            fillColor: markerColor,
            fillOpacity: 0.3,
            radius: Math.pow(eq.properties.mag, 2) * 10000
            })
        .bindPopup(
            "<h3>" + eq.properties.title +"</h3>" +
            // "<h3>" + eq.properties.time +"<h3>" +
            "<p>" + humanDateFormat + "</p>"  // Human readable date and time.
            // "<h3>" + eq.properties.mag + "</h3>"
            );
  
      // Add the marker to the eqMarkers array
      eqMarkers.push(eqMarker);
    }

    // Create a layer group made from the bike markers array, pass it into the createMap function
    createFaultlines(L.layerGroup(eqMarkers), colors, labels);
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

// Earthquake JSON Data Query URL:
let query_url = `${usgs_base_url}${eq_filter['All']}_${lookback_options['W']}.geojson`

d3.json(query_url, createMarkers);
  