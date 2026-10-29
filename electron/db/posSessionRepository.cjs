const crypto = require("crypto");


// =====================================================
// POS SESSION REPOSITORY
// =====================================================

class PosSessionRepository {

  constructor(db) {
    this.db = db;
  }


  // ===================================================
  // CREATE SESSION
  // ===================================================

  createSession(user) {

    // -------------------------------------------------
    // Close any previous active session
    // -------------------------------------------------

    this.db
      .prepare(`
        UPDATE pos_sessions
        SET
          isActive = 0,
          logoutAt = ?
        WHERE isActive = 1
      `)
      .run(Date.now());


    // -------------------------------------------------
    // New session ID
    // -------------------------------------------------

    const sessionId =
      crypto.randomUUID();


    const now =
      Date.now();


    // -------------------------------------------------
    // Create session
    // -------------------------------------------------

    this.db
      .prepare(`
        INSERT INTO pos_sessions (
          sessionId,
          userId,
          outletId,
          fullName,
          employeeId,
          role,
          loginAt,
          logoutAt,
          lastActivityAt,
          isActive
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, 1)
      `)
      .run(
        sessionId,
        user.userId,
        user.outletId,
        user.fullName,
        user.employeeId || null,
        user.role || null,
        now,
        now
      );


    return this.getActiveSession();
  }


  // ===================================================
  // GET ACTIVE SESSION
  // ===================================================

  getActiveSession() {

    return this.db
      .prepare(`
        SELECT
          sessionId,
          userId,
          outletId,
          fullName,
          employeeId,
          role,
          loginAt,
          logoutAt,
          lastActivityAt,
          isActive
        FROM pos_sessions
        WHERE isActive = 1
        LIMIT 1
      `)
      .get() || null;
  }


  // ===================================================
  // UPDATE ACTIVITY
  // ===================================================

  updateActivity(sessionId) {

    this.db
      .prepare(`
        UPDATE pos_sessions
        SET lastActivityAt = ?
        WHERE sessionId = ?
          AND isActive = 1
      `)
      .run(
        Date.now(),
        sessionId
      );
  }


  // ===================================================
  // CLOSE SESSION
  // ===================================================

  closeSession(sessionId) {

    this.db
      .prepare(`
        UPDATE pos_sessions
        SET
          isActive = 0,
          logoutAt = ?,
          lastActivityAt = ?
        WHERE sessionId = ?
          AND isActive = 1
      `)
      .run(
        Date.now(),
        Date.now(),
        sessionId
      );

    return true;
  }


  // ===================================================
  // CLOSE CURRENT SESSION
  // ===================================================

  closeActiveSession() {

    this.db
      .prepare(`
        UPDATE pos_sessions
        SET
          isActive = 0,
          logoutAt = ?,
          lastActivityAt = ?
        WHERE isActive = 1
      `)
      .run(
        Date.now(),
        Date.now()
      );

    return true;
  }

}


module.exports = PosSessionRepository;