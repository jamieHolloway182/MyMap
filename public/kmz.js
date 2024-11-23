// Function to handle loading KMZ files
function loadKMZ(url) {
    // Fetch the KMZ file (you can use any method, like FileReader for local files)
    fetch(url)
        .then(response => response.blob()) // Get the file as a Blob
        .then(blob => {
            // Use JSZip to unzip the KMZ file
            JSZip.loadAsync(blob)
                .then(function(zip) {
                    // Look for the KML file inside the KMZ archive
                    var kmlFileName = Object.keys(zip.files).find(fileName => fileName.endsWith('.kml'));
                    
                    if (kmlFileName) {
                        // Get the KML file as a text string
                        zip.files[kmlFileName].async('string').then(function(kmlText) {
                            // Parse the KML string using leaflet-omnivore
                            var kmlLayer = omnivore.kml.parse(kmlText).addTo(map);
                        });
                    } else {
                        console.error('No KML file found in the KMZ archive.');
                    }
                })
                .catch(function(error) {
                    console.error('Error unzipping KMZ file:', error);
                });
        })
        .catch(function(error) {
            console.error('Error fetching KMZ file:', error);
        });
}

// loadKMZ('map.kmz'); // Replace with your KMZ file URL

