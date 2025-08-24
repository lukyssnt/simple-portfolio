# Portfolio Website dengan PHP & MySQL

Portfolio website yang dilengkapi dengan sistem admin untuk mengelola konten secara dinamis.

## 🚀 Fitur

- ✨ Dashboard admin untuk mengelola konten
- 🎨 Design modern dengan animasi smooth
- 📱 Responsive design
- 🔐 Sistem autentikasi dengan PHP session
- ⚡ API RESTful untuk CRUD operations
- 💾 Data tersimpan permanen di MySQL database
- 🎯 Navigation yang smooth
- 🔧 Auto installer untuk setup mudah
- 💾 Backup & restore database
- 📊 Admin statistics dashboard
- 🔔 Real-time notifications
- 🛡️ Security headers dan validasi input

## 📁 Struktur File Lengkap

```
portfolio-website/
├── index.html                 # Main website page
├── install.php               # Auto installation wizard
├── backup.php                # Database backup & restore tool
├── .htaccess                 # Apache configuration
├── config/
│   ├── database.php          # Database configuration
│   └── install.lock          # Installation lock file (auto-generated)
├── api/
│   ├── auth.php             # Authentication API
│   ├── home.php             # Home content API
│   ├── portfolio.php        # Portfolio management API
│   └── blog.php             # Blog management API
├── styles/
│   └── main.css             # Main stylesheet
├── js/
│   ├── utils.js             # Utility functions & helpers
│   ├── auth.js              # Authentication management
│   ├── data.js              # Data management
│   ├── portfolio.js         # Portfolio functionality
│   ├── blog.js              # Blog functionality
│   ├── admin.js             # Admin panel
│   └── main.js              # Main application
├── assets/
│   └── images/              # Image assets
├── backups/                 # Database backups (auto-created)
├── database.sql             # Database schema
└── README.md                # Documentation
```

## 🛠️ Instalasi & Setup

### Metode 1: Auto Installation (Recommended)

1. **Persiapan Environment**
   - Install XAMPP/WAMP/LAMP
   - Start Apache dan MySQL

2. **Upload Files**
   - Copy semua file ke folder web server
   - XAMPP: `C:\xampp\htdocs\portfolio-website\`
   - WAMP: `C:\wamp64\www\portfolio-website\`

3. **Jalankan Auto Installer**
   - Buka browser ke `http://localhost/portfolio-website/install.php`
   - Ikuti wizard instalasi step by step:
     - Step 1: Check Requirements
     - Step 2: Database Configuration  
     - Step 3: Setup Database
     - Step 4: Create Admin User
     - Step 5: Finalize Installation

4. **Akses Website**
   - Website: `http://localhost/portfolio-website/`
   - Login dengan kredensial yang dibuat di installer

### Metode 2: Manual Installation

1. **Setup Database**
   - Buat database `portfolio_website` di phpMyAdmin
   - Import file `database.sql`

2. **Konfigurasi Database**
   - Edit `config/database.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USERNAME', 'root');
   define('DB_PASSWORD', '');
   define('DB_NAME', 'portfolio_website');
   ```

3. **Test Website**
   - Akses `http://localhost/portfolio-website/`
   - Login: username=`admin`, password=`password`

## 🔧 Fitur Admin Dashboard

### 1. Home Content Management
- Edit hero title dan description
- Real-time preview update
- Form validation

### 2. Portfolio Management
- Tambah/edit/hapus portfolio items
- Upload gambar dan link project
- Grid view dengan hover effects
- Bulk operations

### 3. Blog Management  
- Tambah/edit/hapus blog posts
- Rich text content
- Date management
- Preview dan publish

### 4. Database Backup & Restore
- Akses: `http://localhost/portfolio-website/backup.php`
- Create full database backups
- Restore from backup files
- Manage existing backups
- Download backup files

### 5. Statistics Dashboard
- Total portfolio items
- Total blog posts
- Recent activity
- Auto-refresh data

## 🎨 Customization

### Mengubah Warna Theme

Edit `styles/main.css`:
```css
/* Primary colors */
:root {
    --primary-color: #667eea;
    --primary-hover: #5a67d8;
    --gradient-start: #667eea;
    --gradient-end: #764ba2;
}
```

### Menambah Menu Navigation

Edit `index.html` bagian navigation:
```html
<ul class="nav-links">
    <li><a href="#" class="nav-link" data-section="home">Home</a></li>
    <li><a href="#" class="nav-link" data-section="portfolio">Portfolio</a></li>
    <li><a href="#" class="nav-link" data-section="blog">Blog</a></li>
    <li><a href="#" class="nav-link" data-section="contact">Contact</a></li>
</ul>
```

### Custom Notification Messages

```javascript
// Success notification
showNotification('Data berhasil disimpan!', 'success');

// Error notification  
showNotification('Terjadi kesalahan!', 'error');

// Warning notification
showNotification('Perhatian!', 'warning');

// Info notification
showNotification('Info penting', 'info');
```

