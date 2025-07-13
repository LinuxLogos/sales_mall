<?php

require_once __DIR__ . '/../config/database.php';

class Invoice {
    private $db;

    public function __construct() {
        $this->db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function create($customer_id, $user_id, $total_amount) {
        $stmt = $this->db->prepare("INSERT INTO invoices (customer_id, user_id, total_amount) VALUES (:customer_id, :user_id, :total_amount)");
        $stmt->execute([
            'customer_id' => $customer_id,
            'user_id' => $user_id,
            'total_amount' => $total_amount
        ]);
        return $this->db->lastInsertId();
    }
}
