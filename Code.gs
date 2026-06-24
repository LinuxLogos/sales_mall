/**
 * WMS - Warehouse Management System
 * Core Configuration & Unified Services
 */

const CONFIG = {
  APP: 'WMS ERP',
  VERSION: '1.2.0',
  TVA: 0.18,
  TIMEOUT: 15 * 60 * 1000, // 15 mins
  MAX_ATTEMPTS: 3,
  THEME: { primary: '#1A312C', danger: '#8B0000', success: '#1A312C' }
};

/**
 * High-Performance DB Service
 */
const DB = {
  _ss: null,
  get ss() { return this._ss || (this._ss = SpreadsheetApp.getActiveSpreadsheet()); },

  sheet(name) {
    const s = this.ss.getSheetByName(name);
    if (!s) throw new Error(`Sheet ${name} missing`);
    return s;
  },

  getRows(sheetName) {
    const data = this.sheet(sheetName).getDataRange().getValues();
    const headers = data.shift();
    return data.map(row => headers.reduce((acc, h, i) => (acc[h] = row[i], acc), {}));
  },

  insert(sheetName, data) {
    return this.lock(() => {
      const s = this.sheet(sheetName);
      const headers = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0];
      s.appendRow(headers.map(h => data[h] ?? ''));
      return true;
    });
  },

  update(sheetName, key, val, updates) {
    return this.lock(() => {
      const s = this.sheet(sheetName);
      const data = s.getDataRange().getValues();
      const headers = data[0];
      const kIdx = headers.indexOf(key);
      for (let i = 1; i < data.length; i++) {
        if (data[i][kIdx] == val) {
          for (let k in updates) {
            const col = headers.indexOf(k);
            if (col > -1) s.getRange(i + 1, col + 1).setValue(updates[k]);
          }
          return true;
        }
      }
      return false;
    });
  },

  lock(fn) {
    const l = LockService.getScriptLock();
    try {
      l.waitLock(10000);
      return fn();
    } finally { l.releaseLock(); }
  }
};

/**
 * Security & Session Gateway
 */
const Security = {
  verify(token, module, level = 'READ') {
    const session = this.getSession(token);
    if (!session) throw new Error('AUTH_EXPIRED');

    const perms = this.getPerms(session.role);
    const mPerm = perms[`Module_${module}`] || 'NONE';

    const levels = { 'NONE': 0, 'READ': 1, 'WRITE': 2, 'FULL': 3 };
    if (levels[mPerm] < levels[level]) throw new Error('PERMISSION_DENIED');

    return session;
  },

  getSession(token) {
    const sessions = DB.getRows('Sessions');
    const s = sessions.find(s => s.Token === token);
    if (!s || (new Date() - new Date(s.LastActivity) > CONFIG.TIMEOUT)) return null;
    DB.update('Sessions', 'Token', token, { LastActivity: new Date() });
    return s;
  },

  getPerms(role) {
    return DB.getRows('Permissions').find(p => p.Role === role) || {};
  }
};

function doGet() {
  const t = HtmlService.createTemplateFromFile('index');
  // Pre-load basic system data to minimize initial latency
  const config = getClientConfig();
  t.initialData = JSON.stringify({
    config,
    version: CONFIG.VERSION,
    appName: CONFIG.APP
  });
  return t.evaluate()
    .setTitle(config.name || CONFIG.APP)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getClientConfig() {
  const cfg = {};
  DB.getRows('Config').forEach(r => cfg[r.Clé] = r.Valeur);
  return {
    name: cfg.COMPANY_NAME || CONFIG.APP,
    tva: parseFloat(cfg.TVA_RATE || CONFIG.TVA),
    currency: cfg.CURRENCY || 'XOF'
  };
}

function audit(action, module, desc, token = null) {
  const user = token ? Security.getSession(token)?.Email : 'SYSTEM';
  DB.insert('Audit', {
    Timestamp: new Date(),
    UserID: user || 'GUEST',
    Action: action,
    Module: module,
    Description: desc
  });
}
