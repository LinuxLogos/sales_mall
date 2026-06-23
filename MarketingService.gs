/**
 * MarketingService - Handles product segmentation and suggestions
 */
const MarketingService = {
  /**
   * BCG Matrix segmentation based on score
   */
  getSegment: function(score) {
    if (score > 75) return "STARS (Promouvoir)";
    if (score > 50) return "OPTIMISER (Visibilité)";
    if (score > 25) return "SÉCURISER (Volume)";
    return "POIDS MORTS (Déstocker)";
  },

  /**
   * Generate automatic suggestions
   */
  getSuggestions: function() {
    const performance = AccountingService.getProductPerformance();

    return {
      toPromote: performance.filter(p => p.score > 75),
      toLiquidity: performance.filter(p => p.score < 25),
      toOrder: this._getProductsToReorder()
    };
  },

  _getProductsToReorder: function() {
    const catalogue = ProductService.getAll();
    return catalogue.filter(p => {
      // Logic for reorder suggestion: stock < alert threshold
      return false; // Simplified
    });
  }
};
