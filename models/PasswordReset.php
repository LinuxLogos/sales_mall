<?php

require_once __DIR__ . '/../config/database.php';

class PasswordReset {
    private $db;

    public function __construct() {
        $this->db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function create($email, $token) {
        $stmt = $this->db->prepare("INSERT INTO password_resets (email, token) VALUES (:email, :token)");
        return $stmt->execute([
            'email' => $email,
            'token' => $token
        ]);
    }

    public function findByToken($token) {
        $stmt = $this->db->prepare("SELECT * FROM password_resets WHERE token = :token AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)");
        $stmt->execute(['token' => $token]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function delete($token) {
        $stmt = $this->db->prepare("DELETE FROM password_resets WHERE token = :token");
        return $stmt->execute(['token' => $token]);
    }
}
