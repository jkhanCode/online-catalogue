// Product data - This would typically come from a CMS or API
const products = [
    {
        id: 1,
        name: "Premium Wireless Headphones",
        description: "High-quality wireless headphones with advanced noise cancellation and 30-hour battery life. Perfect for music lovers and professionals who demand exceptional audio quality.\n\nThese headphones feature premium drivers that deliver crisp highs, rich mids, and deep bass. The adaptive noise cancellation technology automatically adjusts to your environment, blocking out unwanted sounds while preserving the clarity of your music.\n\nWith fast charging capabilities, you get 5 hours of playbook with just 10 minutes of charging. The comfortable over-ear design with memory foam padding ensures all-day comfort during extended listening sessions.",
        price: "₹149.99",
        originalPrice: "₹199.99",
        discount: "25",
        category: "electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
        media: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
            "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=300&fit=crop"
        ],
        images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=400&h=300&fit=crop"
        ],
        rating: "4.8 (124 reviews)",
        brand: "AudioTech",
        stock: "In Stock"
    },
    {
        id: 2,
        name: "Smart Fitness Watch",
        description: "Track your health and fitness goals with this advanced smartwatch featuring heart rate monitoring, GPS, and waterproof design. Built for active lifestyles with comprehensive health tracking capabilities.\n\nMonitor your heart rate 24/7, track workouts across 50+ sports modes, and get detailed insights into your sleep patterns. The built-in GPS accurately tracks your outdoor activities without needing your phone.\n\nWith 5ATM water resistance, you can swim, shower, or exercise in any weather. The long-lasting battery provides up to 7 days of usage on a single charge, making it perfect for extended adventures.",
        price: "₹199.99",
        category: "electronics",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop"
        ],
        rating: "4.6 (89 reviews)",
        brand: "FitPro",
        stock: "In Stock"
    },
    {
        id: 3,
        name: "Organic Cotton T-Shirt",
        description: "Comfortable and sustainable organic cotton t-shirt available in multiple colors. Ethically sourced and eco-friendly, perfect for conscious consumers.\n\nMade from 100% certified organic cotton, this t-shirt is incredibly soft and breathable. The fabric is pre-shrunk and holds its shape wash after wash. Available in classic colors that never go out of style.\n\nOur commitment to sustainability means fair trade practices and environmentally responsible manufacturing. Each purchase supports ethical farming communities and reduces environmental impact.",
        price: "₹29.99",
        category: "fashion",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=300&fit=crop"
        ],
        rating: "4.7 (156 reviews)",
        brand: "EcoWear",
        stock: "Limited Stock"
    },
    {
        id: 4,
        name: "Ceramic Coffee Mug Set",
        description: "Beautiful handcrafted ceramic coffee mugs perfect for your morning coffee ritual. Set of 4 mugs with elegant design that brings warmth to your daily coffee experience.\n\nEach mug is carefully crafted from high-quality ceramic with a smooth, comfortable handle and perfect weight balance. The unique glaze finish gives each mug a distinctive character while maintaining durability.\n\nDishwasher and microwave safe, these mugs are designed for everyday use while adding a touch of artisanal elegance to your kitchen.",
        price: "₹39.99",
        category: "home",
        image: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400&h=300&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1572286258217-4b6f1e0b8b0a?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1580933073521-dc49ac0d4e6a?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop"
        ],
        rating: "4.9 (67 reviews)",
        brand: "CeramicCraft",
        stock: "In Stock"
    },
    {
        id: 5,
        name: "Natural Face Moisturizer",
        description: "Hydrating face moisturizer with natural ingredients including aloe vera, vitamin E, and organic oils for all skin types. Perfect for daily use and suitable for sensitive skin.\n\nThis lightweight formula absorbs quickly without leaving a greasy residue. Enriched with antioxidants and natural botanicals to nourish and protect your skin throughout the day.\n\nDermatologist tested and free from harsh chemicals, parabens, and artificial fragrances.",
        price: "₹24.99",
        category: "beauty",
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=300&fit=crop"
        ],
        rating: "4.5 (203 reviews)",
        brand: "PureBeauty",
        stock: "In Stock"
    },
    {
        id: 6,
        name: "Minimalist Desk Lamp",
        description: "Modern LED desk lamp with adjustable brightness and color temperature. Perfect for working, reading, or studying with eye-care technology.\n\nFeatures touch controls, memory function, and USB charging port. The sleek design complements any workspace while providing optimal lighting for productivity.\n\nEnergy-efficient LED technology with 50,000-hour lifespan and flicker-free illumination to reduce eye",
        price: "₹79.99",
        category: "home",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
        rating: "4.4 (92 reviews)",
        brand: "LightDesign",
        stock: "In Stock"
    },
    {
        id: 7,
        name: "Denim Jacket",
        description: "Classic denim jacket with a modern fit. Made from premium denim fabric, perfect for layering in any season.",
        price: "₹69.99",
        category: "fashion",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop",
        rating: "4.6 (78 reviews)",
        brand: "UrbanStyle",
        stock: "In Stock"
    },
    {
        id: 8,
        name: "Wireless Phone Charger",
        description: "Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator and foreign object detection.",
        price: "₹34.99",
        category: "electronics",
        image: "https://images.unsplash.com/photo-1609592179882-8005dd81df56?w=400&h=300&fit=crop",
        rating: "4.3 (145 reviews)",
        brand: "ChargeTech",
        stock: "In Stock"
    },
    {
        id: 9,
        name: "Aromatherapy Candle Set",
        description: "Set of 3 natural soy candles with calming scents: lavender, eucalyptus, and vanilla. Hand-poured with cotton wicks.",
        price: "₹44.99",
        category: "home",
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop",
        rating: "4.8 (113 reviews)",
        brand: "ZenScents",
        stock: "Limited Stock"
    },
    {
        id: 10,
        name: "Premium Lip Balm Set",
        description: "Nourishing lip balm set with 5 different flavors. Made with natural ingredients including shea butter and coconut oil.",
        price: "₹19.99",
        category: "beauty",
        image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=300&fit=crop",
        rating: "4.7 (167 reviews)",
        brand: "LipCare",
        stock: "In Stock"
    }
];

