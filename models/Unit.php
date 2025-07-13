<?php

require_once __DIR__ . '/../../config/database.php';

class Unit {
    private $db;

    public function __construct() {
        $this->db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function getAll() {
        $stmt = $this->db->query("SELECT * FROM units");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
