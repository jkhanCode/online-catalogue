// DOM elements
const productGrid = document.getElementById('product-grid');
const loadingElement = document.getElementById('loading');
const noProductsElement = document.getElementById('no-products');
const filterButtons = document.querySelectorAll('.filter-btn');

// State management
let currentFilter = 'all';
let currentProducts = [...products];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
});

// Load and display products
function loadProducts(category = 'all') {
    showLoading();
    
    // Simulate loading delay for better UX
    setTimeout(() => {
        currentProducts = getProductsByCategory(category);
        displayProducts(currentProducts);
        hideLoading();
        
        if (currentProducts.length === 0) {
            showNoProducts();
        } else {
            hideNoProducts();
        }
    }, 300);
}

// Display products in the grid
function displayProducts(productsToShow) {
    productGrid.innerHTML = '';
    
    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productGrid.appendChild(productCard);
    });
}

// Create individual product card
function createProductCard(product) {
    const template = document.getElementById('product-card-template');
    const cardElement = template.content.cloneNode(true);
    
    // Populate product data
    cardElement.querySelector('.product-image').src = product.image;
    cardElement.querySelector('.product-image').alt = product.name;
    cardElement.querySelector('.product-name').textContent = product.name;
    cardElement.querySelector('.product-price').textContent = product.price;
    cardElement.querySelector('.product-rating').textContent = product.rating;
    cardElement.querySelector('.product-category').textContent = getCategoryDisplayName(product.category);
    
    // Setup expandable description for product card
    setupProductCardDescription(cardElement, product.description);
    
    // Add event listeners
    const viewFullBtn = cardElement.querySelector('.view-full-btn');
    const orderBtn = cardElement.querySelector('.order-btn');
    const whatsappBtn = cardElement.querySelector('.whatsapp-btn');
    
    viewFullBtn.addEventListener('click', () => openFocusView(product.id));
    orderBtn.addEventListener('click', () => openOrderModal(product.id));
    whatsappBtn.addEventListener('click', () => openWhatsApp(product));
    
    return cardElement;
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            filterProducts(category);
            updateActiveFilter(this);
        });
    });
    
    // Search functionality (if search input exists)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
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
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        displayProducts(getProductsByCategory(currentFilter));
        return;
    }
    
    const filteredProducts = currentProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
    
    displayProducts(filteredProducts);
    
    if (filteredProducts.length === 0) {
        showNoProducts();
    } else {
        hideNoProducts();
    }
}

// Open focus view for a specific product
function openFocusView(productId) {
    const urlParams = new URLSearchParams();
    urlParams.set('id', productId);
    urlParams.set('index', getProductIndex(productId));
    window.location.href = `focus.html?${urlParams.toString()}`;
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
    loadingElement.classList.remove('hidden');
    productGrid.classList.add('hidden');
}

function hideLoading() {
    loadingElement.classList.add('hidden');
    productGrid.classList.remove('hidden');
}

function showNoProducts() {
    noProductsElement.classList.remove('hidden');
}

function hideNoProducts() {
    noProductsElement.classList.add('hidden');
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

// Setup expandable description for product card
function setupProductCardDescription(cardElement, description) {
    const descriptionElement = cardElement.querySelector('.product-description');
    const toggleButton = cardElement.querySelector('.product-description-toggle');
    
    // Convert newlines to spaces for card display
    const cleanDescription = description.replace(/\n+/g, ' ');
    
    // Check if description is long enough to need expansion
    if (cleanDescription.length <= 120) {
        // Short description, show all
        descriptionElement.textContent = cleanDescription;
        return;
    }
    
    // Show truncated text initially
    const shortText = cleanDescription.substring(0, 120) + '...';
    const fullText = cleanDescription;
    
    descriptionElement.textContent = shortText;
    descriptionElement.classList.remove('line-clamp-2');
    toggleButton.classList.remove('hidden');
    
    let isExpanded = false;
    
    toggleButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        isExpanded = !isExpanded;
        
        if (isExpanded) {
            descriptionElement.textContent = fullText;
            descriptionElement.classList.remove('line-clamp-2');
            toggleButton.querySelector('.toggle-text').textContent = 'Show less';
            toggleButton.querySelector('.toggle-icon').style.transform = 'rotate(180deg)';
        } else {
            descriptionElement.textContent = shortText;
            descriptionElement.classList.add('line-clamp-2');
            toggleButton.querySelector('.toggle-text').textContent = 'Read more';
            toggleButton.querySelector('.toggle-icon').style.transform = 'rotate(0deg)';
        }
    });
}
