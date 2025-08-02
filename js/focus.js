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
        initializeMediaCarousels();
    }, 100);
}

// Helper function to detect if media is video
function isVideo(mediaSrc) {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    return videoExtensions.some(ext => mediaSrc.toLowerCase().includes(ext));
}

// Create video element
function createVideoElement(videoSrc, productName, index) {
    return `
        <video 
            src="${videoSrc}" 
            alt="${productName} - Video ${index + 1}"
            class="w-full h-80 object-cover cursor-pointer"
            controls
            preload="metadata"
            poster=""
            onloadstart="handleMediaLoad(this)"
            onerror="handleMediaError(this)"
        >
            Your browser does not support the video tag.
        </video>
    `;
}

// Create image element
function createImageElement(imageSrc, productName, index) {
    return `
        <img 
            src="${imageSrc}" 
            alt="${productName} - Image ${index + 1}"
            class="w-full h-80 object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
            loading="lazy"
            onclick="openImageModal('${imageSrc}', '${productName}')"
            onload="handleMediaLoad(this)"
            onerror="handleMediaError(this)"
        >
    `;
}

// Handle media loading
function handleMediaLoad(element) {
    element.style.opacity = '1';
}

// Handle media errors
function handleMediaError(element) {
    if (element.tagName === 'VIDEO') {
        element.outerHTML = `
            <div class="w-full h-80 bg-gray-200 flex items-center justify-center">
                <div class="text-center text-gray-500">
                    <i class="fas fa-video-slash text-4xl mb-2"></i>
                    <p>Video unavailable</p>
                </div>
            </div>
        `;
    } else {
        element.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f3f4f6"/><text x="200" y="150" text-anchor="middle" fill="%236b7280" font-family="Arial, sans-serif" font-size="16">Image not available</text></svg>';
    }
}

// Setup dynamic rating stars
function setupRatingStars(focusElement, rating) {
    const starsContainer = focusElement.querySelector('.focus-rating-stars');
    const numericRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.5;
    
    starsContainer.innerHTML = '';
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        const star = document.createElement('i');
        star.className = 'fas fa-star text-sm';
        starsContainer.appendChild(star);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
        const halfStar = document.createElement('i');
        halfStar.className = 'fas fa-star-half-alt text-sm';
        starsContainer.appendChild(halfStar);
    }
    
    // Add empty stars to make 5 total
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        const star = document.createElement('i');
        star.className = 'far fa-star text-sm';
        starsContainer.appendChild(star);
    }
}

// Setup stock status with proper styling
function setupStockStatus(focusElement, stock) {
    const stockElement = focusElement.querySelector('.focus-stock');
    const stockNum = parseInt(stock);
    
    if (stockNum > 10) {
        stockElement.textContent = 'In Stock';
        stockElement.className = 'focus-stock font-semibold text-green-600';
    } else if (stockNum > 0) {
        stockElement.textContent = `Low Stock (${stockNum})`;
        stockElement.className = 'focus-stock font-semibold text-orange-600';
    } else {
        stockElement.textContent = 'Out of Stock';
        stockElement.className = 'focus-stock font-semibold text-red-600';
    }
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
    
    // Handle discount pricing
    if (product.originalPrice && product.discount) {
        const originalPriceEl = focusElement.querySelector('.focus-original-price');
        const discountEl = focusElement.querySelector('.focus-discount');
        
        originalPriceEl.textContent = product.originalPrice;
        originalPriceEl.classList.remove('hidden');
        
        discountEl.textContent = `-${product.discount}%`;
        discountEl.classList.remove('hidden');
    }
    
    // Setup enhanced media carousel (images + videos)
    const swiperWrapper = focusElement.querySelector('.swiper-wrapper');
    const mediaItems = product.media || product.images || [product.image];
    
    mediaItems.forEach((mediaSrc, mediaIndex) => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        
        // Auto-detect media type
        if (isVideo(mediaSrc)) {
            slide.innerHTML = createVideoElement(mediaSrc, product.name, mediaIndex);
        } else {
            slide.innerHTML = createImageElement(mediaSrc, product.name, mediaIndex);
        }
        
        swiperWrapper.appendChild(slide);
    });
    
    // Update media counter
    const currentMediaEl = focusElement.querySelector('.current-media');
    const totalMediaEl = focusElement.querySelector('.total-media');
    if (currentMediaEl && totalMediaEl) {
        currentMediaEl.textContent = '1';
        totalMediaEl.textContent = mediaItems.length.toString();
    }
    
    // Setup dynamic rating stars
    setupRatingStars(focusElement, product.rating);
    
    // Setup expandable description
    setupExpandableDescription(focusElement, product.description);
    
    // Setup stock status with proper styling
    setupStockStatus(focusElement, product.stock);
    
    // Add data attribute for tracking
    const productFocus = focusElement.querySelector('.product-focus');
    productFocus.dataset.productId = product.id;
    productFocus.dataset.index = index;
    
    return focusElement;
}

// Setup event listeners for focus view
function setupFocusEventListeners() {
    const container = document.getElementById('product-container');
    
    // Scroll event listener for navigation update
    container.addEventListener('scroll', debounce(updateCurrentIndex, 100));
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Touch/swipe gestures for product navigation
    setupTouchNavigation(container);
}

