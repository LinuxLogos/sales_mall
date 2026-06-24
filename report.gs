/**
 * Reports & Analytics Module
 */

function getDashboardData(token) {
  try {
    if (!checkPermission(token, 'Rapports', 'READ')) throw new Error('Accès refusé');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const salesSheet = ss.getSheetByName('Sales');
    const stockSheet = ss.getSheetByName('Stock');
    const productsSheet = ss.getSheetByName('Products');

    const salesData = salesSheet.getDataRange().getValues();
    const stockData = stockSheet.getDataRange().getValues();
    const productsData = productsSheet.getDataRange().getValues();

    const today = new Date();
    const todayStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');

    let dailySales = 0, dailyTransactions = 0;
    let totalStock = 0, totalArticles = 0;
    let stockAlerts = 0;
    const salesByDay = {};

    // Process sales
    for (let i = 1; i < salesData.length; i++) {
      if (salesData[i][11] === 'ANNULE') continue;
      const saleDate = Utilities.formatDate(new Date(salesData[i][1]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      const totalTTC = salesData[i][8] || 0;

      if (saleDate === todayStr) {
        dailySales += totalTTC;
        dailyTransactions++;
      }

      if (!salesByDay[saleDate]) salesByDay[saleDate] = 0;
      salesByDay[saleDate] += totalTTC;
    }

    // Process stock
    const uniqueSKUs = new Set();
    for (let i = 1; i < stockData.length; i++) {
      uniqueSKUs.add(stockData[i][0]);
      const physique = stockData[i][5] || 0;
      const reserve = stockData[i][6] || 0;
      const disponible = physique - reserve;
      totalArticles += disponible;

      if (disponible <= 0) stockAlerts++;
      else if (disponible <= 10) stockAlerts++;
    }

    // Last 7 days sales
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      const dayName = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][date.getDay()];
      last7Days.push({ day: dayName, date: dateStr, total: salesByDay[dateStr] || 0 });
    }

    // Recent activity (from Audit sheet)
    const auditSheet = ss.getSheetByName('Audit');
    const auditData = auditSheet ? auditSheet.getRange(Math.max(1, auditSheet.getLastRow() - 9), 1, Math.min(10, auditSheet.getLastRow()), auditSheet.getLastColumn()).getValues() : [];
    const activities = auditData.slice(1).map(row => ({
      time: row[0],
      user: row[1],
      action: row[2],
      desc: row[4]
    })).reverse();

    return {
      success: true,
      dailySales: dailySales,
      dailyTransactions: dailyTransactions,
      totalStock: uniqueSKUs.size, // Number of different types of articles
      stockAlerts: stockAlerts,
      last7Days: last7Days,
      totalProducts: productsData.length - 1,
      recentActivity: activities
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function getSalesReport(token, filters = {}) {
  try {
    if (!checkPermission(token, 'Rapports', 'READ')) throw new Error('Accès refusé');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const salesSheet = ss.getSheetByName('Sales');
    const itemsSheet = ss.getSheetByName('SaleItems');

    const salesData = salesSheet.getDataRange().getValues();
    const itemsData = itemsSheet.getDataRange().getValues();

    const salesHeaders = salesData[0];
    const itemsHeaders = itemsData[0];

    let filteredSales = [];
    for (let i = 1; i < salesData.length; i++) {
      const sale = {};
      salesHeaders.forEach((h, idx) => { sale[h] = salesData[i][idx]; });

      if (filters.startDate && new Date(sale.Timestamp) < new Date(filters.startDate)) continue;
      if (filters.endDate && new Date(sale.Timestamp) > new Date(filters.endDate)) continue;
      if (filters.siteID && sale.Site_ID !== filters.siteID) continue;
      if (filters.status && sale.Status !== filters.status) continue;

      filteredSales.push(sale);
    }

    // Calculate totals
    let totalHT = 0, totalTVA = 0, totalTTC = 0;
    filteredSales.forEach(sale => {
      if (sale.Status !== 'ANNULE') {
        totalHT += sale.TotalHT || 0;
        totalTVA += sale.TotalTVA || 0;
        totalTTC += sale.TotalTTC || 0;
      }
    });

    // Top products
    const productSales = {};
    for (let i = 1; i < itemsData.length; i++) {
      const sku = itemsData[i][2];
      if (!productSales[sku]) productSales[sku] = { SKU: sku, Designation: itemsData[i][3], Quantity: 0, TotalHT: 0 };
      productSales[sku].Quantity += itemsData[i][4] || 0;
      productSales[sku].TotalHT += itemsData[i][7] || 0;
    }

    const topProducts = Object.values(productSales).sort((a, b) => b.TotalHT - a.TotalHT).slice(0, 10);

    return {
      success: true,
      sales: filteredSales,
      totals: { totalHT, totalTVA, totalTTC },
      topProducts: topProducts,
      totalTransactions: filteredSales.length
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function getProductPerformance(token, filters = {}) {
  try {
    if (!checkPermission(token, 'Rapports', 'READ')) throw new Error('Accès refusé');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const itemsSheet = ss.getSheetByName('SaleItems');
    const productsSheet = ss.getSheetByName('Products');
    const stockSheet = ss.getSheetByName('Stock');

    const itemsData = itemsSheet.getDataRange().getValues();
    const productsData = productsSheet.getDataRange().getValues();
    const stockData = stockSheet.getDataRange().getValues();

    const productMap = new Map();
    for (let i = 1; i < productsData.length; i++) {
      productMap.set(productsData[i][0], { Designation: productsData[i][2], PrixAchat: productsData[i][4], PrixVente: productsData[i][5], Categorie: productsData[i][3] });
    }

    const stockMap = new Map();
    for (let i = 1; i < stockData.length; i++) {
      const sku = stockData[i][0];
      if (!stockMap.has(sku)) stockMap.set(sku, 0);
      stockMap.set(sku, stockMap.get(sku) + (stockData[i][5] || 0));
    }

    const performance = {};
    for (let i = 1; i < itemsData.length; i++) {
      const sku = itemsData[i][2];
      if (!performance[sku]) {
        const product = productMap.get(sku) || {};
        performance[sku] = {
          SKU: sku,
          Designation: product.Designation || sku,
          Categorie: product.Categorie || '',
          PrixAchat: product.PrixAchat || 0,
          PrixVente: product.PrixVente || 0,
          QuantitySold: 0,
          TotalRevenue: 0,
          TotalCost: 0,
          TotalMargin: 0,
          Stock: stockMap.get(sku) || 0
        };
      }
      performance[sku].QuantitySold += itemsData[i][4] || 0;
      performance[sku].TotalRevenue += itemsData[i][7] || 0;
      performance[sku].TotalCost += (itemsData[i][4] || 0) * (productMap.get(sku)?.PrixAchat || 0);
    }

    Object.values(performance).forEach(p => {
      p.TotalMargin = p.TotalRevenue - p.TotalCost;
      p.MarginPercent = p.TotalRevenue > 0 ? (p.TotalMargin / p.TotalRevenue * 100) : 0;
      p.Velocity = p.QuantitySold; // Simplified
      p.AttractivenessScore = (p.MarginPercent * 0.5) + (p.Velocity * 0.3) + (p.TotalRevenue > 0 ? 20 : 0) * 0.2;

      if (p.AttractivenessScore > 50) p.Category = 'Star';
      else if (p.AttractivenessScore < 10) p.Category = 'Poids Mort';
      else if (p.MarginPercent > 30 && p.Velocity < 5) p.Category = 'À Optimiser';
      else if (p.MarginPercent < 15 && p.Velocity > 10) p.Category = 'Produit d\'appel';
      else p.Category = 'Neutre';
    });

    const sorted = Object.values(performance).sort((a, b) => b.AttractivenessScore - a.AttractivenessScore);

    return { success: true, products: sorted };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function getFinancialReport(token, filters = {}) {
  try {
    if (!checkPermission(token, 'Comptabilite', 'FULL')) throw new Error('Accès refusé');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const salesSheet = ss.getSheetByName('Sales');
    if (!salesSheet) return { success: false, error: 'Sales sheet not found' };
    const salesData = salesSheet.getDataRange().getValues();
    const salesHeaders = salesData[0];

    let totalRevenue = 0, totalTVA = 0;
    const monthlyData = {};

    for (let i = 1; i < salesData.length; i++) {
      if (salesData[i][11] === 'ANNULE') continue;

      const sale = {};
      salesHeaders.forEach((h, idx) => { sale[h] = salesData[i][idx]; });

      if (filters.startDate && new Date(sale.Timestamp) < new Date(filters.startDate)) continue;
      if (filters.endDate && new Date(sale.Timestamp) > new Date(filters.endDate)) continue;

      const monthKey = Utilities.formatDate(new Date(sale.Timestamp), Session.getScriptTimeZone(), 'yyyy-MM');
      if (!monthlyData[monthKey]) monthlyData[monthKey] = { revenue: 0, tva: 0, transactions: 0 };

      monthlyData[monthKey].revenue += sale.TotalHT || 0;
      monthlyData[monthKey].tva += sale.TotalTVA || 0;
      monthlyData[monthKey].transactions++;

      totalRevenue += sale.TotalHT || 0;
      totalTVA += sale.TotalTVA || 0;
    }

    const monthlyArray = Object.entries(monthlyData).map(([month, data]) => ({ month, ...data })).sort((a, b) => a.month.localeCompare(b.month));

    return {
      success: true,
      totals: { totalRevenue, totalTVA, totalTransactions: salesData.length - 1 },
      monthly: monthlyArray
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function exportToCSV(token, exportType, filters = {}) {
  try {
    if (!checkPermission(token, 'Rapports', 'READ')) throw new Error('Accès refusé');

    let csvContent = '\ufeff';
    let fileName = '';

    if (exportType === 'sales') {
      const report = getSalesReport(token, filters);
      if (!report.success) throw new Error(report.error);

      csvContent += 'TicketNumber;Timestamp;UserID;Site_ID;TotalHT;TotalTVA;TotalTTC;Status\n';
      report.sales.forEach(sale => {
        csvContent += `${sale.TicketNumber};${sale.Timestamp};${sale.UserID};${sale.Site_ID};${sale.TotalHT};${sale.TotalTVA};${sale.TotalTTC};${sale.Status}\n`;
      });
      fileName = `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (exportType === 'stock') {
      const overview = getStockOverview(token);
      if (!overview.success) throw new Error(overview.error);

      csvContent += 'SKU;Designation;Site_ID;Location;StockPhysique;StockReserve;StockDisponible\n';
      overview.stock.forEach(item => {
        csvContent += `${item.SKU};${item.Designation};${item.Site_ID};${item.Location};${item.StockPhysique};${item.StockReserve};${item.StockDisponible}\n`;
      });
      fileName = `Stock_Overview_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (exportType === 'products') {
      const performance = getProductPerformance(token, filters);
      if (!performance.success) throw new Error(performance.error);

      csvContent += 'SKU;Designation;Categorie;QuantitySold;TotalRevenue;TotalCost;TotalMargin;MarginPercent;Velocity;Score;Category\n';
      performance.products.forEach(p => {
        csvContent += `${p.SKU};${p.Designation};${p.Categorie};${p.QuantitySold};${p.TotalRevenue};${p.TotalCost};${p.TotalMargin};${p.MarginPercent.toFixed(2)}%;${p.Velocity};${p.AttractivenessScore.toFixed(2)};${p.Category}\n`;
      });
      fileName = `Product_Performance_${new Date().toISOString().split('T')[0]}.csv`;
    }

    return { success: true, csvContent, fileName };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function generateInvoicePDF(token, ticketNumber) {
  try {
    const saleDetails = getSaleDetails(token, ticketNumber);
    if (!saleDetails.success) throw new Error(saleDetails.error);

    const sale = saleDetails.sale;
    const items = saleDetails.items;
    const company = getClientConfig().company;
    let clientInfo = { Nom: 'Client Comptoir', Phone: '', Address: '' };
    try {
       if (sale.Client_Details) {
         clientInfo = JSON.parse(sale.Client_Details);
       }
    } catch(e) {}

    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #000; }
      .header { display: flex; justify-content: space-between; border-bottom: 3px solid #1A312C; padding-bottom: 15px; margin-bottom: 20px; }
      .company-info { color: #1A312C; }
      .company-info h1 { margin: 0; font-size: 24px; }
      .invoice-info { text-align: right; }
      .invoice-info h2 { margin: 0; color: #8B0000; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th { background: #1A312C; color: white; padding: 10px; text-align: left; }
      td { padding: 8px 10px; border-bottom: 1px solid #ddd; }
      .totals { text-align: right; margin-top: 20px; }
      .totals div { margin: 5px 0; }
      .total-final { font-size: 18px; font-weight: bold; color: #1A312C; border-top: 2px solid #1A312C; padding-top: 10px; }
      .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
    </style></head><body>
    <div class="header">
      <div class="company-info">
        <h1>${company.name}</h1>
        <p>${company.address}<br>${company.city}, ${company.country}<br>Tél: ${company.phone}<br>Email: ${company.email}<br>NIF: ${company.nif}</p>
      </div>
      <div class="invoice-info">
        <h2>FACTURE</h2>
        <p><strong>N°:</strong> ${sale.TicketNumber}<br><strong>Date:</strong> ${new Date(sale.Timestamp).toLocaleDateString('fr-FR')}<br><strong>Heure:</strong> ${new Date(sale.Timestamp).toLocaleTimeString('fr-FR')}</p>
        <div style="margin-top:10px;text-align:right;">
          <strong>Client:</strong><br>
          ${clientInfo.Nom}<br>
          ${clientInfo.Phone}<br>
          ${clientInfo.Address}
        </div>
      </div>
    </div>
    <table>
      <thead><tr><th>Désignation</th><th>Qté</th><th>Prix Unit.</th><th>TVA</th><th>Total</th></tr></thead>
      <tbody>`;

    items.forEach(item => {
      html += `<tr><td>${item.Designation}</td><td>${item.Quantity}</td><td>${item.UnitPrice.toLocaleString()} FCFA</td><td>${(item.TVA_Rate * 100).toFixed(0)}%</td><td>${item.TotalTTC.toLocaleString()} FCFA</td></tr>`;
    });

    html += `</tbody></table>
    <div class="totals">
      <div>Total HT: ${sale.TotalHT.toLocaleString()} FCFA</div>
      <div>TVA: ${sale.TotalTVA.toLocaleString()} FCFA</div>
      ${sale.Reduction_Amount > 0 ? `<div style="color:#8B0000;">Réduction: -${sale.Reduction_Amount.toLocaleString()} FCFA</div>` : ''}
      <div class="total-final">TOTAL TTC: ${sale.TotalTTC.toLocaleString()} FCFA</div>
    </div>
    <div class="footer">
      <p>Merci de votre confiance - ${company.name}</p>
    </div>
    </body></html>`;

    return { success: true, htmlContent: html, fileName: `Facture_${sale.TicketNumber}.html` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
