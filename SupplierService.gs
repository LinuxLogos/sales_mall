/**
 * SupplierService - Handles supplier management
 */
const SupplierService = {
  getAll: function() {
    return DatabaseService.findAll('Suppliers', {});
  },

  getById: function(id) {
    return DatabaseService.findOne('Suppliers', { id: id });
  },

  create: function(supplierData) {
    supplierData.id = Utilities.getUuid();
    DatabaseService.insert('Suppliers', supplierData);
    return supplierData.id;
  },

  update: function(id, supplierData) {
    DatabaseService.update('Suppliers', { id: id }, supplierData);
  }
};
