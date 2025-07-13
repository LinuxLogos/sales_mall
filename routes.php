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
    case '/forgot-password':
        $authController = new AuthController();
        $authController->forgot_password();
        break;
    case (preg_match('/\/reset-password\/(\w+)/', $request_uri, $matches) ? true : false):
        $authController = new AuthController();
        $authController->reset_password($matches[1]);
        break;
    case '/dashboard':
        session_start();
        if (isset($_SESSION['user_id'])) {
            $dashboardController = new DashboardController();
            $dashboardController->index();
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
    case '/accounting/revenues/create':
        $accountingController = new AccountingController();
        $accountingController->create_revenue();
        break;
    case (preg_match('/\/accounting\/export\/(csv|pdf)/', $request_uri, $matches) ? true : false):
        $accountingController = new AccountingController();
        $accountingController->export($matches[1]);
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
    case '/promotions':
        $promotionController = new PromotionController();
        $promotionController->index();
        break;
    case '/promotions/create':
        $promotionController = new PromotionController();
        $promotionController->create();
        break;
    case (preg_match('/\/promotions\/update_status\/(\d+)\/(\w+)/', $request_uri, $matches) ? true : false):
        $promotionController = new PromotionController();
        $promotionController->update_status($matches[1], $matches[2]);
        break;
    case '/notifications':
        $notificationController = new NotificationController();
        $notificationController->index();
        break;
    case (preg_match('/\/notifications\/mark_as_read\/(\d+)/', $request_uri, $matches) ? true : false):
        $notificationController = new NotificationController();
        $notificationController->mark_as_read($matches[1]);
        break;
    case '/stock':
        $stockController = new StockController();
        $stockController->index();
        break;
    case '/stock/manage':
        $stockController = new StockController();
        $stockController->manage();
        break;
    case '/stock/transfer':
        $stockController = new StockController();
        $stockController->transfer();
        break;
}
