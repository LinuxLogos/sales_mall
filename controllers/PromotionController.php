<?php

require_once __DIR__ . '/../models/Promotion.php';
require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../models/Customer.php';

class PromotionController {
    public function index() {
        $promotionModel = new Promotion();
        $promotions = $promotionModel->getAll();
        require_once __DIR__ . '/../views/promotions/index.php';
    }

    public function create() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $promotionModel = new Promotion();
            $promotionModel->create($_POST['code'], $_POST['type'], $_POST['value'], $_POST['start_date'], $_POST['end_date'], $_POST['applicable_to'], $_POST['applicable_id']);
            header('Location: /promotions');
        } else {
            $productModel = new Product();
            $products = $productModel->getAll();
            $categoryModel = new Category();
            $categories = $categoryModel->getAll();
            $customerModel = new Customer();
            $customers = $customerModel->getAll();
            require_once __DIR__ . '/../views/promotions/create.php';
        }
    }
}
