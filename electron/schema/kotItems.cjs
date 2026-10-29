module.exports = function createKotItemsTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS kot_items (
      id TEXT PRIMARY KEY,
      kotNumber TEXT NOT NULL,
      kotBatchId TEXT NOT NULL,

      sessionId TEXT,
      tableNo TEXT,
      tableName TEXT,

      productId TEXT NOT NULL,
      name TEXT NOT NULL,
      categoryId TEXT NOT NULL,
      categoryName TEXT NOT NULL,

      basePrice REAL NOT NULL,
      finalPrice REAL NOT NULL,
      quantity INTEGER NOT NULL,

      status TEXT NOT NULL DEFAULT 'PENDING',
      note TEXT DEFAULT '',
      modifiersJson TEXT DEFAULT '',

      kitchenPrinted INTEGER NOT NULL DEFAULT 0,
      createdAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_kot_table
      ON kot_items(tableNo);

    CREATE INDEX IF NOT EXISTS idx_kot_batch
      ON kot_items(kotBatchId);
  `);
};