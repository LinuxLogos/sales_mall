/**
 * Authentication & User Management Module
 */

function login(email, password) {
  try {
    email = email.trim().toLowerCase();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const usersSheet = ss.getSheetByName('Users');
    const sessionsSheet = ss.getSheetByName('Sessions');

    const usersData = usersSheet.getDataRange().getValues();
    let userRow = -1;
    let userData = null;

    for (let i = 1; i < usersData.length; i++) {
      if (usersData[i][0] === email) {
        userRow = i + 1;
        userData = {
          email: usersData[i][0],
          passwordHash: usersData[i][1],
          fullName: usersData[i][2],
          role: usersData[i][3],
          status: usersData[i][4],
          failedAttempts: usersData[i][6] || 0,
          passwordChangedDate: usersData[i][7]
        };
        break;
      }
    }

    if (!userData) {
      auditLog('LOGIN_FAILED', 'Auth', 'User not found: ' + email, null);
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }

    if (userData.status === 'BLOQUÉ' || userData.status === 'DÉSACTIVÉ') {
      return { success: false, error: 'Compte bloqué ou désactivé' };
    }

    if (userData.failedAttempts >= CONFIG.MAX_LOGIN_ATTEMPTS) {
      usersSheet.getRange(userRow, 5).setValue('BLOQUÉ');
      return { success: false, error: 'Compte bloqué après trop de tentatives' };
    }

    const passwordHash = hashPassword(password, email);
    if (passwordHash !== userData.passwordHash) {
      const newAttempts = userData.failedAttempts + 1;
      usersSheet.getRange(userRow, 7).setValue(newAttempts);
      if (newAttempts >= CONFIG.MAX_LOGIN_ATTEMPTS) {
        usersSheet.getRange(userRow, 5).setValue('BLOQUÉ');
      }
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }

    // Check existing session
    const sessionsData = sessionsSheet.getDataRange().getValues();
    for (let i = 1; i < sessionsData.length; i++) {
      if (sessionsData[i][0] === email) {
        // Option to force logout or allow
        // return { success: false, error: 'Session déjà active', requireForceLogout: true };
      }
    }

    // Check password expiration
    let requirePasswordChange = false;
    if (userData.passwordChangedDate) {
      const passwordChangedDate = new Date(userData.passwordChangedDate);
      const daysSinceChange = Math.floor((new Date() - passwordChangedDate) / (1000 * 60 * 60 * 24));
      requirePasswordChange = daysSinceChange > 90;
    }

    // Create session
    const token = generateUUID();
    const now = new Date();
    sessionsSheet.appendRow([email, token, now, '127.0.0.1', 'WebApp', now]);

    usersSheet.getRange(userRow, 5).setValue('ACTIF');
    usersSheet.getRange(userRow, 6).setValue(now);
    usersSheet.getRange(userRow, 7).setValue(0);

    const permissions = getUserPermissions(userData.role);
    auditLog('LOGIN_SUCCESS', 'Auth', 'User logged in: ' + email, null);

    return {
      success: true,
      token: token,
      user: { email: userData.email, fullName: userData.fullName, role: userData.role, requirePasswordChange: requirePasswordChange },
      permissions: permissions,
      config: getClientConfig()
    };

  } catch (error) {
    Logger.log('ERROR in login: ' + error.message);
    return { success: false, error: 'Erreur de connexion: ' + error.message };
  }
}

