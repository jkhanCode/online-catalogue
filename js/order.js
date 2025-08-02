// Order page state management
let currentOrderProduct = null;
let isOTPSectionVisible = false;
let isOrderConfirmed = false;

// Initialize order page
document.addEventListener('DOMContentLoaded', function() {
    initializeOrderPage();
    setupOrderEventListeners();
});

// Initialize order page with product data
function initializeOrderPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        currentOrderProduct = getProductById(parseInt(productId));
        if (currentOrderProduct) {
            displayProductSummary(currentOrderProduct);
        } else {
            // Product not found, redirect to catalog
            alert('Product not found. Redirecting to catalog...');
            window.location.href = 'index.html';
        }
    } else {
        // No product specified, redirect to catalog
        alert('No product selected. Redirecting to catalog...');
        window.location.href = 'index.html';
    }
}

// Display product summary in order page
function displayProductSummary(product) {
    document.getElementById('order-product-image').src = product.image;
    document.getElementById('order-product-image').alt = product.name;
    document.getElementById('order-product-name').textContent = product.name;
    document.getElementById('order-product-price').textContent = product.price;
}

// Setup event listeners for order page
function setupOrderEventListeners() {
    const form = document.getElementById('order-form');
    const otpInputs = document.querySelectorAll('.otp-input');
    const resendBtn = document.getElementById('resend-otp');
    
    // Form validation
    form.addEventListener('input', validateForm);
    
    // OTP input handling
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => handleOTPInput(e, index));
        input.addEventListener('keydown', (e) => handleOTPKeydown(e, index));
    });
    
    // Resend OTP button
    if (resendBtn) {
        resendBtn.addEventListener('click', resendOTP);
    }
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }
}

// Validate form and enable/disable buttons
function validateForm() {
    const form = document.getElementById('order-form');
    const formData = new FormData(form);
    
    const fullName = formData.get('fullName')?.trim();
    const phone = formData.get('phone')?.trim();
    const address = formData.get('address')?.trim();
    
    const isValid = fullName && phone && address && 
                   fullName.length >= 2 && 
                   phone.length >= 10 && 
                   address.length >= 10;
    
    // Enable/disable verify phone button
    const verifyBtn = document.getElementById('verify-phone-btn');
    if (verifyBtn) {
        verifyBtn.disabled = !isValid;
        verifyBtn.classList.toggle('opacity-50', !isValid);
    }
}

// Show OTP verification section
function showOTPSection() {
    const form = document.getElementById('order-form');
    const formData = new FormData(form);
    
    const phone = formData.get('phone')?.trim();
    
    if (!phone || phone.length < 10) {
        alert('Please enter a valid phone number');
        return;
    }
    
    // Show OTP section
    const otpSection = document.getElementById('otp-section');
    otpSection.classList.remove('hidden');
    
    // Hide verify phone button and show confirm order button
    const verifyBtn = document.getElementById('verify-phone-btn');
    const confirmBtn = document.getElementById('confirm-order-btn');
    
    verifyBtn.style.display = 'none';
    confirmBtn.disabled = true;
    
    // Simulate sending OTP
    simulateSendOTP(phone);
    
    // Focus on first OTP input
    const firstOTPInput = document.querySelector('.otp-input');
    if (firstOTPInput) {
        firstOTPInput.focus();
    }
    
    isOTPSectionVisible = true;
}

// Simulate sending OTP
function simulateSendOTP(phone) {
    // Show loading state
    const verifyBtn = document.getElementById('verify-phone-btn');
    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending OTP...';
    
    setTimeout(() => {
        verifyBtn.innerHTML = '<i class="fas fa-check mr-2"></i>OTP Sent!';
        setTimeout(() => {
            verifyBtn.style.display = 'none';
        }, 1000);
    }, 2000);
}

// Handle OTP input
function handleOTPInput(event, index) {
    const input = event.target;
    const value = input.value;
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) {
        input.value = value.replace(/\D/g, '');
        return;
    }
    
    // Move to next input if current is filled
    if (value.length === 1 && index < 5) {
        const nextInput = document.querySelectorAll('.otp-input')[index + 1];
        if (nextInput) {
            nextInput.focus();
        }
    }
    
    // Check if all OTP inputs are filled
    checkOTPComplete();
}

