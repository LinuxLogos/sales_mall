<?php

require_once __DIR__ . '/../../config/database.php';

class Revenue {
    private $db;

    public function __construct() {
        $this->db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function create($description, $amount, $store_id, $user_id) {
        $stmt = $this->db->prepare("INSERT INTO revenues (description, amount, store_id, user_id) VALUES (:description, :amount, :store_id, :user_id)");
        return $stmt->execute([
            'description' => $description,
            'amount' => $amount,
            'store_id' => $store_id,
            'user_id' => $user_id
        ]);
    }
}
