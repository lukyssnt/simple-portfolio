<?php
require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getHomeContent();
        break;
        
    case 'PUT':
        if (!isLoggedIn()) {
            jsonResponse(['error' => 'Unauthorized'], 401);
        }
        updateHomeContent();
        break;
        
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function getHomeContent() {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->query("SELECT * FROM home_content ORDER BY id DESC LIMIT 1");
        $content = $stmt->fetch();
        
        if ($content) {
            jsonResponse([
                'success' => true,
                'data' => [
                    'title' => $content['title'],
                    'description' => $content['description']
                ]
            ]);
        } else {
            jsonResponse([
                'success' => true,
                'data' => [
                    'title' => 'Selamat Datang',
                    'description' => 'Default description'
                ]
            ]);
        }
    } catch (Exception $e) {
        jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function updateHomeContent() {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['title']) || !isset($input['description'])) {
            jsonResponse(['error' => 'Title and description required'], 400);
        }
        
        $pdo = getDBConnection();
        
        // Check if content exists
        $stmt = $pdo->query("SELECT COUNT(*) FROM home_content");
        $count = $stmt->fetchColumn();
        
        if ($count > 0) {
            // Update existing
            $stmt = $pdo->prepare("UPDATE home_content SET title = ?, description = ? WHERE id = 1");
            $stmt->execute([$input['title'], $input['description']]);
        } else {
            // Insert new
            $stmt = $pdo->prepare("INSERT INTO home_content (title, description) VALUES (?, ?)");
            $stmt->execute([$input['title'], $input['description']]);
        }
        
        jsonResponse([
            'success' => true,
            'message' => 'Home content updated successfully'
        ]);
        
    } catch (Exception $e) {
        jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}
?>