/**
 * StockService - Handles "3 Stocks" logic and localization
 */
const StockService = {
  /**
   * Get stock info for a product at a specific site
   */
  getStock: function(sku, siteId) {
    let stock = DatabaseService.findOne('Stocks', { SKU: sku, site_id: siteId });
    if (!stock) {
      // Default empty stock
      stock = {
        SKU: sku,
        site_id: siteId,
        allee: '-',
        colonne: '-',
        etagere: '-',
        physical_stock: 0,
        reserved_stock: 0,
        available_stock: 0
      };
    }
    return stock;
  },

  /**
   * Record a stock movement
   */
  recordMovement: function(movement) {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const { SKU, site_id, variation, type, user_id, reference } = movement;

      let stock = this.getStock(SKU, site_id);
      const newPhysical = Number(stock.physical_stock) + Number(variation);

      if (newPhysical < 0 && type !== 'INVENTAIRE') {
        throw new Error('Stock physique insuffisant pour ce mouvement');
      }

      const newAvailable = newPhysical - Number(stock.reserved_stock);

      const updateData = {
        physical_stock: newPhysical,
        available_stock: newAvailable
      };

      // Update or Insert Stock
      const existing = DatabaseService.findOne('Stocks', { SKU: SKU, site_id: site_id });
      if (existing) {
        DatabaseService.update('Stocks', { SKU: SKU, site_id: site_id }, updateData);
      } else {
        DatabaseService.insert('Stocks', Object.assign(stock, updateData));
      }

      // Add to Journal (Immutable)
      const journalEntry = {
        timestamp: new Date(),
        user_id: user_id,
        type: type,
        SKU: SKU,
        site_id: site_id,
        variation: variation,
        balance_after: newPhysical,
        reference: reference || ""
      };
      DatabaseService.insert('Journal', journalEntry);

      // Check for low stock alerts
      this._checkAlerts(SKU, newAvailable);

      return newPhysical;
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Reserve stock (when added to cart)
   */
  reserveStock: function(sku, siteId, quantity) {
    const stock = this.getStock(sku, siteId);
    const newReserved = Number(stock.reserved_stock) + Number(quantity);
    const newAvailable = Number(stock.physical_stock) - newReserved;

    DatabaseService.update('Stocks', { SKU: sku, site_id: siteId }, {
      reserved_stock: newReserved,
      available_stock: newAvailable
    });
  },

  /**
   * Release reserved stock (payment or cancellation)
   */
  releaseStock: function(sku, siteId, quantity) {
    const stock = this.getStock(sku, siteId);
    const newReserved = Math.max(0, Number(stock.reserved_stock) - Number(quantity));
    const newAvailable = Number(stock.physical_stock) - newReserved;

    DatabaseService.update('Stocks', { SKU: sku, site_id: siteId }, {
      reserved_stock: newReserved,
      available_stock: newAvailable
    });
  },

  updateLocalization: function(sku, siteId, localization) {
    DatabaseService.update('Stocks', { SKU: sku, site_id: siteId }, localization);
  },

  _checkAlerts: function(sku, available) {
    const product = ProductService.getBySku(sku);
    if (!product) return;

    const min = Number(product.stock_min);
    if (available <= min) {
      NotificationService.create({
        type: available === 0 ? 'out_of_stock' : 'low_stock',
        message: `Alerte Stock pour ${product.designation} (${sku}): ${available} disponible(s). Seuil min: ${min}.`
      });
    }
  }
};
