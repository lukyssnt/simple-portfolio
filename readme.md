# Portfolio Website dengan PHP & MySQL

Portfolio website yang dilengkapi dengan sistem admin untuk mengelola konten secara dinamis.

## 🚀 Fitur

- ✨ Dashboard admin untuk mengelola konten
- 🎨 Desain modern dengan animasi smooth
- 📱 Responsive design
- 🔐 Sistem autentikasi dengan PHP session
- ⚡ API RESTful untuk CRUD operations
- 💾 Data tersimpan permanen di MySQL database
- 🎯 Navigation yang smooth

## 📁 Struktur File

```
portfolio-website/
├── index.html
├── config/
│   └── database.php
├── api/
│   ├── auth.php
│   ├── home.php
│   ├── portfolio.php
│   └── blog.php
├── styles/
│   └── main.css
├── js/
│   ├── auth.js
│   ├── data.js
│   ├── portfolio.js
│   ├── blog.js
│   ├── admin.js
│   └── main.js
├── assets/
│   └── images/
├── database.sql
└── README.md
```

## 🛠️ Instalasi & Setup

### 1. Persiapan Environment

**Pastikan Anda sudah menginstall:**
- XAMPP/WAMP/LAMP (Apache + MySQL + PHP)
- Browser modern (Chrome, Firefox, Edge)
- Text editor (VSCode, Sublime Text, dll)

### 2. Setup Database

1. **Buka phpMyAdmin** (http://localhost/phpmyadmin)

2. **Import Database:**
   - Buat database baru bernama `portfolio_website`
   - Import file `database.sql` atau jalankan script SQL berikut:

```sql
-- Jalankan script di database.sql yang sudah disediakan
```

3. **Verifikasi Database:**
   - Pastikan tabel `admin_users`, `home_content`, `portfolio`, dan `blog_posts` sudah terbuat
   - Data default sudah ter-insert

### 3. Konfigurasi File

1. **Edit config/database.php** jika diperlukan:
```php
define('DB_HOST', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', ''); // Sesuaikan dengan setup MySQL Anda
define('DB_NAME', 'portfolio_website');
```

2. **Pastikan struktur folder sesuai:**
   - Semua file API berada di folder `api/`
   - File konfigurasi di folder `config/`
   - File JavaScript di folder `js/`
   - File CSS di folder `styles/`

### 4. Deployment ke Server Local

1. **Copy semua file** ke folder web server:
   - XAMPP: `C:\xampp\htdocs\portfolio-website\`
   - WAMP: `C:\wamp64\www\portfolio-website\`
   - LAMP: `/var/www/html/portfolio-website/`

2. **Pastikan Apache dan MySQL sudah running**

3. **Akses website** di browser:
   ```
   http://localhost/portfolio-website/
   ```

### 5. Test Fungsionalitas

1. **Buka website** - pastikan tampilan normal
2. **Test Login Admin:**
   - Username: `admin`
   - Password: `password`
3. **Test CRUD Operations:**
   - Edit home content
   - Tambah/edit/hapus portfolio
   - Tambah/edit/hapus blog post

## 🔧 Konfigurasi Lanjutan

### Mengubah Password Admin

1. **Generate password hash baru:**
```php
<?php
echo password_hash('password_baru_anda', PASSWORD_DEFAULT);
?>
```

2. **Update di database:**
```sql
UPDATE admin_users SET password = 'hash_hasil_generate' WHERE username = 'admin';
```

### Menambah User Admin Baru

```sql
INSERT INTO admin_users (username, password) VALUES 
('username_baru', 'hash_password');
```

### Customisasi API Base URL

Jika website tidak di root folder, edit di `js/auth.js`:
```javascript
const API_BASE_URL = '/nama-folder-anda/api/';
```

## 📱 Responsive Design

Website sudah dioptimalkan untuk:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🔒 Keamanan

- Password di-hash menggunakan PHP `password_hash()`
- Prepared statements untuk mencegah SQL injection
- Session-based authentication
- Input validation di client dan server side

## 🚀 Deployment ke Production

### 1. Siapkan Hosting

- Shared hosting atau VPS dengan PHP 7.4+ dan MySQL 5.7+
- Pastikan ekstensi PHP PDO dan PDO_MySQL enabled

### 2. Upload Files

- Upload semua file ke public_html atau folder website
- Pastikan permission folder sesuai (755 untuk folder, 644 untuk file)

### 3. Setup Database Production

- Buat database di hosting panel
- Import database.sql
- Update config/database.php dengan kredensial hosting

### 4. Update Konfigurasi

- Ganti `localhost` dengan domain/IP server
- Update API_BASE_URL jika diperlukan
- Test semua fungsi setelah upload

## 🛠️ Troubleshooting

### Database Connection Error
```
Connection failed: SQLSTATE[HY000] [1045] Access denied
```
**Solusi:** Periksa username, password, dan nama database di config/database.php

### 404 Error pada API
```
404 Not Found - api/auth.php
```
**Solusi:** 
- Pastikan file API ada di folder yang benar
- Periksa .htaccess jika menggunakan URL rewriting
- Verifikasi API_BASE_URL di JavaScript

### Session tidak berfungsi
**Solusi:**
- Pastikan session_start() dipanggil
- Periksa permission folder session PHP
- Clear browser cookies

### CORS Error
```
Access to fetch blocked by CORS policy
```
**Solusi:** Tambahkan header CORS di file API:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
```

## 📞 Support

Jika mengalami masalah:
1. Periksa browser console untuk error JavaScript
2. Periksa PHP error log
3. Pastikan semua file ter-upload dengan benar
4. Verifikasi konfigurasi database

---

**Default Login:**
- Username: `admin`
- Password: `password`

**Selamat menggunakan! 🎉**