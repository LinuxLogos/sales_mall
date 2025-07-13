<?php

require_once __DIR__ . '/../config/database.php';

class Product {
    private $db;

    public function __construct() {
        $this->db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function getAll() {
        $stmt = $this->db->query("SELECT p.*, c.name as category_name, u.name as unit_name FROM products p
                                     LEFT JOIN categories c ON p.category_id = c.id
                                     LEFT JOIN units u ON p.unit_id = u.id");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($name, $description, $purchase_price, $sale_price, $stock_threshold, $category_id, $unit_id) {
        $stmt = $this->db->prepare("INSERT INTO products (name, description, purchase_price, sale_price, stock_threshold, category_id, unit_id)
                                     VALUES (:name, :description, :purchase_price, :sale_price, :stock_threshold, :category_id, :unit_id)");
        return $stmt->execute([
            'name' => $name,
            'description' => $description,
            'purchase_price' => $purchase_price,
            'sale_price' => $sale_price,
            'stock_threshold' => $stock_threshold,
            'category_id' => $category_id,
            'unit_id' => $unit_id
        ]);
    }

    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM products WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function update($id, $name, $description, $purchase_price, $sale_price, $stock_threshold, $category_id, $unit_id) {
        $stmt = $this->db->prepare("UPDATE products SET
                                     name = :name,
                                     description = :description,
                                     purchase_price = :purchase_price,
                                     sale_price = :sale_price,
                                     stock_threshold = :stock_threshold,
                                     category_id = :category_id,
                                     unit_id = :unit_id
                                     WHERE id = :id");
        return $stmt->execute([
            'id' => $id,
            'name' => $name,
            'description' => $description,
            'purchase_price' => $purchase_price,
            'sale_price' => $sale_price,
            'stock_threshold' => $stock_threshold,
            'category_id' => $category_id,
            'unit_id' => $unit_id
        ]);
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM products WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
