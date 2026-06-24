/**
 * Stock & Inventory Services
 */

function getStockOverview(token, filters = {}) {
  Security.verify(token, 'Stock', 'READ');
  const stocks = DB.getRows('Stock');
  const prods = DB.getRows('Products');
  const pMap = prods.reduce((acc, p) => (acc[p.SKU] = p, acc), {});

  return {
    success: true,
    stock: stocks.filter(s => {
      const p = pMap[s.SKU] || {};
      if (filters.sku && !s.SKU.includes(filters.sku)) return false;
      if (filters.siteId && s.Site_ID !== filters.siteId) return false;
      if (filters.category && p.Categorie !== filters.category) return false;
      return true;
    }).map(s => ({
      ...s,
      Designation: pMap[s.SKU]?.Designation || s.SKU,
      StockDisponible: Number(s.StockPhysique) - Number(s.StockReserve),
      Location: `${s.Allée}-${s.Colonne}-${s.Étagère}`
    }))
  };
}

function updateStock(sku, variation, siteId) {
  const sheet = DB.sheet('Stock');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const sIdx = headers.indexOf('SKU');
  const siIdx = headers.indexOf('Site_ID');
  const pIdx = headers.indexOf('StockPhysique');
  const dIdx = headers.indexOf('StockDisponible');

  for (let i = 1; i < data.length; i++) {
    if (data[i][sIdx] === sku && data[i][siIdx] === siteId) {
      const currentPhys = Number(data[i][pIdx]) || 0;
      const currentRes = Number(data[i][headers.indexOf('StockReserve')]) || 0;
      const newPhys = currentPhys + variation;

      sheet.getRange(i + 1, pIdx + 1).setValue(newPhys);
      sheet.getRange(i + 1, dIdx + 1).setValue(newPhys - currentRes);
      return true;
    }
  }
  return false;
}

function createCategory(token, data) {
  Security.verify(token, 'Admin', 'WRITE');
  return { success: DB.insert('Categories', { ID: 'CAT-' + Date.now(), Nom: data.Nom, Description: data.Description, CreatedAt: new Date() }) };
}

function getCategories(token) {
  Security.verify(token, 'Admin', 'READ');
  return DB.getRows('Categories');
}
