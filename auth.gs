/**
 * Auth & User Services
 */

function login(email, password) {
  try {
    const user = DB.getRows('Users').find(u => u.Email === email.trim().toLowerCase());
    if (!user) return { success: false, error: 'User missing' };

    if (['BLOQUÉ', 'DÉSACTIVÉ'].includes(user.Status)) return { success: false, error: 'Account disabled' };

    const hash = hashPassword(password, email);
    if (hash !== user.PasswordHash) {
      const attempts = (user.FailedAttempts || 0) + 1;
      DB.update('Users', 'Email', email, { FailedAttempts: attempts, Status: attempts >= 3 ? 'BLOQUÉ' : user.Status });
      return { success: false, error: 'Invalid password' };
    }

    const token = Utilities.getUuid();
    DB.insert('Sessions', { Email: email, Token: token, LastActivity: new Date(), CreatedAt: new Date() });
    DB.update('Users', 'Email', email, { FailedAttempts: 0, LastLogin: new Date() });

    audit('LOGIN', 'Auth', `Connexion utilisateur: ${email}`);

    return {
      success: true,
      token,
      user: { email: user.Email, name: user.FullName, role: user.Role },
      config: getClientConfig()
    };
  } catch (e) { return { success: false, error: e.message }; }
}

function logout(token) {
  const l = LockService.getScriptLock();
  l.waitLock(5000);
  const s = DB.sheet('Sessions');
  const d = s.getDataRange().getValues();
  for (let i = d.length - 1; i >= 1; i--) {
    if (d[i][1] === token) s.deleteRow(i + 1);
  }
  l.releaseLock();
  return { success: true };
}

function hashPassword(p, salt) {
  const pepper = PropertiesService.getScriptProperties().getProperty('PEPPER') || 'wms_v2';
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, p + salt + pepper)
    .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function getAllUsers(token) {
  Security.verify(token, 'Admin', 'READ');
  return { success: true, users: DB.getRows('Users').map(u => ({ Email: u.Email, FullName: u.FullName, Role: u.Role, Status: u.Status })) };
}
