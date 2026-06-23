/**
 * WMS - Warehouse Management System
 * Server-side entry point for Google Apps Script Web App
 */

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('WMS - Warehouse Management System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Global configurations stored in Script Properties
 */
const CONFIG = {
  get: (key) => PropertiesService.getScriptProperties().getProperty(key),
  set: (key, value) => PropertiesService.getScriptProperties().setProperty(key, value),
  init: () => {
    if (!CONFIG.get('PEPPER')) {
      CONFIG.set('PEPPER', Utilities.getUuid());
    }
  }
};

// Initialize configuration on load
CONFIG.init();

/**
 * Unified execution handler for all server calls
 */
function api(token, serviceName, methodName, ...args) {
  try {
    // 1. Security Check
    if (serviceName !== 'AuthService' || methodName !== 'login') {
      if (!AuthService.verifySession(token)) {
        throw new Error('Session invalide ou expirée. Veuillez vous reconnecter.');
      }
    }

    const service = this[serviceName];
    if (!service || typeof service[methodName] !== 'function') {
      throw new Error(`Service or method not found: ${serviceName}.${methodName}`);
    }

    // 2. Audit all write operations
    if (/^(save|update|delete|create|process)/i.test(methodName)) {
      AuditService.logAction(`${serviceName}.${methodName}`, { args, token });
    }

    return service[methodName].apply(service, args);
  } catch (error) {
    console.error(`API Error: ${error.message}`);
    throw new Error(`Server Error: ${error.message}`);
  }
}
