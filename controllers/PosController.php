<?php

require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../models/Customer.php';
require_once __DIR__ . '/../models/Invoice.php';
require_once __DIR__ . '/../models/InvoiceItem.php';

class PosController {
    public function index() {
        $productModel = new Product();
        $products = $productModel->getAll();
        $customerModel = new Customer();
        $customers = $customerModel->getAll();
        require_once __DIR__ . '/../views/pos/index.php';
    }

    public function create_invoice() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            session_start();
            $invoiceModel = new Invoice();
            $invoiceItemModel = new InvoiceItem();
            $customerModel = new Customer();

            // Create customer if new
            $customer_id = $_POST['customer_id'];
            if (empty($customer_id)) {
                $customerModel->create($_POST['customer_name'], $_POST['customer_email'], $_POST['customer_phone'], '');
                $customer_id = $customerModel->db->lastInsertId();
            }

            // Create invoice
            $invoice_id = $invoiceModel->create($customer_id, $_SESSION['user_id'], $_POST['total_amount']);

            // Create invoice items
            foreach ($_POST['products'] as $product) {
                $invoiceItemModel->create($invoice_id, $product['id'], $product['quantity'], $product['price']);
            }

            // Redirect to a success page or the invoice details
            header('Location: /invoices/' . $invoice_id);
        }
    }
}
