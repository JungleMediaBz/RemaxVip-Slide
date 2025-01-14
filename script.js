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