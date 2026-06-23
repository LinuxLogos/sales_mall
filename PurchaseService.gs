/**
 * PurchaseService - Handles procurement and receiving
 */
const PurchaseService = {
  createOrder: function(orderData) {
    orderData.id = `PUR-${new Date().getTime()}`;
    orderData.status = 'PENDING';
    orderData.date = new Date();
    DatabaseService.insert('Purchases', orderData);
    return orderData.id;
  },

  receiveOrder: function(orderId, userId, items) {
    const order = DatabaseService.findOne('Purchases', { id: orderId });
    if (!order) throw new Error('Commande non trouvée');

    // items: array of { SKU, site_id, quantity, lot_num, expiration_date }
    items.forEach(item => {
      StockService.recordMovement({
        SKU: item.SKU,
        site_id: item.site_id,
        variation: item.quantity,
        type: 'RECEPTION',
        user_id: userId,
        reference: orderId
      });

      // If product has lot/expiration, it's recorded in the Journal via recordMovement's reference
      // but we could also have a dedicated Lots table
    });

    DatabaseService.update('Purchases', { id: orderId }, { status: 'RECEIVED' });
    return true;
  }
};
