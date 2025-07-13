<?php

require_once __DIR__ . '/../models/User.php';

class AuthController {
    public function login() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $userModel = new User();
            $user = $userModel->findByUsername($_POST['username']);

            if ($user && password_verify($_POST['password'], $user['password'])) {
                session_start();
                $_SESSION['user_id'] = $user['id'];
                header('Location: /dashboard');
            } else {
                // Handle login failure
                header('Location: /login?error=1');
            }
        } else {
            require_once __DIR__ . '/../views/auth/login.php';
        }
    }

    public function register() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $userModel = new User();
            // NOTE: In a real application, you would perform validation here
            $userModel->create($_POST['username'], $_POST['password'], $_POST['email'], $_POST['role_id']);
            header('Location: /login');
        } else {
            require_once __DIR__ . '/../views/auth/register.php';
        }
    }

    public function logout() {
        session_start();
        session_destroy();
        header('Location: /login');
    }
}
