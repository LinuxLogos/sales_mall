<?php

require_once __DIR__ . '/../config/database.php';

class Payment {
    private $db;

    public function __construct() {
        $this->db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function create($invoice_id, $method, $amount) {
        $stmt = $this->db->prepare("INSERT INTO payments (invoice_id, method, amount) VALUES (:invoice_id, :method, :amount)");
        return $stmt->execute([
            'invoice_id' => $invoice_id,
            'method' => $method,
            'amount' => $amount
        ]);
    }
}
