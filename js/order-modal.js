// Order modal state management
let currentModalProduct = null;
let isModalPaymentSectionVisible = false;
let isModalOrderConfirmed = false;
let hasSharedPaymentScreenshot = false;

// Initialize order modal when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupOrderModalEventListeners();
});

// Setup event listeners for order modal
function setupOrderModalEventListeners() {
    const modalForm = document.getElementById('modal-order-form');
    
    // Form validation
    if (modalForm) {
        modalForm.addEventListener('input', validateModalForm);
    }
    
    // Phone number formatting
    const modalPhoneInput = document.getElementById('modal-phone');
    if (modalPhoneInput) {
        modalPhoneInput.addEventListener('input', formatModalPhoneNumber);
    }
    
    // Close modal when clicking outside
    const orderModal = document.getElementById('order-modal');
    if (orderModal) {
        orderModal.addEventListener('click', function(e) {
            if (e.target === orderModal) {
                closeOrderModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeOrderModal();
        }
    });
}

// Open order modal for a specific product
function openOrderModal(productId) {
    const product = getProductById(productId);
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }
    
    currentModalProduct = product;
    
    // Display product summary
    document.getElementById('modal-product-image').src = product.image;
    document.getElementById('modal-product-image').alt = product.name;
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-product-price').textContent = product.price;
    
    // Reset form and state
    resetModalForm();
    
    // Show modal
    const modal = document.getElementById('order-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Focus on first input
    const firstInput = document.getElementById('modal-full-name');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

// Close order modal
function closeOrderModal() {
    const modal = document.getElementById('order-modal');
    const successModal = document.getElementById('modal-success-modal');
    
    modal.classList.add('hidden');
    successModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Reset state
    currentModalProduct = null;
    isModalPaymentSectionVisible = false;
    isModalOrderConfirmed = false;
    hasSharedPaymentScreenshot = false;
    
    // Reset form
    resetModalForm();
}

// Reset modal form
function resetModalForm() {
    const form = document.getElementById('modal-order-form');
    if (form) {
        form.reset();
    }
    
    // Hide payment section
    const paymentSection = document.getElementById('modal-payment-section');
    if (paymentSection) {
        paymentSection.style.display = 'none';
    }
    
    // Show action buttons
    const actionBtns = document.getElementById('modal-action-buttons');
    if (actionBtns) {
        actionBtns.style.display = 'block';
    }
    
    // Reset buttons
    const payNowBtn = document.getElementById('modal-pay-now-btn');
    const continueBtn = document.getElementById('modal-continue-payment');
    
    if (payNowBtn) {
        payNowBtn.disabled = true;
        payNowBtn.innerHTML = '<i class="fas fa-credit-card mr-2"></i>Pay Now';
    }
    
    if (continueBtn) {
        continueBtn.disabled = true;
        continueBtn.classList.add('opacity-50', 'cursor-not-allowed');
        continueBtn.classList.remove('hover:bg-green-600');
    }
    
    // Reset payment state
    isModalPaymentSectionVisible = false;
    hasSharedPaymentScreenshot = false;
}

// Validate modal form
function validateModalForm() {
    const form = document.getElementById('modal-order-form');
    const formData = new FormData(form);
    
    const fullName = formData.get('fullName')?.trim();
    const phone = formData.get('phone')?.trim();
    const address = formData.get('address')?.trim();
    
    const isValid = fullName && phone && address && 
                   fullName.length >= 2 && 
                   phone.length >= 10 && 
                   address.length >= 10;
    
    // Enable/disable pay now button
    const payNowBtn = document.getElementById('modal-pay-now-btn');
    if (payNowBtn) {
        payNowBtn.disabled = !isValid;
        payNowBtn.classList.toggle('opacity-50', !isValid);
    }
    
    return isValid;
}

// Main order submission function - show payment section
function submitModalOrder(event) {
    event.preventDefault();
    
    if (!validateModalForm()) {
        showModalError('Please fill in all rdequired fields');
        return;
    }
    
    // Show payment section instead of OTP
    showModalPaymentSection();
}

// Show payment section in modal
function showModalPaymentSection() {
    const actionBtns = document.getElementById('modal-action-buttons');
    const paymentSection = document.getElementById('modal-payment-section');
    
    if (!paymentSection) {
        showModalError('Payment section not found');
        return;
    }
    
    // Hide action buttons and show payment section
    if (actionBtns) {
        actionBtns.style.display = 'none';
    }
    
    paymentSection.style.display = 'block';
    isModalPaymentSectionVisible = true;
    
    // Generate QR code for payment
    generatePaymentQR();
    
    // Show success message
    showModalSuccess('Ready to complete your purchase via WhatsApp');
}

// Connect to WhatsApp with streamlined message
function connectToWhatsApp() {
    const whatsappNumber = '919868902123';
    const message = 'Hey! I\'m ready to buy, payment is in process.';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Show success modal
    showModalOrderSuccess();
}

// Connect to WhatsApp from success modal
function connectToWhatsAppFromSuccess() {
    const whatsappNumber = '919868902123';
    const message = 'Hey! I\'m ready to buy, payment is in process.';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Close modals
    closeAllModals();
}

// Generate QR code for payment
function generatePaymentQR() {
    const qrContainer = document.getElementById('modal-qr-code');
    if (!qrContainer) return;
    
    // Get order total
    const total = getModalOrderTotal();
    
    // For demo purposes, show a placeholder QR code
    // In production, you would use a QR code library like qrcode.js
    qrContainer.innerHTML = `
        <div class="w-48 h-48 bg-white border-2 border-gray-300 flex items-center justify-center mx-auto">
            <div class="text-center">
                <div class="text-sm text-gray-600 mb-2">QR Code</div>
                <div class="text-xs text-gray-500">Amount: ₹${total}</div>
                <div class="text-xs text-gray-400 mt-1">Scan to Pay</div>
            </div>
        </div>
    `;
}

// Get modal order total
function getModalOrderTotal() {
    if (!currentModalProduct) return 0;
    
    const quantity = parseInt(document.getElementById('modal-quantity')?.value || 1);
    const price = currentModalProduct.price || 0;
    return price * quantity;
}

// Show modal order success
function showModalOrderSuccess() {
    showModalSuccessModal();
}

// Show modal error message
function showModalError(message) {
    // You can implement a toast notification or alert here
    alert(message);
}

// Show modal success message
function showModalSuccess(message) {
    // You can implement a toast notification here
    // For now, we'll just log it
    console.log('Success:', message);
}

// Format phone number input
function formatModalPhoneNumber(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
    }
    
    event.target.value = value;
}

// This function is now replaced by submitModalOrder which shows payment section directly

// Show success modal
function showModalSuccessModal() {
    const orderModal = document.getElementById('order-modal');
    const successModal = document.getElementById('modal-success-modal');
    
    orderModal.classList.add('hidden');
    successModal.classList.remove('hidden');
    
    // Add animation
    const modalContent = successModal.querySelector('div > div');
    modalContent.style.transform = 'scale(0.8)';
    modalContent.style.opacity = '0';
    
    setTimeout(() => {
        modalContent.style.transform = 'scale(1)';
        modalContent.style.opacity = '1';
        modalContent.style.transition = 'all 0.3s ease';
    }, 100);
}

// Order via WhatsApp from modal
function orderModalViaWhatsApp() {
    if (!currentModalProduct) {
        alert('No product selected');
        return;
    }
    
    const form = document.getElementById('modal-order-form');
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
    
    openWhatsApp(currentModalProduct, hasCustomerInfo ? customerInfo : null);
    
    // Close modal
    closeOrderModal();
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
    
    const phoneNumber = '919868902123'; // Your WhatsApp business number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Go to WhatsApp from success modal
function goModalToWhatsApp() {
    const lastOrder = localStorage.getItem('lastModalOrder');
    if (lastOrder) {
        const orderData = JSON.parse(lastOrder);
        openWhatsApp(orderData.product, orderData.customer);
    }
    closeOrderModal();
}

// Close all modals
function closeAllModals() {
    closeOrderModal();
}

// Auto-save form data
function autoSaveModalFormData() {
    const form = document.getElementById('modal-order-form');
    if (!form) return;
    
    const formData = new FormData(form);
    
    const data = {
        fullName: formData.get('fullName'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        instructions: formData.get('instructions')
    };
    
    localStorage.setItem('modalOrderFormData', JSON.stringify(data));
}

// Restore form data
function restoreModalFormData() {
    const savedData = localStorage.getItem('modalOrderFormData');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        const fullNameInput = document.getElementById('modal-full-name');
        const phoneInput = document.getElementById('modal-phone');
        const emailInput = document.getElementById('modal-email');
        const addressInput = document.getElementById('modal-address');
        const instructionsInput = document.getElementById('modal-instructions');
        
        if (fullNameInput) fullNameInput.value = data.fullName || '';
        if (phoneInput) phoneInput.value = data.phone || '';
        if (emailInput) emailInput.value = data.email || '';
        if (addressInput) addressInput.value = data.address || '';
        if (instructionsInput) instructionsInput.value = data.instructions || '';
    }
}

// Clear saved form data
function clearModalSavedFormData() {
    localStorage.removeItem('modalOrderFormData');
}

// Auto-save on form input with debounce
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

// Setup auto-save after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const modalForm = document.getElementById('modal-order-form');
    if (modalForm) {
        modalForm.addEventListener('input', debounce(autoSaveModalFormData, 1000));
    }
    
    // Restore form data when modal is opened
    const orderModal = document.getElementById('order-modal');
    if (orderModal) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (!orderModal.classList.contains('hidden')) {
                        setTimeout(restoreModalFormData, 100);
                    }
                }
            });
        });
        observer.observe(orderModal, { attributes: true });
    }
});