// Data management - Updated for PHP API
let homeData = {};
let portfolioData = [];
let blogData = [];

// Home content management
async function loadHomeData() {
    try {
        const response = await fetch(API_BASE_URL + 'home.php');
        const result = await response.json();
        
        if (result.success) {
            homeData = result.data;
            
            // Update form fields if they exist
            const titleInput = document.getElementById('editHeroTitle');
            const descInput = document.getElementById('editHeroDescription');
            if (titleInput && descInput) {
                titleInput.value = homeData.title;
                descInput.value = homeData.description;
            }
            
            // Update display
            const heroTitle = document.getElementById('heroTitle');
            const heroDescription = document.getElementById('heroDescription');
            if (heroTitle && heroDescription) {
                heroTitle.textContent = homeData.title;
                heroDescription.textContent = homeData.description;
            }
        }
    } catch (error) {
        console.error('Error loading home data:', error);
    }
}

async function updateHomeData(title, description) {
    try {
        const response = await fetch(API_BASE_URL + 'home.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                description: description
            })
        });

        const result = await response.json();
        
        if (result.success) {
            homeData.title = title;
            homeData.description = description;
            
            // Update display
            const heroTitle = document.getElementById('heroTitle');
            const heroDescription = document.getElementById('heroDescription');
            if (heroTitle && heroDescription) {
                heroTitle.textContent = title;
                heroDescription.textContent = description;
            }
            
            return true;
        } else {
            throw new Error(result.error || 'Update failed');
        }
    } catch (error) {
        console.error('Error updating home data:', error);
        return false;
    }
}

// Portfolio data management
async function loadPortfolioData() {
    try {
        const response = await fetch(API_BASE_URL + 'portfolio.php');
        const result = await response.json();
        
        if (result.success) {
            portfolioData = result.data;
        }
    } catch (error) {
        console.error('Error loading portfolio data:', error);
    }
}

async function createPortfolioItem(itemData) {
    try {
        const response = await fetch(API_BASE_URL + 'portfolio.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(itemData)
        });

        const result = await response.json();
        
        if (result.success) {
            await loadPortfolioData(); // Reload data
            return true;
        } else {
            throw new Error(result.error || 'Create failed');
        }
    } catch (error) {
        console.error('Error creating portfolio item:', error);
        return false;
    }
}

async function updatePortfolioItem(itemData) {
    try {
        const response = await fetch(API_BASE_URL + 'portfolio.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(itemData)
        });

        const result = await response.json();
        
        if (result.success) {
            await loadPortfolioData(); // Reload data
            return true;
        } else {
            throw new Error(result.error || 'Update failed');
        }
    } catch (error) {
        console.error('Error updating portfolio item:', error);
        return false;
    }
}

async function deletePortfolioItem(id) {
    try {
        const response = await fetch(API_BASE_URL + 'portfolio.php?id=' + id, {
            method: 'DELETE'
        });

        const result = await response.json();
        
        if (result.success) {
            await loadPortfolioData(); // Reload data
            return true;
        } else {
            throw new Error(result.error || 'Delete failed');
        }
    } catch (error) {
        console.error('Error deleting portfolio item:', error);
        return false;
    }
}

// Blog data management
async function loadBlogData() {
    try {
        const response = await fetch(API_BASE_URL + 'blog.php');
        const result = await response.json();
        
        if (result.success) {
            blogData = result.data;
        }
    } catch (error) {
        console.error('Error loading blog data:', error);
    }
}

async function createBlogPost(postData) {
    try {
        const response = await fetch(API_BASE_URL + 'blog.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });

        const result = await response.json();
        
        if (result.success) {
            await loadBlogData(); // Reload data
            return true;
        } else {
            throw new Error(result.error || 'Create failed');
        }
    } catch (error) {
        console.error('Error creating blog post:', error);
        return false;
    }
}

async function updateBlogPost(postData) {
    try {
        const response = await fetch(API_BASE_URL + 'blog.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });

        const result = await response.json();
        
        if (result.success) {
            await loadBlogData(); // Reload data
            return true;
        } else {
            throw new Error(result.error || 'Update failed');
        }
    } catch (error) {
        console.error('Error updating blog post:', error);
        return false;
    }
}

async function deleteBlogPost(id) {
    try {
        const response = await fetch(API_BASE_URL + 'blog.php?id=' + id, {
            method: 'DELETE'
        });

        const result = await response.json();
        
        if (result.success) {
            await loadBlogData(); // Reload data
            return true;
        } else {
            throw new Error(result.error || 'Delete failed');
        }
    } catch (error) {
        console.error('Error deleting blog post:', error);
        return false;
    }
}

function editHero() {
    if (!isLoggedIn) return;
    toggleAdmin();
    // Switch to home tab
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
    const homeTab = document.querySelector('[data-tab="home-tab"]');
    const homeContent = document.getElementById('home-tab');
    if (homeTab && homeContent) {
        homeTab.classList.add('active');
        homeContent.classList.add('active');
        loadHomeData();
    }
}

// Home form handler
document.addEventListener('DOMContentLoaded', function() {
    const homeForm = document.getElementById('homeForm');
    if (homeForm) {
        homeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const title = document.getElementById('editHeroTitle').value;
            const description = document.getElementById('editHeroDescription').value;
            
            const success = await updateHomeData(title, description);
            
            if (success) {
                alert('Halaman home berhasil diupdate!');
            } else {
                alert('Gagal mengupdate halaman home!');
            }
        });
    }
});