function logout(token) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sessionsSheet = ss.getSheetByName('Sessions');
    const data = sessionsSheet.getDataRange().getValues();

    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][1] === token) {
        sessionsSheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    return { success: false, error: 'Session non trouvée' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function validateSession(token) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sessionsSheet = ss.getSheetByName('Sessions');
    const usersSheet = ss.getSheetByName('Users');

    const sessionsData = sessionsSheet.getDataRange().getValues();
    const usersData = usersSheet.getDataRange().getValues();

    for (let i = 1; i < sessionsData.length; i++) {
      if (sessionsData[i][1] === token) {
        const email = sessionsData[i][0];
        const lastActivity = new Date(sessionsData[i][2]);
        const now = new Date();

        if (now - lastActivity > CONFIG.SESSION_TIMEOUT) {
          sessionsSheet.deleteRow(i + 1);
          return { valid: false, error: 'Session expirée' };
        }

        sessionsSheet.getRange(i + 1, 3).setValue(now);

        let userData = null;
        for (let j = 1; j < usersData.length; j++) {
          if (usersData[j][0] === email) {
            userData = { email: usersData[j][0], fullName: usersData[j][2], role: usersData[j][3], status: usersData[j][4] };
            break;
          }
        }

        if (!userData || userData.status !== 'ACTIF') {
          sessionsSheet.deleteRow(i + 1);
          return { valid: false, error: 'Utilisateur invalide' };
        }

        return { valid: true, user: userData, permissions: getUserPermissions(userData.role), config: getClientConfig() };
      }
    }
    return { valid: false, error: 'Session invalide' };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

function changePassword(token, oldPassword, newPassword) {
  try {
    const session = validateSession(token);
    if (!session.valid) return { success: false, error: 'Session invalide' };

    if (!validatePassword(newPassword)) {
      return { success: false, error: 'Le mot de passe doit contenir au moins 12 caractères avec majuscules, minuscules, chiffres et caractères spéciaux' };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const usersSheet = ss.getSheetByName('Users');
    const data = usersSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === session.user.email) {
        const oldPasswordHash = hashPassword(oldPassword, session.user.email);
        if (oldPasswordHash !== data[i][1]) {
          return { success: false, error: 'Ancien mot de passe incorrect' };
        }

        const newPasswordHash = hashPassword(newPassword, session.user.email);
        usersSheet.getRange(i + 1, 2).setValue(newPasswordHash);
        usersSheet.getRange(i + 1, 8).setValue(new Date());

        auditLog('PASSWORD_CHANGED', 'Auth', 'Password changed for: ' + session.user.email, null);
        return { success: true, message: 'Mot de passe changé avec succès' };
      }
    }
    return { success: false, error: 'Utilisateur non trouvé' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function resetPasswordRequest(email) {
  try {
    email = email.trim().toLowerCase();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const usersSheet = ss.getSheetByName('Users');
    const data = usersSheet.getDataRange().getValues();

    let userEmail = null;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email) { userEmail = data[i][0]; break; }
    }

    if (!userEmail) {
      return { success: true, message: 'Si l\'email existe, un code a été envoyé' };
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(new Date().getTime() + 15 * 60 * 1000);

    let resetSheet = ss.getSheetByName('PasswordResets');
    if (!resetSheet) {
      resetSheet = ss.insertSheet('PasswordResets');
      resetSheet.appendRow(['Email', 'ResetCode', 'ExpiresAt', 'Used']);
    }
    resetSheet.appendRow([email, resetCode, expiresAt, false]);

    const companyName = getConfigValue('COMPANY_NAME', 'WMS System');
    MailApp.sendEmail({
      to: email,
      subject: `Réinitialisation - ${companyName}`,
      htmlBody: `<h2>Réinitialisation</h2><p>Code: <strong style="font-size:24px;">${resetCode}</strong></p><p>Expire dans 15 min.</p>`
    });

    return { success: true, message: 'Code envoyé par email' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function verifyResetCode(email, resetCode, newPassword) {
  try {
    email = email.trim().toLowerCase();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const resetSheet = ss.getSheetByName('PasswordResets');
    const usersSheet = ss.getSheetByName('Users');

    if (!resetSheet) return { success: false, error: 'Aucune demande' };

    const data = resetSheet.getDataRange().getValues();
    let resetRow = -1;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email && data[i][1] === resetCode && data[i][3] === false) {
        if (new Date(data[i][2]) < new Date()) return { success: false, error: 'Code expiré' };
        resetRow = i + 1;
        break;
      }
    }

    if (resetRow === -1) return { success: false, error: 'Code invalide' };

    if (!validatePassword(newPassword)) {
      return { success: false, error: 'Mot de passe trop faible' };
    }

    const usersData = usersSheet.getDataRange().getValues();
    for (let i = 1; i < usersData.length; i++) {
      if (usersData[i][0] === email) {
        usersSheet.getRange(i + 1, 2).setValue(hashPassword(newPassword, email));
        usersSheet.getRange(i + 1, 8).setValue(new Date());
        usersSheet.getRange(i + 1, 7).setValue(0);
        resetSheet.getRange(resetRow, 4).setValue(true);
        return { success: true, message: 'Mot de passe réinitialisé' };
      }
    }
    return { success: false, error: 'Utilisateur non trouvé' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function getUserPermissions(role) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Permissions');
  if (!sheet) return {};

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === role) {
      const permissions = {};
      headers.forEach((header, index) => { permissions[header] = data[i][index]; });
      return permissions;
    }
  }
  return {};
}

function checkPermission(token, module, action = 'READ') {
  try {
    const session = validateSession(token);
    if (!session.valid) return false;

    const permissions = session.permissions;
    const moduleKey = `Module_${module.charAt(0).toUpperCase() + module.slice(1)}`;
    const permission = permissions[moduleKey];

    switch (action) {
      case 'READ': return permission === 'READ' || permission === 'WRITE' || permission === 'FULL';
      case 'WRITE': return permission === 'WRITE' || permission === 'FULL';
      case 'FULL': return permission === 'FULL';
      case 'DELETE': return permissions['Can_Delete'] === 'TRUE' && permission === 'FULL';
      default: return false;
    }
  } catch (error) {
    return false;
  }
}

// ==================== USER MANAGEMENT ====================

function getAllUsers(token) {
  try {
    if (!checkPermission(token, 'Admin', 'READ')) throw new Error('Accès refusé');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Users');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const users = [];
    for (let i = 1; i < data.length; i++) {
      const user = {};
      headers.forEach((header, index) => {
        if (header !== 'PasswordHash') user[header] = data[i][index];
      });
      users.push(user);
    }
    return { success: true, users: users };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function createUser(token, userData) {
  try {
    if (!checkPermission(token, 'Admin', 'FULL')) throw new Error('Accès refusé');

    const email = userData.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return { success: false, error: 'Email invalide' };

    if (!validatePassword(userData.password)) {
      return { success: false, error: 'Mot de passe trop faible (min 12 caractères, majuscules, minuscules, chiffres, spéciaux)' };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Users');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email) return { success: false, error: 'Email déjà utilisé' };
    }

    const now = new Date();
    sheet.appendRow([email, hashPassword(userData.password, email), userData.fullName || '', userData.role || 'Caissier', 'ACTIF', '', 0, now, now]);
    auditLog('USER_CREATED', 'Admin', 'User created: ' + email, null, token);
    return { success: true, message: 'Utilisateur créé' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function updateUser(token, email, updates) {
  try {
    if (!checkPermission(token, 'Admin', 'FULL')) throw new Error('Accès refusé');
    email = email.trim().toLowerCase();

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Users');
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email) {
        if (updates.role) sheet.getRange(i + 1, 4).setValue(updates.role);
        if (updates.status) sheet.getRange(i + 1, 5).setValue(updates.status);
        if (updates.fullName) sheet.getRange(i + 1, 3).setValue(updates.fullName);
        auditLog('USER_UPDATED', 'Admin', 'User updated: ' + email, updates, token);
        return { success: true, message: 'Utilisateur mis à jour' };
      }
    }
    return { success: false, error: 'Utilisateur non trouvé' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function deleteUser(token, email) {
  try {
    if (!checkPermission(token, 'Admin', 'DELETE')) throw new Error('Accès refusé');
    email = email.trim().toLowerCase();
    const currentUser = getCurrentUserFromToken(token);
    if (email === currentUser) return { success: false, error: 'Auto-suppression interdite' };

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Users');
    const data = sheet.getDataRange().getValues();

    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][0] === email) {
        sheet.deleteRow(i + 1);
        auditLog('USER_DELETED', 'Admin', 'User deleted: ' + email, null, token);
        return { success: true, message: 'Utilisateur supprimé' };
      }
    }
    return { success: false, error: 'Utilisateur non trouvé' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function getCurrentUserFromToken(token) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sessionsSheet = ss.getSheetByName('Sessions');
  if (!sessionsSheet) return null;
  const data = sessionsSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === token) return data[i][0];
  }
  return null;
}

function auditLog(action, module, description, changes, token = null) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Audit');

    let userEmail = 'SYSTEM';
    let ipAddress = 'SYSTEM';
    let userAgent = 'SYSTEM';

    if (token) {
      const session = validateSession(token);
      if (session.valid) {
        userEmail = session.user.email;
        const sessionsData = ss.getSheetByName('Sessions').getDataRange().getValues();
        for (let i = 1; i < sessionsData.length; i++) {
          if (sessionsData[i][1] === token) {
            ipAddress = sessionsData[i][3] || 'Unknown';
            userAgent = sessionsData[i][4] || 'Unknown';
            break;
          }
        }
      }
    }

    sheet.appendRow([getTimestamp(), userEmail, action, module, changes ? JSON.stringify(changes.oldData) : '', changes ? JSON.stringify(changes.newData) : '', ipAddress, userAgent]);
  } catch (error) {
    Logger.log('ERROR in auditLog: ' + error.message);
  }
}

function getRoles(token) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Roles');
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    const roles = [];
    for (let i = 1; i < data.length; i++) {
      roles.push({ name: data[i][0], description: data[i][1] });
    }
    return roles;
  } catch (error) {
    return [];
  }
}

function createRole(token, roleName, description = '') {
  try {
    if (!checkPermission(token, 'Admin', 'FULL')) throw new Error('Accès refusé');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Roles');
    sheet.appendRow([roleName, description, new Date()]);
    return { success: true, message: 'Rôle créé' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
