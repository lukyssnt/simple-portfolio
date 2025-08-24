let currentEditingBlogItem = null;

// Blog management functions
function showBlogModal(item = null) {
    currentEditingBlogItem = item;
    const modal = document.getElementById('blogModal');
    const modalTitle = document.getElementById('blogModalTitle');
    const submitBtn = document.getElementById('blogSubmitBtn');
    
    if (item) {
        modalTitle.textContent = 'Edit Tulisan';
        submitBtn.textContent = 'Update Tulisan';
        document.getElementById('blogId').value = item.id;
        document.getElementById('blogTitle').value = item.title;
        document.getElementById('blogContent').value = item.content;
    } else {
        modalTitle.textContent = 'Tambah Tulisan';
        submitBtn.textContent = 'Tambah Tulisan';
        document.getElementById('blogForm').reset();
        document.getElementById('blogId').value = '';
    }
    
    modal.classList.add('active');
}

function hideBlogModal() {
    const modal = document.getElementById('blogModal');
    const form = document.getElementById('blogForm');
    if (modal && form) {
        modal.classList.remove('active');
        form.reset();
    }
    currentEditingBlogItem = null;
}

// Load blog posts for display
async function loadBlogPosts() {
    await loadBlogData(); // Load from API
    
    const container = document.getElementById('blogContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    blogData.forEach(post => {
        const blogPost = document.createElement('div');
        blogPost.className = 'blog-post';
        
        const actionsHtml = isLoggedIn ? `
            <div class="blog-actions">
                <button class="action-btn edit-btn" onclick="showBlogModal(${JSON.stringify(post).replace(/"/g, '&quot;')})" title="Edit">✏</button>
                <button class="action-btn delete-btn" onclick="deleteBlog(${post.id})" title="Hapus">🗑</button>
            </div>
        ` : '';
        
        blogPost.innerHTML = `
            ${actionsHtml}
            <h3>${post.title}</h3>
            <div class="blog-meta">Dipublikasikan pada ${post.date}</div>
            <p>${post.content}</p>
        `;
        
        container.appendChild(blogPost);
    });
}

// Load blog table for admin
async function loadBlogTable() {
    await loadBlogData(); // Load from API
    
    const tbody = document.getElementById('blogTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    blogData.forEach(post => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${post.title}</td>
            <td>${post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content}</td>
            <td>${post.date}</td>
            <td>
                <button class="btn" onclick="showBlogModal(${JSON.stringify(post).replace(/"/g, '&quot;')})">Edit</button>
                <button class="btn btn-danger" onclick="deleteBlog(${post.id})">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Delete blog post
async function deleteBlog(id) {
    if (confirm('Apakah Anda yakin ingin menghapus tulisan ini?')) {
        const success = await deleteBlogPost(id);
        
        if (success) {
            await loadBlogTable();
            await loadBlogPosts();
            alert('Tulisan berhasil dihapus!');
        } else {
            alert('Gagal menghapus tulisan!');
        }
    }
}

// Blog form handler
document.addEventListener('DOMContentLoaded', function() {
    const blogForm = document.getElementById('blogForm');
    if (blogForm) {
        blogForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const id = document.getElementById('blogId').value;
            const title = document.getElementById('blogTitle').value;
            const content = document.getElementById('blogContent').value;
            
            const postData = {
                title,
                content
            };
            
            let success = false;
            
            if (id) {
                // Update existing item
                postData.id = id;
                success = await updateBlogPost(postData);
                
                if (success) {
                    alert('Tulisan berhasil diupdate!');
                } else {
                    alert('Gagal mengupdate tulisan!');
                }
            } else {
                // Add new item
                success = await createBlogPost(postData);
                
                if (success) {
                    alert('Tulisan berhasil ditambahkan!');
                } else {
                    alert('Gagal menambahkan tulisan!');
                }
            }
            
            if (success) {
                hideBlogModal();
                await loadBlogTable();
                await loadBlogPosts();
            }
        });
    }
});