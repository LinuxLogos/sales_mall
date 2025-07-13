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

    public function forgot_password() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $userModel = new User();
            $user = $userModel->findByEmail($_POST['email']);
            if ($user) {
                $token = bin2hex(random_bytes(50));
                $passwordResetModel = new PasswordReset();
                $passwordResetModel->create($_POST['email'], $token);
                // In a real application, you would send an email with the reset link.
                // For now, we'll just show a success message with the token.
                echo "Password reset link sent! Token: " . $token;
            } else {
                echo "No user found with that email address.";
            }
        } else {
            require_once __DIR__ . '/../views/auth/forgot_password.php';
        }
    }

    public function reset_password($token) {
        $passwordResetModel = new PasswordReset();
        $reset_request = $passwordResetModel->findByToken($token);
        if ($reset_request) {
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $userModel = new User();
                $userModel->updatePassword($reset_request['email'], $_POST['password']);
                $passwordResetModel->delete($token);
                header('Location: /login');
            } else {
                require_once __DIR__ . '/../views/auth/reset_password.php';
            }
        } else {
            echo "Invalid or expired token.";
        }
    }
}
