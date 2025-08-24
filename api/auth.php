<?php
require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'POST':
        switch ($action) {
            case 'login':
                handleLogin();
                break;
            case 'logout':
                handleLogout();
                break;
            default:
                jsonResponse(['error' => 'Invalid action'], 400);
        }
        break;
        
    case 'GET':
        switch ($action) {
            case 'check':
                checkAuthStatus();
                break;
            default:
                jsonResponse(['error' => 'Invalid action'], 400);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function handleLogin() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username']) || !isset($input['password'])) {
        jsonResponse(['error' => 'Username and password required'], 400);
    }
    
    $username = trim($input['username']);
    $password = trim($input['password']);
    
    if (login($username, $password)) {
        jsonResponse([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'username' => $_SESSION['admin_username']
            ]
        ]);
    } else {
        jsonResponse(['error' => 'Invalid username or password'], 401);
    }
}

function handleLogout() {
    logout();
    jsonResponse([
        'success' => true,
        'message' => 'Logout successful'
    ]);
}

function checkAuthStatus() {
    if (isLoggedIn()) {
        jsonResponse([
            'logged_in' => true,
            'user' => [
                'username' => $_SESSION['admin_username']
            ]
        ]);
    } else {
        jsonResponse(['logged_in' => false]);
    }
}
?>