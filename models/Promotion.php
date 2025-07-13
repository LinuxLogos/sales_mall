<?php

require_once __DIR__ . '/../../config/database.php';

class Promotion {
    private $db;

    public function __construct() {
        $this->db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function getAll() {
        $stmt = $this->db->query("SELECT * FROM promotions");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($code, $type, $value, $start_date, $end_date, $applicable_to, $applicable_id) {
        $stmt = $this->db->prepare("INSERT INTO promotions (code, type, value, start_date, end_date, applicable_to, applicable_id)
                                     VALUES (:code, :type, :value, :start_date, :end_date, :applicable_to, :applicable_id)");
        return $stmt->execute([
            'code' => $code,
            'type' => $type,
            'value' => $value,
            'start_date' => $start_date,
            'end_date' => $end_date,
            'applicable_to' => $applicable_to,
            'applicable_id' => $applicable_id
        ]);
    }

    public function findByCode($code) {
        $stmt = $this->db->prepare("SELECT * FROM promotions WHERE code = :code AND status = 'active' AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW())");
        $stmt->execute(['code' => $code]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateStatus($id, $status) {
        $stmt = $this->db->prepare("UPDATE promotions SET status = :status WHERE id = :id");
        return $stmt->execute([
            'id' => $id,
            'status' => $status
        ]);
    }
}
