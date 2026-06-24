/**
 * Stock & Categories
 */

function getStockOverview(token, filters = {}) {
  Security.verify(token, 'Stock', 'READ');
  const stocks = DB.getRows('Stock'), prods = DB.getRows('Products'), pMap = prods.reduce((acc, p) => (acc[p.SKU] = p, acc), {});

  return stocks.filter(s => {
    const p = pMap[s.SKU] || {};
    return (!filters.sku || s.SKU.includes(filters.sku)) && (!filters.category || p.Categorie === filters.category);
  }).map(s => ({
    ...s, Designation: pMap[s.SKU]?.Designation || s.SKU, StockDisponible: s.StockPhysique - s.StockReserve
  }));
}

function getCategories(token) {
  Security.verify(token, 'Admin', 'READ');
  return DB.getRows('Categories');
}

function createCategory(token, data) {
  Security.verify(token, 'Admin', 'WRITE');
  return DB.insert('Categories', { ID: 'CAT-' + Date.now(), Nom: data.Nom, Description: data.Description, CreatedAt: new Date() });
}

function addProduct(token, p) {
  Security.verify(token, 'Stock', 'WRITE');
  DB.insert('Products', p);
  DB.insert('Stock', { SKU: p.SKU, Site_ID: p.Site_ID || 'MAIN', Allée: p.Allée, Colonne: p.Colonne, Étagère: p.Étagère, StockPhysique: p.StockInitial || 0, StockReserve: 0 });
  return { success: true };
}
