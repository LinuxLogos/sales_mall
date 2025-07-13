<?php

require_once __DIR__ . '/../models/Customer.php';
require_once __DIR__ . '/../models/CustomerDiscount.php';

class CustomerController {
    public function index() {
        $customerModel = new Customer();
        $customers = $customerModel->getAll();
        require_once __DIR__ . '/../views/customers/index.php';
    }

    public function edit($id) {
        $customerModel = new Customer();
        $customerDiscountModel = new CustomerDiscount();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $customerModel->update($id, $_POST['name'], $_POST['email'], $_POST['phone'], $_POST['address'], $_POST['loyalty_points']);
            header('Location: /customers');
        } else {
            $customer = $customerModel->findById($id);
            $discounts = $customerDiscountModel->getByCustomerId($id);
            require_once __DIR__ . '/../views/customers/edit.php';
        }
    }

    public function create_discount($customer_id) {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $customerDiscountModel = new CustomerDiscount();
            $customerDiscountModel->create($customer_id, $_POST['discount_percentage']);
            header('Location: /customers/edit/' . $customer_id);
        }
    }

    public function delete_discount($id, $customer_id) {
        $customerDiscountModel = new CustomerDiscount();
        $customerDiscountModel->delete($id);
        header('Location: /customers/edit/' . $customer_id);
    }
}
