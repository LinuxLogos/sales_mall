/**
 * AccountingService - Handles advanced statistics and scoring
 */
const AccountingService = {
  /**
   * Calculate KPIs for a period
   */
  getDashboardKPIs: function(startDate, endDate) {
    const sales = DatabaseService.findAll('Sales', {}); // Ideally filtered by date

    let totalCA = 0;
    let totalMargin = 0;
    let totalTVA = 0;

    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      if (saleDate >= startDate && saleDate <= endDate) {
        totalCA += Number(sale.total_ht);
        totalTVA += Number(sale.total_tva);

        // Margin calculation requires fetching items or storing margin on sale
        // For simplicity, we assume margin logic here or pre-calculated
      }
    });

    return {
      ca: totalCA,
      tva: totalTVA,
      marge: totalMargin
    };
  },

  /**
   * Calculate "Score d'Attractivité" for products
   * Score = (Marge * 0.5) + (Rotation * 0.3) + (Conversion * 0.2)
   */
  getProductPerformance: function() {
    const catalogue = ProductService.getAll();
    const performance = catalogue.map(p => {
      const margin = (p.sale_price - p.purchase_price);
      const rotation = this._getRotationRate(p.SKU);
      const conversion = this._getConversionRate(p.SKU);

      const score = (margin * 0.5) + (rotation * 0.3) + (conversion * 0.2);

      return {
        SKU: p.SKU,
        designation: p.designation,
        score: score,
        category: p.category,
        segment: MarketingService.getSegment(score)
      };
    });

    return performance.sort((a, b) => b.score - a.score);
  },

  _getRotationRate: function(sku) {
    // Rotation = Total Quantité Vendue / Stock Physique Actuel
    const salesItems = DatabaseService.findAll('SaleItems', { SKU: sku });
    const totalSold = salesItems.reduce((sum, it) => sum + Number(it.quantity), 0);

    const stock = DatabaseService.findOne('Stocks', { SKU: sku, site_id: 'SITE1' }); // Default site for global calc
    const currentStock = stock ? Number(stock.physical_stock) : 1;

    return totalSold / (currentStock || 1);
  },

  _getConversionRate: function(sku) {
    // Conversion = Nombre de tickets contenant l'article / Nombre total de tickets
    const allSales = DatabaseService.findAll('Sales', {});
    if (allSales.length === 0) return 0;

    const itemSales = DatabaseService.findAll('SaleItems', { SKU: sku });
    const uniqueTickets = [...new Set(itemSales.map(it => it.ticket_id))];

    return (uniqueTickets.length / allSales.length) * 100;
  }
};
