/**
 * NotificationService - Handles real-time and stored alerts
 */
const NotificationService = {
  create: function(notification) {
    notification.id = Utilities.getUuid();
    notification.created_at = new Date();
    notification.is_read = false;
    DatabaseService.insert('Notifications', notification);

    // In a real app, you could also send emails or push notifications
    if (notification.type === 'out_of_stock') {
      this._sendUrgentEmail(notification.message);
    }
  },

  getAll: function() {
    return DatabaseService.findAll('Notifications', {});
  },

  markAsRead: function(id) {
    DatabaseService.update('Notifications', { id: id }, { is_read: true });
  },

  _sendUrgentEmail: function(message) {
    const adminEmail = CONFIG.get('ADMIN_EMAIL');
    if (adminEmail) {
      MailApp.sendEmail(adminEmail, "ALERTE CRITIQUE WMS", message);
    }
  }
};
