/**
 * WMS - Warehouse Management System
 * Core Service: Unified API Gateway & Initialization
 */

const CONFIG = {
  APP: 'WMS ERP',
  VERSION: '2.0.0',
  TIMEOUT: 15 * 60 * 1000,
  TVA: 0.18,
  COLORS: { primary: '#1A312C', danger: '#8B0000' }
};

/**
 * High-Performance DB Manager
 */
const DB = {
  _cache: {},
  get ss() { return this._ss || (this._ss = SpreadsheetApp.getActiveSpreadsheet()); },
  sheet(n) { return this.ss.getSheetByName(n) || this.ss.insertSheet(n); },

  getRows(n) {
    if (this._cache[n]) return this._cache[n];
    const data = this.sheet(n).getDataRange().getValues();
    const headers = data.shift();
    return (this._cache[n] = data.map(r => headers.reduce((acc, h, i) => (acc[h] = r[i], acc), {})));
  },

  insert(n, data) {
    return this.lock(() => {
      const s = this.sheet(n);
      const headers = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0];
      s.appendRow(headers.map(h => data[h] ?? ''));
      delete this._cache[n];
      return true;
    });
  },

  update(n, key, val, updates) {
    return this.lock(() => {
      const s = this.sheet(n), d = s.getDataRange().getValues(), h = d[0], kIdx = h.indexOf(key);
      for (let i = 1; i < d.length; i++) {
        if (d[i][kIdx] == val) {
          for (let k in updates) {
            const cIdx = h.indexOf(k);
            if (cIdx > -1) s.getRange(i + 1, cIdx + 1).setValue(updates[k]);
          }
          delete this._cache[n];
          return true;
        }
      }
      return false;
    });
  },

  lock(fn) {
    const l = LockService.getScriptLock();
    try { l.waitLock(10000); return fn(); } finally { l.releaseLock(); }
  }
};

/**
 * Unified Security Gateway
 */
const Security = {
  verify(token, mod, level = 'READ') {
    const session = DB.getRows('Sessions').find(s => s.Token === token);
    if (!session || (new Date() - new Date(session.LastActivity) > CONFIG.TIMEOUT)) throw new Error('AUTH_EXPIRED');

    const perm = (DB.getRows('Permissions').find(p => p.Role === session.Role) || {})[`Module_${mod}`] || 'NONE';
    const lvls = { NONE: 0, READ: 1, WRITE: 2, FULL: 3 };
    if (lvls[perm] < lvls[level]) throw new Error('PERMISSION_DENIED');

    DB.update('Sessions', 'Token', token, { LastActivity: new Date() });
    return session;
  }
};

function doGet() {
  const t = HtmlService.createTemplateFromFile('index');
  const cfg = {}; DB.getRows('Config').forEach(r => cfg[r.Clé] = r.Valeur);

  // Pre-load essential data for <1s perceived load time
  t.init = JSON.stringify({
    app: CONFIG.APP,
    company: cfg.COMPANY_NAME || CONFIG.APP,
    currency: cfg.CURRENCY || 'XOF',
    version: CONFIG.VERSION
  });

  return t.evaluate()
    .setTitle(CONFIG.APP)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function audit(action, mod, desc, token = null) {
  const user = token ? DB.getRows('Sessions').find(s => s.Token === token)?.Email : 'SYSTEM';
  DB.insert('Audit', { Timestamp: new Date(), UserID: user || 'GUEST', Action: action, Module: mod, Description: desc });
}

function getClientConfig() {
  const cfg = {};
  DB.getRows('Config').forEach(r => cfg[r.Clé] = r.Valeur);
  return { name: cfg.COMPANY_NAME, tva: parseFloat(cfg.TVA_RATE || CONFIG.TVA), currency: cfg.CURRENCY || 'XOF' };
}
