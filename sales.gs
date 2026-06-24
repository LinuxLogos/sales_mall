/**
 * Sales & POS Logic
 */

function getProductCatalog(token) {
  Security.verify(token, 'Vente', 'READ');
  const products = DB.getRows('Products');
  const stocks = DB.getRows('Stock');

  const stockMap = stocks.reduce((acc, s) => {
    acc[s.SKU] = (acc[s.SKU] || 0) + (Number(s.StockPhysique) - Number(s.StockReserve));
    return acc;
  }, {});

  return products.map(p => ({
    ...p,
    StockDisponible: stockMap[p.SKU] || 0
  }));
}

function createSale(token, data) {
  const session = Security.verify(token, 'Vente', 'WRITE');
  return DB.lock(() => {
    const ticketNum = generateTicketNumber(data.Site_ID, data.Caisse_ID);
    const now = new Date();
    let totalHT = 0, totalTVA = 0;

    data.Items.forEach((item, i) => {
      const subHT = item.UnitPrice * item.Quantity;
      const subTVA = subHT * (item.TVA_Rate || CONFIG.TVA);
      totalHT += subHT; totalTVA += subTVA;

      DB.insert('SaleItems', {
        TicketNumber: ticketNum,
        LineNumber: i + 1,
        SKU: item.SKU,
        Designation: item.Designation,
        Quantity: item.Quantity,
        UnitPrice: item.UnitPrice,
        TVA_Rate: item.TVA_Rate,
        TotalHT: subHT,
        TotalTTC: subHT + subTVA
      });

      updateStock(item.SKU, -item.Quantity, data.Site_ID);
    });

    const client = data.Client_Details ? JSON.stringify(data.Client_Details) : '[]';
    DB.insert('Sales', {
      TicketNumber: ticketNum,
      Timestamp: now,
      UserID: session.Email,
      Client_ID: data.Client_ID || 'MANUAL',
      Site_ID: data.Site_ID,
      Caisse_ID: data.Caisse_ID,
      TotalHT: totalHT,
      TotalTVA: totalTVA,
      TotalTTC: totalHT + totalTVA,
      PaymentMethod: data.PaymentMethod,
      Status: 'VALIDE',
      Client_Details: client
    });

    audit('SALE', 'POS', `Ticket ${ticketNum} - ${totalHT + totalTVA} ${CONFIG.CURRENCY}`, token);

    // In-memory PDF for speed
    const pdf = generateInvoicePDF(token, ticketNum);
    return { success: true, ticketNumber: ticketNum, pdfContent: pdf.htmlContent };
  });
}

function generateTicketNumber(site, caisse) {
  const d = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyMMdd');
  const key = `SEQ_${site}_${caisse}_${d}`;
  const seq = Number(PropertiesService.getScriptProperties().getProperty(key) || 0) + 1;
  PropertiesService.getScriptProperties().setProperty(key, seq.toString());
  return `${site}-${caisse}-${d}-${seq.toString().padStart(4, '0')}`;
}
