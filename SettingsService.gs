/**
 * SettingsService - Handles company personalization and global settings
 */
const SettingsService = {
  getAll: function() {
    const rows = DatabaseService.findAll('Settings', {});
    const settings = {};
    rows.forEach(r => settings[r.key] = r.value);
    return settings;
  },

  get: function(key) {
    const row = DatabaseService.findOne('Settings', { key: key });
    return row ? row.value : null;
  },

  save: function(key, value) {
    const existing = DatabaseService.findOne('Settings', { key: key });
    if (existing) {
      DatabaseService.update('Settings', { key: key }, { value: value });
    } else {
      DatabaseService.insert('Settings', { key: key, value: value });
    }
  },

  /**
   * Save multiple settings at once
   */
  saveBatch: function(settingsObject) {
    for (let key in settingsObject) {
      this.save(key, settingsObject[key]);
    }
  }
};