// Handle OTP input keydown events
function handleOTPKeydown(event, index) {
    // Handle backspace to move to previous input
    if (event.key === 'Backspace' && !event.target.value && index > 0) {
        const prevInput = document.querySelectorAll('.otp-input')[index - 1];
        if (prevInput) {
            prevInput.focus();
        }
    }
}

// Check if OTP is complete
function checkOTPComplete() {
    const otpInputs = document.querySelectorAll('.otp-input');
    const otpValue = Array.from(otpInputs).map(input => input.value).join('');
    
    const confirmBtn = document.getElementById('confirm-order-btn');
    
    if (otpValue.length === 6) {
        confirmBtn.disabled = false;
        confirmBtn.classList.remove('opacity-50');
        
        // Simulate OTP verification
        setTimeout(() => validateOTP(otpValue), 500);
    } else {
        confirmBtn.disabled = true;
        confirmBtn.classList.add('opacity-50');
    }
}

// Validate OTP (simulated)
function validateOTP(otp) {
    // For demo purposes, accept any 6-digit OTP
    // In real implementation, this would be validated server-side
    
    const otpInputs = document.querySelectorAll('.otp-input');
    
    // Visual feedback for successful validation
    otpInputs.forEach(input => {
        input.classList.add('border-green-500', 'bg-green-50');
        input.classList.remove('border-gray-300');
    });
    
    // Enable confirm order button
    const confirmBtn = document.getElementById('confirm-order-btn');
    confirmBtn.disabled = false;
    confirmBtn.classList.remove('opacity-50');
}

// Resend OTP
function resendOTP() {
    const resendBtn = document.getElementById('resend-otp');
    
    // Clear existing OTP inputs
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach(input => {
        input.value = '';
        input.classList.remove('border-green-500', 'bg-green-50');
        input.classList.add('border-gray-300');
    });
    
    // Disable confirm button
    const confirmBtn = document.getElementById('confirm-order-btn');
    confirmBtn.disabled = true;
    confirmBtn.classList.add('opacity-50');
    
    // Show loading state
    resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Resending...';
    resendBtn.disabled = true;
    
    // Simulate resending
    setTimeout(() => {
        resendBtn.innerHTML = 'Resend OTP';
        resendBtn.disabled = false;
        
        // Focus on first OTP input
        const firstOTPInput = document.querySelector('.otp-input');
        if (firstOTPInput) {
            firstOTPInput.focus();
        }
    }, 2000);
}

// Format phone number input
function formatPhoneNumber(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
    }
    
    event.target.value = value;
}

// Confirm order
function confirmOrder() {
    if (!currentOrderProduct) {
        alert('No product selected');
        return;
    }
    
    const form = document.getElementById('order-form');
    const formData = new FormData(form);
    
    // Collect form data
    const orderData = {
        product: currentOrderProduct,
        customer: {
            name: formData.get('fullName'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            address: formData.get('address'),
            instructions: formData.get('instructions')
        },
        timestamp: new Date().toISOString()
    };
    
    // Show loading state
    const confirmBtn = document.getElementById('confirm-order-btn');
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
    confirmBtn.disabled = true;
    
    // Simulate order processing
    setTimeout(() => {
        // Store order data (in real app, this would be sent to server)
        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        
        // Show success modal
        showSuccessModal();
        isOrderConfirmed = true;
    }, 2000);
}

// Show success modal
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Add animation class
    const modalContent = modal.querySelector('div > div');
    modalContent.style.transform = 'scale(0.8)';
    modalContent.style.opacity = '0';
    
    setTimeout(() => {
        modalContent.style.transform = 'scale(1)';
        modalContent.style.opacity = '1';
        modalContent.style.transition = 'all 0.3s ease';
    }, 100);
}

