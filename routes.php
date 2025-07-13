<?php

require_once __DIR__ . '/controllers/AuthController.php';

$request_uri = explode('?', $_SERVER['REQUEST_URI'], 2)[0];

switch ($request_uri) {
    case '/login':
        $authController = new AuthController();
        $authController->login();
        break;
    case '/register':
        $authController = new AuthController();
        $authController->register();
        break;
    case '/logout':
        $authController = new AuthController();
        $authController->logout();
        break;
    case '/dashboard':
        // Protected route - check for session
        session_start();
        if (isset($_SESSION['user_id'])) {
            // For now, just a placeholder
            echo "Welcome to the dashboard!";
        } else {
            header('Location: /login');
        }
        break;
    default:
        // Redirect to login
        header('Location: /login');
        break;
    case '/stores':
        $storeController = new StoreController();
        $storeController->index();
        break;
    case '/stores/create':
        $storeController = new StoreController();
        $storeController->create();
        break;
    case (preg_match('/\/stores\/edit\/(\d+)/', $request_uri, $matches) ? true : false):
        $storeController = new StoreController();
        $storeController->edit($matches[1]);
        break;
    case (preg_match('/\/stores\/delete\/(\d+)/', $request_uri, $matches) ? true : false):
        $storeController = new StoreController();
        $storeController->delete($matches[1]);
        break;
    case '/products':
        $productController = new ProductController();
        $productController->index();
        break;
    case '/products/create':
        $productController = new ProductController();
        $productController->create();
        break;
    case (preg_match('/\/products\/edit\/(\d+)/', $request_uri, $matches) ? true : false):
        $productController = new ProductController();
        $productController->edit($matches[1]);
        break;
    case (preg_match('/\/products\/delete\/(\d+)/', $request_uri, $matches) ? true : false):
        $productController = new ProductController();
        $productController->delete($matches[1]);
        break;
    case '/pos':
        $posController = new PosController();
        $posController->index();
        break;
    case '/pos/invoice':
        $posController = new PosController();
        $posController->create_invoice();
        break;
    case (preg_match('/\/pos\/receipt\/(\d+)/', $request_uri, $matches) ? true : false):
        $posController = new PosController();
        $posController->receipt($matches[1]);
        break;
    case '/accounting':
        $accountingController = new AccountingController();
        $accountingController->index();
        break;
    case '/accounting/expenses/create':
        $accountingController = new AccountingController();
        $accountingController->create_expense();
        break;
    case '/accounting/taxes':
        $accountingController = new AccountingController();
        $accountingController->taxes();
        break;
    case '/accounting/taxes/create':
        $accountingController = new AccountingController();
        $accountingController->create_tax();
        break;
    case '/accounting/fiscal-report':
        $accountingController = new AccountingController();
        $accountingController->fiscal_report();
        break;
    case '/customers':
        $customerController = new CustomerController();
        $customerController->index();
        break;
    case (preg_match('/\/customers\/edit\/(\d+)/', $request_uri, $matches) ? true : false):
        $customerController = new CustomerController();
        $customerController->edit($matches[1]);
        break;
    case (preg_match('/\/customers\/(\d+)\/discounts\/create/', $request_uri, $matches) ? true : false):
        $customerController = new CustomerController();
        $customerController->create_discount($matches[1]);
        break;
    case (preg_match('/\/customers\/(\d+)\/discounts\/delete\/(\d+)/', $request_uri, $matches) ? true : false):
        $customerController = new CustomerController();
        $customerController->delete_discount($matches[2], $matches[1]);
        break;
}
