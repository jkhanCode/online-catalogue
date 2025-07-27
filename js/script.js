// DOM elements cache
const DOM = {
    productGrid: document.getElementById('product-grid'),
    loadingElement: document.getElementById('loading'),
    loadingSkeleton: document.getElementById('loading-skeleton'),
    noProductsElement: document.getElementById('no-products'),
    errorState: document.getElementById('error-state'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    searchInput: document.getElementById('search-input'),
    clearSearch: document.getElementById('clear-search')
};

// State management
let currentFilter = 'all';
let currentProducts = [...products];
let currentSearchTerm = '';
let isLoading = false;
let loadedImages = new Set();

// Error handling
let retryCount = 0;
const MAX_RETRIES = 3;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeApp();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showErrorState();
    }
});

// Initialize application
function initializeApp() {
    setupEventListeners();
    createSkeletonCards();
    loadProducts();
    setupLazyLoading();
    setupAccessibility();
}

// Load and display products with error handling
function loadProducts(category = 'all', searchTerm = '') {
    if (isLoading) return;
    
    isLoading = true;
    showLoading();
    hideErrorState();
    
    try {
        // Simulate loading delay for better UX
        setTimeout(() => {
            try {
                let filteredProducts = getProductsByCategory(category);
                
                // Apply search filter if search term exists
                if (searchTerm.trim()) {
                    filteredProducts = searchProducts(filteredProducts, searchTerm);
                }
                
                currentProducts = filteredProducts;
                displayProducts(currentProducts);
                hideLoading();
                
                if (currentProducts.length === 0) {
                    showNoProducts();
                } else {
                    hideNoProducts();
                }
                
                // Reset retry count on success
                retryCount = 0;
                isLoading = false;
                
                // Announce to screen readers
                announceToScreenReader(`${currentProducts.length} products loaded`);
                
            } catch (error) {
                console.error('Error displaying products:', error);
                handleLoadError();
            }
        }, 300);
        
    } catch (error) {
        console.error('Error loading products:', error);
        handleLoadError();
    }
}

