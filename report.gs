/**
 * Reports & Analytics Optimized
 */

function getDashboardData(token) {
  try {
    Security.verify(token, 'Rapports', 'READ');
    const sales = DB.getRows('Sales');
    const stock = DB.getRows('Stock');
    const auditLogs = DB.getRows('Audit');

    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    let dailyVal = 0, dailyTx = 0;
    const salesByDay = {};

    sales.forEach(s => {
      if (s.Status === 'ANNULE') return;
      const d = Utilities.formatDate(new Date(s.Timestamp), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      if (d === today) { dailyVal += Number(s.TotalTTC); dailyTx++; }
      salesByDay[d] = (salesByDay[d] || 0) + Number(s.TotalTTC);
    });

    const uniqueTypes = new Set(stock.map(s => s.SKU)).size;
    const alerts = stock.filter(s => (Number(s.StockPhysique) - Number(s.StockReserve)) <= 10).length;

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      last7Days.push({ day: ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][d.getDay()], total: salesByDay[ds] || 0 });
    }

    return {
      success: true,
      dailySales: dailyVal,
      dailyTransactions: dailyTx,
      totalStock: uniqueTypes,
      stockAlerts: alerts,
      last7Days: last7Days,
      recentActivity: auditLogs.slice(-10).reverse().map(a => ({
        time: a.Timestamp, action: a.Action, desc: a.Description
      }))
    };
  } catch (e) { return { success: false, error: e.message }; }
}

function generateInvoicePDF(token, ticketNum) {
  const sale = DB.getRows('Sales').find(s => s.TicketNumber === ticketNum);
  const items = DB.getRows('SaleItems').filter(it => it.TicketNumber === ticketNum);
  const cfg = getClientConfig();
  let client = { Nom: 'Client Comptoir' };
  try { client = JSON.parse(sale.Client_Details); } catch(e) {}

  const html = `
    <div style="font-family:sans-serif; padding:20px; color:#1A312C">
      <h2 style="border-bottom:2px solid">${cfg.name}</h2>
      <p>Facture: ${ticketNum} | Date: ${new Date(sale.Timestamp).toLocaleString()}</p>
      <p>Client: ${client.Nom || 'Public'} | Tel: ${client.Phone || '-'}</p>
      <table style="width:100%; border-collapse:collapse; margin-top:20px">
        <tr style="background:#f1f5f9"><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        ${items.map(it => `<tr><td>${it.Designation}</td><td>${it.Quantity}</td><td>${it.UnitPrice}</td><td>${it.TotalTTC}</td></tr>`).join('')}
      </table>
      <h3 style="text-align:right; margin-top:20px">Total: ${sale.TotalTTC} ${cfg.currency}</h3>
    </div>
  `;
  return { success: true, htmlContent: html };
}

function listClients(token) {
  Security.verify(token, 'Clients', 'READ');
  return DB.getRows('Clients').map(c => ({ id: c.Client_ID, nom: c.Nom, phone: c.Phone }));
}
