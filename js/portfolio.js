let currentEditingPortfolioItem = null;

// Portfolio management functions
function showPortfolioModal(item = null) {
    currentEditingPortfolioItem = item;
    const modal = document.getElementById('portfolioModal');
    const modalTitle = document.getElementById('portfolioModalTitle');
    const submitBtn = document.getElementById('portfolioSubmitBtn');
    
    if (item) {
        modalTitle.textContent = 'Edit Portofolio';
        submitBtn.textContent = 'Update Portofolio';
        document.getElementById('portfolioId').value = item.id;
        document.getElementById('portfolioTitle').value = item.title;
        document.getElementById('portfolioDescription').value = item.description;
        document.getElementById('portfolioImage').value = item.image || '';
        document.getElementById('portfolioLink').value = item.link || '';
    } else {
        modalTitle.textContent = 'Tambah Portofolio';
        submitBtn.textContent = 'Tambah Portofolio';
        document.getElementById('portfolioForm').reset();
        document.getElementById('portfolioId').value = '';
    }
    
    modal.classList.add('active');
}

function hidePortfolioModal() {
    const modal = document.getElementById('portfolioModal');
    const form = document.getElementById('portfolioForm');
    if (modal && form) {
        modal.classList.remove('active');
        form.reset();
    }
    currentEditingPortfolioItem = null;
}

// Load portfolio items for display
async function loadPortfolioItems() {
    await loadPortfolioData(); // Load from API
    
    const container = document.getElementById('portfolioGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    portfolioData.forEach(item => {
        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'portfolio-item';
        
        const imageHtml = item.image 
            ? `<img src="${item.image}" alt="${item.title}">`
            : `<div style="background: linear-gradient(45deg, #667eea, #764ba2); height: 200px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem;">No Image</div>`;
        
        const actionsHtml = isLoggedIn ? `
            <div class="portfolio-actions">
                <button class="action-btn edit-btn" onclick="showPortfolioModal(${JSON.stringify(item).replace(/"/g, '&quot;')})" title="Edit">✏</button>
                <button class="action-btn delete-btn" onclick="deletePortfolio(${item.id})" title="Hapus">🗑</button>
            </div>
        ` : '';
        
        portfolioItem.innerHTML = `
            ${actionsHtml}
            ${imageHtml}
            <div class="portfolio-item-content">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                ${item.link ? `<a href="${item.link}" target="_blank" style="color: #667eea; text-decoration: none;">Lihat Project →</a>` : ''}
            </div>
        `;
        
        container.appendChild(portfolioItem);
    });
}

// Load portfolio table for admin
async function loadPortfolioTable() {
    await loadPortfolioData(); // Load from API
    
    const tbody = document.getElementById('portfolioTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    portfolioData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.title}</td>
            <td>${item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description}</td>
            <td>${item.date}</td>
            <td>
                <button class="btn" onclick="showPortfolioModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">Edit</button>
                <button class="btn btn-danger" onclick="deletePortfolio(${item.id})">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Delete portfolio item
async function deletePortfolio(id) {
    if (confirm('Apakah Anda yakin ingin menghapus portofolio ini?')) {
        const success = await deletePortfolioItem(id);
        
        if (success) {
            await loadPortfolioTable();
            await loadPortfolioItems();
            alert('Portofolio berhasil dihapus!');
        } else {
            alert('Gagal menghapus portofolio!');
        }
    }
}

// Portfolio form handler
document.addEventListener('DOMContentLoaded', function() {
    const portfolioForm = document.getElementById('portfolioForm');
    if (portfolioForm) {
        portfolioForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const id = document.getElementById('portfolioId').value;
            const title = document.getElementById('portfolioTitle').value;
            const description = document.getElementById('portfolioDescription').value;
            const image = document.getElementById('portfolioImage').value;
            const link = document.getElementById('portfolioLink').value;
            
            const itemData = {
                title,
                description,
                image,
                link
            };
            
            let success = false;
            
            if (id) {
                // Update existing item
                itemData.id = id;
                success = await updatePortfolioItem(itemData);
                
                if (success) {
                    alert('Portofolio berhasil diupdate!');
                } else {
                    alert('Gagal mengupdate portofolio!');
                }
            } else {
                // Add new item
                success = await createPortfolioItem(itemData);
                
                if (success) {
                    alert('Portofolio berhasil ditambahkan!');
                } else {
                    alert('Gagal menambahkan portofolio!');
                }
            }
            
            if (success) {
                hidePortfolioModal();
                await loadPortfolioTable();
                await loadPortfolioItems();
            }
        });
    }
});