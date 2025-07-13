<?php

require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../models/Unit.php';
require_once __DIR__ . '/../models/Variant.php';

class ProductController {
    public function index() {
        $productModel = new Product();
        $products = $productModel->getAll();
        require_once __DIR__ . '/../views/products/index.php';
    }

    public function create() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $productModel = new Product();
            $productModel->create($_POST['name'], $_POST['description'], $_POST['purchase_price'], $_POST['sale_price'], $_POST['stock_threshold'], $_POST['category_id'], $_POST['unit_id']);
            header('Location: /products');
        } else {
            $categoryModel = new Category();
            $categories = $categoryModel->getAll();
            $unitModel = new Unit();
            $units = $unitModel->getAll();
            $variantModel = new Variant();
            $variants = $variantModel->getAll();
            require_once __DIR__ . '/../views/products/create.php';
        }
    }

    public function edit($id) {
        $productModel = new Product();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $productModel->update($id, $_POST['name'], $_POST['description'], $_POST['purchase_price'], $_POST['sale_price'], $_POST['stock_threshold'], $_POST['category_id'], $_POST['unit_id']);
            header('Location: /products');
        } else {
            $product = $productModel->findById($id);
            $categoryModel = new Category();
            $categories = $categoryModel->getAll();
            $unitModel = new Unit();
            $units = $unitModel->getAll();
            $variantModel = new Variant();
            $variants = $variantModel->getAll();
            require_once __DIR__ . '/../views/products/edit.php';
        }
    }

    public function delete($id) {
        $productModel = new Product();
        $productModel->delete($id);
        header('Location: /products');
    }
}
