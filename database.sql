-- Database untuk Portfolio Website
CREATE DATABASE IF NOT EXISTS portfolio_website;
USE portfolio_website;

-- Tabel untuk data admin
CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk data home/hero section
CREATE TABLE IF NOT EXISTS home_content (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel untuk portfolio
CREATE TABLE IF NOT EXISTS portfolio (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    project_link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel untuk blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert data default
INSERT INTO admin_users (username, password) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: admin123

INSERT INTO home_content (title, description) VALUES 
('Selamat Datang', 'Saya adalah seorang developer yang passionate dalam menciptakan solusi digital yang inovatif dan bermanfaat. Mari berkenalan lebih jauh melalui karya-karya saya.');

INSERT INTO portfolio (title, description, image_url, project_link) VALUES 
('Website E-commerce', 'Platform jual-beli online dengan fitur lengkap', '', ''),
('Aplikasi Mobile', 'Aplikasi mobile untuk manajemen tugas harian', '', '');

INSERT INTO blog_posts (title, content) VALUES 
('Tips Belajar Web Development', 'Web development adalah skill yang sangat penting di era digital ini. Berikut beberapa tips untuk memulai belajar web development dari nol hingga mahir...'),
('Tren Teknologi 2025', 'Tahun 2025 membawa berbagai inovasi teknologi baru yang akan mengubah cara kita bekerja dan berinteraksi. Mari kita bahas beberapa tren yang perlu diperhatikan...');