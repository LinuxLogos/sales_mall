<?php

require_once __DIR__ . '/../../config/database.php';

class Store {
    private $db;

    public function __construct() {
        $this->db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function getAll() {
        $stmt = $this->db->query("SELECT * FROM stores");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($name, $location) {
        $stmt = $this->db->prepare("INSERT INTO stores (name, location) VALUES (:name, :location)");
        return $stmt->execute([
            'name' => $name,
            'location' => $location
        ]);
    }

    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM stores WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function update($id, $name, $location) {
        $stmt = $this->db->prepare("UPDATE stores SET name = :name, location = :location WHERE id = :id");
        return $stmt->execute([
            'id' => $id,
            'name' => $name,
            'location' => $location
        ]);
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM stores WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
