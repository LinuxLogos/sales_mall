<?php

require_once __DIR__ . '/../../config/database.php';

class Notification {
    private $db;

    public function __construct() {
        $this->db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function getAllUnread() {
        $stmt = $this->db->query("SELECT * FROM notifications WHERE is_read = 0 ORDER BY created_at DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($type, $message) {
        $stmt = $this->db->prepare("INSERT INTO notifications (type, message) VALUES (:type, :message)");
        return $stmt->execute([
            'type' => $type,
            'message' => $message
        ]);
    }

    public function markAsRead($id) {
        $stmt = $this->db->prepare("UPDATE notifications SET is_read = 1 WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
