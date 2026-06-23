/**
 * SalesService - Handles POS logic and transactions
 */
const SalesService = {
  /**
   * Generate next ticket ID: SITE-CAISSE-AAMMJJ-SEQUENCE
   */
  generateTicketId: function(site, caisse) {
    const now = new Date();
    const dateStr = Utilities.formatDate(now, "GMT", "yyMMdd");
    const prefix = `${site}-${caisse}-${dateStr}`;

    // Find last sequence for this prefix
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const lastSequence = Number(CONFIG.get(`SEQ_${prefix}`) || 0);
      const nextSequence = lastSequence + 1;
      CONFIG.set(`SEQ_${prefix}`, nextSequence);

      return `${prefix}-${nextSequence.toString().padStart(4, '0')}`;
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Process a sale
   */
  processSale: function(saleData) {
    const { site, caisse, userId, customerId, items, paymentMethod } = saleData;

    const ticketId = this.generateTicketId(site, caisse);

    let totalHT = 0;
    let totalTVA = 0;

    // 1. Process items
    items.forEach(item => {
      const product = ProductService.getBySku(item.SKU);
      const subtotalHT = item.quantity * item.unit_price;
      const tvaAmount = subtotalHT * (item.tva_rate / 100);

      totalHT += subtotalHT;
      totalTVA += tvaAmount;

      // Update Stock
      StockService.recordMovement({
        SKU: item.SKU,
        site_id: site,
        variation: -item.quantity,
        type: 'VENTE',
        user_id: userId,
        reference: ticketId
      });

      // Save item
      DatabaseService.insert('SaleItems', {
        ticket_id: ticketId,
        SKU: item.SKU,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tva_rate: item.tva_rate,
        discount_amount: item.discount_amount || 0
      });
    });

    // 2. Save Sale
    const saleRecord = {
      ticket_id: ticketId,
      site: site,
      caisse: caisse,
      date: new Date(),
      customer_id: customerId,
      user_id: userId,
      total_ht: totalHT,
      total_tva: totalTVA,
      total_ttc: totalHT + totalTVA,
      payment_method: paymentMethod
    };
    DatabaseService.insert('Sales', saleRecord);

    return ticketId;
  },

  /**
   * Get special customer info
   */
  getSpecialCustomer: function(customerId) {
    return DatabaseService.findOne('Customers', { id: customerId, is_special: true });
  }
};
