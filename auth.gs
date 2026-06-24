/**
 * Auth & Session Management
 */

function login(email, password) {
  try {
    const user = DB.getRows('Users').find(u => u.Email === email.trim().toLowerCase());
    if (!user || user.Status !== 'ACTIF') return { success: false, error: 'Identifiants invalides' };

    const hash = hashPassword(password, email);
    if (hash !== user.PasswordHash) {
      const fails = (user.FailedAttempts || 0) + 1;
      DB.update('Users', 'Email', email, { FailedAttempts: fails, Status: fails >= 3 ? 'BLOQUÉ' : 'ACTIF' });
      return { success: false, error: 'Identifiants invalides' };
    }

    const token = Utilities.getUuid();
    DB.insert('Sessions', { Email: email, Token: token, Role: user.Role, LastActivity: new Date() });
    DB.update('Users', 'Email', email, { FailedAttempts: 0, LastLogin: new Date() });

    audit('LOGIN', 'Auth', `User logged: ${email}`);
    return { success: true, token, user: { name: user.FullName, role: user.Role, email: user.Email } };
  } catch (e) { return { success: false, error: e.message }; }
}

function logout(token) {
  DB.lock(() => {
    const s = DB.sheet('Sessions'), d = s.getDataRange().getValues();
    for (let i = d.length-1; i > 0; i--) if (d[i][1] === token) s.deleteRow(i+1);
  });
  return { success: true };
}

function hashPassword(p, salt) {
  const pepper = PropertiesService.getScriptProperties().getProperty('PEPPER') || 'wms_v2';
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, p + salt + pepper).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function getAllUsers(token) {
  Security.verify(token, 'Admin', 'READ');
  return DB.getRows('Users').map(u => ({ email: u.Email, name: u.FullName, role: u.Role, status: u.Status }));
}
