// Focus view state management
let currentFocusIndex = 0;
let focusProducts = [];
let isInfoModalOpen = false;

// Initialize focus view
document.addEventListener('DOMContentLoaded', function() {
    initializeFocusView();
    setupFocusEventListeners();
});

// Initialize focus view with URL parameters
function initializeFocusView() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const startIndex = parseInt(urlParams.get('index')) || 0;
    
    if (productId) {
        // Load products and set starting index
        focusProducts = [...products];
        currentFocusIndex = Math.max(0, startIndex);
        
        loadFocusProducts();
        updateNavigation();
        scrollToCurrentProduct();
    } else {
        // No product specified, go back to catalog
        goBack();
    }
}

// Load all products in focus view
function loadFocusProducts() {
    const container = document.getElementById('product-container');
    container.innerHTML = '';
    
    focusProducts.forEach((product, index) => {
        const focusElement = createFocusProduct(product, index);
        container.appendChild(focusElement);
    });
    
    // Initialize carousels after products are loaded
    setTimeout(() => {
        initializeImageCarousels();
    }, 100);
}

// Create individual focus product element
function createFocusProduct(product, index) {
    const template = document.getElementById('product-focus-template');
    const focusElement = template.content.cloneNode(true);
    
    // Populate product data
    focusElement.querySelector('.focus-name').textContent = product.name;
    focusElement.querySelector('.focus-price').textContent = product.price;
    focusElement.querySelector('.focus-rating').textContent = product.rating;
    focusElement.querySelector('.focus-category').textContent = getCategoryDisplayName(product.category);
    focusElement.querySelector('.focus-brand').textContent = product.brand;
    focusElement.querySelector('.focus-stock').textContent = product.stock;
    
    // Setup image carousel
    const swiperWrapper = focusElement.querySelector('.swiper-wrapper');
    const images = product.images || [product.image];
    
    images.forEach((imageSrc, imgIndex) => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `<img src="${imageSrc}" alt="${product.name} - Image ${imgIndex + 1}" class="w-full h-80 object-cover cursor-pointer" onclick="openImageModal('${imageSrc}', '${product.name}')">`;
        swiperWrapper.appendChild(slide);
    });
    
    // Setup expandable description
    setupExpandableDescription(focusElement, product.description);
    
    // Add data attribute for tracking
    const productFocus = focusElement.querySelector('.product-focus');
    productFocus.dataset.productId = product.id;
    productFocus.dataset.index = index;
    
    return focusElement;
}

