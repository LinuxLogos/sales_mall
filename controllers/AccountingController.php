<?php

require_once __DIR__ . '/../models/Invoice.php';
require_once __DIR__ . '/../models/Expense.php';
require_once __DIR__ . '/../models/Store.php';

class AccountingController {
    public function index() {
        $invoiceModel = new Invoice();
        // This is a simplified version. A real implementation would filter by date and store.
        $sales = $invoiceModel->db->query("SELECT SUM(total_amount) as total_sales FROM invoices")->fetch(PDO::FETCH_ASSOC)['total_sales'];

        $expenseModel = new Expense();
        $expenses = $expenseModel->getAll();
        $total_expenses = $expenseModel->db->query("SELECT SUM(amount) as total_expenses FROM expenses")->fetch(PDO::FETCH_ASSOC)['total_expenses'];

        $balance = $sales - $total_expenses;

        require_once __DIR__ . '/../views/accounting/index.php';
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
