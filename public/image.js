const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewArea = document.getElementById('previewArea');
const submitButton = document.getElementById('submitButton');
let filesToUpload = [];

// Handle drag-and-drop events
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragOver');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragOver');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragOver');
    const files = e.dataTransfer.files;
    handleFiles(files);
});

// Handle click to open file dialog
dropZone.addEventListener('click', () => fileInput.click());

// Handle file input change
fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    handleFiles(files);
});

// Handle paste event for images
document.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;

    for (const item of items) {
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
                filesToUpload.push(file); // Add file to the array
                renderPreview(); // Update the preview
            }
        }
    }
});

function handleFiles(files) {
    filesToUpload = [...filesToUpload, ...files]; // Add new files to the list
    renderPreview();
}

function renderPreview() {
    previewArea.innerHTML = ''; // Clear previous content
    filesToUpload.forEach((file, index) => {
        const previewItem = document.createElement('div');
        previewItem.classList.add('previewItem');

        const img = document.createElement('img');
        img.src = URL.createObjectURL(file); // Preview the image
        const removeButton = document.createElement('button');
        removeButton.classList.add('removeButton');
        removeButton.textContent = '×';
        removeButton.addEventListener('click', () => removeImage(index));

        previewItem.appendChild(img);
        previewItem.appendChild(removeButton);
        previewArea.appendChild(previewItem);
    });
}

// Remove an image
function removeImage(index) {
    filesToUpload.splice(index, 1); // Remove file from the array
    renderPreview(); // Re-render the preview
}