// Utility function to get product by ID with validation
function getProductById(id) {
    try {
        if (!id) return null;
        const productId = parseInt(id);
        if (isNaN(productId)) return null;
        
        const product = products.find(product => product.id === productId);
        return validateProduct(product) ? product : null;
    } catch (error) {
        console.error('Error getting product by ID:', error);
        return null;
    }
}

// Utility function to filter products by category with validation
function getProductsByCategory(category) {
    try {
        if (!category || typeof category !== 'string') {
            return products.filter(validateProduct);
        }
        
        if (category === 'all') {
            return products.filter(validateProduct);
        }
        
        return products.filter(product => 
            validateProduct(product) && product.category === category
        );
    } catch (error) {
        console.error('Error filtering products by category:', error);
        return [];
    }
}

// Validate product data structure
function validateProduct(product) {
    if (!product || typeof product !== 'object') return false;
    
    const requiredFields = ['id', 'name', 'price', 'category', 'image'];
    return requiredFields.every(field => product.hasOwnProperty(field) && product[field]);
}

// Utility function to create WhatsApp order message with validation
function createWhatsAppMessage(product, customerInfo = null) {
    try {
        if (!validateProduct(product)) {
            throw new Error('Invalid product data');
        }
        
        let message = `Hi! I'd like to order:\n\n`;
        message += `📦 Product: ${sanitizeForWhatsApp(product.name)}\n`;
        message += `💰 Price: ${sanitizeForWhatsApp(product.price)}\n`;
        
        if (product.brand) {
            message += `🏷️ Brand: ${sanitizeForWhatsApp(product.brand)}\n`;
        }
        
        if (customerInfo && validateCustomerInfo(customerInfo)) {
            message += `\n👤 Customer Details:\n`;
            message += `Name: ${sanitizeForWhatsApp(customerInfo.name)}\n`;
            message += `Phone: ${sanitizeForWhatsApp(customerInfo.phone)}\n`;
            if (customerInfo.email) {
                message += `Email: ${sanitizeForWhatsApp(customerInfo.email)}\n`;
            }
            message += `Address: ${sanitizeForWhatsApp(customerInfo.address)}\n`;
            if (customerInfo.instructions) {
                message += `Special Instructions: ${sanitizeForWhatsApp(customerInfo.instructions)}\n`;
            }
        }
        
        message += `\nPlease confirm availability and delivery details. Thank you!`;
        
        return encodeURIComponent(message);
    } catch (error) {
        console.error('Error creating WhatsApp message:', error);
        return encodeURIComponent('Hi! I would like to inquire about your products. Thank you!');
    }
}

// Utility function to open WhatsApp with pre-filled message and error handling
function openWhatsApp(product, customerInfo = null) {
    try {
        const message = createWhatsAppMessage(product, customerInfo);
        const whatsappUrl = `https://wa.me/?text=${message}`;
        
        // Check if WhatsApp is available
        const link = document.createElement('a');
        link.href = whatsappUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        // Try to open WhatsApp
        const opened = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        
        if (!opened) {
            // Fallback: copy message to clipboard
            copyToClipboard(decodeURIComponent(message));
            if (window.showToast) {
                showToast('WhatsApp message copied to clipboard', 'info');
            } else {
                alert('WhatsApp message copied to clipboard');
            }
        }
        
    } catch (error) {
        console.error('Error opening WhatsApp:', error);
        if (window.showToast) {
            showToast('Unable to open WhatsApp', 'error');
        } else {
            alert('Unable to open WhatsApp. Please try again.');
        }
    }
}

// Validate customer information
function validateCustomerInfo(customerInfo) {
    if (!customerInfo || typeof customerInfo !== 'object') return false;
    
    const requiredFields = ['name', 'phone', 'address'];
    return requiredFields.every(field => 
        customerInfo.hasOwnProperty(field) && 
        customerInfo[field] && 
        customerInfo[field].trim().length > 0
    );
}

// Sanitize text for WhatsApp message
function sanitizeForWhatsApp(text) {
    if (typeof text !== 'string') return String(text || '');
    return text.replace(/[<>]/g, '').trim();
}

// Copy text to clipboard utility
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
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
            textArea.remove();
            return Promise.resolve();
        } catch (error) {
            textArea.remove();
            return Promise.reject(error);
        }
    }
}
