<?php

require_once __DIR__ . '/../models/Invoice.php';
require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../models/Customer.php';
require_once __DIR__ . '/../models/Notification.php';

class DashboardController {
    public function index() {
        $invoiceModel = new Invoice();
        $productModel = new Product();
        $customerModel = new Customer();
        $notificationModel = new Notification();

        // Placeholder data - in a real app, this would be more dynamic
        $total_sales = $invoiceModel->db->query("SELECT SUM(total_amount) FROM invoices")->fetchColumn();
        $product_count = $productModel->db->query("SELECT COUNT(*) FROM products")->fetchColumn();
        $customer_count = $customerModel->db->query("SELECT COUNT(*) FROM customers")->fetchColumn();
        $unread_notifications = $notificationModel->getAllUnread();

        // Data for charts
        $sales_by_day = $invoiceModel->db->query("SELECT DATE(created_at) as date, SUM(total_amount) as total FROM invoices GROUP BY DATE(created_at) ORDER BY date ASC")->fetchAll(PDO::FETCH_ASSOC);

        require_once __DIR__ . '/../views/dashboard/index.php';
    }
}