// Initialize enhanced media carousels
function initializeMediaCarousels() {
    const carousels = document.querySelectorAll('.focus-media-carousel');
    carousels.forEach((carousel, index) => {
        // Add unique class for multiple carousels
        const uniqueClass = `media-carousel-${index}`;
        carousel.classList.add(uniqueClass);
        
        new Swiper(`.${uniqueClass}`, {
            loop: false,
            speed: 600,
            effect: 'slide',
            spaceBetween: 0,
            centeredSlides: true,
            pagination: {
                el: `.${uniqueClass} .swiper-pagination`,
                clickable: true,
                dynamicBullets: true,
                dynamicMainBullets: 3,
            },
            navigation: {
                nextEl: `.${uniqueClass} .swiper-button-next`,
                prevEl: `.${uniqueClass} .swiper-button-prev`,
            },
            keyboard: {
                enabled: true,
                onlyInViewport: true,
            },
            mousewheel: {
                forceToAxis: true,
            },
            touchRatio: 1,
            threshold: 10,
            grabCursor: true,
            watchSlidesProgress: true,
            preloadImages: false,
            lazy: {
                loadPrevNext: true,
                loadOnTransitionStart: true,
            },
            on: {
                slideChange: function() {
                    // Update media counter
                    const currentMediaEl = carousel.querySelector('.current-media');
                    if (currentMediaEl) {
                        currentMediaEl.textContent = (this.realIndex + 1).toString();
                    }
                    
                    // Pause videos when not active
                    this.slides.forEach(slide => {
                        const video = slide.querySelector('video');
                        if (video && !slide.classList.contains('swiper-slide-active')) {
                            video.pause();
                        }
                    });
                },
                slideChangeTransitionEnd: function() {
                    // Auto-play video in active slide if it exists
                    const activeSlide = this.slides[this.activeIndex];
                    const video = activeSlide?.querySelector('video');
                    if (video) {
                        video.currentTime = 0;
                        // Don't auto-play, let user control
                    }
                }
            }
        });
    });
}

// Enhanced action button functions
function shareProduct() {
    const currentProduct = focusProducts[currentFocusIndex];
    if (!currentProduct) return;
    
    const productUrl = window.location.href;
    
    let message = `Take a look at this ${currentProduct.name} on Our Store\n\n`;
    message += `🛍️ *${currentProduct.name}*\n`;
    message += `💰 *Special Price:* ${currentProduct.price}\n\n`;
    message += `✨ *Why choose us?*\n`;
    message += `• Premium Quality Products\n`;
    message += `• Best Prices Guaranteed\n`;
    message += `• Fast & Reliable Delivery\n`;
    message += `• Customer Satisfaction First\n\n`;
    message += `🔗 *View Details & Order:*\n${productUrl}\n\n`;
    message += `🛒 *Order now for the best deal!*`;
    
    const shareData = {
        title: currentProduct.name,
        text: message,
        url: productUrl
    };
    
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        navigator.share(shareData).catch(() => {
            // Fallback to WhatsApp sharing
            shareViaWhatsApp();
        });
    } else {
        // Fallback to WhatsApp sharing
        shareViaWhatsApp();
    }
}

function shareViaWhatsApp() {
    const currentProduct = focusProducts[currentFocusIndex];
    if (!currentProduct) return;
    
    const productUrl = window.location.href;
    
    let message = `Take a look at this ${currentProduct.name} on Our Store\n\n`;
    message += `🛍️ *${currentProduct.name}*\n`;
    message += `💰 *Special Price:* ${currentProduct.price}\n\n`;
    message += `✨ *Why choose us?*\n`;
    message += `• Premium Quality Products\n`;
    message += `• Best Prices Guaranteed\n`;
    message += `• Fast & Reliable Delivery\n`;
    message += `• Customer Satisfaction First\n\n`;
    message += `🔗 *View Details & Order:*\n${productUrl}\n\n`;
    message += `🛒 *Order now for the best deal!*`;
    
    const phoneNumber = '919868907397'; // Your WhatsApp business number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function openWhatsApp() {
    const currentProduct = focusProducts[currentFocusIndex];
    if (!currentProduct) return;
    
    const productUrl = window.location.href;
    
    let message = `🛍️ *Product Inquiry*\n\n`;
    message += `Hi! I need inquiry for this product:\n\n`;
    message += `📱 *Product:* ${currentProduct.name}\n`;
    message += `💰 *Price:* ${currentProduct.price}\n\n`;
    message += `🔗 *Product Link:* ${productUrl}\n\n`;
    message += `Could you please provide more details about:\n`;
    message += `• Product specifications & features\n`;
    message += `• Availability & stock status\n`;
    message += `• Delivery time & shipping charges\n`;
    message += `• Warranty & return policy\n`;
    message += `• Any ongoing offers or discounts\n\n`;
    message += `I'm interested in purchasing this product. Please share complete details.\n\n`;
    message += `Thank you!`;
    
    const phoneNumber = '919868907397'; // Your WhatsApp business number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function orderOnline() {
    const currentProduct = focusProducts[currentFocusIndex];
    if (!currentProduct) return;
    
    // For now, this could redirect to an order page or show a modal
    // You can customize this based on your needs
    showToast('Redirecting to order page...', 'info');
    
    // Example: redirect to order page with product ID
    setTimeout(() => {
        window.location.href = `order.html?id=${currentProduct.id}`;
    }, 1000);
}

// Helper function for fallback clipboard
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('Link copied to clipboard!', 'success');
    } catch (err) {
        showToast('Could not copy link. Please share manually.', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Enhanced toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    toast.className = `fixed top-20 right-4 ${bgColor} text-white px-4 py-3 rounded-lg z-50 transform translate-x-full transition-transform duration-300 shadow-lg`;
    toast.innerHTML = `
        <div class="flex items-center">
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
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
