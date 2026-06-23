/**
 * PermissionService - Handles RBAC matrix and permissions check
 */
const PermissionService = {
  /**
   * Get all permissions for a specific role
   */
  getForRole: function(roleId) {
    const permissions = DatabaseService.findAll('Permissions', { role_id: roleId });
    const matrix = {};
    permissions.forEach(p => {
      matrix[p.module] = p.level; // NONE, READ, WRITE, FULL
    });
    return matrix;
  },

  /**
   * Update permission for a role and module
   */
  update: function(roleId, module, level) {
    const existing = DatabaseService.findOne('Permissions', { role_id: roleId, module: module });
    if (existing) {
      DatabaseService.update('Permissions', { role_id: roleId, module: module }, { level: level });
    } else {
      DatabaseService.insert('Permissions', {
        role_id: roleId,
        module: module,
        level: level
      });
    }
  },

  /**
   * Server-side permission check
   */
  check: function(roleId, module, requiredLevel) {
    const permissions = this.getForRole(roleId);
    const userLevel = permissions[module] || 'NONE';

    const levels = ['NONE', 'READ', 'WRITE', 'FULL'];
    return levels.indexOf(userLevel) >= levels.indexOf(requiredLevel);
  }
};
