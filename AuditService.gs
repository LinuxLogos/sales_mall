/**
 * AuditService - Immutable logging of all operations
 */
const AuditService = {
  /**
   * Log an action to the Audit sheet
   */
  logAction: function(action, details, oldState = null, newState = null) {
    const log = {
      timestamp: new Date(),
      user_id: Session.getActiveUser().getEmail(), // In GAS, this is the executor
      ip: "SERVER",
      browser: "GAS_RUNTIME",
      action: action,
      details: typeof details === 'object' ? JSON.stringify(details) : details,
      old_state: oldState ? JSON.stringify(oldState) : "",
      new_state: newState ? JSON.stringify(newState) : ""
    };

    // Low level insert to avoid recursion
    this._directInsert('Audit', log);
  },

  _directInsert: function(sheetName, data) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) sheet = ss.insertSheet(sheetName);

    // Check for headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(Object.keys(data));
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(h => data[h] !== undefined ? data[h] : "");
    sheet.appendRow(row);
  },

  getAll: function() {
    return DatabaseService.findAll('Audit', {});
  }
};
