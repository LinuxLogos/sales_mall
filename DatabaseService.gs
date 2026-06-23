/**
 * DatabaseService - Core helper for Google Sheets operations
 */
const DatabaseService = {
  _getSpreadsheet: function() {
    // In a real environment, you would use SpreadsheetApp.getActiveSpreadsheet()
    // or SpreadsheetApp.openById(ID)
    return SpreadsheetApp.getActiveSpreadsheet();
  },

  _getSheet: function(sheetName) {
    const ss = this._getSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    return sheet;
  },

  /**
   * Insert a new row from an object
   */
  insert: function(sheetName, data) {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = this._getSheet(sheetName);
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const row = headers.map(h => data[h] !== undefined ? data[h] : "");
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Find a single record matching criteria
   */
  findOne: function(sheetName, criteria) {
    const data = this.findAll(sheetName, criteria);
    return data.length > 0 ? data[0] : null;
  },

  /**
   * Find all records matching criteria
   */
  findAll: function(sheetName, criteria) {
    const sheet = this._getSheet(sheetName);
    if (sheet.getLastRow() < 2) return [];

    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const results = [];

    for (let i = 1; i < rows.length; i++) {
      const item = {};
      headers.forEach((h, j) => item[h] = rows[i][j]);

      let match = true;
      for (let key in criteria) {
        if (item[key] != criteria[key]) {
          match = false;
          break;
        }
      }
      if (match) results.push(item);
    }
    return results;
  },

  /**
   * Update records matching criteria (Batched)
   */
  update: function(sheetName, criteria, newData) {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = this._getSheet(sheetName);
      const range = sheet.getDataRange();
      const values = range.getValues();
      const headers = values[0];
      let modified = false;

      for (let i = 1; i < values.length; i++) {
        const item = {};
        headers.forEach((h, j) => item[h] = values[i][j]);

        let match = true;
        for (let key in criteria) {
          if (item[key] != criteria[key]) {
            match = false;
            break;
          }
        }

        if (match) {
          for (let key in newData) {
            const colIndex = headers.indexOf(key);
            if (colIndex > -1) {
              values[i][colIndex] = newData[key];
              modified = true;
            }
          }
        }
      }

      if (modified) {
        range.setValues(values);
      }
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Delete records matching criteria (Batched)
   */
  delete: function(sheetName, criteria) {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = this._getSheet(sheetName);
      const values = sheet.getDataRange().getValues();
      const headers = values[0];

      const newValues = [headers];
      let modified = false;

      for (let i = 1; i < values.length; i++) {
        const item = {};
        headers.forEach((h, j) => item[h] = values[i][j]);

        let match = true;
        for (let key in criteria) {
          if (item[key] != criteria[key]) {
            match = false;
            break;
          }
        }

        if (match) {
          modified = true;
        } else {
          newValues.push(values[i]);
        }
      }

      if (modified) {
        sheet.clearContents();
        sheet.getRange(1, 1, newValues.length, headers.length).setValues(newValues);
      }
    } finally {
      lock.releaseLock();
    }
  }
};
