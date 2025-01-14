const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/listings/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

// Serve static files
app.use(express.static('public'));

// Create listings.json if it doesn't exist
if (!fs.existsSync('listings.json')) {
    fs.writeFileSync('listings.json', '[]');
}

// Handle new listing upload
app.post('/api/listings', upload.array('images'), (req, res) => {
    try {
        const images = req.files.map(file => '/images/listings/' + file.filename);
        
        const listing = {
            id: Date.now(),
            name: req.body.listingName,
            type: req.body.listingType,
            location: req.body.location,
            price: req.body.price,
            size: req.body.size,
            sku: req.body.sku,
            features: JSON.parse(req.body.features),
            images: images
        };

        // Read existing listings
        const listings = JSON.parse(fs.readFileSync('listings.json', 'utf8'));
        
        // Add new listing
        listings.push(listing);
        
        // Save updated listings
        fs.writeFileSync('listings.json', JSON.stringify(listings, null, 2));

        res.json({ success: true, message: 'Listing added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all listings
app.get('/api/listings', (req, res) => {
    try {
        const listings = JSON.parse(fs.readFileSync('listings.json', 'utf8'));
        res.json(listings);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});