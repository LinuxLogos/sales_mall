/**
 * Sales & POS Module
 */

function getProductCatalog(token) {
  try {
    if (!checkPermission(token, 'Vente', 'READ')) throw new Error('Accès refusé');

    const cacheKey = 'PRODUCT_CATALOG';
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const productsSheet = ss.getSheetByName('Products');
    const stockSheet = ss.getSheetByName('Stock');
    const promotionsSheet = ss.getSheetByName('Promotions');

    const productsData = productsSheet.getDataRange().getValues();
    const stockData = stockSheet.getDataRange().getValues();
    const promotionsData = promotionsSheet ? promotionsSheet.getDataRange().getValues() : [];

    const headers = productsData[0];
    const catalog = [];
    const stockMap = new Map();
    const promoMap = new Map();

    for (let i = 1; i < stockData.length; i++) {
      const sku = stockData[i][0];
      if (!stockMap.has(sku)) stockMap.set(sku, { physique: 0, reserve: 0 });
      const current = stockMap.get(sku);
      current.physique += stockData[i][5] || 0;
      current.reserve += stockData[i][6] || 0;
    }

    const now = new Date();
    for (let i = 1; i < promotionsData.length; i++) {
      if (promotionsData[i][6] === true) {
        const validFrom = new Date(promotionsData[i][4]);
        const validTo = new Date(promotionsData[i][5]);
        if (now >= validFrom && now <= validTo) {
          promoMap.set(promotionsData[i][1], {
            reductionPercent: promotionsData[i][2] || 0,
            reductionAmount: promotionsData[i][3] || 0,
            priority: promotionsData[i][7] || 0
          });
        }
      }
    }

    for (let i = 1; i < productsData.length; i++) {
      const product = {};
      headers.forEach((header, index) => { product[header] = productsData[i][index]; });

      const stock = stockMap.get(product.SKU) || { physique: 0, reserve: 0 };
      product.StockDisponible = stock.physique - stock.reserve;
      product.StockPhysique = stock.physique;

      const promo = promoMap.get(product.SKU);
      if (promo) {
        if (promo.reductionPercent > 0) product.PrixVentePromo = product.PrixVente * (1 - promo.reductionPercent / 100);
        else if (promo.reductionAmount > 0) product.PrixVentePromo = product.PrixVente - promo.reductionAmount;
        product.HasPromotion = true;
      }

      catalog.push(product);
    }

    setInCache(cacheKey, catalog, 60);
    return catalog;
  } catch (error) {
    Logger.log('ERROR in getProductCatalog: ' + error.message);
    throw error;
  }
}

