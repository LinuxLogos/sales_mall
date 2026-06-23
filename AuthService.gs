/**
 * AuthService - Handles authentication and session management
 */
const AuthService = {
  /**
   * Login user and return session token
   */
  login: function(username, password) {
    const user = UserService.getByUsername(username);
    if (!user) throw new Error('Utilisateur non trouvé');

    if (user.status === 'BLOQUÉ') {
      throw new Error('Compte bloqué après plusieurs échecs');
    }

    const pepper = CONFIG.get('PEPPER');
    const hash = this._hashPassword(password, user.email, pepper);

    if (user.password_hash === hash) {
      // Success
      UserService.resetFailedAttempts(user.id);
      return this._createSession(user);
    } else {
      // Failure
      UserService.incrementFailedAttempts(user.id);
      throw new Error('Mot de passe incorrect');
    }
  },

  /**
   * Internal password hashing using SHA-256
   */
  _hashPassword: function(password, email, pepper) {
    const raw = password + email + pepper;
    const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw);
    return digest.map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
  },

  /**
   * Create and store a session token
   */
  _createSession: function(user) {
    const token = Utilities.getUuid();
    const session = {
      email: user.email,
      token: token,
      last_activity: new Date(),
      ip: this._getClientIp()
    };

    // Store in Sessions sheet (via a helper)
    DatabaseService.insert('Sessions', session);

    return {
      token: token,
      user: {
        id: user.id,
        username: user.username,
        role_id: user.role_id,
        permissions: PermissionService.getForRole(user.role_id)
      }
    };
  },

  _getClientIp: function() {
    // Note: In GAS Web Apps, we don't have direct access to client IP,
    // but we can try to get it if the app is run as the user.
    return "SERVER_SIDE";
  },

  /**
   * Verify if a session token is valid
   */
  verifySession: function(token) {
    const session = DatabaseService.findOne('Sessions', { token: token });
    if (!session) return false;

    // 15 min timeout check
    const now = new Date();
    const lastActivity = new Date(session.last_activity);
    if ((now - lastActivity) > 15 * 60 * 1000) {
      DatabaseService.delete('Sessions', { token: token });
      return false;
    }

    // Update activity
    DatabaseService.update('Sessions', { token: token }, { last_activity: now });
    return true;
  }
};
