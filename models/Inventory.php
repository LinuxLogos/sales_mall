<?php

require_once __DIR__ . '/../config/database.php';

class Inventory {
    private $db;

    public function __construct() {
        $this->db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function getStockByStore($store_id) {
        $stmt = $this->db->prepare("SELECT i.*, p.name as product_name, p.stock_threshold FROM inventory i
                                     JOIN products p ON i.product_id = p.id
                                     WHERE i.store_id = :store_id");
        $stmt->execute(['store_id' => $store_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateStock($product_id, $store_id, $quantity) {
        $stmt = $this->db->prepare("INSERT INTO inventory (product_id, store_id, quantity)
                                     VALUES (:product_id, :store_id, :quantity)
                                     ON DUPLICATE KEY UPDATE quantity = quantity + :quantity");
        return $stmt->execute([
            'product_id' => $product_id,
            'store_id' => $store_id,
            'quantity' => $quantity
        ]);
    }
}
