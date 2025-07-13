<?php

require_once __DIR__ . '/../models/Store.php';

class StoreController {
    public function index() {
        $storeModel = new Store();
        $stores = $storeModel->getAll();
        require_once __DIR__ . '/../views/stores/index.php';
    }

    public function create() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $storeModel = new Store();
            $storeModel->create($_POST['name'], $_POST['location']);
            header('Location: /stores');
        } else {
            require_once __DIR__ . '/../views/stores/create.php';
        }
    }

    public function edit($id) {
        $storeModel = new Store();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $storeModel->update($id, $_POST['name'], $_POST['location']);
            header('Location: /stores');
        } else {
            $store = $storeModel->findById($id);
            require_once __DIR__ . '/../views/stores/edit.php';
        }
    }

    public function delete($id) {
        $storeModel = new Store();
        $storeModel->delete($id);
        header('Location: /stores');
    }
}
