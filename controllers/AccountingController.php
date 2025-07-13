<?php

require_once __DIR__ . '/../models/Invoice.php';
require_once __DIR__ . '/../models/Expense.php';
require_once __DIR__ . '/../models/Store.php';

class AccountingController {
    public function index() {
        $period = $_GET['period'] ?? 'daily'; // daily, weekly, monthly
        $sales = $this->getSalesByPeriod($period);
        $expenses = $this->getExpensesByPeriod($period);
        $total_sales = array_sum(array_column($sales, 'total_sales'));
        $total_expenses = array_sum(array_column($expenses, 'total_expenses'));
        $total_taxes = array_sum(array_column($sales, 'total_taxes'));
        $balance = $total_sales - $total_expenses;

        require_once __DIR__ . '/../views/accounting/index.php';
    }

    private function getSalesByPeriod($period) {
        $invoiceModel = new Invoice();
        $group_by = match ($period) {
            'weekly' => "YEAR(created_at), WEEK(created_at)",
            'monthly' => "YEAR(created_at), MONTH(created_at)",
            default => "DATE(created_at)",
        };
        $stmt = $invoiceModel->db->query("SELECT DATE(created_at) as date, SUM(total_amount) as total_sales, SUM(tax_amount) as total_taxes FROM invoices GROUP BY $group_by");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getExpensesByPeriod($period) {
        $expenseModel = new Expense();
        $group_by = match ($period) {
            'weekly' => "YEAR(created_at), WEEK(created_at)",
            'monthly' => "YEAR(created_at), MONTH(created_at)",
            default => "DATE(created_at)",
        };
        $stmt = $expenseModel->db->query("SELECT DATE(created_at) as date, SUM(amount) as total_expenses FROM expenses GROUP BY $group_by");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create_expense() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            session_start();
            $expenseModel = new Expense();
            $expenseModel->create($_POST['description'], $_POST['amount'], $_POST['store_id'], $_SESSION['user_id']);
            header('Location: /accounting');
        } else {
            $storeModel = new Store();
            $stores = $storeModel->getAll();
            require_once __DIR__ . '/../views/accounting/create_expense.php';
        }
    }
}
