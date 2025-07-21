// Comprehensive Error Handling and Performance Monitoring

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 50;
        this.setupGlobalHandlers();
    }

    setupGlobalHandlers() {
        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled promise rejection',
                stack: event.reason?.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Handle resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.logError({
                    type: 'resource',
                    message: `Failed to load resource: ${event.target.src || event.target.href}`,
                    element: event.target.tagName,
                    timestamp: new Date().toISOString()
                });
            }
        }, true);
    }

    logError(error) {
        // Add to error log
        this.errors.push(error);
        
        // Keep only recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }

        // Log to console in development
        if (this.isDevelopment()) {
            console.error('Error logged:', error);
        }

        // Show user-friendly message for critical errors
        if (this.isCriticalError(error)) {
            this.showUserError(error);
        }
    }

    isCriticalError(error) {
        const criticalPatterns = [
            /network/i,
            /fetch/i,
            /load/i,
            /timeout/i
        ];
        
        return criticalPatterns.some(pattern => 
            pattern.test(error.message)
        );
    }

    showUserError(error) {
        if (window.showToast) {
            showToast('Something went wrong. Please try again.', 'error');
        }
    }

    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    }

    getErrorReport() {
        return {
            errors: this.errors,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString()
        };
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.setupPerformanceObserver();
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            // Monitor largest contentful paint
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // Monitor first input delay
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.fid = entry.processingStart - entry.startTime;
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // Monitor cumulative layout shift
            const clsObserver = new PerformanceObserver((list) => {
                let clsValue = 0;
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                this.metrics.cls = clsValue;
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }

    measureLoadTime(name, startTime) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        this.metrics[name] = duration;
        
        if (this.isDevelopment()) {
            console.log(`${name}: ${duration.toFixed(2)}ms`);
        }
    }

    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    }

    getMetrics() {
        return {
            ...this.metrics,
            navigation: performance.getEntriesByType('navigation')[0],
            timestamp: new Date().toISOString()
        };
    }
}

// Image loading optimization
class ImageOptimizer {
    constructor() {
        this.loadedImages = new Set();
        this.failedImages = new Set();
        this.retryAttempts = new Map();
        this.maxRetries = 3;
    }

    optimizeImage(imgElement, src, alt) {
        // Add loading attribute for native lazy loading
        imgElement.loading = 'lazy';
        
        // Add error handling
        imgElement.onerror = () => this.handleImageError(imgElement, src);
        imgElement.onload = () => this.handleImageLoad(imgElement, src);
        
        // Set alt text for accessibility
        imgElement.alt = alt || 'Product image';
        
        // Use WebP if supported
        if (this.supportsWebP()) {
            const webpSrc = this.convertToWebP(src);
            if (webpSrc !== src) {
                imgElement.src = webpSrc;
                return;
            }
        }
        
        imgElement.src = src;
    }

    handleImageError(imgElement, originalSrc) {
        const retries = this.retryAttempts.get(originalSrc) || 0;
        
        if (retries < this.maxRetries) {
            // Retry loading
            this.retryAttempts.set(originalSrc, retries + 1);
            setTimeout(() => {
                imgElement.src = originalSrc;
            }, 1000 * (retries + 1));
        } else {
            // Use fallback image
            this.failedImages.add(originalSrc);
            imgElement.src = this.getFallbackImage();
            imgElement.classList.add('error');
        }
    }

    handleImageLoad(imgElement, src) {
        this.loadedImages.add(src);
        imgElement.classList.add('loaded');
        imgElement.classList.remove('loading');
    }

    supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    convertToWebP(src) {
        // Simple WebP conversion for Unsplash images
        if (src.includes('unsplash.com')) {
            return src + '&fm=webp';
        }
        return src;
    }

    getFallbackImage() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjlmYWZiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';
    }
}

// Initialize error handling and performance monitoring
const errorHandler = new ErrorHandler();
const performanceMonitor = new PerformanceMonitor();
const imageOptimizer = new ImageOptimizer();

// Export for use in other scripts
window.errorHandler = errorHandler;
window.performanceMonitor = performanceMonitor;
window.imageOptimizer = imageOptimizer;

// Development tools
if (errorHandler.isDevelopment()) {
    window.getErrorReport = () => errorHandler.getErrorReport();
    window.getPerformanceMetrics = () => performanceMonitor.getMetrics();
    
    console.log('Development mode: Error reporting and performance monitoring enabled');
    console.log('Use getErrorReport() and getPerformanceMetrics() in console');
}