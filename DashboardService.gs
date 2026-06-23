/**
 * DashboardService - Aggregates data for the BI dashboard
 */
const DashboardService = {
  /**
   * Get main dashboard data
   */
  getData: function() {
    const now = new Date();
    const todayStart = new Date(now.setHours(0,0,0,0));
    const todayEnd = new Date(now.setHours(23,59,59,999));

    return {
      kpis: AccountingService.getDashboardKPIs(todayStart, todayEnd),
      lowStock: StockService._getLowStockProducts(), // Need to implement this helper
      recentSales: this._getRecentSales(5),
      topProducts: AccountingService.getProductPerformance().slice(0, 5)
    };
  },

  _getRecentSales: function(limit) {
    const sales = DatabaseService.findAll('Sales', {});
    return sales.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
  }
};

// Add helper to StockService
StockService._getLowStockProducts = function() {
  const stocks = DatabaseService.findAll('Stocks', {});
  return stocks.filter(s => {
    const product = ProductService.getBySku(s.SKU);
    return product && Number(s.available_stock) <= Number(product.stock_min);
  });
};