// Handle loading errors
function handleLoadError() {
    isLoading = false;
    hideLoading();
    
    if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Retrying... Attempt ${retryCount}/${MAX_RETRIES}`);
        setTimeout(() => loadProducts(currentFilter, currentSearchTerm), 1000);
    } else {
        showErrorState();
    }
}

// Retry loading products
function retryLoadProducts() {
    retryCount = 0;
    loadProducts(currentFilter, currentSearchTerm);
}

// Display products in the grid with error handling
function displayProducts(productsToShow) {
    try {
        DOM.productGrid.innerHTML = '';
        
        if (!Array.isArray(productsToShow)) {
            throw new Error('Products data is not an array');
        }
        
        const fragment = document.createDocumentFragment();
        
        productsToShow.forEach((product, index) => {
            try {
                const productCard = createProductCard(product, index);
                fragment.appendChild(productCard);
            } catch (error) {
                console.error('Error creating product card:', error, product);
            }
        });
        
        DOM.productGrid.appendChild(fragment);
        
        // Setup lazy loading for new images
        setupLazyLoadingForNewImages();
        
        // Setup intersection observer for animations
        setTimeout(observeProductCards, 100);
        
    } catch (error) {
        console.error('Error displaying products:', error);
        throw error;
    }
}

// Create individual product card with validation and error handling
function createProductCard(product, index = 0) {
    try {
        // Validate product data
        if (!product || typeof product !== 'object') {
            throw new Error('Invalid product data');
        }
        
        const requiredFields = ['id', 'name', 'price', 'image', 'category'];
        for (const field of requiredFields) {
            if (!product[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        const template = document.getElementById('product-card-template');
        if (!template) {
            throw new Error('Product card template not found');
        }
        
        const cardElement = template.content.cloneNode(true);
        
        // Setup lazy loading for image
        const imageElement = cardElement.querySelector('.product-image');
        setupLazyImage(imageElement, product.image, product.name);
        
        // Populate product data with sanitization
        const titleElement = cardElement.querySelector('.product-name');
        titleElement.textContent = sanitizeText(product.name);
        titleElement.setAttribute('title', sanitizeText(product.name)); // Add tooltip for truncated titles
        
        cardElement.querySelector('.product-price').textContent = sanitizeText(product.price);
        cardElement.querySelector('.product-rating').textContent = sanitizeText(product.rating || 'No rating');
        cardElement.querySelector('.product-category').textContent = getCategoryDisplayName(product.category);
        
        // Add structured data
        const cardContainer = cardElement.querySelector('.product-card');
        cardContainer.setAttribute('data-product-id', product.id);
        cardContainer.setAttribute('role', 'article');
        cardContainer.setAttribute('aria-label', `Product: ${product.name}`);
        
        // Setup expandable description for product card
        setupProductCardDescription(cardElement, product.description || 'No description available');
        
        // Add event listeners with error handling
        const shareIconBtn = cardElement.querySelector('.share-icon-btn');
        const productTitle = cardElement.querySelector('.product-name');
        const orderBtn = cardElement.querySelector('.order-btn');
        const whatsappBtn = cardElement.querySelector('.whatsapp-btn');
        const shareBtn = cardElement.querySelector('.share-btn');
        
        // Add accessibility attributes
        orderBtn.setAttribute('aria-label', `Order ${product.name}`);
        whatsappBtn.setAttribute('aria-label', `Order ${product.name} via WhatsApp`);
        if (shareBtn) shareBtn.setAttribute('aria-label', `Share ${product.name}`);
        if (shareIconBtn) shareIconBtn.setAttribute('aria-label', `Share ${product.name}`);
        
        // View product handler function
        const handleViewProduct = (e) => {
            e.preventDefault();
            try {
                openFocusView(product.id);
            } catch (error) {
                console.error('Error opening focus view:', error);
                showToast('Unable to open product details', 'error');
            }
        };
        
        // Share product handler function
        const handleShareProduct = (e) => {
            e.preventDefault();
            try {
                shareProduct(product.name, product.price, product.image, window.location.href);
            } catch (error) {
                console.error('Error sharing product:', error);
                showToast('Unable to share product', 'error');
            }
        };
        
        // Product title click for viewing details
        productTitle.addEventListener('click', handleViewProduct);
        productTitle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleViewProduct(e);
            }
        });
        
        // Share button event listeners
        if (shareIconBtn) {
            shareIconBtn.addEventListener('click', handleShareProduct);
        }
        if (shareBtn) {
            shareBtn.addEventListener('click', handleShareProduct);
        }
        
        orderBtn.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                openOrderModal(product.id);
            } catch (error) {
                console.error('Error opening order modal:', error);
                showToast('Unable to open order form', 'error');
            }
        });
        
        whatsappBtn.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                openWhatsApp(product);
            } catch (error) {
                console.error('Error opening WhatsApp:', error);
                showToast('Unable to open WhatsApp', 'error');
            }
        });
        
        // Add animation delay for staggered effect
        cardContainer.style.animationDelay = `${index * 100}ms`;
        
        return cardElement;
        
    } catch (error) {
        console.error('Error creating product card:', error);
        return createErrorCard(error.message);
    }
}

// Create error card fallback
function createErrorCard(errorMessage) {
    const errorCard = document.createElement('div');
    errorCard.className = 'bg-red-50 border border-red-200 rounded-xl p-6 text-center';
    errorCard.innerHTML = `
        <i class="fas fa-exclamation-triangle text-red-400 text-2xl mb-2" aria-hidden="true"></i>
        <p class="text-red-600 text-sm">Unable to load product</p>
        <p class="text-red-500 text-xs mt-1">${sanitizeText(errorMessage)}</p>
    `;
    return errorCard;
}

// Setup event listeners
function setupEventListeners() {
    try {
        // Filter buttons
        DOM.filterButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.dataset.category;
                filterProducts(category);
                updateActiveFilter(this);
            });
        });
        
        // Search functionality
        if (DOM.searchInput) {
            DOM.searchInput.addEventListener('input', debounce(handleSearch, 300));
            DOM.searchInput.addEventListener('keydown', handleSearchKeydown);
        }
        
        // Clear search button
        if (DOM.clearSearch) {
            DOM.clearSearch.addEventListener('click', clearSearch);
        }
        
        // Global error handler
        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

// Handle search keydown events
function handleSearchKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleSearch(event);
    } else if (event.key === 'Escape') {
        clearSearch();
    }
}

// Clear search
function clearSearch() {
    DOM.searchInput.value = '';
    currentSearchTerm = '';
    DOM.clearSearch.classList.add('hidden');
    loadProducts(currentFilter, '');
    DOM.searchInput.focus();
}

// Filter products by category
function filterProducts(category) {
    currentFilter = category;
    loadProducts(category);
}

// Update active filter button
function updateActiveFilter(activeButton) {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
}

// Reset filters to show all products
function resetFilters() {
    const allButton = document.querySelector('[data-category="all"]');
    updateActiveFilter(allButton);
    filterProducts('all');
}

// Handle search functionality
function handleSearch(event) {
    try {
        const searchTerm = event.target.value.toLowerCase().trim();
        currentSearchTerm = searchTerm;
        
        // Show/hide clear button
        if (searchTerm) {
            DOM.clearSearch.classList.remove('hidden');
        } else {
            DOM.clearSearch.classList.add('hidden');
        }
        
        // Load products with search filter
        loadProducts(currentFilter, searchTerm);
        
    } catch (error) {
        console.error('Error handling search:', error);
        showToast('Search error occurred', 'error');
    }
}

// Search products function
function searchProducts(products, searchTerm) {
    if (!searchTerm.trim()) return products;
    
    const term = searchTerm.toLowerCase();
    
    return products.filter(product => {
        try {
            return (
                (product.name && product.name.toLowerCase().includes(term)) ||
                (product.description && product.description.toLowerCase().includes(term)) ||
                (product.category && product.category.toLowerCase().includes(term)) ||
                (product.brand && product.brand.toLowerCase().includes(term))
            );
        } catch (error) {
            console.error('Error filtering product:', error, product);
            return false;
        }
    });
}

// Open focus view for a specific product
function openFocusView(productId) {
    const urlParams = new URLSearchParams();
    urlParams.set('id', productId);
    window.location.href = `product.html?${urlParams.toString()}`;
}

// Open order page for a specific product
function openOrderPage(productId) {
    const urlParams = new URLSearchParams();
    urlParams.set('id', productId);
    window.location.href = `order.html?${urlParams.toString()}`;
}

// Utility functions
function getProductIndex(productId) {
    return currentProducts.findIndex(product => product.id === parseInt(productId));
}

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

function showLoading() {
    DOM.loadingElement.classList.remove('hidden');
    DOM.loadingSkeleton.classList.remove('hidden');
    DOM.productGrid.classList.add('hidden');
    DOM.noProductsElement.classList.add('hidden');
    DOM.errorState.classList.add('hidden');
}

function hideLoading() {
    DOM.loadingElement.classList.add('hidden');
    DOM.loadingSkeleton.classList.add('hidden');
    DOM.productGrid.classList.remove('hidden');
}

function showNoProducts() {
    DOM.noProductsElement.classList.remove('hidden');
    DOM.productGrid.classList.add('hidden');
}

function hideNoProducts() {
    DOM.noProductsElement.classList.add('hidden');
}

function showErrorState() {
    DOM.errorState.classList.remove('hidden');
    DOM.loadingElement.classList.add('hidden');
    DOM.loadingSkeleton.classList.add('hidden');
    DOM.productGrid.classList.add('hidden');
    DOM.noProductsElement.classList.add('hidden');
}

function hideErrorState() {
    DOM.errorState.classList.add('hidden');
}

// Debounce function for search
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

// Add smooth scrolling behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe product cards for animation
function observeProductCards() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Call this after products are loaded
setTimeout(observeProductCards, 100);

// Utility Functions

// Text sanitization to prevent XSS
function sanitizeText(text) {
    if (typeof text !== 'string') return String(text || '');
    return text.replace(/[<>\"'&]/g, function(match) {
        const escapeMap = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '&': '&amp;'
        };
        return escapeMap[match];
    });
}

// Create skeleton loading cards
function createSkeletonCards() {
    const skeletonContainer = DOM.loadingSkeleton;
    if (!skeletonContainer) return;
    
    // Create 6 skeleton cards
    for (let i = 0; i < 6; i++) {
        const skeletonCard = document.createElement('div');
        skeletonCard.className = 'skeleton-card';
        skeletonCard.innerHTML = `
            <div class="skeleton-image"></div>
            <div class="p-4">
                <div class="skeleton-text long mb-2"></div>
                <div class="skeleton-text medium mb-3"></div>
                <div class="skeleton-text short mb-4"></div>
                <div class="flex space-x-2">
                    <div class="skeleton-button flex-1"></div>
                    <div class="skeleton-button w-12"></div>
                </div>
            </div>
        `;
        skeletonContainer.appendChild(skeletonCard);
    }
}

// Lazy loading setup
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    loadImage(img);
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        // Store observer for later use
        window.imageObserver = imageObserver;
    }
}

// Setup lazy loading for new images
function setupLazyLoadingForNewImages() {
    if (window.imageObserver) {
        const lazyImages = DOM.productGrid.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => window.imageObserver.observe(img));
    }
}

// Setup lazy image loading
function setupLazyImage(imgElement, src, alt) {
    imgElement.setAttribute('data-src', src);
    imgElement.alt = alt;
    imgElement.classList.add('loading');
    
    // Add placeholder
    imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+';
    
    if (window.imageObserver) {
        window.imageObserver.observe(imgElement);
    } else {
        // Fallback for browsers without IntersectionObserver
        loadImage(imgElement);
    }
}

// Load image with error handling
function loadImage(imgElement) {
    const src = imgElement.getAttribute('data-src');
    if (!src || loadedImages.has(src)) return;
    
    const tempImg = new Image();
    
    tempImg.onload = function() {
        imgElement.src = src;
        imgElement.classList.remove('loading');
        imgElement.classList.add('loaded');
        loadedImages.add(src);
        imgElement.removeAttribute('data-src');
    };
    
    tempImg.onerror = function() {
        imgElement.classList.remove('loading');
        imgElement.classList.add('error');
        console.error('Failed to load image:', src);
        imgElement.removeAttribute('data-src');
    };
    
    tempImg.src = src;
}

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type} fixed top-4 right-4 z-50 bg-white border rounded-lg shadow-lg p-4 max-w-sm transform translate-x-full transition-transform duration-300`;
    
    const icon = type === 'error' ? 'fas fa-exclamation-circle text-red-500' : 
                 type === 'success' ? 'fas fa-check-circle text-green-500' : 
                 'fas fa-info-circle text-blue-500';
    
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="${icon} mr-2" aria-hidden="true"></i>
            <span class="text-gray-800">${sanitizeText(message)}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
        toast.classList.add('translate-x-0');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('translate-x-full');
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// Screen reader announcements
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Setup accessibility features
function setupAccessibility() {
    // Add keyboard navigation for filter buttons
    DOM.filterButtons.forEach((button, index) => {
        button.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const direction = e.key === 'ArrowRight' ? 1 : -1;
                const nextIndex = (index + direction + DOM.filterButtons.length) % DOM.filterButtons.length;
                DOM.filterButtons[nextIndex].focus();
            }
        });
    });
}

