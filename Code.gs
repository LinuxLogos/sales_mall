/**
 * WMS - Warehouse Management System
 * Application ERP/POS complète
 */

const CONFIG = {
  APP_NAME: 'WMS Warehouse Management System',
  VERSION: '1.0.0',
  CURRENCY: 'XOF',
  DEFAULT_TVA: 0.18,
  SESSION_TIMEOUT: 15 * 60 * 1000,
  MAX_LOGIN_ATTEMPTS: 3,
  PASSWORD_MIN_LENGTH: 12,
  CACHE_EXPIRY: 300,
  GOLDEN_RATIO: 1.618,
  COLORS: {
    primary: '#1A312C',
    primaryDark: '#0f1f1c',
    primaryLight: '#2d4a43',
    white: '#ffffff',
    black: '#000000',
    danger: '#8B0000',
    dangerLight: '#a52a2a',
    success: '#1A312C',
    warning: '#f59e0b',
    bgLight: '#f8fafc',
    border: '#e2e8f0'
  }
};

let _cachedSpreadsheet = null;

function doGet(e) {
  try {
    initializeSystem();
    const template = HtmlService.createTemplateFromFile('index');
    template.appConfig = JSON.stringify(CONFIG);
    return template.evaluate()
      .setTitle(CONFIG.APP_NAME)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    return HtmlService.createHtmlOutput('<h1>Erreur: ' + error.message + '</h1>');
  }
}

function initializeSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const requiredSheets = [
    'Config', 'Users', 'Sessions', 'Permissions', 'Roles',
    'Products', 'Stock', 'StockMovements', 'Lots', 'Categories',
    'Sales', 'SaleItems', 'Clients', 'SpecialClients',
    'Promotions', 'Suppliers', 'Transfers',
    'Journal', 'Audit'
  ];

  requiredSheets.forEach(sheetName => {
    if (!ss.getSheetByName(sheetName)) {
      const sheet = ss.insertSheet(sheetName);
      initializeSheet(sheetName, sheet);
    }
  });

  initializeDefaultAdmin();
  initializeDefaultConfig();
}

