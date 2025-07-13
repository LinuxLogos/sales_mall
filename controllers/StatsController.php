<?php

require_once __DIR__ . '/../models/Invoice.php';
require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../models/Inventory.php';

class StatsController {
    public function index() {
        $invoiceModel = new Invoice();
        $productModel = new Product();
        $inventoryModel = new Inventory();

        // Best and worst selling products
        $best_selling = $invoiceModel->db->query("SELECT p.name, SUM(ii.quantity) as total_quantity
                                                    FROM invoice_items ii
                                                    JOIN products p ON ii.product_id = p.id
                                                    GROUP BY p.name
                                                    ORDER BY total_quantity DESC
                                                    LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);

        $worst_selling = $invoiceModel->db->query("SELECT p.name, SUM(ii.quantity) as total_quantity
                                                     FROM invoice_items ii
                                                     JOIN products p ON ii.product_id = p.id
                                                     GROUP BY p.name
                                                     ORDER BY total_quantity ASC
                                                     LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);

        // Sales trends
        $sales_by_month = $invoiceModel->db->query("SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total_amount) as total
                                                      FROM invoices
                                                      GROUP BY month
                                                      ORDER BY month ASC")->fetchAll(PDO::FETCH_ASSOC);

        // Purchase suggestions
        $products = $productModel->getAll();
        $suggestions = [];
        foreach ($products as $product) {
            // This is a very basic suggestion logic. A real app would use more advanced forecasting.
            $sales_last_30_days = $invoiceModel->db->query("SELECT SUM(quantity) FROM invoice_items WHERE product_id = {$product['id']} AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)")->fetchColumn();
            $current_stock = $inventoryModel->db->query("SELECT SUM(quantity) FROM inventory WHERE product_id = {$product['id']}")->fetchColumn() ?: 0;

            if ($current_stock < $sales_last_30_days) {
                $suggestions[] = [
                    'name' => $product['name'],
                    'needed' => $sales_last_30_days - $current_stock
                ];
            }
        }

        require_once __DIR__ . '/../views/stats/index.php';
    }
}
