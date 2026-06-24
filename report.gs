/**
 * BI & Reports
 */

function getDashboardData(token) {
  try {
    Security.verify(token, 'Rapports', 'READ');
    const sales = DB.getRows('Sales'), stocks = DB.getRows('Stock'), auditLogs = DB.getRows('Audit');
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

    let totalVal = 0, totalTx = 0;
    sales.forEach(s => {
      if (Utilities.formatDate(new Date(s.Timestamp), Session.getScriptTimeZone(), 'yyyy-MM-dd') === today) {
        totalVal += s.TotalTTC; totalTx++;
      }
    });

    return {
      success: true,
      dailySales: totalVal,
      dailyTransactions: totalTx,
      totalStockTypes: new Set(stocks.map(s => s.SKU)).size,
      stockAlerts: stocks.filter(s => (s.StockPhysique - s.StockReserve) <= 10).length,
      recentActivity: auditLogs.slice(-10).reverse().map(a => ({ time: a.Timestamp, action: a.Action, desc: a.Description }))
    };
  } catch (e) { return { success: false, error: e.message }; }
}

function generateInvoiceHTML(ticket) {
  const sale = DB.getRows('Sales').find(s => s.TicketNumber === ticket);
  const items = DB.getRows('SaleItems').filter(it => it.TicketNumber === ticket);
  const client = JSON.parse(sale.Client_Details || '{}');

  return `
    <div style="font-family:sans-serif; padding:30px; color:#1A312C">
      <h2 style="border-bottom:2px solid">FACTURE ${ticket}</h2>
      <p>Date: ${new Date(sale.Timestamp).toLocaleString()}</p>
      <p>Client: ${client.Nom || 'Public'} | Tel: ${client.Phone || '-'}</p>
      <table style="width:100%; border-collapse:collapse; margin:20px 0">
        <tr style="background:#f1f5f9"><th>Item</th><th>Qty</th><th>Total</th></tr>
        ${items.map(it => `<tr><td>${it.Designation}</td><td>${it.Quantity}</td><td>${it.TotalTTC}</td></tr>`).join('')}
      </table>
      <h3 style="text-align:right">Total: ${sale.TotalTTC}</h3>
    </div>
  `;
}

function listClients(token) {
  Security.verify(token, 'Clients', 'READ');
  return DB.getRows('Clients').map(c => ({ id: c.Client_ID, nom: c.Nom, phone: c.Phone }));
}
