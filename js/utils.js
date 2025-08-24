// Utility functions for Portfolio Website

// Loading indicator management
class LoadingManager {
    constructor() {
        this.loadingCount = 0;
    }
    
    show(message = 'Loading...') {
        this.loadingCount++;
        
        if (!document.getElementById('loadingIndicator')) {
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'loadingIndicator';
            loadingDiv.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    color: white;
                    font-size: 1.2rem;
                    backdrop-filter: blur(5px);
                ">
                    <div style="
                        background: rgba(255,255,255,0.1);
                        padding: 2rem 3rem;
                        border-radius: 15px;
                        text-align: center;
                        border: 1px solid rgba(255,255,255,0.2);
                    ">
                        <div style="
                            width: 40px;
                            height: 40px;
                            border: 3px solid rgba(255,255,255,0.3);
                            border-top: 3px solid #fff;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin: 0 auto 1rem;
                        "></div>
                        <div>${message}</div>
                    </div>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            document.body.appendChild(loadingDiv);
        }
    }
    
    hide() {
        this.loadingCount = Math.max(0, this.loadingCount - 1);
        
        if (this.loadingCount === 0) {
            const loadingDiv = document.getElementById('loadingIndicator');
            if (loadingDiv) {
                loadingDiv.remove();
            }
        }
    }
    
    hideAll() {
        this.loadingCount = 0;
        this.hide();
    }
}

const loadingManager = new LoadingManager();

// Global loading functions
function showLoading(message) {
    loadingManager.show(message);
}

function hideLoading() {
    loadingManager.hide();
}

// Enhanced notification system
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.createContainer();
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notificationContainer';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(this.container);
    }
    
    show(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        const id = Date.now().toString();
        
        const colors = {
            success: { bg: '#4CAF50', border: '#45a049' },
            error: { bg: '#f44336', border: '#da190b' },
            warning: { bg: '#ff9800', border: '#f57c00' },
            info: { bg: '#2196F3', border: '#0b7dda' }
        };
        
        const color = colors[type] || colors.info;
        
        notification.id = `notification-${id}`;
        notification.style.cssText = `
            background: ${color.bg};
            color: white;
            padding: 1rem 1.5rem;
            margin-bottom: 0.5rem;
            border-radius: 8px;
            border-left: 4px solid ${color.border};
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            word-wrap: break-word;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1; margin-right: 10px;">${message}</div>
                <button style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    opacity: 0.7;
                    line-height: 1;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                " onclick="notificationManager.remove('${id}')">&times;</button>
            </div>
        `;
        
        this.container.appendChild(notification);
        this.notifications.push({ id, element: notification, timeout: null });
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove
        if (duration > 0) {
            const timeout = setTimeout(() => {
                this.remove(id);
            }, duration);
            
            const notifData = this.notifications.find(n => n.id === id);
            if (notifData) {
                notifData.timeout = timeout;
            }
        }
        
        // Click to dismiss
        notification.addEventListener('click', () => {
            this.remove(id);
        });
        
        return id;
    }
    
    remove(id) {
        const notifIndex = this.notifications.findIndex(n => n.id === id);
        if (notifIndex === -1) return;
        
        const notifData = this.notifications[notifIndex];
        const element = notifData.element;
        
        if (notifData.timeout) {
            clearTimeout(notifData.timeout);
        }
        
        // Animate out
        element.style.opacity = '0';
        element.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 300);
        
        this.notifications.splice(notifIndex, 1);
    }
    
    clear() {
        this.notifications.forEach(n => {
            if (n.timeout) clearTimeout(n.timeout);
            if (n.element.parentNode) {
                n.element.parentNode.removeChild(n.element);
            }
        });
        this.notifications = [];
    }
}

const notificationManager = new NotificationManager();

// Global notification functions
function showNotification(message, type, duration) {
    return notificationManager.show(message, type, duration);
}

// API helper functions
class ApiHelper {
    static async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(url, finalOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to server');
            }
            throw error;
        }
    }
    
    static async get(url) {
        return this.request(url, { method: 'GET' });
    }
    
    static async post(url, data) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    static async put(url, data) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    static async delete(url) {
        return this.request(url, { method: 'DELETE' });
    }
}

// Form validation helpers
class FormValidator {
    static required(value, fieldName) {
        if (!value || value.toString().trim() === '') {
            throw new Error(`${fieldName} wajib diisi`);
        }
        return true;
    }
    
    static minLength(value, min, fieldName) {
        if (value && value.toString().length < min) {
            throw new Error(`${fieldName} minimal ${min} karakter`);
        }
        return true;
    }
    
    static maxLength(value, max, fieldName) {
        if (value && value.toString().length > max) {
            throw new Error(`${fieldName} maksimal ${max} karakter`);
        }
        return true;
    }
    
    static url(value, fieldName) {
        if (value) {
            const urlPattern = /^https?:\/\/.+/;
            if (!urlPattern.test(value)) {
                throw new Error(`${fieldName} harus berupa URL yang valid (http:// atau https://)`);
            }
        }
        return true;
    }
    
    static email(value, fieldName) {
        if (value) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(value)) {
                throw new Error(`${fieldName} harus berupa email yang valid`);
            }
        }
        return true;
    }
}

// Local storage helpers (for client-side caching)
class StorageHelper {
    static set(key, value, expirationMinutes = 60) {
        const item = {
            value: value,
            expiry: Date.now() + (expirationMinutes * 60 * 1000)
        };
        localStorage.setItem(key, JSON.stringify(item));
    }
    
    static get(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        
        try {
            const item = JSON.parse(itemStr);
            if (Date.now() > item.expiry) {
                localStorage.removeItem(key);
                return null;
            }
            return item.value;
        } catch (e) {
            localStorage.removeItem(key);
            return null;
        }
    }
    
    static remove(key) {
        localStorage.removeItem(key);
    }
    
    static clear() {
        localStorage.clear();
    }
}

// Debounce function for performance
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Date formatting helpers
class DateHelper {
    static formatDate(date, locale = 'id-ID') {
        return new Date(date).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    static formatDateTime(date, locale = 'id-ID') {
        return new Date(date).toLocaleString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    static timeAgo(date, locale = 'id-ID') {
        const now = new Date();
        const diffTime = Math.abs(now - new Date(date));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Kemarin';
        if (diffDays < 7) return `${diffDays} hari yang lalu`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} minggu yang lalu`;
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)} bulan yang lalu`;
        return `${Math.ceil(diffDays / 365)} tahun yang lalu`;
    }
}

// Make utilities globally available
window.utils = {
    showLoading,
    hideLoading,
    showNotification,
    ApiHelper,
    FormValidator,
    StorageHelper,
    debounce,
    throttle,
    DateHelper,
    loadingManager,
    notificationManager
};