// Order via WhatsApp (alternative flow)
function orderViaWhatsApp() {
    if (!currentOrderProduct) {
        alert('No product selected');
        return;
    }
    
    const form = document.getElementById('order-form');
    const formData = new FormData(form);
    
    const customerInfo = {
        name: formData.get('fullName'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        instructions: formData.get('instructions')
    };
    
    // Only include customer info if form is filled
    const hasCustomerInfo = customerInfo.name && customerInfo.phone && customerInfo.address;
    
    openWhatsApp(currentOrderProduct, hasCustomerInfo ? customerInfo : null);
}

// Open WhatsApp for product inquiry or order
function openWhatsApp(product, customerInfo = null) {
    if (!product) {
        alert('No product selected');
        return;
    }
    
    let message = '';
    
    if (customerInfo) {
        // Order message with customer info
        message = `🛒 *New Order Request*\n\n`;
        message += `Hi! I would like to place an order:\n\n`;
        message += `📱 *Product:* ${product.name}\n`;
        message += `💰 *Price:* ${product.price}\n\n`;
        message += `👤 *Customer Details:*\n`;
        message += `• Name: ${customerInfo.name}\n`;
        message += `• Phone: ${customerInfo.phone}\n`;
        if (customerInfo.email) message += `• Email: ${customerInfo.email}\n`;
        message += `• Address: ${customerInfo.address}\n`;
        if (customerInfo.instructions) message += `• Special Instructions: ${customerInfo.instructions}\n`;
        message += `\n🔗 *Product Link:* ${window.location.href}\n\n`;
        message += `Please confirm my order and let me know the next steps.\n\n`;
        message += `Thank you!`;
    } else {
        // Product inquiry message
        message = `🛍️ *Product Inquiry*\n\n`;
        message += `Hi! I need inquiry for this product:\n\n`;
        message += `📱 *Product:* ${product.name}\n`;
        message += `💰 *Price:* ${product.price}\n\n`;
        message += `🔗 *Product Link:* ${window.location.href}\n\n`;
        message += `Could you please provide more details about:\n`;
        message += `• Product specifications & features\n`;
        message += `• Availability & stock status\n`;
        message += `• Delivery time & shipping charges\n`;
        message += `• Warranty & return policy\n`;
        message += `• Any ongoing offers or discounts\n\n`;
        message += `I'm interested in purchasing this product. Please share complete details.\n\n`;
        message += `Thank you!`;
    }
    
    const phoneNumber = '919868907397'; // Your WhatsApp business number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Go to WhatsApp from success modal
function goToWhatsApp() {
    const lastOrder = localStorage.getItem('lastOrder');
    if (lastOrder) {
        const orderData = JSON.parse(lastOrder);
        openWhatsApp(orderData.product, orderData.customer);
    }
}

// Back to catalog from success modal
function backToCatalog() {
    window.location.href = 'index.html';
}

// Go back function
function goBack() {
    if (document.referrer && document.referrer.includes(window.location.origin)) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

// Handle page unload to prevent data loss
window.addEventListener('beforeunload', function(event) {
    if (!isOrderConfirmed && isOTPSectionVisible) {
        event.preventDefault();
        event.returnValue = 'You have an incomplete order. Are you sure you want to leave?';
    }
});

// Auto-save form data to localStorage
function autoSaveFormData() {
    const form = document.getElementById('order-form');
    const formData = new FormData(form);
    
    const data = {
        fullName: formData.get('fullName'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        instructions: formData.get('instructions')
    };
    
    localStorage.setItem('orderFormData', JSON.stringify(data));
}

// Restore form data from localStorage
function restoreFormData() {
    const savedData = localStorage.getItem('orderFormData');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        document.getElementById('full-name').value = data.fullName || '';
        document.getElementById('phone').value = data.phone || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('address').value = data.address || '';
        document.getElementById('instructions').value = data.instructions || '';
    }
}

// Auto-save form data on input
document.getElementById('order-form').addEventListener('input', 
    debounce(autoSaveFormData, 1000)
);

// Restore form data on page load
setTimeout(restoreFormData, 100);

// Clear saved form data on successful order
function clearSavedFormData() {
    localStorage.removeItem('orderFormData');
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
