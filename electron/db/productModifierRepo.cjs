const { db } = require('./sqlite.cjs');

async function clearProductModifiers() {
  db.prepare(
    'DELETE FROM product_modifiers'
  ).run();
}

async function insertProductModifiers(list) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO product_modifiers (
      id, productId, groupId, sortOrder
    ) VALUES (
      @id, @productId, @groupId, @sortOrder
    )
  `);

  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      stmt.run({
        id: row.id,
        productId: row.productId ?? '',
        groupId: row.groupId ?? '',
        sortOrder:
          Number(row.sortOrder ?? 0),
      });
    }
  });

  insertMany(list);
}

async function getProductModifiers(
  productId
) {
  return db
    .prepare(
      `
      SELECT * FROM product_modifiers
      WHERE productId = ?
      ORDER BY sortOrder ASC
    `
    )
    .all(productId);
}

module.exports = {
  clearProductModifiers,
  insertProductModifiers,
  getProductModifiers,
};