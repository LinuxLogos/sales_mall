<?php

require_once __DIR__ . '/../models/Inventory.php';
require_once __DIR__ . '/../models/Store.php';
require_once __DIR__ . '/../models/Product.php';

class StockController {
    public function index() {
        $storeModel = new Store();
        $stores = $storeModel->getAll();
        $selected_store = $_GET['store_id'] ?? ($stores[0]['id'] ?? null);

        $inventoryModel = new Inventory();
        $inventory = $selected_store ? $inventoryModel->getStockByStore($selected_store) : [];

        require_once __DIR__ . '/../views/stock/index.php';
    }

    public function manage() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $inventoryModel = new Inventory();
            $quantity = $_POST['type'] == 'in' ? $_POST['quantity'] : -$_POST['quantity'];
            $inventoryModel->updateStock($_POST['product_id'], $_POST['store_id'], $quantity);
            header('Location: /stock?store_id=' . $_POST['store_id']);
        } else {
            $productModel = new Product();
            $products = $productModel->getAll();
            $storeModel = new Store();
            $stores = $storeModel->getAll();
            require_once __DIR__ . '/../views/stock/manage.php';
        }
    }

    public function transfer() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $inventoryModel = new Inventory();
            // Remove from source store
            $inventoryModel->updateStock($_POST['product_id'], $_POST['from_store_id'], -$_POST['quantity']);
            // Add to destination store
            $inventoryModel->updateStock($_POST['product_id'], $_POST['to_store_id'], $_POST['quantity']);
            header('Location: /stock?store_id=' . $_POST['from_store_id']);
        } else {
            $productModel = new Product();
            $products = $productModel->getAll();
            $storeModel = new Store();
            $stores = $storeModel->getAll();
            require_once __DIR__ . '/../views/stock/transfer.php';
        }
    }
}