function createSale(token, saleData) {
  try {
    if (!checkPermission(token, 'Vente', 'WRITE')) throw new Error('Accès refusé');

    return executeWithLock('SALE_LOCK', () => {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const salesSheet = ss.getSheetByName('Sales');
      const saleItemsSheet = ss.getSheetByName('SaleItems');
      const journalSheet = ss.getSheetByName('Journal');

      const now = new Date();
      const ticketNumber = generateTicketNumber(saleData.Site_ID, saleData.Caisse_ID);

      let clientTVA = parseFloat(getConfigValue('TVA_RATE', '0.18'));
      let clientReduction = 0;

      if (saleData.Client_ID) {
        const specialClient = getSpecialClient(saleData.Client_ID);
        if (specialClient) {
          clientTVA = specialClient.TVA_Rate || clientTVA;
          clientReduction = specialClient.Reduction_Percent || 0;
        }
      }

      let totalHT = 0, totalTVA = 0, totalTTC = 0;
      const itemsData = [];
      const currentUser = getCurrentUserFromToken(token);

      saleData.Items.forEach((item, index) => {
        const currentStock = getAvailableStock(item.SKU, saleData.Site_ID);
        if (currentStock < item.Quantity) {
          throw new Error(`Stock insuffisant pour ${item.Designation}: ${currentStock} disponibles`);
        }

        const unitPrice = item.PrixVentePromo || item.PrixVente;
        const tvaRate = item.TVA_Rate !== undefined ? item.TVA_Rate : clientTVA;
        const lineHT = unitPrice * item.Quantity;
        const lineTVA = lineHT * tvaRate;
        const lineTTC = lineHT + lineTVA;

        totalHT += lineHT;
        totalTVA += lineTVA;
        totalTTC += lineTTC;

        itemsData.push([ticketNumber, index + 1, item.SKU, item.Designation, item.Quantity, unitPrice, tvaRate, lineHT, lineTTC, item.Lot_ID || '']);

        updateStock(item.SKU, -item.Quantity, saleData.Site_ID, item.Lot_ID);

        journalSheet.appendRow([getTimestamp(), currentUser, 'VENTE', item.SKU, -item.Quantity, getAvailableStock(item.SKU, saleData.Site_ID), ticketNumber, item.Lot_ID || '', '', generateHash({ ticket: ticketNumber, sku: item.SKU, qty: item.Quantity })]);
      });

      let reductionAmount = saleData.Reduction_Amount || 0;
      let reductionPercent = saleData.Reduction_Percent || clientReduction;

      if (reductionPercent > 0) {
        const reduction = totalTTC * (reductionPercent / 100);
        totalTTC -= reduction;
        reductionAmount = reduction;
      }

      salesSheet.appendRow([ticketNumber, now, currentUser, saleData.Client_ID || '', saleData.Site_ID, saleData.Caisse_ID, totalHT, totalTVA, totalTTC, saleData.PaymentMethod || 'ESPECE', 'PAYE', 'VALIDE', reductionAmount, reductionPercent]);

      if (itemsData.length > 0) {
        const range = saleItemsSheet.getRange(saleItemsSheet.getLastRow() + 1, 1, itemsData.length, itemsData[0].length);
        range.setValues(itemsData);
      }

      invalidateCache('PRODUCT_CATALOG');
      auditLog('SALE_CREATED', 'Vente', 'Sale: ' + ticketNumber, { total: totalTTC }, token);

      return { success: true, ticketNumber: ticketNumber, totalHT: totalHT, totalTVA: totalTVA, totalTTC: totalTTC, timestamp: now };
    });
  } catch (error) {
    Logger.log('ERROR in createSale: ' + error.message);
    return { success: false, error: error.message };
  }
}

function getAvailableStock(sku, siteID = null) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const stockSheet = ss.getSheetByName('Stock');
  const data = stockSheet.getDataRange().getValues();

  let totalPhysique = 0, totalReserve = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === sku && (!siteID || data[i][1] === siteID)) {
      totalPhysique += data[i][5] || 0;
      totalReserve += data[i][6] || 0;
    }
  }
  return totalPhysique - totalReserve;
}

function updateStock(sku, variation, siteID, lotID = null) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const stockSheet = ss.getSheetByName('Stock');
  const data = stockSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === sku && (!siteID || data[i][1] === siteID)) {
      const currentPhysique = data[i][5] || 0;
      const currentReserve = data[i][6] || 0;
      const newPhysique = currentPhysique + variation;

      stockSheet.getRange(i + 1, 6).setValue(newPhysique);
      stockSheet.getRange(i + 1, 8).setValue(newPhysique - currentReserve);
      stockSheet.getRange(i + 1, 11).setValue(new Date());
      break;
    }
  }
}

function getSpecialClient(clientID) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('SpecialClients');
  if (!sheet) return null;

  const data = sheet.getDataRange().getValues();
  const now = new Date();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === clientID && data[i][6] === true) {
      const validFrom = data[i][4] ? new Date(data[i][4]) : null;
      const validTo = data[i][5] ? new Date(data[i][5]) : null;
      if ((!validFrom || now >= validFrom) && (!validTo || now <= validTo)) {
        return { Client_ID: data[i][0], TVA_Rate: data[i][1], Reduction_Percent: data[i][2], Reduction_Amount: data[i][3] };
      }
    }
  }
  return null;
}

