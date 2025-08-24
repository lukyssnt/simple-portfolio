// Main application initialization and navigation - Updated for PHP API
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize application
    await checkAuthStatus(); // Check login status first
    await loadHomeData(); // Load home content
    await loadPortfolioItems(); // Load portfolio data
    await loadBlogPosts(); // Load blog data
    
    updateUIForAuth();

    // Navigation functionality
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            
            e.target.classList.add('active');
            
            // Show corresponding section
            const sectionId = e.target.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            
            if (section) {
                section.classList.add('active');
                
                // Load data when switching to specific sections
                if (sectionId === 'portfolio') {
                    await loadPortfolioItems();
                } else if (sectionId === 'blog') {
                    await loadBlogPosts();
                } else if (sectionId === 'home') {
                    await loadHomeData();
                }
            }
        });
    });

    // Smooth scrolling for better UX
    document.documentElement.style.scrollBehavior = 'smooth';
});

// Updated admin panel functionality
async function toggleAdmin() {
    if (!isLoggedIn) {
        showLogin();
        return;
    }
    
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.classList.toggle('active');
        if (adminPanel.classList.contains('active')) {
            await loadAdminData();
            await loadHomeData();
        }
    }
}

// Load all admin data
async function loadAdminData() {
    await loadPortfolioTable();
    await loadBlogTable();
}

// Utility functions
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Error handling for API calls
function handleApiError(error, operation) {
    console.error(`Error during ${operation}:`, error);
    
    // Show user-friendly error message
    if (error.message && error.message.includes('fetch')) {
        alert('Tidak dapat terhubung ke server. Pastikan koneksi internet Anda stabil.');
    } else if (error.message && error.message.includes('Unauthorized')) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        logout();
    } else {
        alert(`Terjadi kesalahan saat ${operation}. Silakan coba lagi.`);
    }
}

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    // You can add user-friendly error messaging here
});

// Loading indicator functions
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingIndicator';
    loadingDiv.style.cssText = `
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
    `;
    loadingDiv.innerHTML = 'Loading...';
    document.body.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.getElementById('loadingIndicator');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC key to close modals/panels
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        const activePanel = document.querySelector('.admin-panel.active, .login-panel.active');
        
        if (activeModal) {
            activeModal.classList.remove('active');
        } else if (activePanel) {
            activePanel.classList.remove('active');
        }
    }
    
    // Ctrl/Cmd + K for quick admin access (if logged in)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k' && isLoggedIn) {
        e.preventDefault();
        toggleAdmin();
    }
});

// Handle responsive navigation (if needed for mobile menu)
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('mobile-active');
    }
}

// Performance optimization: Debounce function
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

// Export functions for global access
window.portfolioApp = {
    showLogin,
    hideLogin,
    login,
    logout,
    toggleAdmin,
    showPortfolioModal,
    hidePortfolioModal,
    showBlogModal,
    hideBlogModal,
    deletePortfolio,
    deleteBlog,
    editHero,
    loadHomeData,
    loadPortfolioItems,
    loadBlogPosts
};