<?php

require_once __DIR__ . '/../../config/database.php';

class Expense {
    private $db;

    public function __construct() {
        $this->db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function getAll() {
        $stmt = $this->db->query("SELECT e.*, s.name as store_name, u.username as user_name
                                     FROM expenses e
                                     LEFT JOIN stores s ON e.store_id = s.id
                                     LEFT JOIN users u ON e.user_id = u.id");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($description, $amount, $store_id, $user_id) {
        $stmt = $this->db->prepare("INSERT INTO expenses (description, amount, store_id, user_id) VALUES (:description, :amount, :store_id, :user_id)");
        return $stmt->execute([
            'description' => $description,
            'amount' => $amount,
            'store_id' => $store_id,
            'user_id' => $user_id
        ]);
    }
}
