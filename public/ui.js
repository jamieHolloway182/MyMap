var map = L.map('map').setView([51.5081, -0.1248], 10);

formOpen = false
tabOpen = false
var marker;

var curImageIndex = 0;

map.on('click', function(e) {
    if (fetched){
        if (tabOpen){
            toggleMarkerTab(-1);
        }else{
            clickedCoords = e.latlng
            toggleSubmitForm(1)
        }
    }
})

closeButton = document.getElementById("closeButton")
closeButton.addEventListener('click',(e) => toggleSubmitForm(-1)) 

submitButton.addEventListener('click',() => submitData()) 

function addDataToMap(){
    fetchData().then(() => {
       for (m of markers){
            map.removeLayer(m)
        }
        for(m of data['markers']){
            markers.push(createMarker(m))
        } 
    })
}

function createMarker(data){
    let marker = L.marker(data).addTo(map)

    marker.options.id = data["id"]

    marker.on('click', (e) => {
        if(!formOpen){
            toggleMarkerTab(1, e.target)
        }
    })
    return marker
}

function toggleSubmitForm(val){
    form = document.getElementById("submitForm");
    form.style.zIndex = val

    closeButton = document.getElementById("closeButton")
    closeButton.style.zIndex = val

    formOpen = val == 1;

}

async function submitData() {
    const text = document.getElementById("textInput").value;

    // Prepare FormData
    const formData = new FormData();
    formData.append("data", JSON.stringify({
        id: Object.keys(data["markers"]).length + 1,
        lat: clickedCoords.lat,
        lng: clickedCoords.lng,
        text: text,
    }));

    // Append images to FormData
    filesToUpload.forEach(file => formData.append("images", file));
    try {
        const response = await fetch('/api/data', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to save data');
        }

        const result = await response.json();
        console.log(result.message);

        addDataToMap();

        toggleSubmitForm(-1);

        // Reset form
        document.getElementById("textInput").value = "";
        filesToUpload = [];
        previewArea.innerHTML = "";
    } catch (error) {
        console.error("Error:", error);
    }
}

function toggleMarkerTab(val, marker){
    markerTab = document.getElementById("markerTab");
    markerTab.style.zIndex = val

    tabOpen = val == 1;

    if (val == 1){
        createMarkerTab(marker.options.id)
    }
}

function getMarkerById(id){
    for (let m of Object.values(data["markers"])){
        if (m.id == id) return m
    }
    return -1;
}

function createMarkerTab(id) {
    marker = getMarkerById(id);
    document.getElementById("markerText").innerHTML = marker.text;

    // Set initial image
    curImageIndex = 0;
    updateMarkerImage();

    // Update navigation buttons
    const imageLeft = document.getElementById("imageLeft");
    const imageRight = document.getElementById("imageRight");

    if (marker.images.length === 1) {
        // Disable navigation if there's only one image
        imageLeft.style.color = "#666";
        imageLeft.style.cursor = "not-allowed";
        imageLeft.style.opacity = "0.7";

        imageRight.style.color = "#666";
        imageRight.style.cursor = "not-allowed";
        imageRight.style.opacity = "0.7";
    } else {
        // Enable navigation for multiple images
        imageLeft.style.color = "#000";
        imageLeft.style.cursor = "pointer";
        imageLeft.style.opacity = "1";

        imageRight.style.color = "#000";
        imageRight.style.cursor = "pointer";
        imageRight.style.opacity = "1";
    }
}

// Helper function to update the image display
function updateMarkerImage() {
    const markerImage = document.getElementById("markerImage");
    const imageDiv = document.getElementById("markerImageContainer"); // The div that contains the image

    // Check if there are any images
    if (marker.images.length === 0) {
        // Hide the image div if there are no images
        imageDiv.style.display = 'none';
    } else {
        // Show the image div if there are images
        imageDiv.style.display = 'flex';

        // Set the current image
        const currentImage = marker.images[curImageIndex];
        markerImage.src = currentImage; // This should be the image URL or base64 data
    }
}

function openImageInNewTab() {
    const currentImage = marker.images[curImageIndex];
    window.open(currentImage); // Open the image in a new tab
}

document.getElementById("markerImage").addEventListener("click", openImageInNewTab);

document.getElementById("imageLeft").addEventListener("click", () => {
    curImageIndex = mod(curImageIndex - 1, marker.images.length); // Cycle backward
    updateMarkerImage();
});

document.getElementById("imageRight").addEventListener("click", () => {
    curImageIndex = mod(curImageIndex + 1, marker.images.length); // Cycle forward
    updateMarkerImage();
});
