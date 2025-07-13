<?php

require_once __DIR__ . '/../../config/database.php';

class Customer {
    private $db;

    public function __construct() {
        $this->db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function getAll() {
        $stmt = $this->db->query("SELECT * FROM customers");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($name, $email, $phone, $address) {
        $stmt = $this->db->prepare("INSERT INTO customers (name, email, phone, address) VALUES (:name, :email, :phone, :address)");
        return $stmt->execute([
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'address' => $address
        ]);
    }

    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM customers WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function update($id, $name, $email, $phone, $address, $loyalty_points, $segment) {
        $stmt = $this->db->prepare("UPDATE customers SET name = :name, email = :email, phone = :phone, address = :address, loyalty_points = :loyalty_points, segment = :segment WHERE id = :id");
        return $stmt->execute([
            'id' => $id,
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'address' => $address,
            'loyalty_points' => $loyalty_points,
            'segment' => $segment
        ]);
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM customers WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
