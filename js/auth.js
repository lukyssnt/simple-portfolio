// Authentication system - Updated for PHP API
let isLoggedIn = false;

// API Base URL - adjust according to your setup
const API_BASE_URL = 'api/';

// Authentication functions
function showLogin() {
    document.getElementById('loginPanel').classList.add('active');
}

function hideLogin() {
    document.getElementById('loginPanel').classList.remove('active');
    document.getElementById('loginForm').reset();
    document.getElementById('loginError').style.display = 'none';
}

async function login(username, password) {
    try {
        const response = await fetch(API_BASE_URL + 'auth.php?action=login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();
        
        if (data.success) {
            isLoggedIn = true;
            updateUIForAuth();
            hideLogin();
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

async function logout() {
    try {
        await fetch(API_BASE_URL + 'auth.php?action=logout', {
            method: 'POST'
        });
        
        isLoggedIn = false;
        updateUIForAuth();
        
        // Close admin panel if open
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel.classList.contains('active')) {
            adminPanel.classList.remove('active');
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

async function checkAuthStatus() {
    try {
        const response = await fetch(API_BASE_URL + 'auth.php?action=check');
        const data = await response.json();
        
        isLoggedIn = data.logged_in || false;
        updateUIForAuth();
    } catch (error) {
        console.error('Auth check error:', error);
        isLoggedIn = false;
        updateUIForAuth();
    }
}

function updateUIForAuth() {
    const guestButtons = document.getElementById('guestButtons');
    const adminButtons = document.getElementById('adminButtons');
    const editIcons = document.querySelectorAll('.edit-icon');

    if (isLoggedIn) {
        guestButtons.classList.add('hidden');
        adminButtons.classList.remove('hidden');
        editIcons.forEach(icon => icon.classList.remove('hidden'));
    } else {
        guestButtons.classList.remove('hidden');
        adminButtons.classList.add('hidden');
        editIcons.forEach(icon => icon.classList.add('hidden'));
    }
}

// Login form handler
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status on page load
    checkAuthStatus();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const success = await login(username, password);
            
            if (success) {
                alert('Login berhasil!');
            } else {
                const errorDiv = document.getElementById('loginError');
                errorDiv.textContent = 'Username atau password salah!';
                errorDiv.style.display = 'block';
            }
        });
    }
});