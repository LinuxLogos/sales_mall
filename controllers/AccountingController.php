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

    public function taxes() {
        $taxModel = new Tax();
        $taxes = $taxModel->getAll();
        require_once __DIR__ . '/../views/accounting/taxes.php';
    }

    public function create_tax() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $taxModel = new Tax();
            $taxModel->create($_POST['name'], $_POST['rate'], $_POST['is_default'] ?? 0);
            header('Location: /accounting/taxes');
        } else {
            require_once __DIR__ . '/../views/accounting/create_tax.php';
        }
    }

    public function fiscal_report() {
        $period = $_GET['period'] ?? 'monthly';
        $sales = $this->getSalesByPeriod($period);
        $total_taxes = array_sum(array_column($sales, 'total_taxes'));
        require_once __DIR__ . '/../views/accounting/fiscal_report.php';
    }

    public function create_revenue() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            session_start();
            $revenueModel = new Revenue();
            $revenueModel->create($_POST['description'], $_POST['amount'], $_POST['store_id'], $_SESSION['user_id']);
            header('Location: /accounting');
        } else {
            $storeModel = new Store();
            $stores = $storeModel->getAll();
            require_once __DIR__ . '/../views/accounting/create_revenue.php';
        }
    }

    public function export($format) {
        $period = $_GET['period'] ?? 'daily';
        $sales = $this->getSalesByPeriod($period);
        $expenses = $this->getExpensesByPeriod($period);

        if ($format == 'csv') {
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="accounting_report.csv"');
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Date', 'Sales', 'Taxes', 'Expenses']);
            // This is a simplified export. A real implementation would merge sales and expenses by date.
            foreach ($sales as $sale) {
                fputcsv($output, [$sale['date'], $sale['total_sales'], $sale['total_taxes'], 0]);
            }
            foreach ($expenses as $expense) {
                fputcsv($output, [$expense['date'], 0, 0, $expense['total_expenses']]);
            }
            fclose($output);
        } else { // pdf via printable html
            require_once __DIR__ . '/../views/accounting/report_printable.php';
        }
    }
}
