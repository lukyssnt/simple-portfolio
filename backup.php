<?php
/**
 * Database Backup & Restore Tool for Portfolio Website
 * This script provides functionality to backup and restore the database
 */

require_once 'config/database.php';

// Check if user is logged in as admin
if (!isLoggedIn()) {
    die('Access denied. Please login as admin.');
}

$action = $_GET['action'] ?? 'backup';
$message = '';
$error = '';

if ($_POST) {
    if ($action === 'backup') {
        $result = createBackup();
        if ($result['success']) {
            $message = $result['message'];
        } else {
            $error = $result['error'];
        }
    } elseif ($action === 'restore') {
        $result = restoreBackup($_FILES['backup_file']);
        if ($result['success']) {
            $message = $result['message'];
        } else {
            $error = $result['error'];
        }
    }
}

function createBackup() {
    try {
        $pdo = getDBConnection();
        
        // Get all tables
        $tables = [];
        $result = $pdo->query("SHOW TABLES");
        while ($row = $result->fetch(PDO::FETCH_NUM)) {
            $tables[] = $row[0];
        }
        
        $backup = "-- Portfolio Website Database Backup\n";
        $backup .= "-- Generated: " . date('Y-m-d H:i:s') . "\n\n";
        $backup .= "SET FOREIGN_KEY_CHECKS=0;\n\n";
        
        foreach ($tables as $table) {
            // Get CREATE TABLE statement
            $result = $pdo->query("SHOW CREATE TABLE `$table`");
            $createTable = $result->fetch(PDO::FETCH_NUM);
            
            $backup .= "-- Table structure for table `$table`\n";
            $backup .= "DROP TABLE IF EXISTS `$table`;\n";
            $backup .= $createTable[1] . ";\n\n";
            
            // Get table data
            $result = $pdo->query("SELECT * FROM `$table`");
            $rows = $result->fetchAll(PDO::FETCH_ASSOC);
            
            if ($rows) {
                $backup .= "-- Dumping data for table `$table`\n";
                $backup .= "INSERT INTO `$table` VALUES\n";
                
                $insertValues = [];
                foreach ($rows as $row) {
                    $values = array_map(function($value) use ($pdo) {
                        return $value === null ? 'NULL' : $pdo->quote($value);
                    }, array_values($row));
                    $insertValues[] = '(' . implode(', ', $values) . ')';
                }
                
                $backup .= implode(",\n", $insertValues) . ";\n\n";
            }
        }
        
        $backup .= "SET FOREIGN_KEY_CHECKS=1;\n";
        
        // Create backup directory if it doesn't exist
        if (!is_dir('backups')) {
            mkdir('backups', 0755, true);
        }
        
        $filename = 'backups/backup_' . date('Y-m-d_H-i-s') . '.sql';
        file_put_contents($filename, $backup);
        
        return [
            'success' => true,
            'message' => "Backup created successfully: $filename",
            'filename' => $filename
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Backup failed: ' . $e->getMessage()
        ];
    }
}

function restoreBackup($file) {
    try {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('File upload error');
        }
        
        $backupContent = file_get_contents($file['tmp_name']);
        if (!$backupContent) {
            throw new Exception('Cannot read backup file');
        }
        
        $pdo = getDBConnection();
        
        // Split SQL statements
        $statements = explode(';', $backupContent);
        
        foreach ($statements as $statement) {
            $statement = trim($statement);
            if (!empty($statement) && !preg_match('/^--/', $statement)) {
                $pdo->exec($statement);
            }
        }
        
        return [
            'success' => true,
            'message' => 'Database restored successfully!'
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => 'Restore failed: ' . $e->getMessage()
        ];
    }
}

function getBackupList() {
    $backups = [];
    if (is_dir('backups')) {
        $files = scandir('backups');
        foreach ($files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'sql') {
                $backups[] = [
                    'filename' => $file,
                    'size' => formatBytes(filesize("backups/$file")),
                    'date' => date('Y-m-d H:i:s', filemtime("backups/$file"))
                ];
            }
        }
        
        // Sort by date (newest first)
        usort($backups, function($a, $b) {
            return filemtime("backups/".$b['filename']) - filemtime("backups/".$a['filename']);
        });
    }
    return $backups;
}

function formatBytes($size, $precision = 2) {
    $units = array('B', 'KB', 'MB', 'GB');
    $power = floor(log($size, 1024));
    return round($size / pow(1024, $power), $precision) . ' ' . $units[$power];
}

