const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'images')); // Save to 'images' folder
    },
    filename: (req, file, cb) => {
        // Combine the current timestamp and a unique UUID
        const uniqueFilename = Date.now() + '-' + uuidv4() + path.extname(file.originalname);
        cb(null, uniqueFilename); // e.g. 1624042159997-8a5b2b5b-1333-4b18-b759-d85e51a57b5c.png
    }
});
const upload = multer({ storage: storage });

// Path to the data file
const dataFilePath = path.join(__dirname, 'data', 'data.json');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); // To parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // To parse URL-encoded bodies

// POST route to handle data and image uploads
app.post('/api/data', upload.array('images'), (req, res) => {
    const { data } = req.body; // JSON data (lat, lng, text, etc.)
    const files = req.files;    // Array of uploaded files


    // Check if data is provided
    if (!data) {
        return res.status(400).json({ message: 'No data provided' });
    }

    let parsedData;
    try {
        parsedData = JSON.parse(data);
    } catch (error) {
        return res.status(400).json({ message: 'Invalid JSON data' });
    }

    // Process images (store the file paths)
    const imagePaths = files.map(file => path.join('images', file.filename));

    parsedData.images = imagePaths; // Add image paths to the marker data

    // Read the existing data from data.json
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to read data.' });
        }

        const existingData = JSON.parse(data);
        existingData.markers.push(parsedData); // Add the new marker data

        // Write the updated data to the file
        fs.writeFile(dataFilePath, JSON.stringify(existingData, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to save data.' });
            }
            res.status(200).json({ message: 'Data saved successfully!' });
        });
    });
});

// GET route to fetch data from the JSON file
app.get('/api/data', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to read data.' });
        }
        res.json(JSON.parse(data)); // Send the data back as JSON
    });
});

// Serve static files (e.g., images)
app.use('/images', express.static(path.join(__dirname, 'images')));

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
