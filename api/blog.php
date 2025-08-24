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
        getBlogPosts();
        break;
        
    case 'POST':
        if (!isLoggedIn()) {
            jsonResponse(['error' => 'Unauthorized'], 401);
        }
        createBlogPost();
        break;
        
    case 'PUT':
        if (!isLoggedIn()) {
            jsonResponse(['error' => 'Unauthorized'], 401);
        }
        updateBlogPost();
        break;
        
    case 'DELETE':
        if (!isLoggedIn()) {
            jsonResponse(['error' => 'Unauthorized'], 401);
        }
        deleteBlogPost();
        break;
        
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function getBlogPosts() {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->query("SELECT * FROM blog_posts ORDER BY created_at DESC");
        $posts = $stmt->fetchAll();
        
        // Format data
        $formattedPosts = array_map(function($post) {
            return [
                'id' => (int)$post['id'],
                'title' => $post['title'],
                'content' => $post['content'],
                'date' => date('d F Y', strtotime($post['created_at']))
            ];
        }, $posts);
        
        jsonResponse([
            'success' => true,
            'data' => $formattedPosts
        ]);
        
    } catch (Exception $e) {
        jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function createBlogPost() {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['title']) || !isset($input['content'])) {
            jsonResponse(['error' => 'Title and content required'], 400);
        }
        
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("INSERT INTO blog_posts (title, content) VALUES (?, ?)");
        $stmt->execute([
            $input['title'],
            $input['content']
        ]);
        
        $newId = $pdo->lastInsertId();
        
        jsonResponse([
            'success' => true,
            'message' => 'Blog post created successfully',
            'id' => $newId
        ]);
        
    } catch (Exception $e) {
        jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function updateBlogPost() {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['id']) || !isset($input['title']) || !isset($input['content'])) {
            jsonResponse(['error' => 'ID, title and content required'], 400);
        }
        
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("UPDATE blog_posts SET title = ?, content = ? WHERE id = ?");
        $stmt->execute([
            $input['title'],
            $input['content'],
            $input['id']
        ]);
        
        if ($stmt->rowCount() > 0) {
            jsonResponse([
                'success' => true,
                'message' => 'Blog post updated successfully'
            ]);
        } else {
            jsonResponse(['error' => 'Blog post not found'], 404);
        }
        
    } catch (Exception $e) {
        jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

function deleteBlogPost() {
    try {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            jsonResponse(['error' => 'ID required'], 400);
        }
        
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("DELETE FROM blog_posts WHERE id = ?");
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            jsonResponse([
                'success' => true,
                'message' => 'Blog post deleted successfully'
            ]);
        } else {
            jsonResponse(['error' => 'Blog post not found'], 404);
        }
        
    } catch (Exception $e) {
        jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}
?>