/**
 * AnalyticsService - Handles complex data analysis and trends
 */
const AnalyticsService = {
  /**
   * Get sales trends over time
   */
  getSalesTrends: function(period) {
    const sales = DatabaseService.findAll('Sales', {});
    // Group by date and calculate totals
    const trends = {};
    sales.forEach(sale => {
      const date = Utilities.formatDate(new Date(sale.date), "GMT", "yyyy-MM-dd");
      trends[date] = (trends[date] || 0) + Number(sale.total_ttc);
    });
    return trends;
  },

  /**
   * Get product category distribution
   */
  getCategoryDistribution: function() {
    const catalogue = ProductService.getAll();
    const distribution = {};
    catalogue.forEach(p => {
      distribution[p.category] = (distribution[p.category] || 0) + 1;
    });
    return distribution;
  }
};
