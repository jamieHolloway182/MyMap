 // Set the center and zoom level

var markers = [];

var data;
var fetched = false;

var clickedCoords;

// Add a tile layer (basemap) to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

function fetchData() {
    return fetch('/api/data')  // Return the fetch promise
        .then(response => response.json())
        .then(d => {
            data = d;
            fetched = true;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

fetchData().then(addDataToMap);
