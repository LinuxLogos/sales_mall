/**
 * Stock Management Module
 */

function getStockOverview(token, filters = {}) {
  try {
    if (!checkPermission(token, 'Stock', 'READ')) throw new Error('Accès refusé');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const stockSheet = ss.getSheetByName('Stock');
    const productsSheet = ss.getSheetByName('Products');

    const stockData = stockSheet.getDataRange().getValues();
    const productsData = productsSheet.getDataRange().getValues();

    const productMap = new Map();
    for (let i = 1; i < productsData.length; i++) {
      productMap.set(productsData[i][0], { Designation: productsData[i][2], Categorie: productsData[i][3], StockAlert: productsData[i][7] });
    }

    const stockOverview = [];
    const alerts = [];

    for (let i = 1; i < stockData.length; i++) {
      const sku = stockData[i][0];
      const product = productMap.get(sku) || {};
      const siteId = stockData[i][1];

      if (filters.sku && sku !== filters.sku) continue;
      if (filters.siteId && siteId !== filters.siteId) continue;
      if (filters.category && product.Categorie !== filters.category) continue;

      const physique = stockData[i][5] || 0;
      const reserve = stockData[i][6] || 0;
      const disponible = physique - reserve;
      const alertThreshold = product.StockAlert || 10;

      stockOverview.push({
        SKU: sku,
        Designation: product.Designation || sku,
        Categorie: product.Categorie || '',
        Site_ID: siteId,
        Location: `${stockData[i][2]}-${stockData[i][3]}-${stockData[i][4]}`,
        StockPhysique: physique,
        StockReserve: reserve,
        StockDisponible: disponible,
        DateExpiration: stockData[i][9]
      });

      if (disponible <= 0) {
        alerts.push({ SKU: sku, Designation: product.Designation, Status: 'RUPTURE', Level: 'CRITIQUE' });
      } else if (disponible <= alertThreshold) {
        alerts.push({ SKU: sku, Designation: product.Designation, Status: 'FAIBLE', Level: 'ATTENTION' });
      }
    }

    return { success: true, stock: stockOverview, alerts: alerts };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function addProduct(token, productData) {
  try {
    if (!checkPermission(token, 'Stock', 'WRITE')) throw new Error('Accès refusé');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const productsSheet = ss.getSheetByName('Products');
    const stockSheet = ss.getSheetByName('Stock');
    const journalSheet = ss.getSheetByName('Journal');
    const currentUser = getCurrentUserFromToken(token);

    const productsData = productsSheet.getDataRange().getValues();
    for (let i = 1; i < productsData.length; i++) {
      if (productsData[i][0] === productData.SKU || productsData[i][1] === productData.CodeBarres) {
        return { success: false, error: 'SKU ou Code-barres déjà existant' };
      }
    }

    const now = new Date();
    productsSheet.appendRow([productData.SKU, productData.CodeBarres, productData.Designation, productData.Categorie, productData.PrixAchat, productData.PrixVente, productData.TVA_Rate || 0.18, productData.StockAlert || 10, productData.Unite || 'PCE', productData.Supplier_ID || '', now, now]);

    // Add stock entry
    const stockQty = productData.StockInitial || 0;
    stockSheet.appendRow([productData.SKU, productData.Site_ID || 'MAIN', productData.Allée || 'A', productData.Colonne || '01', productData.Étagère || 'N1', stockQty, 0, stockQty, productData.Lot_ID || '', productData.DateExpiration || '', now]);

    if (stockQty > 0) {
      journalSheet.appendRow([getTimestamp(), currentUser, 'RECEPTION', productData.SKU, stockQty, stockQty, 'INIT', productData.Lot_ID || '', productData.DateExpiration || '', generateHash({ action: 'initial', sku: productData.SKU, qty: stockQty })]);
    }

    invalidateCache('PRODUCT_CATALOG');
    auditLog('PRODUCT_CREATED', 'Stock', 'Product created: ' + productData.SKU, { newData: productData }, token);

    return { success: true, message: 'Produit ajouté' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function updateProduct(token, sku, updates) {
  try {
    if (!checkPermission(token, 'Stock', 'WRITE')) throw new Error('Accès refusé');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const productsSheet = ss.getSheetByName('Products');
    const data = productsSheet.getDataRange().getValues();
    const headers = data[0];

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === sku) {
        if (updates.Designation !== undefined) productsSheet.getRange(i + 1, 3).setValue(updates.Designation);
        if (updates.PrixVente !== undefined) productsSheet.getRange(i + 1, 6).setValue(updates.PrixVente);
        if (updates.PrixAchat !== undefined) productsSheet.getRange(i + 1, 5).setValue(updates.PrixAchat);
        if (updates.StockAlert !== undefined) productsSheet.getRange(i + 1, 8).setValue(updates.StockAlert);
        productsSheet.getRange(i + 1, 12).setValue(new Date());

        invalidateCache('PRODUCT_CATALOG');
        auditLog('PRODUCT_UPDATED', 'Stock', 'Product updated: ' + sku, { newData: updates }, token);
        return { success: true, message: 'Produit mis à jour' };
      }
    }
    return { success: false, error: 'Produit non trouvé' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function stockMovement(token, movementData) {
  try {
    if (!checkPermission(token, 'Stock', 'WRITE')) throw new Error('Accès refusé');

    return executeWithLock('STOCK_LOCK', () => {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const stockSheet = ss.getSheetByName('Stock');
      const journalSheet = ss.getSheetByName('Journal');
      const currentUser = getCurrentUserFromToken(token);

      const data = stockSheet.getDataRange().getValues();
      let stockRow = -1;

      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === movementData.SKU && data[i][1] === movementData.Site_ID) {
          stockRow = i + 1;
          break;
        }
      }

      if (stockRow === -1) return { success: false, error: 'Emplacement stock non trouvé' };

      const currentPhysique = data[stockRow - 1][5] || 0;
      const currentReserve = data[stockRow - 1][6] || 0;
      const variation = movementData.Variation;

      if (movementData.Type === 'VENTE' || movementData.Type === 'CASSE') {
        if (currentPhysique + variation < 0) return { success: false, error: 'Stock insuffisant' };
      }

      const newPhysique = currentPhysique + variation;
      stockSheet.getRange(stockRow, 6).setValue(newPhysique);
      stockSheet.getRange(stockRow, 8).setValue(newPhysique - currentReserve);
      stockSheet.getRange(stockRow, 11).setValue(new Date());

      const newSolde = newPhysique;
      journalSheet.appendRow([getTimestamp(), currentUser, movementData.Type, movementData.SKU, variation, newSolde, movementData.Reference || '', movementData.Lot_ID || '', movementData.DateExpiration || '', generateHash({ type: movementData.Type, sku: movementData.SKU, var: variation })]);

      invalidateCache('PRODUCT_CATALOG');
      auditLog('STOCK_MOVEMENT', 'Stock', `${movementData.Type}: ${movementData.SKU} (${variation})`, { newData: movementData }, token);

      return { success: true, newStock: newPhysique };
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function inventoryAdjustment(token, adjustmentData) {
  try {
    if (!checkPermission(token, 'Inventaire', 'FULL')) throw new Error('Accès refusé');

    return executeWithLock('STOCK_LOCK', () => {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const stockSheet = ss.getSheetByName('Stock');
      const journalSheet = ss.getSheetByName('Journal');
      const currentUser = getCurrentUserFromToken(token);

      const data = stockSheet.getDataRange().getValues();
      let stockRow = -1;

      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === adjustmentData.SKU && data[i][1] === adjustmentData.Site_ID) {
          stockRow = i + 1;
          break;
        }
      }

      if (stockRow === -1) return { success: false, error: 'Emplacement non trouvé' };

      const currentPhysique = data[stockRow - 1][5] || 0;
      const counted = adjustmentData.Counted;
      const variation = counted - currentPhysique;
      const ecarts = Math.abs(variation);
      const threshold = adjustmentData.Threshold || 5;

      if (ecarts > threshold && !adjustmentData.Justification) {
        return { success: false, error: 'Écart important - Justification obligatoire' };
      }

      stockSheet.getRange(stockRow, 6).setValue(counted);
      stockSheet.getRange(stockRow, 8).setValue(counted - (data[stockRow - 1][6] || 0));
      stockSheet.getRange(stockRow, 11).setValue(new Date());

      journalSheet.appendRow([getTimestamp(), currentUser, 'INVENTAIRE', adjustmentData.SKU, variation, counted, 'INV-' + Date.now(), adjustmentData.Lot_ID || '', '', generateHash({ action: 'inventory', sku: adjustmentData.SKU, counted: counted })]);

      invalidateCache('PRODUCT_CATALOG');
      auditLog('INVENTORY_ADJUSTMENT', 'Inventaire', `Inventory: ${adjustmentData.SKU} (${currentPhysique} -> ${counted})`, { newData: adjustmentData }, token);

      return { success: true, message: 'Inventaire enregistré', variation: variation };
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function createCategory(token, categoryData) {
  try {
    if (!checkPermission(token, 'Admin', 'WRITE')) throw new Error('Accès refusé');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Categories');
    const id = 'CAT-' + Date.now();
    sheet.appendRow([id, categoryData.Nom, categoryData.Description || '', new Date()]);
    auditLog('CATEGORY_CREATED', 'Admin', 'Catégorie créée: ' + categoryData.Nom, { newData: categoryData }, token);
    return { success: true, id: id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function getCategories(token) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Categories');
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    const categories = [];
    for (let i = 1; i < data.length; i++) {
      categories.push({ id: data[i][0], nom: data[i][1], description: data[i][2] });
    }
    return categories;
  } catch (error) {
    return [];
  }
}

function getStockMovements(token, filters = {}) {
  try {
    if (!checkPermission(token, 'Stock', 'READ')) throw new Error('Accès refusé');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('StockMovements');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const movements = [];
    for (let i = 1; i < data.length; i++) {
      const movement = {};
      headers.forEach((header, index) => { movement[header] = data[i][index]; });

      if (filters.startDate && new Date(movement.Timestamp) < new Date(filters.startDate)) continue;
      if (filters.endDate && new Date(movement.Timestamp) > new Date(filters.endDate)) continue;
      if (filters.sku && movement.SKU !== filters.sku) continue;
      if (filters.type && movement.Type_Mouvement !== filters.type) continue;

      movements.push(movement);
    }
    return { success: true, movements: movements };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function transferStock(token, transferData) {
  try {
    if (!checkPermission(token, 'Stock', 'FULL')) throw new Error('Accès refusé');

    return executeWithLock('STOCK_LOCK', () => {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const stockSheet = ss.getSheetByName('Stock');
      const transfersSheet = ss.getSheetByName('Transfers');
      const journalSheet = ss.getSheetByName('Journal');
      const currentUser = getCurrentUserFromToken(token);

      const transferId = 'TRF-' + Date.now();
      const now = new Date();

      transferData.Items.forEach(item => {
        // Deduct from source
        const sourceData = stockSheet.getDataRange().getValues();
        for (let i = 1; i < sourceData.length; i++) {
          if (sourceData[i][0] === item.SKU && sourceData[i][1] === transferData.From_Site) {
            const currentPhysique = sourceData[i][5] || 0;
            if (currentPhysique < item.Quantity) throw new Error(`Stock insuffisant à la source pour ${item.SKU}`);
            stockSheet.getRange(i + 1, 6).setValue(currentPhysique - item.Quantity);
            stockSheet.getRange(i + 1, 8).setValue(currentPhysique - item.Quantity - (sourceData[i][6] || 0));
            stockSheet.getRange(i + 1, 11).setValue(now);

            journalSheet.appendRow([getTimestamp(), currentUser, 'TRANSFERT_OUT', item.SKU, -item.Quantity, currentPhysique - item.Quantity, transferId, '', '', generateHash({ action: 'transfer_out', sku: item.SKU })]);
            break;
          }
        }

        // Add to destination
        const destData = stockSheet.getDataRange().getValues();
        let destRow = -1;
        for (let i = 1; i < destData.length; i++) {
          if (destData[i][0] === item.SKU && destData[i][1] === transferData.To_Site) {
            destRow = i + 1;
            break;
          }
        }

        if (destRow > 0) {
          const currentPhysique = destData[destRow - 1][5] || 0;
          stockSheet.getRange(destRow, 6).setValue(currentPhysique + item.Quantity);
          stockSheet.getRange(destRow, 8).setValue(currentPhysique + item.Quantity - (destData[destRow - 1][6] || 0));
          stockSheet.getRange(destRow, 11).setValue(now);
        } else {
          stockSheet.appendRow([item.SKU, transferData.To_Site, item.Allée || 'A', item.Colonne || '01', item.Étagère || 'N1', item.Quantity, 0, item.Quantity, '', '', now]);
        }

        journalSheet.appendRow([getTimestamp(), currentUser, 'TRANSFERT_IN', item.SKU, item.Quantity, getAvailableStock(item.SKU, transferData.To_Site), transferId, '', '', generateHash({ action: 'transfer_in', sku: item.SKU })]);
      });

      transfersSheet.appendRow([transferId, now, transferData.From_Site, transferData.To_Site, currentUser, 'COMPLETED', JSON.stringify(transferData.Items), '', now]);

      invalidateCache('PRODUCT_CATALOG');
      auditLog('STOCK_TRANSFER', 'Stock', `Transfer: ${transferData.From_Site} -> ${transferData.To_Site}`, { newData: transferData }, token);

      return { success: true, transferId: transferId };
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function importProducts(token, productsArray) {
  try {
    if (!checkPermission(token, 'Stock', 'FULL')) throw new Error('Accès refusé');

    return executeWithLock('STOCK_LOCK', () => {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const productsSheet = ss.getSheetByName('Products');
      const stockSheet = ss.getSheetByName('Stock');
      const currentUser = getCurrentUserFromToken(token);

      const now = new Date();
      const productsData = productsSheet.getDataRange().getValues();
      const existingSKUs = new Set();
      for (let i = 1; i < productsData.length; i++) {
        existingSKUs.add(productsData[i][0]);
      }

      const newProducts = [];
      const newStock = [];
      let imported = 0;

      productsArray.forEach(product => {
        if (!existingSKUs.has(product.SKU)) {
          newProducts.push([product.SKU, product.CodeBarres, product.Designation, product.Categorie, product.PrixAchat, product.PrixVente, product.TVA_Rate || 0.18, product.StockAlert || 10, product.Unite || 'PCE', product.Supplier_ID || '', now, now]);
          newStock.push([product.SKU, product.Site_ID || 'MAIN', product.Allée || 'A', product.Colonne || '01', product.Étagère || 'N1', product.Stock_Physique || 0, 0, product.Stock_Physique || 0, '', product.DateExpiration || '', now]);
          existingSKUs.add(product.SKU);
          imported++;
        }
      });

      if (newProducts.length > 0) {
        const pRange = productsSheet.getRange(productsSheet.getLastRow() + 1, 1, newProducts.length, newProducts[0].length);
        pRange.setValues(newProducts);
      }
      if (newStock.length > 0) {
        const sRange = stockSheet.getRange(stockSheet.getLastRow() + 1, 1, newStock.length, newStock[0].length);
        sRange.setValues(newStock);
      }

      invalidateCache('PRODUCT_CATALOG');
      auditLog('PRODUCTS_IMPORTED', 'Stock', `${imported} products imported`, null, token);

      return { success: true, imported: imported };
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}
