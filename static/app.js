// Link to USGS earthquake data = earthquakes from the past day with magnitude 1.0+
let earthquake_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson";

// Link to data on tectonic plate locatioins
let plates_url = "https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_plates.json";

// Function to set color and radius according to earthquake magnitude
function markerChar(mag) {
    let color = "";
    let radius = "";

    switch (true) {
        case mag >= 5:
            return color = "red", radius = 30;
        case mag >= 4:
            color = "orange", radius = 25;
        case mag >= 3:
            color = "yellow", radius = 20;
        case mag >= 2:
            color = "lightgreen", radius = 15;
        case mag >= 1:
            color = "green", radius = 10;
    }
}

// Create basemap options
let streets = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "streets-v11",
    accessToken: API_KEY
});

let satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
});

let baseMaps = {
    Streets: streets,
    Satellite: satellite
};

let earthquakes = new L.layerGroup();

// Create overlays object for layer control
let overlays = {
    Earthquakes: earthquakes,
    // "Tectonic Plates": plates
};

// Create map object
let myMap = L.map("map", {
    center: [40.7128, -74.0059],
    zoom: 3,
    layers: [streets, satellite]
    });

streets.addTo(myMap);

// Add layer control
L.control.layers(baseMaps, overlays, {
    collapsed: false
}).addTo(myMap);

// Create a legend
// let legend = L.control({
//     position: "bottomright"
// });

// // Insert div to html
// legend.onAdd = function() {
//     let div = DomUtil.create("div", "legend");
//     return div;
// };

// // Add legend to map
// legend.addTo(myMap);

// Visualize earthquake data
d3.json(earthquake_url, function(response) {
    console.log(response);

    let eqArray = [];

    for (let i=0; i<response.length; i++) {
        let eq_location = response[i].geometry;

        if (eq_location) {
            eqArray.push([eq_location.coordinates[1], eq_location.coordinates[0]]);
        }
    }

    L.geoJson(response, {
        style: function(feature) {
            return {
                color: "white",
                fillColor: markerChar(feature.properties.mag),
                fillOpacity: 0.6,
                weight: 1,
                radius: markerChar(feature.properties.mag)
            };
        },
        onEachFeature: function(feature, layer) {
            layer.on({
                mouseover: function(event) {
                    layer = event.target;
                    layer.setStyle({
                        fillOpacity: 0.9
                    });
                },
                mouseout: function(event) {
                    layer = event.target;
                    layer.setStyle({
                        fillOpacity: 0.6
                    });
                },
                click: function(event) {
                    map.fitBounds(event.target.getBounds());
                }
            });
            layer.bindPopup("<h3>Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place + "</h3>");
        }
    }).addTo(earthquakes);
});

earthquakes.addTo(myMap);