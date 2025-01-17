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

// Initialize listings array from localStorage or use default if empty
let listings = JSON.parse(localStorage.getItem('listings')) || [
    {
        name: "Three Acre Beachfront Lot",
        location: "Placencia Road",
        price: "1,700,000",
        size: "2.8 Acres",
        sku: "L342",
        type: "lot",
        features: ["Road Access", "White Sand Beach"],
        image: "images/l1.jpg"
    }
];

// Handle form submission
document.getElementById('listingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const newListing = {
        name: this.listingName.value,
        location: this.location.value,
        price: this.price.value,
        size: this.size.value,
        sku: this.sku.value,
        type: this.listingType.value,
        features: Array.from(document.querySelectorAll('.feature-tag'))
            .map(tag => tag.textContent.replace('×', '').trim()),
        image: this.images.files[0] ? URL.createObjectURL(this.images.files[0]) : 'images/default.jpg'
    };
    
    // Add to listings array
    listings.push(newListing);
    
    // Save to localStorage
    localStorage.setItem('listings', JSON.stringify(listings));
    
    // Clear form
    this.reset();
    document.getElementById('featuresContainer').innerHTML = '';
    document.getElementById('imagePreview').innerHTML = '';
    
    // Show success message
    alert('Listing added successfully!');
    
    // Optionally close the window
    window.close();
});

// Function to delete listing
function deleteListing(index) {
    if (confirm('Are you sure you want to delete this listing?')) {
        listings.splice(index, 1);
        localStorage.setItem('listings', JSON.stringify(listings));
        updateSlider();
    }
}

// Function to update slider display
function updateSlider() {
    const slider = document.querySelector('.property-slider');
    if (!slider) return; // Exit if not on index page
    
    slider.innerHTML = '';
    
    listings.forEach((listing, index) => {
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
                            <button onclick="deleteListing(${index})" class="delete-btn">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        slider.insertAdjacentHTML('beforeend', slide);
    });
    
    // Reset to first slide
    showSlide(0);
}

// Initialize slider when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateSlider();
}); 