/**
 * ProductService - Handles product catalogue
 */
const ProductService = {
  getAll: function() {
    return DatabaseService.findAll('Catalogue', {});
  },

  getBySku: function(sku) {
    return DatabaseService.findOne('Catalogue', { SKU: sku });
  },

  getByBarcode: function(barcode) {
    return DatabaseService.findOne('Catalogue', { barcode: barcode });
  },

  create: function(productData) {
    if (this.getBySku(productData.SKU)) {
      throw new Error('Un produit avec ce SKU existe déjà');
    }
    DatabaseService.insert('Catalogue', productData);

    // Initialize stock for all sites if needed
    // Or just let StockService handle it on first movement
    return productData.SKU;
  },

  update: function(sku, productData) {
    DatabaseService.update('Catalogue', { SKU: sku }, productData);
  },

  delete: function(sku) {
    DatabaseService.delete('Catalogue', { SKU: sku });
    DatabaseService.delete('Stocks', { SKU: sku });
  }
};
