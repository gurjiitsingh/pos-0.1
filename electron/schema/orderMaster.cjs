module.exports = function createOrderMasterTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_master (
      id TEXT PRIMARY KEY,
      srno TEXT NOT NULL,
      orderType TEXT NOT NULL,
      tableNo TEXT,

      saleType TEXT DEFAULT '',
      reason TEXT DEFAULT '',

      customerName TEXT,
      customerPhone TEXT,
      customerId TEXT,

      createdById TEXT DEFAULT '',
      createdByName TEXT DEFAULT '',
      finalizedById TEXT DEFAULT '',
      finalizedByName TEXT DEFAULT '',

      dAddressLine1 TEXT,
      dAddressLine2 TEXT,
      dCity TEXT,
      dState TEXT,
      dZipcode TEXT,
      dLandmark TEXT,

      deliveryFee REAL DEFAULT 0,
      deliveryTax REAL DEFAULT 0,

      itemTotal REAL NOT NULL,
      itemTax REAL DEFAULT 0,
      taxTotal REAL NOT NULL,
      discountTotal REAL NOT NULL,
      grandTotal REAL NOT NULL,

      paymentMode TEXT NOT NULL,
      paymentStatus TEXT NOT NULL,
      paidAmount REAL DEFAULT 0,
      dueAmount REAL DEFAULT 0,

      orderStatus TEXT NOT NULL,

      source TEXT DEFAULT 'POS',
      deviceId TEXT NOT NULL,
      deviceName TEXT,
      appVersion TEXT,

      businessDate TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER,

      syncStatus TEXT NOT NULL,
      lastSyncedAt INTEGER,

      notes TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_order_master_sync
      ON order_master(syncStatus);

    CREATE INDEX IF NOT EXISTS idx_order_master_created
      ON order_master(createdAt);

    CREATE INDEX IF NOT EXISTS idx_order_master_type
      ON order_master(orderType);
  `);
};