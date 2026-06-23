/**
 * InventoryService - Handles counting and validation workflow
 */
const InventoryService = {
  /**
   * Process a count result
   */
  processCount: function(sku, siteId, countedQuantity, userId, justification) {
    const stock = StockService.getStock(sku, siteId);
    const theoretical = Number(stock.physical_stock);
    const difference = countedQuantity - theoretical;

    if (difference === 0) return true;

    // Logic for hierarchy validation could be added here
    const absoluteDiff = Math.abs(difference);
    if (absoluteDiff > 50) { // Example threshold
       // Flag for high level validation
    }

    // Apply adjustment
    StockService.recordMovement({
      SKU: sku,
      site_id: siteId,
      variation: difference,
      type: 'INVENTAIRE',
      user_id: userId,
      reference: `INV-${new Date().getTime()} | ${justification || 'Ajustement inventaire'}`
    });

    return true;
  },

  /**
   * Global inventory (just a helper to fetch all stocks for a site)
   */
  getSiteStockList: function(siteId) {
    return DatabaseService.findAll('Stocks', { site_id: siteId });
  }
};
