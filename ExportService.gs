/**
 * ExportService - Handles CSV and PDF generation
 */
const ExportService = {
  /**
   * Generate CSV from sheet data
   */
  generateCsv: function(sheetName, filters) {
    const data = DatabaseService.findAll(sheetName, filters || {});
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const rows = data.map(item => headers.map(h => JSON.stringify(item[h])).join(','));

    return headers.join(',') + '\n' + rows.join('\n');
  },

  /**
   * PDF generation placeholder (logic normally uses a template or library)
   */
  generateInvoicePdf: function(ticketId) {
    const sale = DatabaseService.findOne('Sales', { ticket_id: ticketId });
    if (!sale) throw new Error('Vente non trouvée');

    const items = DatabaseService.findAll('SaleItems', { ticket_id: ticketId });
    const settings = SettingsService.getAll();

    // In GAS, we typically generate HTML and convert to PDF
    const html = `
      <html>
        <body>
          <h1>${settings.company_name || 'WMS'}</h1>
          <p>${settings.address || ''}, ${settings.city || ''}</p>
          <hr/>
          <h3>Facture #${ticketId}</h3>
          <p>Date: ${sale.date}</p>
          <table border="1">
            <tr><th>Article</th><th>Qté</th><th>Prix</th><th>Total</th></tr>
            ${items.map(it => `<tr><td>${it.SKU}</td><td>${it.quantity}</td><td>${it.unit_price}</td><td>${it.quantity * it.unit_price}</td></tr>`).join('')}
          </table>
          <h4>Total TTC: ${sale.total_ttc}</h4>
        </body>
      </html>
    `;

    const blob = HtmlService.createHtmlOutput(html).getAs('application/pdf');
    return Utilities.base64Encode(blob.getBytes());
  }
};
