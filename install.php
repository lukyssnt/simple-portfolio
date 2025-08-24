<?php
/**
 * Auto Installation Script for Portfolio Website
 * This script will automatically setup the database and initial configuration
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if installation is already completed
if (file_exists('config/install.lock')) {
    die('Installation already completed. Delete config/install.lock to reinstall.');
}

$step = $_GET['step'] ?? '1';
$error = '';
$success = '';

// Step 1: Check requirements
if ($step == '1') {
    $requirements = checkRequirements();
}

// Step 2: Database configuration
if ($step == '2' && $_POST) {
    $dbConfig = [
        'host' => $_POST['db_host'] ?? 'localhost',
        'username' => $_POST['db_username'] ?? 'root',
        'password' => $_POST['db_password'] ?? '',
        'database' => $_POST['db_name'] ?? 'portfolio_website'
    ];
    
    $testResult = testDatabaseConnection($dbConfig);
    if ($testResult['success']) {
        $success = 'Database connection successful!';
        // Store config temporarily
        file_put_contents('temp_config.json', json_encode($dbConfig));
    } else {
        $error = $testResult['error'];
    }
}

// Step 3: Create database and tables
if ($step == '3') {
    $dbConfig = json_decode(file_get_contents('temp_config.json'), true);
    $setupResult = setupDatabase($dbConfig);
    
    if ($setupResult['success']) {
        $success = 'Database setup completed!';
    } else {
        $error = $setupResult['error'];
    }
}

// Step 4: Create admin user
if ($step == '4' && $_POST) {
    $adminData = [
        'username' => $_POST['admin_username'] ?? 'admin',
        'password' => $_POST['admin_password'] ?? 'password'
    ];
    
    $adminResult = createAdminUser($adminData);
    if ($adminResult['success']) {
        $success = 'Admin user created successfully!';
    } else {
        $error = $adminResult['error'];
    }
}

// Step 5: Finalize installation
if ($step == '5') {
    $finalResult = finalizeInstallation();
    if ($finalResult['success']) {
        $success = 'Installation completed successfully!';
    } else {
        $error = $finalResult['error'];
    }
}

function checkRequirements() {
    $requirements = [
        'PHP Version >= 7.4' => version_compare(PHP_VERSION, '7.4.0') >= 0,
        'PDO Extension' => extension_loaded('pdo'),
        'PDO MySQL Extension' => extension_loaded('pdo_mysql'),
        'JSON Extension' => extension_loaded('json'),
        'Config Directory Writable' => is_writable(dirname(__FILE__)) || mkdir('config', 0755, true),
        'MySQL Available' => function_exists('mysql_connect') || extension_loaded('mysqli') || extension_loaded('pdo_mysql')
    ];
    
    return $requirements;
}

function testDatabaseConnection($config) {
    try {
        // Test connection without database first
        $pdo = new PDO(
            "mysql:host={$config['host']};charset=utf8mb4",
            $config['username'],
            $config['password'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        
        // Try to create database if it doesn't exist
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$config['database']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        
        // Test connection to the database
        $pdo = new PDO(
            "mysql:host={$config['host']};dbname={$config['database']};charset=utf8mb4",
            $config['username'],
            $config['password'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        
        return ['success' => true];
    } catch (PDOException $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

function setupDatabase($config) {
    try {
        $pdo = new PDO(
            "mysql:host={$config['host']};dbname={$config['database']};charset=utf8mb4",
            $config['username'],
            $config['password'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        
        // Read SQL schema
        $sql = file_get_contents('database.sql');
        
        // Remove the CREATE DATABASE and USE statements as we already connected to the database
        $sql = preg_replace('/CREATE DATABASE.*?;/i', '', $sql);
        $sql = preg_replace('/USE.*?;/i', '', $sql);
        
        // Execute SQL statements
        $statements = explode(';', $sql);
        foreach ($statements as $statement) {
            $statement = trim($statement);
            if (!empty($statement)) {
                $pdo->exec($statement);
            }
        }
        
        return ['success' => true];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

function createAdminUser($adminData) {
    try {
        $config = json_decode(file_get_contents('temp_config.json'), true);
        $pdo = new PDO(
            "mysql:host={$config['host']};dbname={$config['database']};charset=utf8mb4",
            $config['username'],
            $config['password'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        
        // Hash password
        $hashedPassword = password_hash($adminData['password'], PASSWORD_DEFAULT);
        
        // Insert or update admin user
        $stmt = $pdo->prepare("
            INSERT INTO admin_users (username, password) VALUES (?, ?)
            ON DUPLICATE KEY UPDATE password = VALUES(password)
        ");
        $stmt->execute([$adminData['username'], $hashedPassword]);
        
        return ['success' => true];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

function finalizeInstallation() {
    try {
        // Create config directory if it doesn't exist
        if (!is_dir('config')) {
            mkdir('config', 0755, true);
        }
        
        // Move temp config to final location
        $config = json_decode(file_get_contents('temp_config.json'), true);
        
        // Create database config file
        $configContent = "<?php
// Database configuration - Generated by installer
define('DB_HOST', '{$config['host']}');
define('DB_USERNAME', '{$config['username']}');
define('DB_PASSWORD', '{$config['password']}');
define('DB_NAME', '{$config['database']}');

// Create connection
function getDBConnection() {
    try {
        \$pdo = new PDO(
            \"mysql:host=\" . DB_HOST . \";dbname=\" . DB_NAME . \";charset=utf8mb4\",
            DB_USERNAME,
            DB_PASSWORD,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return \$pdo;
    } catch (PDOException \$e) {
        die(\"Connection failed: \" . \$e->getMessage());
    }
}

// Test connection
function testConnection() {
    try {
        \$pdo = getDBConnection();
        return true;
    } catch (Exception \$e) {
        return false;
    }
}

// Session management
session_start();

// Check if user is logged in
function isLoggedIn() {
    return isset(\$_SESSION['admin_logged_in']) && \$_SESSION['admin_logged_in'] === true;
}

// Login function
function login(\$username, \$password) {
    \$pdo = getDBConnection();
    \$stmt = \$pdo->prepare(\"SELECT * FROM admin_users WHERE username = ?\");
    \$stmt->execute([\$username]);
    \$user = \$stmt->fetch();
    
    if (\$user && password_verify(\$password, \$user['password'])) {
        \$_SESSION['admin_logged_in'] = true;
        \$_SESSION['admin_id'] = \$user['id'];
        \$_SESSION['admin_username'] = \$user['username'];
        return true;
    }
    return false;
}

// Logout function
function logout() {
    session_destroy();
    return true;
}

// JSON response helper
function jsonResponse(\$data, \$status = 200) {
    http_response_code(\$status);
    header('Content-Type: application/json');
    echo json_encode(\$data);
    exit;
}
?>";
        
        file_put_contents('config/database.php', $configContent);
        
        // Create installation lock file
        file_put_contents('config/install.lock', date('Y-m-d H:i:s'));
        
        // Clean up temp files
        if (file_exists('temp_config.json')) {
            unlink('temp_config.json');
        }
        
        return ['success' => true];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio Website - Installation</title>
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
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .install-container {
            background: white;
            border-radius: 20px;
            padding: 3rem;
            width: 90%;
            max-width: 600px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        
        .install-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .install-header h1 {
            color: #333;
            margin-bottom: 0.5rem;
        }
        
        .install-header p {
            color: #666;
        }
        
        .step-indicator {
            display: flex;
            justify-content: center;
            margin-bottom: 2rem;
        }
        
        .step {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #eee;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 0.5rem;
            color: #999;
            font-weight: bold;
        }
        
        .step.active {
            background: #667eea;
            color: white;
        }
        
        .step.completed {
            background: #4CAF50;
            color: white;
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
        
        .form-group input {
            width: 100%;
            padding: 0.8rem;
            border: 2px solid #eee;
            border-radius: 8px;
            font-size: 1rem;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .btn {
            background: #667eea;
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
        }
        
        .btn:hover {
            background: #5a67d8;
            transform: translateY(-2px);
        }
        
        .btn-secondary {
            background: #6c757d;
        }
        
        .btn-secondary:hover {
            background: #5a6268;
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
        
        .requirements-list {
            list-style: none;
            margin: 1rem 0;
        }
        
        .requirements-list li {
            padding: 0.5rem 0;
            display: flex;
            align-items: center;
        }
        
        .requirements-list .icon {
            margin-right: 0.5rem;
            width: 20px;
            text-align: center;
        }
        
        .icon-check {
            color: #28a745;
        }
        
        .icon-times {
            color: #dc3545;
        }
        
        .text-center {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="install-container">
        <div class="install-header">
            <h1>Portfolio Website</h1>
            <p>Installation Wizard</p>
        </div>
        
        <div class="step-indicator">
            <div class="step <?= $step >= 1 ? ($step > 1 ? 'completed' : 'active') : '' ?>">1</div>
            <div class="step <?= $step >= 2 ? ($step > 2 ? 'completed' : 'active') : '' ?>">2</div>
            <div class="step <?= $step >= 3 ? ($step > 3 ? 'completed' : 'active') : '' ?>">3</div>
            <div class="step <?= $step >= 4 ? ($step > 4 ? 'completed' : 'active') : '' ?>">4</div>
            <div class="step <?= $step >= 5 ? 'active' : '' ?>">5</div>
        </div>
        
        <?php if ($error): ?>
            <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>
        
        <?php if ($success): ?>
            <div class="alert alert-success"><?= htmlspecialchars($success) ?></div>
        <?php endif; ?>
        
        <?php if ($step == '1'): ?>
            <h2>Step 1: Check Requirements</h2>
            <p>Checking if your server meets the requirements...</p>
            
            <ul class="requirements-list">
                <?php foreach ($requirements as $req => $status): ?>
                    <li>
                        <span class="icon <?= $status ? 'icon-check' : 'icon-times' ?>">
                            <?= $status ? '✓' : '✗' ?>
                        </span>
                        <?= $req ?>
                    </li>
                <?php endforeach; ?>
            </ul>
            
            <?php if (array_reduce($requirements, function($carry, $item) { return $carry && $item; }, true)): ?>
                <div class="text-center">
                    <a href="?step=2" class="btn">Next: Database Configuration</a>
                </div>
            <?php else: ?>
                <div class="alert alert-error">
                    Please fix the requirements above before proceeding.
                </div>
            <?php endif; ?>
            
        <?php elseif ($step == '2'): ?>
            <h2>Step 2: Database Configuration</h2>
            <p>Please provide your database connection details:</p>
            
            <form method="POST">
                <div class="form-group">
                    <label>Database Host</label>
                    <input type="text" name="db_host" value="localhost" required>
                </div>
                
                <div class="form-group">
                    <label>Database Username</label>
                    <input type="text" name="db_username" value="root" required>
                </div>
                
                <div class="form-group">
                    <label>Database Password</label>
                    <input type="password" name="db_password">
                </div>
                
                <div class="form-group">
                    <label>Database Name</label>
                    <input type="text" name="db_name" value="portfolio_website" required>
                </div>
                
                <div class="text-center">
                    <button type="submit" class="btn">Test Connection</button>
                    <?php if ($success): ?>
                        <a href="?step=3" class="btn">Next: Setup Database</a>
                    <?php endif; ?>
                </div>
            </form>
            
        <?php elseif ($step == '3'): ?>
            <h2>Step 3: Setup Database</h2>
            <p>Setting up database tables and initial data...</p>
            
            <?php if ($success): ?>
                <div class="text-center">
                    <a href="?step=4" class="btn">Next: Create Admin User</a>
                </div>
            <?php else: ?>
                <div class="text-center">
                    <a href="?step=3" class="btn">Try Again</a>
                </div>
            <?php endif; ?>
            
        <?php elseif ($step == '4'): ?>
            <h2>Step 4: Create Admin User</h2>
            <p>Create your admin account:</p>
            
            <form method="POST">
                <div class="form-group">
                    <label>Admin Username</label>
                    <input type="text" name="admin_username" value="admin" required>
                </div>
                
                <div class="form-group">
                    <label>Admin Password</label>
                    <input type="password" name="admin_password" required>
                </div>
                
                <div class="text-center">
                    <button type="submit" class="btn">Create Admin User</button>
                    <?php if ($success): ?>
                        <a href="?step=5" class="btn">Next: Finalize</a>
                    <?php endif; ?>
                </div>
            </form>
            
        <?php elseif ($step == '5'): ?>
            <h2>Step 5: Installation Complete</h2>
            
            <?php if ($success): ?>
                <div class="alert alert-success">
                    <strong>Congratulations!</strong> Your Portfolio Website has been successfully installed.
                </div>
                
                <div class="text-center">
                    <a href="index.html" class="btn">Go to Website</a>
                    <a href="install.php?cleanup=1" class="btn btn-secondary">Remove Installer</a>
                </div>
            <?php else: ?>
                <div class="text-center">
                    <a href="?step=5" class="btn">Try Again</a>
                </div>
            <?php endif; ?>
            
        <?php endif; ?>
    </div>
</body>
</html>

<?php
// Cleanup installer if requested
if (isset($_GET['cleanup'])) {
    if (file_exists('config/install.lock')) {
        unlink(__FILE__);
        exit;
    }
}
?>