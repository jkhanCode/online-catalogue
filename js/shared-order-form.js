// Shared Order Form Component
// This component provides reusable order form functionality across different pages

class OrderFormManager {
    constructor(config = {}) {
        this.config = {
            modalId: config.modalId || 'order-modal',
            formId: config.formId || 'modal-order-form',
            isInline: config.isInline || false,
            productContext: config.productContext || null,
            ...config
        };
        
        this.currentProduct = null;
        this.isPaymentSectionVisible = false;
        this.hasSharedPaymentScreenshot = false;
        this.isOrderConfirmed = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.restoreFormData();
    }
    
    // Generate the order form HTML
    static getOrderFormHTML(config = {}) {
        const isModal = !config.isInline;
        const idPrefix = config.idPrefix || 'modal';
        
        return `
            ${isModal ? `
            <!-- Modal Header -->
            <div class="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6">
                <div class="flex items-center justify-between">
                    <h2 class="text-xl font-bold text-gray-800">
                        Complete Your Order
                    </h2>
                    <button onclick="closeOrderModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
            </div>

            <!-- Product Summary -->
            <div class="p-6 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">
                    Order Summary
                </h3>
                <div class="flex items-center space-x-4">
                    <img id="${idPrefix}-product-image" class="w-16 h-16 object-cover rounded-lg" src="" alt="" />
                    <div class="flex-1">
                        <h4 id="${idPrefix}-product-name" class="font-medium text-gray-800"></h4>
                        <p id="${idPrefix}-product-price" class="text-blue-600 font-bold"></p>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Order Form -->
            <div class="${isModal ? 'p-6' : ''}">
                <form id="${idPrefix}-order-form">
                    <div class="space-y-4">
                        <!-- Full Name -->
                        <div>
                            <label for="${idPrefix}-name" class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-user mr-2 text-gray-400"></i>Full Name *
                            </label>
                            <input type="text" id="${idPrefix}-name" name="fullName" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your full name" />
                        </div>

                        <!-- Phone Number -->
                        <div>
                            <label for="${idPrefix}-phone" class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-phone mr-2 text-gray-400"></i>Phone Number *
                            </label>
                            <input type="tel" id="${idPrefix}-phone" name="phone" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="+1 (555) 123-4567" />
                        </div>

                        <!-- Email -->
                        <div>
                            <label for="${idPrefix}-email" class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-envelope mr-2 text-gray-400"></i>Email Address
                            </label>
                            <input type="email" id="${idPrefix}-email" name="email"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="your.email@example.com" />
                        </div>

                        <!-- Delivery Address -->
                        <div>
                            <label for="${idPrefix}-address" class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-map-marker-alt mr-2 text-gray-400"></i>Delivery Address *
                            </label>
                            <textarea id="${idPrefix}-address" name="address" required rows="3"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                placeholder="Enter your complete delivery address"></textarea>
                        </div>

                        <!-- Special Instructions -->
                        <div>
                            <label for="${idPrefix}-instructions" class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-comment mr-2 text-gray-400"></i>Special Instructions
                            </label>
                            <textarea id="${idPrefix}-instructions" name="instructions" rows="2"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                placeholder="Any special requests or delivery instructions"></textarea>
                        </div>
                    </div>
                </form>

                <!-- Payment Section -->
                <div id="${idPrefix}-payment-section" class="mt-6 hidden">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-credit-card mr-2 text-blue-600"></i>Make Payment
                    </h3>
                    
                    <!-- QR Code Scanner -->
                    <div class="bg-gray-50 rounded-xl p-6 text-center mb-4">
                        <div id="${idPrefix}-qr-code" class="w-48 h-48 mx-auto bg-white rounded-lg shadow-sm flex items-center justify-center mb-4">
                            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0icXIiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJ3aGl0ZSIvPjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSIxNSIgeT0iNSIgd2lkdGg9IjUiIGhlaWdodD0iNSIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSI1IiB5PSIxNSIgd2lkdGg9IjUiIGhlaWdodD0iNSIgZmlsbD0iYmxhY2siLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI3FyKSIvPjx0ZXh0IHg9IjEwMCIgeT0iMjIwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNjYW4gdG8gUGF5PC90ZXh0Pjwvc3ZnPg==" 
                                 alt="Payment QR Code" class="w-full h-full object-contain" />
                        </div>
                        <div class="text-center">
                            <p class="text-sm font-medium text-gray-800 mb-2">
                                <i class="fas fa-qrcode mr-2 text-blue-600"></i>Scan to Pay
                            </p>
                            <p class="text-xs text-gray-600 mb-3">
                                Scan this QR code with your UPI app to make payment
                            </p>
                            <div class="flex items-center justify-center space-x-4 text-xs text-gray-500">
                                <span class="flex items-center">
                                    <i class="fab fa-google-pay text-blue-600 mr-1"></i>GPay
                                </span>
                                <span class="flex items-center">
                                    <i class="fas fa-mobile-alt text-purple-600 mr-1"></i>PhonePe
                                </span>
                                <span class="flex items-center">
                                    <i class="fas fa-university text-orange-600 mr-1"></i>Paytm
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Payment Instructions -->
                    <div class="bg-blue-50 rounded-lg p-4 mb-4">
                        <div class="flex items-start space-x-3">
                            <i class="fas fa-info-circle text-blue-600 mt-0.5"></i>
                            <div class="text-sm text-blue-800">
                                <p class="font-medium mb-1">Payment Instructions:</p>
                                <ol class="list-decimal list-inside space-y-1 text-xs">
                                    <li>Scan the QR code above with your UPI app</li>
                                    <li>Complete the payment</li>
                                    <li>Connect to WhatsApp to complete your purchase</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    <!-- Connect to WhatsApp Button -->
                    <button type="button" onclick="orderFormManager.connectToWhatsApp()" 
                        class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200">
                        <i class="fab fa-whatsapp mr-2"></i>Connect to WhatsApp
                    </button>

                    <p class="text-xs text-gray-500 text-center mt-3">
                        We'll connect you to WhatsApp to complete your purchase
                    </p>
                </div>

                <!-- Action Buttons -->
                <div id="${idPrefix}-action-buttons" class="mt-6 space-y-3">
                    <button type="button" id="${idPrefix}-pay-now-btn" onclick="orderFormManager.submitOrder(event)"
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200">
                        <i class="fas fa-credit-card mr-2"></i>Pay Now
                    </button>

                    <button type="button" onclick="orderFormManager.orderViaWhatsApp()"
                        class="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-all duration-200">
                        <i class="fab fa-whatsapp mr-2 text-green-500"></i>Continue with WhatsApp
                    </button>
                </div>
            </div>
        `;
    }
    
    // Setup event listeners
    setupEventListeners() {
        const form = document.getElementById(this.config.formId);
        if (form) {
            form.addEventListener('input', () => this.validateForm());
            // Auto-save form data
            form.addEventListener('input', this.debounce(() => this.autoSaveFormData(), 1000));
        }
        
        // Phone number formatting
        const phoneInput = document.getElementById(this.getElementId('phone'));
        if (phoneInput) {
            phoneInput.addEventListener('input', this.formatPhoneNumber);
        }
    }
    
    // Get element ID with proper prefix
    getElementId(suffix) {
        const prefix = this.config.idPrefix || 'modal';
        return `${prefix}-${suffix}`;
    }
    
    // Validate form and enable/disable buttons
    validateForm() {
        const form = document.getElementById(this.config.formId);
        if (!form) return false;
        
        const formData = new FormData(form);
        
        const fullName = formData.get('fullName')?.trim();
        const phone = formData.get('phone')?.trim();
        const address = formData.get('address')?.trim();
        
        const isValid = fullName && phone && address && 
                       fullName.length >= 2 && 
                       phone.length >= 10 && 
                       address.length >= 10;
        
        // Enable/disable pay now button
        const payNowBtn = document.getElementById(this.getElementId('pay-now-btn'));
        if (payNowBtn) {
            payNowBtn.disabled = !isValid;
            payNowBtn.classList.toggle('opacity-50', !isValid);
        }
        
        return isValid;
    }
    
    // Submit order - show payment section
    submitOrder(event) {
        if (event) event.preventDefault();
        
        if (!this.validateForm()) {
            this.showError('Please fill in all required fields');
            return;
        }
        
        this.showPaymentSection();
    }
    
    // Show payment section
    showPaymentSection() {
        const actionBtns = document.getElementById(this.getElementId('action-buttons'));
        const paymentSection = document.getElementById(this.getElementId('payment-section'));
        
        if (!paymentSection) {
            this.showError('Payment section not found');
            return;
        }
        
        // Hide action buttons and show payment section
        if (actionBtns) {
            actionBtns.style.display = 'none';
        }
        
        paymentSection.style.display = 'block';
        this.isPaymentSectionVisible = true;
        
        // Generate QR code for payment
        this.generatePaymentQR();
        
        this.showSuccess('Ready to complete your purchase via WhatsApp');
    }
    
    // Generate QR code for payment
    generatePaymentQR() {
        const qrContainer = document.getElementById(this.getElementId('qr-code'));
        if (!qrContainer) return;
        
        // Get order total
        const total = this.getOrderTotal();
        
        // For demo purposes, show a placeholder QR code
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
    
    // Get order total
    getOrderTotal() {
        if (!this.currentProduct) return 0;
        
        const quantity = parseInt(document.getElementById(this.getElementId('quantity'))?.value || 1);
        const price = this.currentProduct.price || 0;
        return price * quantity;
    }
    
    // Connect to WhatsApp with streamlined message
    connectToWhatsApp() {
        const whatsappNumber = '919868902123';
        const message = 'Hey! I\'m ready to buy, payment is in process.';
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Show success modal or section
        this.showOrderSuccess();
    }
    
    // Order via WhatsApp (alternative flow)
    orderViaWhatsApp() {
        const form = document.getElementById(this.config.formId);
        if (!form) return;
        
        const formData = new FormData(form);
        
        const customerInfo = {
            name: formData.get('fullName')?.trim(),
            phone: formData.get('phone')?.trim(),
            email: formData.get('email')?.trim(),
            address: formData.get('address')?.trim(),
            instructions: formData.get('instructions')?.trim()
        };
        
        // Only include customer info if form has basic required fields
        const hasCustomerInfo = customerInfo.name && customerInfo.phone && customerInfo.address;
        
        this.openWhatsApp(this.currentProduct, hasCustomerInfo ? customerInfo : null);
    }
    
    // Open WhatsApp for product inquiry or order
    openWhatsApp(product, customerInfo = null) {
        if (!product) {
            this.showError('No product selected');
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
        
        const phoneNumber = '919868902123';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        this.showSuccess('Redirecting to WhatsApp...');
    }
    
    // Set current product
    setProduct(product) {
        this.currentProduct = product;
        
        // Update product display
        const productImage = document.getElementById(this.getElementId('product-image'));
        const productName = document.getElementById(this.getElementId('product-name'));
        const productPrice = document.getElementById(this.getElementId('product-price'));
        
        if (productImage) {
            productImage.src = product.image || '';
            productImage.alt = product.name || '';
        }
        if (productName) productName.textContent = product.name || '';
        if (productPrice) productPrice.textContent = product.price || '';
    }
    
    // Show order success
    showOrderSuccess() {
        // This can be overridden by specific implementations
        if (this.config.onOrderSuccess) {
            this.config.onOrderSuccess();
        } else {
            this.showSuccess('Order submitted successfully!');
        }
    }
    
    // Reset form
    resetForm() {
        const form = document.getElementById(this.config.formId);
        if (form) {
            form.reset();
        }
        
        // Reset payment section
        const paymentSection = document.getElementById(this.getElementId('payment-section'));
        if (paymentSection) {
            paymentSection.style.display = 'none';
        }
        
        // Show action buttons
        const actionBtns = document.getElementById(this.getElementId('action-buttons'));
        if (actionBtns) {
            actionBtns.style.display = 'block';
        }
        
        // Reset state
        this.isPaymentSectionVisible = false;
        this.hasSharedPaymentScreenshot = false;
        this.isOrderConfirmed = false;
    }
    
    // Auto-save form data
    autoSaveFormData() {
        const form = document.getElementById(this.config.formId);
        if (!form) return;
        
        const formData = new FormData(form);
        
        const data = {
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            address: formData.get('address'),
            instructions: formData.get('instructions')
        };
        
        localStorage.setItem(`orderFormData_${this.config.formId}`, JSON.stringify(data));
    }
    
    // Restore form data
    restoreFormData() {
        const savedData = localStorage.getItem(`orderFormData_${this.config.formId}`);
        if (savedData) {
            const data = JSON.parse(savedData);
            
            const nameInput = document.getElementById(this.getElementId('name'));
            const phoneInput = document.getElementById(this.getElementId('phone'));
            const emailInput = document.getElementById(this.getElementId('email'));
            const addressInput = document.getElementById(this.getElementId('address'));
            const instructionsInput = document.getElementById(this.getElementId('instructions'));
            
            if (nameInput) nameInput.value = data.fullName || '';
            if (phoneInput) phoneInput.value = data.phone || '';
            if (emailInput) emailInput.value = data.email || '';
            if (addressInput) addressInput.value = data.address || '';
            if (instructionsInput) instructionsInput.value = data.instructions || '';
        }
    }
    
    // Clear saved form data
    clearSavedFormData() {
        localStorage.removeItem(`orderFormData_${this.config.formId}`);
    }
    
    // Format phone number
    formatPhoneNumber(event) {
        let value = event.target.value.replace(/\D/g, '');
        
        if (value.length >= 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
        }
        
        event.target.value = value;
    }
    
    // Utility functions
    showError(message) {
        if (typeof showModalError === 'function') {
            showModalError(message);
        } else {
            alert(message);
        }
    }
    
    showSuccess(message) {
        if (typeof showModalSuccess === 'function') {
            showModalSuccess(message);
        } else if (typeof showToast === 'function') {
            showToast(message, 'success');
        } else {
            console.log('Success:', message);
        }
    }
    
    debounce(func, wait) {
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
}

// Global instance for easy access
window.orderFormManager = null;

// Initialize order form manager
function initializeOrderForm(config = {}) {
    window.orderFormManager = new OrderFormManager(config);
    return window.orderFormManager;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OrderFormManager, initializeOrderForm };
}
