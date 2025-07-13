<?php

require_once __DIR__ . '/../../config/database.php';

class PromotionHistory {
    private $db;

    public function __construct() {
        $this->db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function create($promotion_id, $invoice_id) {
        $stmt = $this->db->prepare("INSERT INTO promotion_history (promotion_id, invoice_id) VALUES (:promotion_id, :invoice_id)");
        return $stmt->execute([
            'promotion_id' => $promotion_id,
            'invoice_id' => $invoice_id
        ]);
    }
}
