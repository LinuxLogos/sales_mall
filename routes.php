<?php

require_once __DIR__ . '/controllers/AuthController.php';

$request_uri = explode('?', $_SERVER['REQUEST_URI'], 2)[0];

switch ($request_uri) {
    case '/login':
        $authController = new AuthController();
        $authController->login();
        break;
    case '/register':
        $authController = new AuthController();
        $authController->register();
        break;
    case '/logout':
        $authController = new AuthController();
        $authController->logout();
        break;
    case '/dashboard':
        // Protected route - check for session
        session_start();
        if (isset($_SESSION['user_id'])) {
            // For now, just a placeholder
            echo "Welcome to the dashboard!";
        } else {
            header('Location: /login');
        }
        break;
    default:
        // Redirect to login
        header('Location: /login');
        break;
}