// Setup event listeners for focus view
function setupFocusEventListeners() {
    const container = document.getElementById('product-container');
    const whatsappBtn = document.getElementById('focus-whatsapp-btn');
    
    // Scroll event listener for navigation update
    container.addEventListener('scroll', debounce(updateCurrentIndex, 100));
    
    // WhatsApp button click
    whatsappBtn.addEventListener('click', () => {
        const currentProduct = focusProducts[currentFocusIndex];
        if (currentProduct) {
            openWhatsApp(currentProduct);
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Touch/swipe gestures
    setupTouchNavigation(container);
}

// Handle keyboard navigation
function handleKeyboardNavigation(event) {
    switch(event.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
            event.preventDefault();
            navigateToPrevious();
            break;
        case 'ArrowDown':
        case 'ArrowRight':
            event.preventDefault();
            navigateToNext();
            break;
        case 'Escape':
            goBack();
            break;
    }
}

// Setup touch/swipe navigation
function setupTouchNavigation(container) {
    let startY = 0;
    let startTime = 0;
    
    container.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        startTime = Date.now();
    });
    
    container.addEventListener('touchend', (e) => {
        const endY = e.changedTouches[0].clientY;
        const endTime = Date.now();
        const deltaY = startY - endY;
        const deltaTime = endTime - startTime;
        
        // Check for swipe gesture (minimum distance and speed)
        if (Math.abs(deltaY) > 50 && deltaTime < 300) {
            if (deltaY > 0) {
                // Swipe up - next product
                navigateToNext();
            } else {
                // Swipe down - previous product
                navigateToPrevious();
            }
        }
    });
}

// Navigate to previous product
function navigateToPrevious() {
    if (currentFocusIndex > 0) {
        currentFocusIndex--;
        scrollToCurrentProduct();
        updateNavigation();
    }
}

// Navigate to next product
function navigateToNext() {
    if (currentFocusIndex < focusProducts.length - 1) {
        currentFocusIndex++;
        scrollToCurrentProduct();
        updateNavigation();
    }
}

// Scroll to current product
function scrollToCurrentProduct() {
    const container = document.getElementById('product-container');
    const targetY = currentFocusIndex * window.innerHeight;
    
    container.scrollTo({
        top: targetY,
        behavior: 'smooth'
    });
}

// Update current index based on scroll position
function updateCurrentIndex() {
    const container = document.getElementById('product-container');
    const scrollTop = container.scrollTop;
    const windowHeight = window.innerHeight;
    
    const newIndex = Math.round(scrollTop / windowHeight);
    
    if (newIndex !== currentFocusIndex && newIndex >= 0 && newIndex < focusProducts.length) {
        currentFocusIndex = newIndex;
        updateNavigation();
    }
}

// Update navigation display
function updateNavigation() {
    const currentIndexElement = document.getElementById('current-index');
    const totalProductsElement = document.getElementById('total-products');
    
    if (currentIndexElement && totalProductsElement) {
        currentIndexElement.textContent = currentFocusIndex + 1;
        totalProductsElement.textContent = focusProducts.length;
    }
}

// Toggle info modal
function toggleInfo() {
    const modal = document.getElementById('info-modal');
    isInfoModalOpen = !isInfoModalOpen;
    
    if (isInfoModalOpen) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// Go back to catalog
function goBack() {
    // Check if we came from catalog or go to catalog by default
    if (document.referrer && document.referrer.includes(window.location.origin)) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

// Open current product in order page
function orderCurrentProduct() {
    const currentProduct = focusProducts[currentFocusIndex];
    if (currentProduct) {
        const urlParams = new URLSearchParams();
        urlParams.set('id', currentProduct.id);
        window.location.href = `order.html?${urlParams.toString()}`;
    }
}

// Utility function - same as in script.js
function getCategoryDisplayName(category) {
    const categoryNames = {
        'electronics': 'Electronics',
        'fashion': 'Fashion',
        'home': 'Home & Living',
        'beauty': 'Beauty',
        'all': 'All Products'
    };
    return categoryNames[category] || category;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Preload images for smoother experience
function preloadImages() {
    focusProducts.forEach(product => {
        const img = new Image();
        img.src = product.image;
    });
}

// Call preload images after products are loaded
setTimeout(preloadImages, 100);

// Handle page visibility change to pause/resume functionality
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, pause any animations or auto-scroll
    } else {
        // Page is visible, resume functionality
        updateNavigation();
    }
});

// Setup expandable description functionality
function setupExpandableDescription(element, description) {
    const descriptionElement = element.querySelector('.focus-description');
    const toggleButton = element.querySelector('.focus-description-toggle');
    
    // Convert newlines to paragraphs
    const paragraphs = description.split('\n\n').filter(p => p.trim());
    
    if (paragraphs.length <= 1) {
        // Short description, show all
        descriptionElement.innerHTML = paragraphs[0] || description;
        return;
    }
    
    // Show first paragraph initially
    const shortText = paragraphs[0];
    const fullText = paragraphs.map(p => `<p class="mb-3 last:mb-0">${p}</p>`).join('');
    
    descriptionElement.innerHTML = `<p>${shortText}</p>`;
    toggleButton.classList.remove('hidden');
    
    let isExpanded = false;
    
    toggleButton.addEventListener('click', function() {
        isExpanded = !isExpanded;
        
        if (isExpanded) {
            descriptionElement.innerHTML = fullText;
            toggleButton.querySelector('.toggle-text').textContent = 'Show less';
            toggleButton.querySelector('.toggle-icon').style.transform = 'rotate(180deg)';
        } else {
            descriptionElement.innerHTML = `<p>${shortText}</p>`;
            toggleButton.querySelector('.toggle-text').textContent = 'Read more';
            toggleButton.querySelector('.toggle-icon').style.transform = 'rotate(0deg)';
        }
    });
}

// Initialize image carousels for all products
function initializeImageCarousels() {
    const carousels = document.querySelectorAll('.focus-image-carousel');
    
    carousels.forEach((carousel, index) => {
        new Swiper(carousel, {
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                dynamicBullets: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            keyboard: {
                enabled: true,
            },
            grabCursor: true,
            effect: 'slide',
            speed: 300,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            breakpoints: {
                768: {
                    autoplay: false, // Disable autoplay on desktop
                }
            }
        });
    });
}

// Open image in modal view
function openImageModal(imageSrc, productName) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('image-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'image-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 hidden flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="relative max-w-4xl max-h-full">
                <button onclick="closeImageModal()" class="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl z-10">
                    <i class="fas fa-times"></i>
                </button>
                <img id="modal-image" class="max-w-full max-h-full object-contain rounded-lg" src="" alt="">
                <div class="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                    <p id="modal-image-title" class="text-sm font-medium"></p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close modal on click outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeImageModal();
            }
        });
        
        // Close modal on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeImageModal();
            }
        });
    }
    
    // Set image and title
    document.getElementById('modal-image').src = imageSrc;
    document.getElementById('modal-image-title').textContent = productName;
    
    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close image modal
function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}