function getSalesHistory(token, filters = {}) {
  try {
    if (!checkPermission(token, 'Rapports', 'READ')) throw new Error('Accès refusé');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const salesSheet = ss.getSheetByName('Sales');
    const data = salesSheet.getDataRange().getValues();
    const headers = data[0];

    const sales = [];
    for (let i = 1; i < data.length; i++) {
      const sale = {};
      headers.forEach((header, index) => { sale[header] = data[i][index]; });

      if (filters.startDate && new Date(sale.Timestamp) < new Date(filters.startDate)) continue;
      if (filters.endDate && new Date(sale.Timestamp) > new Date(filters.endDate)) continue;
      if (filters.siteID && sale.Site_ID !== filters.siteID) continue;
      if (filters.userID && sale.UserID !== filters.userID) continue;

      sales.push(sale);
    }
    return { success: true, sales: sales };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function getSaleDetails(token, ticketNumber) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const salesSheet = ss.getSheetByName('Sales');
    const itemsSheet = ss.getSheetByName('SaleItems');

    const salesData = salesSheet.getDataRange().getValues();
    let sale = null;

    for (let i = 1; i < salesData.length; i++) {
      if (salesData[i][0] === ticketNumber) {
        sale = {};
        salesData[0].forEach((header, index) => { sale[header] = salesData[i][index]; });
        break;
      }
    }

    if (!sale) return { success: false, error: 'Ticket non trouvé' };

    const itemsData = itemsSheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < itemsData.length; i++) {
      if (itemsData[i][0] === ticketNumber) {
        items.push({ LineNumber: itemsData[i][1], SKU: itemsData[i][2], Designation: itemsData[i][3], Quantity: itemsData[i][4], UnitPrice: itemsData[i][5], TVA_Rate: itemsData[i][6], TotalHT: itemsData[i][7], TotalTTC: itemsData[i][8] });
      }
    }

    return { success: true, sale: sale, items: items };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function annulSale(token, ticketNumber, reason) {
  try {
    if (!checkPermission(token, 'Vente', 'FULL')) throw new Error('Accès refusé');

    return executeWithLock('SALE_LOCK', () => {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const salesSheet = ss.getSheetByName('Sales');
      const itemsSheet = ss.getSheetByName('SaleItems');
      const journalSheet = ss.getSheetByName('Journal');
      const currentUser = getCurrentUserFromToken(token);

      const salesData = salesSheet.getDataRange().getValues();
      let saleRow = -1;

      for (let i = 1; i < salesData.length; i++) {
        if (salesData[i][0] === ticketNumber && salesData[i][11] !== 'ANNULE') {
          saleRow = i + 1;
          break;
        }
      }

      if (saleRow === -1) return { success: false, error: 'Ticket non trouvé ou déjà annulé' };

      // Restore stock
      const itemsData = itemsSheet.getDataRange().getValues();
      for (let i = 1; i < itemsData.length; i++) {
        if (itemsData[i][0] === ticketNumber) {
          const sku = itemsData[i][2];
          const qty = itemsData[i][4];
          updateStock(sku, qty, salesData[saleRow - 1][4]);

          journalSheet.appendRow([getTimestamp(), currentUser, 'ANNULATION', sku, qty, getAvailableStock(sku, salesData[saleRow - 1][4]), ticketNumber, '', '', generateHash({ action: 'annul', ticket: ticketNumber, sku: sku })]);
        }
      }

      salesSheet.getRange(saleRow, 12).setValue('ANNULE');
      salesSheet.getRange(saleRow, 14).setValue(reason || 'Annulation');

      auditLog('SALE_ANNULED', 'Vente', 'Sale annulled: ' + ticketNumber + ' - Reason: ' + reason, null, token);
      invalidateCache('PRODUCT_CATALOG');

      return { success: true, message: 'Ticket annulé' };
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}
