document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.property-slider');
    const slides = document.querySelectorAll('.property-slide');
    const prevButton = document.querySelector('.prev-slide');
    const nextButton = document.querySelector('.next-slide');
    let currentSlide = 0;

    // Initialize the first slide
    slides[currentSlide].classList.add('active');

    function showSlide(index) {
        // Remove active class from all slides
        slides.forEach(slide => slide.classList.remove('active'));
        
        // Handle wrap-around
        if (index >= slides.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = slides.length - 1;
        } else {
            currentSlide = index;
        }

        // Show the current slide
        slides[currentSlide].classList.add('active');
    }

    // Event listeners for navigation
    prevButton.addEventListener('click', () => {
        showSlide(currentSlide - 1);
    });

    nextButton.addEventListener('click', () => {
        showSlide(currentSlide + 1);
    });

    // Auto advance slides every 6.5 seconds
    setInterval(() => {
        showSlide(currentSlide + 1);
    }, 6500);

    // Add touch support for mobile devices
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    slider.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left
                showSlide(currentSlide + 1);
            } else {
                // Swipe right
                showSlide(currentSlide - 1);
            }
        }
    }
});

async function loadListings() {
    try {
        const response = await fetch('/api/listings');
        const listings = await response.json();
        
        const slider = document.querySelector('.property-slider');
        
        // Clear existing slides
        slider.innerHTML = '';
        
        // Add listings to slider
        listings.forEach(listing => {
            const slide = document.createElement('div');
            slide.className = 'property-slide';
            slide.innerHTML = `
                <div class="property-image">
                    <img src="${listing.images[0]}" alt="${listing.name}">
                    <div class="property-overlay">
                        <div class="property-info">
                            <h3>${listing.name}</h3>
                            <ul>
                                <li>Location: ${listing.location}</li>
                                <li>Size: ${listing.size}</li>
                                ${listing.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                            <div class="price">USD ${listing.price}</div>
                            <div class="sku">SKU: ${listing.sku}</div>
                        </div>
                    </div>
                </div>
            `;
            slider.appendChild(slide);
        });
        
        // Initialize slider
        initializeSlider();
    } catch (error) {
        console.error('Error loading listings:', error);
    }
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', loadListings); 

// Initialize listings from localStorage or use default if empty
let listings = JSON.parse(localStorage.getItem('listings')) || [
    {
        id: 1,
        name: "Three Acre Beachfront Lot",
        location: "Placencia Road",
        price: "1,700,000",
        size: "2.8 Acres",
        sku: "L342",
        type: "lot",
        features: ["Road Access", "White Sand Beach"],
        image: "images/l1.jpg"
    },
    {
        id: 2,
        name: "Beachfront Parcel on Placencia Sidewalk",
        location: "Placencia Village",
        size: "1.22 Acres",
        price: "2,200,000",
        sku: "L327",
        type: "lot",
        features: ["Sidewalk & Road Frontage"],
        image: "images/l2.jpg"
    }
];

// Function to save listings to localStorage
function saveListings() {
    localStorage.setItem('listings', JSON.stringify(listings));
}

// Function to delete a listing
function deleteListing(id) {
    if (confirm('Are you sure you want to delete this listing?')) {
        listings = listings.filter(listing => listing.id !== id);
        saveListings();
        updateSlider();
    }
}

// Function to edit a listing
function editListing(id) {
    const listing = listings.find(l => l.id === id);
    if (!listing) return;

    // Open upload form in new tab with populated data
    const editWindow = window.open('upload.html', '_blank');
    editWindow.onload = function() {
        const form = editWindow.document.getElementById('listingForm');
        form.listingName.value = listing.name;
        form.location.value = listing.location;
        form.price.value = listing.price;
        form.size.value = listing.size;
        form.sku.value = listing.sku;
        form.listingType.value = listing.type;
        
        // Populate features
        const featuresContainer = editWindow.document.getElementById('featuresContainer');
        listing.features.forEach(feature => {
            const featureTag = document.createElement('div');
            featureTag.className = 'feature-tag';
            featureTag.innerHTML = `
                ${feature}
                <button type="button" onclick="removeFeature(this)">&times;</button>
            `;
            featuresContainer.appendChild(featureTag);
        });

        // Change form submit behavior for editing
        form.setAttribute('data-edit-id', id);
    };
}

// Handle form submission (new or edit)
document.getElementById('listingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const editId = this.getAttribute('data-edit-id');
    
    const listingData = {
        id: editId || Date.now(), // Use existing ID or create new one
        name: formData.get('listingName'),
        location: formData.get('location'),
        price: formData.get('price'),
        size: formData.get('size'),
        sku: formData.get('sku'),
        type: formData.get('listingType'),
        features: Array.from(document.querySelectorAll('.feature-tag'))
            .map(tag => tag.textContent.trim()),
        image: formData.get('images').files[0] ? 
            URL.createObjectURL(formData.get('images').files[0]) : 
            (editId ? listings.find(l => l.id === editId).image : 'images/default.jpg')
    };

    if (editId) {
        // Update existing listing
        const index = listings.findIndex(l => l.id === editId);
        listings[index] = listingData;
    } else {
        // Add new listing
        listings.push(listingData);
    }
    
    saveListings();
    
    // Clear form
    this.reset();
    document.getElementById('featuresContainer').innerHTML = '';
    document.getElementById('imagePreview').innerHTML = '';
    
    alert(`Listing ${editId ? 'updated' : 'added'} successfully!`);
    window.close();
});

// Update slider with edit/delete buttons
function updateSlider() {
    const slider = document.querySelector('.property-slider');
    if (!slider) return;
    
    slider.innerHTML = '';
    
    listings.forEach(listing => {
        const slide = `
            <div class="property-slide">
                <div class="property-image">
                    <img src="${listing.image}" alt="${listing.name}">
                    <div class="property-overlay">
                        <div class="property-info">
                            <h3>${listing.name}</h3>
                            <ul>
                                <li>Location: ${listing.location}</li>
                                <li>Size: ${listing.size}</li>
                                ${listing.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                            <div class="price">USD ${listing.price}</div>
                            <div class="sku">SKU: ${listing.sku}</div>
                            <div class="listing-controls">
                                <button onclick="editListing(${listing.id})" class="edit-btn">Edit</button>
                                <button onclick="deleteListing(${listing.id})" class="delete-btn">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        slider.insertAdjacentHTML('beforeend', slide);
    });
    
    showSlide(0);
}

// Add styles for edit/delete buttons
const style = document.createElement('style');
style.textContent = `
    .listing-controls {
        margin-top: 15px;
        display: flex;
        gap: 10px;
        justify-content: center;
    }
    
    .edit-btn, .delete-btn {
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
    }
    
    .edit-btn {
        background: #4CAF50;
        color: white;
    }
    
    .delete-btn {
        background: #f44336;
        color: white;
    }
    
    .edit-btn:hover, .delete-btn:hover {
        opacity: 0.9;
        transform: scale(1.05);
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const storedListings = localStorage.getItem('listings');
    if (storedListings) {
        listings = JSON.parse(storedListings);
    }
    updateSlider();
}); 