function initializeSheet(sheetName, sheet) {
  const headers = {
    'Config': ['Clé', 'Valeur', 'Description'],
    'Users': ['Email', 'PasswordHash', 'FullName', 'Role', 'Status', 'LastLogin', 'FailedAttempts', 'PasswordChangedDate', 'CreatedAt'],
    'Sessions': ['Email', 'Token', 'LastActivity', 'IPAddress', 'UserAgent', 'CreatedAt'],
    'Permissions': ['Role', 'Module_Vente', 'Module_Stock', 'Module_Inventaire', 'Module_Comptabilite', 'Module_Clients', 'Module_Rapports', 'Module_Admin', 'Can_Delete', 'Can_Modify_Price', 'Can_Annul_Ticket'],
    'Roles': ['Nom_Role', 'Description', 'CreatedAt'],
    'Products': ['SKU', 'CodeBarres', 'Designation', 'Categorie', 'PrixAchat', 'PrixVente', 'TVA_Rate', 'StockAlert', 'Unite', 'Supplier_ID', 'CreatedAt', 'UpdatedAt'],
    'Stock': ['SKU', 'Site_ID', 'Allée', 'Colonne', 'Étagère', 'StockPhysique', 'StockReserve', 'StockDisponible', 'Lot_ID', 'DateExpiration', 'LastUpdate'],
    'StockMovements': ['Timestamp', 'UserID', 'Type_Mouvement', 'SKU', 'Variation', 'Solde_Apres', 'Reference_Ticket', 'Site_ID', 'Allée', 'Colonne', 'Étagère', 'Lot_ID', 'Notes'],
    'Lots': ['Lot_ID', 'SKU', 'DateReception', 'DateExpiration', 'Quantite_Initiale', 'Quantite_Restante', 'Supplier_ID', 'Status'],
    'Sales': ['TicketNumber', 'Timestamp', 'UserID', 'Client_ID', 'Site_ID', 'Caisse_ID', 'TotalHT', 'TotalTVA', 'TotalTTC', 'PaymentMethod', 'PaymentStatus', 'Status', 'Reduction_Amount', 'Reduction_Percent'],
    'SaleItems': ['TicketNumber', 'LineNumber', 'SKU', 'Designation', 'Quantity', 'UnitPrice', 'TVA_Rate', 'TotalHT', 'TotalTTC', 'Lot_ID'],
    'Clients': ['Client_ID', 'Nom', 'Email', 'Phone', 'Address', 'City', 'Country', 'NIF', 'Type_Client', 'CreatedAt', 'IsActive'],
    'SpecialClients': ['Client_ID', 'TVA_Rate', 'Reduction_Percent', 'Reduction_Amount', 'ValidFrom', 'ValidTo', 'IsActive', 'Notes'],
    'Promotions': ['Promo_ID', 'SKU', 'Reduction_Percent', 'Reduction_Amount', 'ValidFrom', 'ValidTo', 'IsActive', 'Priority'],
    'Suppliers': ['Supplier_ID', 'Name', 'Contact', 'Phone', 'Email', 'Address', 'City', 'Country', 'NIF', 'PaymentTerms', 'IsActive'],
    'Transfers': ['Transfer_ID', 'Timestamp', 'From_Site', 'To_Site', 'UserID', 'Status', 'Items_JSON', 'ValidatedBy', 'ValidatedAt'],
    'Categories': ['ID', 'Nom', 'Description', 'CreatedAt'],
    'Journal': ['Timestamp', 'UserID', 'Type_Mouvement', 'SKU', 'Variation', 'Solde_Apres_Operation', 'Reference_Ticket', 'Lot_ID', 'DateExpiration', 'Hash'],
    'Audit': ['Timestamp', 'UserID', 'Action', 'Module', 'Description', 'OldData', 'NewData', 'IPAddress', 'UserAgent']
  };

  if (headers[sheetName]) {
    sheet.appendRow(headers[sheetName]);
    sheet.getRange(1, 1, 1, headers[sheetName].length)
      .setBackground('#1A312C')
      .setFontColor('white')
      .setFontWeight('bold');
  }

  // Add default data for specific sheets
  if (sheetName === 'Config') {
    const defaults = [
      ['COMPANY_NAME', 'WMS Warehouse Management System', 'Nom de l\'entreprise'],
      ['COMPANY_ADDRESS', '', 'Adresse complète'],
      ['COMPANY_CITY', 'Lomé', 'Ville'],
      ['COMPANY_COUNTRY', 'Togo', 'Pays'],
      ['COMPANY_PHONE', '', 'Téléphone'],
      ['COMPANY_EMAIL', '', 'Email'],
      ['COMPANY_NIF', '', 'Numéro d\'identification fiscale'],
      ['TVA_RATE', '0.18', 'Taux de TVA par défaut'],
      ['CURRENCY', 'XOF', 'Devise'],
      ['CURRENCY_SYMBOL', 'FCFA', 'Symbole monétaire']
    ];
    defaults.forEach(row => sheet.appendRow(row));
  }

  if (sheetName === 'Permissions') {
    const perms = [
      ['Super_Admin', 'FULL', 'FULL', 'FULL', 'FULL', 'FULL', 'FULL', 'FULL', 'TRUE', 'TRUE', 'TRUE'],
      ['Gestionnaire', 'WRITE', 'FULL', 'FULL', 'READ', 'WRITE', 'FULL', 'NONE', 'FALSE', 'TRUE', 'TRUE'],
      ['Caissier', 'WRITE', 'READ', 'NONE', 'NONE', 'READ', 'NONE', 'NONE', 'FALSE', 'FALSE', 'FALSE'],
      ['Comptable', 'READ', 'READ', 'READ', 'FULL', 'READ', 'FULL', 'NONE', 'FALSE', 'FALSE', 'FALSE']
    ];
    perms.forEach(row => sheet.appendRow(row));
  }

  if (sheetName === 'Roles') {
    sheet.appendRow(['Super_Admin', 'Administrateur système', new Date()]);
    sheet.appendRow(['Gestionnaire', 'Gestionnaire de stock', new Date()]);
    sheet.appendRow(['Caissier', 'Opérateur de caisse', new Date()]);
    sheet.appendRow(['Comptable', 'Responsable comptable', new Date()]);
  }

  // Protect sensitive sheets
  if (['Journal', 'Audit'].includes(sheetName)) {
    protectSheet(sheet);
  }
}