$backupList = getBackupList();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Backup & Restore</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        
        .header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .header h1 {
            color: #333;
            margin-bottom: 0.5rem;
        }
        
        .header p {
            color: #666;
        }
        
        .tabs {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            border-bottom: 1px solid #eee;
        }
        
        .tab {
            padding: 1rem;
            background: none;
            border: none;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            transition: all 0.3s ease;
            text-decoration: none;
            color: #666;
        }
        
        .tab.active {
            border-bottom-color: #667eea;
            color: #667eea;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #333;
        }
        
        .form-group input[type="file"] {
            width: 100%;
            padding: 0.8rem;
            border: 2px dashed #ddd;
            border-radius: 8px;
            text-align: center;
        }
        
        .btn {
            background: #667eea;
            color: white;
            padding: 0.8rem 2rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            margin-right: 0.5rem;
        }
        
        .btn:hover {
            background: #5a67d8;
            transform: translateY(-2px);
        }
        
        .btn-danger {
            background: #ff6b6b;
        }
        
        .btn-danger:hover {
            background: #ff5252;
        }
        
        .btn-success {
            background: #4CAF50;
        }
        
        .btn-success:hover {
            background: #45a049;
        }
        
        .alert {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        
        .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .alert-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .backup-list {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
        }
        
        .backup-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            margin-bottom: 0.5rem;
            background: white;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .backup-info {
            flex: 1;
        }
        
        .backup-name {
            font-weight: 500;
            color: #333;
        }
        
        .backup-meta {
            font-size: 0.9rem;
            color: #666;
            margin-top: 0.25rem;
        }
        
        .backup-actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .warning {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        
        .back-link {
            text-align: center;
            margin-top: 2rem;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 8px;
            text-align: center;
        }
        
        .stat-number {
            font-size: 1.5rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 0.5rem;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Database Backup & Restore</h1>
            <p>Manage your website data safely</p>
        </div>
        
        <?php if ($message): ?>
            <div class="alert alert-success"><?= htmlspecialchars($message) ?></div>
        <?php endif; ?>
        
        <?php if ($error): ?>
            <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>
        
        <div class="tabs">
            <a href="?action=backup" class="tab <?= $action === 'backup' ? 'active' : '' ?>">Create Backup</a>
            <a href="?action=restore" class="tab <?= $action === 'restore' ? 'active' : '' ?>">Restore Backup</a>
            <a href="?action=manage" class="tab <?= $action === 'manage' ? 'active' : '' ?>">Manage Backups</a>
        </div>
        
        <?php if ($action === 'backup'): ?>
            <div class="tab-content active">
                <h3>Create New Backup</h3>
                <p>Create a complete backup of your database including all content, portfolio items, and blog posts.</p>
                
                <div class="warning">
                    <strong>Note:</strong> Creating a backup will include all your data. Store the backup file in a safe location.
                </div>
                
                <form method="POST">
                    <button type="submit" class="btn btn-success">Create Backup Now</button>
                </form>
                
                <?php if ($backupList): ?>
                    <h4 style="margin-top: 2rem;">Recent Backups</h4>
                    <div class="backup-list">
                        <?php foreach (array_slice($backupList, 0, 3) as $backup): ?>
                            <div class="backup-item">
                                <div class="backup-info">
                                    <div class="backup-name"><?= htmlspecialchars($backup['filename']) ?></div>
                                    <div class="backup-meta">Size: <?= $backup['size'] ?> | Date: <?= $backup['date'] ?></div>
                                </div>
                                <div class="backup-actions">
                                    <a href="backups/<?= htmlspecialchars($backup['filename']) ?>" class="btn" download>Download</a>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
            
        <?php elseif ($action === 'restore'): ?>
            <div class="tab-content active">
                <h3>Restore from Backup</h3>
                <p>Upload a backup file to restore your database.</p>
                
                <div class="warning">
                    <strong>Warning:</strong> Restoring a backup will completely replace your current data. This action cannot be undone. Please create a backup before proceeding.
                </div>
                
                <form method="POST" enctype="multipart/form-data">
                    <div class="form-group">
                        <label>Select Backup File (.sql)</label>
                        <input type="file" name="backup_file" accept=".sql" required>
                    </div>
                    
                    <button type="submit" class="btn btn-danger" onclick="return confirm('Are you sure? This will replace all current data!')">Restore Database</button>
                </form>
            </div>
            
        <?php elseif ($action === 'manage'): ?>
            <div class="tab-content active">
                <h3>Manage Backups</h3>
                
                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-number"><?= count($backupList) ?></div>
                        <div class="stat-label">Total Backups</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-number">
                            <?php 
                            $totalSize = 0;
                            foreach ($backupList as $backup) {
                                $totalSize += filesize("backups/" . $backup['filename']);
                            }
                            echo formatBytes($totalSize);
                            ?>
                        </div>
                        <div class="stat-label">Total Size</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-number">
                            <?= $backupList ? date('Y-m-d', filemtime("backups/" . $backupList[0]['filename'])) : 'N/A' ?>
                        </div>
                        <div class="stat-label">Latest Backup</div>
                    </div>
                </div>
                
                <?php if ($backupList): ?>
                    <div class="backup-list">
                        <?php foreach ($backupList as $backup): ?>
                            <div class="backup-item">
                                <div class="backup-info">
                                    <div class="backup-name"><?= htmlspecialchars($backup['filename']) ?></div>
                                    <div class="backup-meta">Size: <?= $backup['size'] ?> | Created: <?= $backup['date'] ?></div>
                                </div>
                                <div class="backup-actions">
                                    <a href="backups/<?= htmlspecialchars($backup['filename']) ?>" class="btn" download>Download</a>
                                    <a href="?action=delete&file=<?= urlencode($backup['filename']) ?>" 
                                       class="btn btn-danger" 
                                       onclick="return confirm('Delete this backup?')">Delete</a>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <p>No backups found. <a href="?action=backup">Create your first backup</a>.</p>
                <?php endif; ?>
            </div>
        <?php endif; ?>
        
        <div class="back-link">
            <a href="index.html" class="btn">Back to Website</a>
        </div>
    </div>
</body>
</html>

<?php
// Handle backup deletion
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['file'])) {
    $filename = $_GET['file'];
    $filepath = "backups/" . basename($filename); // Prevent directory traversal
    
    if (file_exists($filepath)) {
        unlink($filepath);
        header('Location: backup.php?action=manage&message=Backup deleted successfully');
        exit;
    }
}
?>