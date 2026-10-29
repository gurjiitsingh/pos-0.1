module.exports = function createOrderItemsTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      categoryName TEXT NOT NULL,
      productMode TEXT NOT NULL,
      currentStock REAL DEFAULT 0,

      orderMasterId TEXT NOT NULL,
      productId TEXT NOT NULL,

      createdById TEXT DEFAULT '',
      createdByName TEXT DEFAULT '',

      name TEXT NOT NULL,
      categoryId TEXT NOT NULL,

      parentId TEXT,
      isVariant INTEGER NOT NULL DEFAULT 0,

      basePrice REAL NOT NULL,
      quantity INTEGER NOT NULL,
      itemSubtotal REAL NOT NULL,

      currency TEXT,
      paymentStatus TEXT,

      taxRate REAL NOT NULL DEFAULT 0,
      taxType TEXT NOT NULL DEFAULT 'exclusive',

      taxRate1 REAL,
      taxType1 TEXT,

      taxAmountPerItem REAL NOT NULL DEFAULT 0,
      taxTotal REAL NOT NULL DEFAULT 0,

      note TEXT DEFAULT '',
      modifiersJson TEXT DEFAULT '',
      modifierPrice REAL DEFAULT 0,
      modifierSummary TEXT DEFAULT '',

      finalPricePerItem REAL NOT NULL,
      finalTotal REAL NOT NULL,

      source TEXT DEFAULT 'POS',
      createdAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_order
      ON order_items(orderMasterId);

    CREATE INDEX IF NOT EXISTS idx_order_items_product
      ON order_items(productId);

    CREATE INDEX IF NOT EXISTS idx_order_items_created
      ON order_items(createdAt);
  `);
};