function protectSheet(sheet) {
  const protection = sheet.protect().setDescription('Protected - Admin Only');
  const me = Session.getEffectiveUser();
  protection.addEditor(me);
  protection.removeEditors(protection.getEditors());
  if (protection.canDomainEdit()) {
    protection.setDomainEdit(false);
  }
}

function initializeDefaultConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Config');
  if (!sheet || sheet.getLastRow() <= 1) {
    if (!sheet) {
      const newSheet = ss.insertSheet('Config');
      initializeSheet('Config', newSheet);
    }
  }
}

function initializeDefaultAdmin() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Users');

  if (!sheet || sheet.getLastRow() <= 1) {
    if (!sheet) {
      const newSheet = ss.insertSheet('Users');
      initializeSheet('Users', newSheet);
    }

    const defaultEmail = 'admin@wms.local';
    const defaultPassword = 'Admin123!@#';
    const passwordHash = hashPassword(defaultPassword, defaultEmail);

    sheet.appendRow([
      defaultEmail, passwordHash, 'Administrateur',
      'Super_Admin', 'ACTIF', '', 0, new Date(), new Date()
    ]);

    Logger.log('Default admin created: ' + defaultEmail);
  }
}

// ==================== UTILITY FUNCTIONS ====================

function generateUUID() {
  return Utilities.getUuid();
}

function generateTicketNumber(siteID, caisseID) {
  const now = new Date();
  const dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyMMdd');
  const key = `TICKET_SEQ_${siteID}_${caisseID}_${dateStr}`;

  let seq = PropertiesService.getScriptProperties().getProperty(key);
  seq = seq ? parseInt(seq) + 1 : 1;
  PropertiesService.getScriptProperties().setProperty(key, seq.toString());

  return `${siteID}-${caisseID}-${dateStr}-${Utilities.formatString('%04d', seq)}`;
}

function hashPassword(password, salt = '') {
  const pepper = PropertiesService.getScriptProperties().getProperty('PEPPER') || 'wms_default_pepper_2024';
  const toHash = password + salt + pepper;
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, toHash);
  return digest.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function generateHash(data) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, JSON.stringify(data))
    .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function getTimestamp() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
  return regex.test(password);
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>\"']/g, '');
}

// ==================== CACHE & LOCK ====================

function getFromCache(key) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(key);
  return cached ? JSON.parse(cached) : null;
}

function setInCache(key, data, expiration = CONFIG.CACHE_EXPIRY) {
  CacheService.getScriptCache().put(key, JSON.stringify(data), expiration);
}

function invalidateCache(key) {
  CacheService.getScriptCache().remove(key);
}

function executeWithLock(lockKey, callback, timeout = 30000) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(timeout);
    return callback();
  } finally {
    lock.releaseLock();
  }
}

// ==================== CONFIG HELPERS ====================

function getConfigValue(key, defaultValue = '') {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Config');
  if (!sheet) return defaultValue;

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) return data[i][1];
  }
  return defaultValue;
}

function setConfigValue(key, value, description = '') {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Config');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      if (description) sheet.getRange(i + 1, 3).setValue(description);
      return true;
    }
  }
  sheet.appendRow([key, value, description]);
  return true;
}

function getClientConfig() {
  return {
    appName: CONFIG.APP_NAME,
    version: CONFIG.VERSION,
    currency: getConfigValue('CURRENCY', 'XOF'),
    currencySymbol: getConfigValue('CURRENCY_SYMBOL', 'FCFA'),
    defaultTVA: parseFloat(getConfigValue('TVA_RATE', '0.18')),
    sessionTimeout: CONFIG.SESSION_TIMEOUT,
    goldenRatio: CONFIG.GOLDEN_RATIO,
    company: {
      name: getConfigValue('COMPANY_NAME', ''),
      address: getConfigValue('COMPANY_ADDRESS', ''),
      city: getConfigValue('COMPANY_CITY', ''),
      country: getConfigValue('COMPANY_COUNTRY', ''),
      phone: getConfigValue('COMPANY_PHONE', ''),
      email: getConfigValue('COMPANY_EMAIL', ''),
      nif: getConfigValue('COMPANY_NIF', '')
    }
  };
}
