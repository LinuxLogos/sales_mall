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
    case '/stores':
        $storeController = new StoreController();
        $storeController->index();
        break;
    case '/stores/create':
        $storeController = new StoreController();
        $storeController->create();
        break;
    case (preg_match('/\/stores\/edit\/(\d+)/', $request_uri, $matches) ? true : false):
        $storeController = new StoreController();
        $storeController->edit($matches[1]);
        break;
    case (preg_match('/\/stores\/delete\/(\d+)/', $request_uri, $matches) ? true : false):
        $storeController = new StoreController();
        $storeController->delete($matches[1]);
        break;
}