// Global error handlers
function handleGlobalError(event) {
    console.error('Global error:', event.error);
    showToast('An unexpected error occurred', 'error');
}

function handleUnhandledRejection(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showToast('An unexpected error occurred', 'error');
}

// Update active filter with accessibility
function updateActiveFilter(activeButton) {
    DOM.filterButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    activeButton.classList.add('active');
    activeButton.setAttribute('aria-pressed', 'true');
}

// Setup trimmed description for product card (no read more functionality)
function setupProductCardDescription(cardElement, description) {
    const descriptionElement = cardElement.querySelector('.product-description');
    
    // Convert newlines to spaces for card display
    const cleanDescription = description.replace(/\n+/g, ' ');
    
    // Always show trimmed content with line-clamp-2 for consistent layout
    descriptionElement.textContent = cleanDescription;
    descriptionElement.classList.add('line-clamp-2');
}

// Product sharing functionality
function shareProduct(productName, productPrice, productImage, productUrl) {
    // If no parameters provided, share the main page
    if (!productName) {
        productName = 'Our Amazing Products';
        productPrice = '';
        productUrl = window.location.href;
    }
    
    const productData = {
        title: `${productName} - Shop with Us`,
        text: productPrice ? 
            `Check out this amazing ${productName} for just ${productPrice}!` : 
            `Check out our amazing products collection!`,
        url: productUrl || window.location.href
    };

    // Check if Web Share API is supported
    if (navigator.share && navigator.canShare && navigator.canShare(productData)) {
        navigator.share(productData)
            .then(() => {
                showToast('Product shared successfully!', 'success');
            })
            .catch((error) => {
                console.log('Error sharing:', error);
                shareViaWhatsApp(productName, productPrice, productUrl);
            });
    } else {
        // Fallback: Share via WhatsApp
        shareViaWhatsApp(productName, productPrice, productUrl);
    }
}

// Share via WhatsApp function
function shareViaWhatsApp(productName, productPrice, productUrl) {
    const baseMessage = productPrice ? 
        `Check out this amazing product: *${productName}* for just *${productPrice}*!` :
        `Check out our amazing products collection!`;
    const message = `${baseMessage}\n\n${productUrl || window.location.href}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    showToast('Sharing via WhatsApp...', 'info');
}
