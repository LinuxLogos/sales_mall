<?php

require_once __DIR__ . '/../../config/database.php';

class CustomerDiscount {
    private $db;

    public function __construct() {
        $this->db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function getByCustomerId($customer_id) {
        $stmt = $this->db->prepare("SELECT * FROM customer_discounts WHERE customer_id = :customer_id");
        $stmt->execute(['customer_id' => $customer_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($customer_id, $discount_percentage) {
        $stmt = $this->db->prepare("INSERT INTO customer_discounts (customer_id, discount_percentage) VALUES (:customer_id, :discount_percentage)");
        return $stmt->execute([
            'customer_id' => $customer_id,
            'discount_percentage' => $discount_percentage
        ]);
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM customer_discounts WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
