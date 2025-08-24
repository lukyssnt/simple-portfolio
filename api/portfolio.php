<?php
require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getPortfolioItems();
        break;
        
    case 'POST':
        if (!isLoggedIn()) {
            jsonResponse(['error' => 'Unauthorized'], 401);
        }
        createPortfolioItem();
        break;
        
    case 'PUT':
        if (!isLoggedIn()) {
            jsonResponse(['error' => 'Unauthorized'], 401);
        }
        updatePortfolioItem();
        break;
        
    case 'DELETE':
        if (!isLoggedIn()) {
            jsonResponse(['error' => 'Unauthorized'], 401);
        }
        deletePortfolioItem();
        break;
        
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function getPortfolioItems() {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->query("SELECT * FROM portfolio ORDER BY created_at DESC");
        $items = $stmt->fetchAll();
        
        // Format data
        $formattedItems = array_map(function($item) {
            return [
                'id' => (int)$item['id'],
                'title' => $item['title'],
                'description' => $item['description'],
                'image' => $item['image_url'] ?? '',
                'link' => $item['project_link'] ?? '',
                'date' => date('Y-m-d', strtotime($item['created_at']))
            ];
        }, $items);
        
        jsonResponse([
            'success' => true,
            'data' => $formattedItems
        ]);
        
    } catch (Exception $e) {
        jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function createPortfolioItem() {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['title']) || !isset($input['description'])) {
            jsonResponse(['error' => 'Title and description required'], 400);
        }
        
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("INSERT INTO portfolio (title, description, image_url, project_link) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $input['title'],
            $input['description'],
            $input['image'] ?? '',
            $input['link'] ?? ''
        ]);
        
        $newId = $pdo->lastInsertId();
        
        jsonResponse([
            'success' => true,
            'message' => 'Portfolio item created successfully',
            'id' => $newId
        ]);
        
    } catch (Exception $e) {
        jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function updatePortfolioItem() {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['id']) || !isset($input['title']) || !isset($input['description'])) {
            jsonResponse(['error' => 'ID, title and description required'], 400);
        }
        
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("UPDATE portfolio SET title = ?, description = ?, image_url = ?, project_link = ? WHERE id = ?");
        $stmt->execute([
            $input['title'],
            $input['description'],
            $input['image'] ?? '',
            $input['link'] ?? '',
            $input['id']
        ]);
        
        if ($stmt->rowCount() > 0) {
            jsonResponse([
                'success' => true,
                'message' => 'Portfolio item updated successfully'
            ]);
        } else {
            jsonResponse(['error' => 'Portfolio item not found'], 404);
        }
        
    } catch (Exception $e) {
        jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function deletePortfolioItem() {
    try {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            jsonResponse(['error' => 'ID required'], 400);
        }
        
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("DELETE FROM portfolio WHERE id = ?");
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            jsonResponse([
                'success' => true,
                'message' => 'Portfolio item deleted successfully'
            ]);
        } else {
            jsonResponse(['error' => 'Portfolio item not found'], 404);
        }
        
    } catch (Exception $e) {
        jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}
?>