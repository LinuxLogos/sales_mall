<?php

require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../models/Notification.php';

class AlertManager {
    public function checkStockLevels() {
        $productModel = new Product();
        $products = $productModel->getAll();
        $notificationModel = new Notification();

        foreach ($products as $product) {
            $stock_level = $this->getCurrentStock($product['id']);
            if ($stock_level <= $product['stock_threshold']) {
                $message = "Low stock for product: " . $product['name'] . ". Current stock: " . $stock_level;
                $notificationModel->create('low_stock', $message);
            }
        }
    }

    private function getCurrentStock($product_id) {
        // This is a placeholder. In a real application, you would query the inventory table.
        return 10;
    }
}
