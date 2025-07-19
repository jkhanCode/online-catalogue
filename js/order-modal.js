// Order modal state management
let currentModalProduct = null;
let isModalOTPSectionVisible = false;
let isModalOrderConfirmed = false;

// Initialize order modal when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupOrderModalEventListeners();
});

// Setup event listeners for order modal
function setupOrderModalEventListeners() {
    const modalForm = document.getElementById('modal-order-form');
    const modalOtpInputs = document.querySelectorAll('.modal-otp-input');
    const modalResendBtn = document.getElementById('modal-resend-otp');
    
    // Form validation
    if (modalForm) {
        modalForm.addEventListener('input', validateModalForm);
    }
    
    // OTP input handling
    modalOtpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => handleModalOTPInput(e, index));
        input.addEventListener('keydown', (e) => handleModalOTPKeydown(e, index));
    });
    
    // Resend OTP button
    if (modalResendBtn) {
        modalResendBtn.addEventListener('click', resendModalOTP);
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
    isModalOTPSectionVisible = false;
    isModalOrderConfirmed = false;
    
    // Reset form
    resetModalForm();
}

// Reset modal form
function resetModalForm() {
    const form = document.getElementById('modal-order-form');
    if (form) {
        form.reset();
    }
    
    // Hide OTP section
    const otpSection = document.getElementById('modal-otp-section');
    otpSection.classList.add('hidden');
    
    // Reset buttons
    const verifyBtn = document.getElementById('modal-verify-phone-btn');
    const confirmBtn = document.getElementById('modal-confirm-order-btn');
    
    verifyBtn.style.display = 'block';
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<i class="fas fa-mobile-alt mr-2"></i>Verify Phone Number';
    
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Confirm Order';
    
    // Clear OTP inputs
    const otpInputs = document.querySelectorAll('.modal-otp-input');
    otpInputs.forEach(input => {
        input.value = '';
        input.classList.remove('border-green-500', 'bg-green-50');
        input.classList.add('border-gray-300');
    });
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
    
    // Enable/disable verify phone button
    const verifyBtn = document.getElementById('modal-verify-phone-btn');
    if (verifyBtn) {
        verifyBtn.disabled = !isValid;
        verifyBtn.classList.toggle('opacity-50', !isValid);
    }
}

// Show OTP verification section
function showModalOTPSection() {
    const form = document.getElementById('modal-order-form');
    const formData = new FormData(form);
    
    const phone = formData.get('phone')?.trim();
    
    if (!phone || phone.length < 10) {
        alert('Please enter a valid phone number');
        return;
    }
    
    // Show OTP section
    const otpSection = document.getElementById('modal-otp-section');
    otpSection.classList.remove('hidden');
    
    // Hide verify phone button
    const verifyBtn = document.getElementById('modal-verify-phone-btn');
    const confirmBtn = document.getElementById('modal-confirm-order-btn');
    
    verifyBtn.style.display = 'none';
    confirmBtn.disabled = true;
    
    // Simulate sending OTP
    simulateModalSendOTP(phone);
    
    // Focus on first OTP input
    const firstOTPInput = document.querySelector('.modal-otp-input');
    if (firstOTPInput) {
        setTimeout(() => firstOTPInput.focus(), 100);
    }
    
    isModalOTPSectionVisible = true;
}

// Simulate sending OTP
function simulateModalSendOTP(phone) {
    const verifyBtn = document.getElementById('modal-verify-phone-btn');
    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending OTP...';
    
    setTimeout(() => {
        verifyBtn.innerHTML = '<i class="fas fa-check mr-2"></i>OTP Sent!';
        setTimeout(() => {
            verifyBtn.style.display = 'none';
        }, 1000);
    }, 2000);
}

// Handle OTP input
function handleModalOTPInput(event, index) {
    const input = event.target;
    const value = input.value;
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) {
        input.value = value.replace(/\D/g, '');
        return;
    }
    
    // Move to next input if current is filled
    if (value.length === 1 && index < 5) {
        const nextInput = document.querySelectorAll('.modal-otp-input')[index + 1];
        if (nextInput) {
            nextInput.focus();
        }
    }
    
    // Check if all OTP inputs are filled
    checkModalOTPComplete();
}

// Handle OTP input keydown events
function handleModalOTPKeydown(event, index) {
    // Handle backspace to move to previous input
    if (event.key === 'Backspace' && !event.target.value && index > 0) {
        const prevInput = document.querySelectorAll('.modal-otp-input')[index - 1];
        if (prevInput) {
            prevInput.focus();
        }
    }
}

// Check if OTP is complete
function checkModalOTPComplete() {
    const otpInputs = document.querySelectorAll('.modal-otp-input');
    const otpValue = Array.from(otpInputs).map(input => input.value).join('');
    
    const confirmBtn = document.getElementById('modal-confirm-order-btn');
    
    if (otpValue.length === 6) {
        confirmBtn.disabled = false;
        confirmBtn.classList.remove('opacity-50');
        
        // Simulate OTP verification
        setTimeout(() => validateModalOTP(otpValue), 500);
    } else {
        confirmBtn.disabled = true;
        confirmBtn.classList.add('opacity-50');
    }
}

// Validate OTP (simulated)
function validateModalOTP(otp) {
    const otpInputs = document.querySelectorAll('.modal-otp-input');
    
    // Visual feedback for successful validation
    otpInputs.forEach(input => {
        input.classList.add('border-green-500', 'bg-green-50');
        input.classList.remove('border-gray-300');
    });
    
    // Enable confirm order button
    const confirmBtn = document.getElementById('modal-confirm-order-btn');
    confirmBtn.disabled = false;
    confirmBtn.classList.remove('opacity-50');
}

// Resend OTP
function resendModalOTP() {
    const resendBtn = document.getElementById('modal-resend-otp');
    
    // Clear existing OTP inputs
    const otpInputs = document.querySelectorAll('.modal-otp-input');
    otpInputs.forEach(input => {
        input.value = '';
        input.classList.remove('border-green-500', 'bg-green-50');
        input.classList.add('border-gray-300');
    });
    
    // Disable confirm button
    const confirmBtn = document.getElementById('modal-confirm-order-btn');
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
        const firstOTPInput = document.querySelector('.modal-otp-input');
        if (firstOTPInput) {
            firstOTPInput.focus();
        }
    }, 2000);
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

// Confirm order
function confirmModalOrder() {
    if (!currentModalProduct) {
        alert('No product selected');
        return;
    }
    
    const form = document.getElementById('modal-order-form');
    const formData = new FormData(form);
    
    // Collect form data
    const orderData = {
        product: currentModalProduct,
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
    const confirmBtn = document.getElementById('modal-confirm-order-btn');
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
    confirmBtn.disabled = true;
    
    // Simulate order processing
    setTimeout(() => {
        // Store order data
        localStorage.setItem('lastModalOrder', JSON.stringify(orderData));
        
        // Show success modal
        showModalSuccessModal();
        isModalOrderConfirmed = true;
    }, 2000);
}

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