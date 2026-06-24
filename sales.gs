/**
 * Sales & POS Logic
 */

function getProductCatalog(token) {
  Security.verify(token, 'Vente', 'READ');
  const prods = DB.getRows('Products'), stocks = DB.getRows('Stock');
  const stockMap = stocks.reduce((acc, s) => (acc[s.SKU] = (acc[s.SKU] || 0) + (s.StockPhysique - s.StockReserve), acc), {});

  return prods.map(p => ({ ...p, StockDisponible: stockMap[p.SKU] || 0 }));
}

function createSale(token, data) {
  const sess = Security.verify(token, 'Vente', 'WRITE');
  return DB.lock(() => {
    const ticket = generateTicketNumber(data.Site_ID, data.Caisse_ID);
    let totalHT = 0, totalTVA = 0;

    data.Items.forEach((it, i) => {
      const lineHT = it.UnitPrice * it.Quantity, lineTVA = lineHT * (it.TVA_Rate || CONFIG.TVA);
      totalHT += lineHT; totalTVA += lineTVA;

      DB.insert('SaleItems', { TicketNumber: ticket, LineNumber: i+1, SKU: it.SKU, Designation: it.Designation, Quantity: it.Quantity, UnitPrice: it.UnitPrice, TotalTTC: lineHT + lineTVA });
      updateStockDirect(it.SKU, -it.Quantity, data.Site_ID);
    });

    DB.insert('Sales', { TicketNumber: ticket, Timestamp: new Date(), UserID: sess.Email, TotalTTC: totalHT + totalTVA, Client_Details: JSON.stringify(data.Client_Details) });
    audit('SALE', 'POS', `Vente ${ticket}`, token);

    return { success: true, ticket, pdf: generateInvoiceHTML(ticket) };
  });
}

function updateStockDirect(sku, varQty, site) {
  const s = DB.sheet('Stock'), d = s.getDataRange().getValues(), h = d[0], sIdx = h.indexOf('SKU'), siIdx = h.indexOf('Site_ID'), pIdx = h.indexOf('StockPhysique');
  for (let i = 1; i < d.length; i++) {
    if (d[i][sIdx] === sku && d[i][siIdx] === site) {
      s.getRange(i+1, pIdx+1).setValue(Number(d[i][pIdx]) + varQty);
      return;
    }
  }
}

function generateTicketNumber(site, caisse) {
  const d = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyMMdd');
  const key = `SEQ_${site}_${caisse}_${d}`;
  const seq = Number(PropertiesService.getScriptProperties().getProperty(key) || 0) + 1;
  PropertiesService.getScriptProperties().setProperty(key, seq.toString());
  return `${site}-${caisse}-${d}-${seq.toString().padStart(4, '0')}`;
}
