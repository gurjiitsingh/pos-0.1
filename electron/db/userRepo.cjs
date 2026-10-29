const { db } = require('./sqlite.cjs');


// =====================================================
// CLEAR USERS
// =====================================================

function clearUsers() {
  db.prepare('DELETE FROM pos_users').run();
}


// =====================================================
// INSERT USERS
// =====================================================

function insertUsers(list) {
  const stmt = db.prepare(`
    INSERT INTO pos_users (
      userId,
      outletId,
      fullName,
      username,
      mobile,
      employeeId,
      role,
      loginPin,
      allowPosLogin,
      isActive,
      createdAt,
      updatedAt,
      syncStatus,
      lastSyncedAt
    ) VALUES (
      @userId,
      @outletId,
      @fullName,
      @username,
      @mobile,
      @employeeId,
      @role,
      @loginPin,
      @allowPosLogin,
      @isActive,
      @createdAt,
      @updatedAt,
      @syncStatus,
      @lastSyncedAt
    )
  `);

  const tx = db.transaction((rows) => {
    for (const row of rows) {
      stmt.run({
        ...row,
       allowPosLogin:
  row.allowPosLogin === undefined
    ? 1
    : row.allowPosLogin
      ? 1
      : 0,

isActive:
  row.isActive === undefined
    ? 1
    : row.isActive
      ? 1
      : 0,
      });
    }
  });

  tx(list);
}


// =====================================================
// GET ALL USERS
// =====================================================
//
// Keep this because your existing sync/debug code
// may already use it.
// =====================================================

function getAllUsers() {
  return db.prepare(`
    SELECT *
    FROM pos_users
    ORDER BY fullName ASC
  `).all();
}


// =====================================================
// GET POS LOGIN USERS
// =====================================================
//
// Only return users who:
//   - are active
//   - are allowed to login to POS
//
// IMPORTANT:
// Do NOT return loginPin here.
// The renderer does not need it.
// =====================================================

function getPosLoginUsers() {
  return db.prepare(`
    SELECT
      userId,
      outletId,
      fullName,
      username,
      mobile,
      employeeId,
      role
    FROM pos_users
    WHERE
      isActive = 1
      AND allowPosLogin = 1
    ORDER BY fullName COLLATE NOCASE ASC
  `).all();
}


// =====================================================
// GET USER FOR LOGIN
// =====================================================
//
// This function is used ONLY by the Electron main
// process to verify the PIN.
//
// loginPin is intentionally returned here because
// verification happens inside Electron/main process.
//
// Never send this result directly to React.
// =====================================================

function getUserForLogin(userId) {
  return db.prepare(`
    SELECT
      userId,
      outletId,
      fullName,
      username,
      mobile,
      employeeId,
      role,
      loginPin,
      allowPosLogin,
      isActive
    FROM pos_users
    WHERE userId = ?
    LIMIT 1
  `).get(userId) || null;
}


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  clearUsers,
  insertUsers,
  getAllUsers,
  getPosLoginUsers,
  getUserForLogin,
};