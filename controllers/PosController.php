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
            $data = json_decode(file_get_contents('php://input'), true);

            $invoiceModel = new Invoice();
            $invoiceItemModel = new InvoiceItem();
            $customerModel = new Customer();
            $customerDiscountModel = new CustomerDiscount();

            // Create customer if new
            $customer_id = $data['customer_id'];
            if (empty($customer_id)) {
                $customerModel->create($data['customer_name'], $data['customer_email'], $data['customer_phone'], '');
                $customer_id = $customerModel->db->lastInsertId();
            }

            // Calculate total and apply discounts
            $total_amount = 0;
            $products = $data['products'];
            foreach ($products as &$product) {
                $total_amount += $product['price'] * $product['quantity'];
            }

            // Apply customer-specific discounts
            $discounts = $customerDiscountModel->getByCustomerId($customer_id);
            $discount_percentage = 0;
            foreach ($discounts as $discount) {
                $discount_percentage += $discount['discount_percentage'];
            }
            $discount_amount = ($total_amount * $discount_percentage) / 100;
            $total_amount -= $discount_amount;

            // Apply promotion code
            if (!empty($data['promotion_code'])) {
                $promotionModel = new Promotion();
                $promotion = $promotionModel->findByCode($data['promotion_code']);
                if ($promotion) {
                    if ($promotion['type'] == 'percentage') {
                        $total_amount -= ($total_amount * $promotion['value']) / 100;
                    } else {
                        $total_amount -= $promotion['value'];
                    }
                }
            }

            // Apply taxes
            $taxModel = new Tax();
            $default_tax = $taxModel->getDefault();
            $tax_rate = $default_tax ? $default_tax['rate'] : 0;
            $tax_amount = ($total_amount * $tax_rate) / 100;
            $total_amount += $tax_amount;

            // Create invoice
            $invoice_id = $invoiceModel->create($customer_id, $_SESSION['user_id'], $total_amount, $tax_rate, $tax_amount);

            // Create invoice items
            foreach ($products as $product) {
                $invoiceItemModel->create($invoice_id, $product['id'], $product['quantity'], $product['price']);
            }

            // Update loyalty points
            $customer = $customerModel->findById($customer_id);
            $new_loyalty_points = $customer['loyalty_points'] + floor($total_amount);
            $customerModel->update($customer_id, $customer['name'], $customer['email'], $customer['phone'], $customer['address'], $new_loyalty_points, $customer['segment']);

            echo json_encode(['invoice_id' => $invoice_id]);
        }
    }

    public function receipt($invoice_id) {
        $invoiceModel = new Invoice();
        $invoice = $invoiceModel->db->query("SELECT i.*, c.name as customer_name, u.username as user_name
                                             FROM invoices i
                                             JOIN customers c ON i.customer_id = c.id
                                             JOIN users u ON i.user_id = u.id
                                             WHERE i.id = $invoice_id")->fetch(PDO::FETCH_ASSOC);
        $invoiceItemModel = new InvoiceItem();
        $items = $invoiceItemModel->db->query("SELECT ii.*, p.name as product_name
                                               FROM invoice_items ii
                                               JOIN products p ON ii.product_id = p.id
                                               WHERE ii.invoice_id = $invoice_id")->fetchAll(PDO::FETCH_ASSOC);
        require_once __DIR__ . '/../views/pos/receipt.php';
    }
}
