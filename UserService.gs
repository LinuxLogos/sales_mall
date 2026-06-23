/**
 * UserService - Handles user data operations
 */
const UserService = {
  getByUsername: function(username) {
    return DatabaseService.findOne('Users', { username: username });
  },

  getById: function(id) {
    return DatabaseService.findOne('Users', { id: id });
  },

  incrementFailedAttempts: function(userId) {
    const user = this.getById(userId);
    if (!user) return;

    const attempts = (user.failed_attempts || 0) + 1;
    const status = attempts >= 3 ? 'BLOQUÉ' : user.status;

    DatabaseService.update('Users', { id: userId }, {
      failed_attempts: attempts,
      status: status
    });
  },

  resetFailedAttempts: function(userId) {
    DatabaseService.update('Users', { id: userId }, {
      failed_attempts: 0,
      last_login: new Date()
    });
  },

  /**
   * Create a new user with secure hashing
   */
  create: function(userData) {
    const pepper = CONFIG.get('PEPPER');
    userData.password_hash = AuthService._hashPassword(userData.password, userData.email, pepper);
    delete userData.password;

    userData.id = Utilities.getUuid();
    userData.status = 'ACTIF';
    userData.failed_attempts = 0;

    DatabaseService.insert('Users', userData);
    return userData.id;
  },

  updatePassword: function(userId, newPassword) {
    const user = this.getById(userId);
    if (!user) throw new Error('Utilisateur non trouvé');

    const pepper = CONFIG.get('PEPPER');
    const hash = AuthService._hashPassword(newPassword, user.email, pepper);

    DatabaseService.update('Users', { id: userId }, { password_hash: hash });
  },

  getAll: function() {
    return DatabaseService.findAll('Users', {});
  }
};
