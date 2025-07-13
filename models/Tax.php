<?php

require_once __DIR__ . '/../config/database.php';

class Tax {
    private $db;

    public function __construct() {
        $this->db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function getAll() {
        $stmt = $this->db->query("SELECT * FROM taxes");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($name, $rate, $is_default) {
        $stmt = $this->db->prepare("INSERT INTO taxes (name, rate, is_default) VALUES (:name, :rate, :is_default)");
        return $stmt->execute([
            'name' => $name,
            'rate' => $rate,
            'is_default' => $is_default
        ]);
    }

    public function getDefault() {
        $stmt = $this->db->query("SELECT * FROM taxes WHERE is_default = 1");
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
