// Admin panel functionality - Updated for PHP API

// Admin tabs functionality
document.addEventListener('DOMContentLoaded', function() {
    // Admin tab switching
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', async (e) => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
            
            e.target.classList.add('active');
            const tabId = e.target.getAttribute('data-tab');
            const tabContent = document.getElementById(tabId);
            
            if (tabContent) {
                tabContent.classList.add('active');
                
                // Load appropriate data based on tab
                if (tabId === 'home-tab') {
                    await loadHomeData();
                } else if (tabId === 'portfolio-tab') {
                    await loadPortfolioTable();
                } else if (tabId === 'blog-tab') {
                    await loadBlogTable();
                }
            }
        });
    });

    // Close modal handlers
    setupModalHandlers();
});

function setupModalHandlers() {
    const portfolioModal = document.getElementById('portfolioModal');
    const blogModal = document.getElementById('blogModal');
    const loginPanel = document.getElementById('loginPanel');
    const adminPanel = document.getElementById('adminPanel');

    // Portfolio modal
    if (portfolioModal) {
        portfolioModal.addEventListener('click', (e) => {
            if (e.target === portfolioModal) {
                hidePortfolioModal();
            }
        });
    }

    // Blog modal
    if (blogModal) {
        blogModal.addEventListener('click', (e) => {
            if (e.target === blogModal) {
                hideBlogModal();
            }
        });
    }

    // Login panel
    if (loginPanel) {
        loginPanel.addEventListener('click', (e) => {
            if (e.target === loginPanel) {
                hideLogin();
            }
        });
    }

    // Admin panel
    if (adminPanel) {
        adminPanel.addEventListener('click', (e) => {
            if (e.target === adminPanel) {
                adminPanel.classList.remove('active');
            }
        });
    }
}

// Enhanced admin dashboard with statistics
async function loadAdminStats() {
    try {
        // Load all data first
        await Promise.all([
            loadPortfolioData(),
            loadBlogData()
        ]);

        // Create stats display
        const statsContainer = createStatsContainer();
        
        // Insert stats at the top of admin content
        const adminContent = document.querySelector('.admin-content');
        if (adminContent && !document.getElementById('adminStats')) {
            const adminHeader = adminContent.querySelector('.admin-header');
            adminHeader.insertAdjacentElement('afterend', statsContainer);
        }
    } catch (error) {
        console.error('Error loading admin stats:', error);
    }
}

function createStatsContainer() {
    const statsContainer = document.createElement('div');
    statsContainer.id = 'adminStats';
    statsContainer.className = 'admin-stats';
    
    const portfolioCount = portfolioData.length;
    const blogCount = blogData.length;
    const recentPortfolio = portfolioData[0]?.title || 'Tidak ada';
    const recentBlog = blogData[0]?.title || 'Tidak ada';
    
    statsContainer.innerHTML = `
        <style>
            .admin-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 10px;
            }
            .stat-card {
                background: white;
                padding: 1.5rem;
                border-radius: 8px;
                text-align: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .stat-number {
                font-size: 2rem;
                font-weight: bold;
                color: #667eea;
                margin-bottom: 0.5rem;
            }
            .stat-label {
                color: #666;
                font-size: 0.9rem;
            }
            .stat-recent {
                font-size: 0.8rem;
                color: #999;
                margin-top: 0.5rem;
                font-style: italic;
            }
        </style>
        <div class="stat-card">
            <div class="stat-number">${portfolioCount}</div>
            <div class="stat-label">Total Portfolio</div>
            <div class="stat-recent">Terbaru: ${recentPortfolio}</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${blogCount}</div>
            <div class="stat-label">Total Blog Posts</div>
            <div class="stat-recent">Terbaru: ${recentBlog}</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${new Date().toLocaleDateString('id-ID')}</div>
            <div class="stat-label">Hari Ini</div>
            <div class="stat-recent">Last login: ${new Date().toLocaleTimeString('id-ID')}</div>
        </div>
    `;
    
    return statsContainer;
}

// Enhanced toggle admin with stats
async function toggleAdmin() {
    if (!isLoggedIn) {
        showLogin();
        return;
    }
    
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.classList.toggle('active');
        if (adminPanel.classList.contains('active')) {
            // Show loading
            showLoading();
            
            try {
                await loadAdminData();
                await loadHomeData();
                await loadAdminStats();
            } catch (error) {
                handleApiError(error, 'memuat data admin');
            } finally {
                hideLoading();
            }
        }
    }
}

// Auto-refresh admin data periodically
let adminRefreshInterval;

function startAdminAutoRefresh() {
    // Refresh every 5 minutes when admin panel is open
    adminRefreshInterval = setInterval(async () => {
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel && adminPanel.classList.contains('active') && isLoggedIn) {
            try {
                await loadAdminData();
                await loadAdminStats();
                console.log('Admin data refreshed automatically');
            } catch (error) {
                console.error('Auto-refresh error:', error);
            }
        } else {
            stopAdminAutoRefresh();
        }
    }, 5 * 60 * 1000); // 5 minutes
}

function stopAdminAutoRefresh() {
    if (adminRefreshInterval) {
        clearInterval(adminRefreshInterval);
        adminRefreshInterval = null;
    }
}

// Enhanced admin notification system
function showAdminNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Bulk operations for admin
async function bulkDeletePortfolio(ids) {
    if (!ids.length) return;
    
    const confirmed = confirm(`Apakah Anda yakin ingin menghapus ${ids.length} item portfolio?`);
    if (!confirmed) return;
    
    showLoading();
    
    try {
        const promises = ids.map(id => deletePortfolioItem(id));
        await Promise.all(promises);
        
        await loadPortfolioTable();
        await loadPortfolioItems();
        await loadAdminStats();
        
        showAdminNotification(`${ids.length} portfolio berhasil dihapus`);
    } catch (error) {
        handleApiError(error, 'menghapus portfolio');
        showAdminNotification('Gagal menghapus beberapa portfolio', 'error');
    } finally {
        hideLoading();
    }
}

async function bulkDeleteBlog(ids) {
    if (!ids.length) return;
    
    const confirmed = confirm(`Apakah Anda yakin ingin menghapus ${ids.length} blog post?`);
    if (!confirmed) return;
    
    showLoading();
    
    try {
        const promises = ids.map(id => deleteBlogPost(id));
        await Promise.all(promises);
        
        await loadBlogTable();
        await loadBlogPosts();
        await loadAdminStats();
        
        showAdminNotification(`${ids.length} blog post berhasil dihapus`);
    } catch (error) {
        handleApiError(error, 'menghapus blog post');
        showAdminNotification('Gagal menghapus beberapa blog post', 'error');
    } finally {
        hideLoading();
    }
}

// Export admin data to JSON (backup feature)
function exportAdminData() {
    const data = {
        homeData,
        portfolioData,
        blogData,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showAdminNotification('Data berhasil di-export');
}

// Make functions available globally
window.adminPanel = {
    toggleAdmin,
    loadAdminStats,
    showAdminNotification,
    bulkDeletePortfolio,
    bulkDeleteBlog,
    exportAdminData,
    startAdminAutoRefresh,
    stopAdminAutoRefresh
};