## 🔒 Security Features

### 1. Authentication
- Session-based login
- Password hashing dengan `password_hash()`
- Auto logout on session expire
- CSRF protection

### 2. Database Security
- Prepared statements untuk semua queries
- Input validation dan sanitization
- SQL injection prevention
- XSS protection

### 3. Server Security
- Security headers di `.htaccess`
- File access restrictions
- Directory traversal prevention
- Upload validation

## 🚀 Deployment Production

### 1. Shared Hosting

1. **Upload Files**
   - Upload via FTP/File Manager
   - Set folder permissions: 755
   - Set file permissions: 644

2. **Database Setup**
   - Create database di cPanel/hosting panel
   - Import `database.sql`
   - Update `config/database.php`

3. **Domain Configuration**
   - Update API_BASE_URL di `js/auth.js` jika diperlukan
   - Test semua functionality

### 2. VPS/Dedicated Server

1. **Server Requirements**
   - PHP 7.4+ dengan extensions: PDO, PDO_MySQL, JSON
   - MySQL 5.7+ atau MariaDB 10.2+
   - Apache/Nginx dengan mod_rewrite

2. **SSL Certificate**
   - Install SSL certificate
   - Update `.htaccess` untuk force HTTPS:
   ```apache
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

3. **Performance Optimization**
   - Enable gzip compression
   - Set cache headers
   - Optimize images
   - Use CDN jika diperlukan

## 📊 API Documentation

### Authentication API (`api/auth.php`)

**Login**
```javascript
POST api/auth.php?action=login
Body: {
    "username": "admin",
    "password": "password"
}
```

**Logout**
```javascript
POST api/auth.php?action=logout
```

**Check Status**
```javascript
GET api/auth.php?action=check
```

### Home Content API (`api/home.php`)

**Get Content**
```javascript
GET api/home.php
```

**Update Content**  
```javascript
PUT api/home.php
Body: {
    "title": "New Title",
    "description": "New Description"
}
```

### Portfolio API (`api/portfolio.php`)

**Get All Items**
```javascript
GET api/portfolio.php
```

**Create Item**
```javascript
POST api/portfolio.php  
Body: {
    "title": "Project Title",
    "description": "Description",
    "image": "http://example.com/image.jpg",
    "link": "http://example.com"
}
```

**Update Item**
```javascript
PUT api/portfolio.php
Body: {
    "id": 1,
    "title": "Updated Title",
    "description": "Updated Description"
}
```

**Delete Item**
```javascript
DELETE api/portfolio.php?id=1
```

### Blog API (`api/blog.php`)

Similar endpoints dengan Portfolio API, tapi untuk blog posts.

## 🛠️ Troubleshooting

### Database Connection Error
**Gejala:** `Connection failed: Access denied`
**Solusi:**
- Periksa kredensial database di `config/database.php`
- Pastikan MySQL service running
- Cek user permissions di MySQL

### 404 Error pada API
**Gejala:** `404 Not Found - api/auth.php`  
**Solusi:**
- Pastikan mod_rewrite enabled di Apache
- Periksa file `.htaccess`
- Verifikasi struktur folder

### Session tidak berfungsi  
**Gejala:** Login berhasil tapi langsung logout
**Solusi:**
- Periksa session directory permissions
- Clear browser cookies
- Pastikan `session_start()` dipanggil

### JavaScript Error
**Gejala:** `Uncaught ReferenceError`
**Solusi:**  
- Periksa urutan loading script di `index.html`
- Check browser console untuk error details
- Pastikan semua file JavaScript ter-load

### Performance Issues
**Gejala:** Website lambat loading
**Solusi:**
- Enable gzip compression di `.htaccess`
- Optimize images
- Check database query performance
- Use browser caching

## 📞 Support & Maintenance

### Regular Maintenance
- **Backup Database:** Lakukan backup mingguan via `backup.php`
- **Update Password:** Ganti password admin secara berkala
- **Monitor Logs:** Check error logs untuk issues
- **Clean Backups:** Hapus backup lama untuk save space

### Updates & Patches
- Keep PHP dan MySQL updated
- Monitor security advisories  
- Test updates di staging environment
- Backup sebelum update major

### Performance Monitoring
- Monitor server resources (CPU, RAM, Disk)
- Check database performance
- Monitor website uptime
- Analyze user behavior

---

**Default Login Credentials:**
- Username: `admin`
- Password: `password` (atau sesuai yang dibuat di installer)

**Important Files:**
- Main website: `index.html`
- Admin backup: `backup.php`
- Auto installer: `install.php`
- Database config: `config/database.php`

**🎉 Selamat menggunakan Portfolio Website!**

Untuk support lebih lanjut, pastikan untuk:
1. Check browser console untuk JavaScript errors
2. Check server error logs untuk PHP errors  
3. Test di browser berbeda
4. Pastikan semua requirements terpenuhi
