<?php

require_once __DIR__ . '/../../config/database.php';

class InvoiceItem {
    private $db;

    public function __construct() {
        $this->db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function create($invoice_id, $product_id, $quantity, $unit_price) {
        $stmt = $this->db->prepare("INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price) VALUES (:invoice_id, :product_id, :quantity, :unit_price)");
        return $stmt->execute([
            'invoice_id' => $invoice_id,
            'product_id' => $product_id,
            'quantity' => $quantity,
            'unit_price' => $unit_price
        ]);
    }
}
