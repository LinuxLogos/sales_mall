<?php

require_once __DIR__ . '/../models/Notification.php';

class NotificationController {
    public function index() {
        $notificationModel = new Notification();
        $notifications = $notificationModel->getAllUnread();
        require_once __DIR__ . '/../views/notifications/index.php';
    }

    public function mark_as_read($id) {
        $notificationModel = new Notification();
        $notificationModel->markAsRead($id);
        header('Location: /notifications');
    }
}
