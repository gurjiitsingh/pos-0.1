const { db } = require("./sqlite.cjs");

function saveFirebaseConfig(config, clientId) {
  db.prepare(`
    INSERT INTO firebase_config (
      id,
      clientId,
      apiKey,
      authDomain,
      databaseURL,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
      measurementId,
      updatedAt
    )
    VALUES (
      1,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?
    )
    ON CONFLICT(id) DO UPDATE SET
      clientId = excluded.clientId,
      apiKey = excluded.apiKey,
      authDomain = excluded.authDomain,
      databaseURL = excluded.databaseURL,
      projectId = excluded.projectId,
      storageBucket = excluded.storageBucket,
      messagingSenderId = excluded.messagingSenderId,
      appId = excluded.appId,
      measurementId = excluded.measurementId,
      updatedAt = excluded.updatedAt
  `).run(
    clientId,
    config.apiKey || "",
    config.authDomain || "",
    config.databaseURL || "",
    config.projectId || "",
    config.storageBucket || "",
    config.messagingSenderId || "",
    config.appId || "",
    config.measurementId || "",
    Date.now()
  );
}

function getFirebaseConfig() {
  return db.prepare(`
    SELECT *
    FROM firebase_config
    WHERE id = 1
  `).get();
}

module.exports = {
  saveFirebaseConfig,
  getFirebaseConfig,
};