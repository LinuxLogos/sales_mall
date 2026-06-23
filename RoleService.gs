/**
 * RoleService - Handles roles management
 */
const RoleService = {
  getAll: function() {
    return DatabaseService.findAll('Roles', {});
  },

  getById: function(id) {
    return DatabaseService.findOne('Roles', { id: id });
  },

  create: function(name) {
    const role = {
      id: Utilities.getUuid(),
      name: name
    };
    DatabaseService.insert('Roles', role);
    return role;
  }
};
