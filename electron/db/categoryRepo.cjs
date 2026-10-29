const { db } = require('./sqlite.cjs');

async function clearCategories() {
  db.prepare('DELETE FROM categories').run();
}

async function insertCategories(list) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO categories (
      id, name, desc, image,
      taxRate, taxType,
      sortOrder, slug,
      isFeatured, kitchenPrintReq,
      updatedAt, isDeleted,
      outletId
    ) VALUES (
      @id, @name, @desc, @image,
      @taxRate, @taxType,
      @sortOrder, @slug,
      @isFeatured, @kitchenPrintReq,
      @updatedAt, @isDeleted,
      @outletId
    )
  `);

  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      stmt.run({
        id: row.id,
        name: row.name ?? '',
        desc: row.desc ?? '',
        image: row.image ?? null,
        taxRate: row.taxRate ?? null,
        taxType: row.taxType ?? null,
        sortOrder: row.sortOrder ?? 0,
        slug: row.slug ?? null,
        isFeatured: row.isFeatured ? 1 : 0,
        kitchenPrintReq:
          row.kitchenPrintReq == null
            ? null
            : row.kitchenPrintReq
            ? 1
            : 0,
        updatedAt: row.updatedAt ?? null,
        isDeleted: row.isDeleted ? 1 : 0,
        outletId: row.outletId ?? null,
      });
    }
  });

  insertMany(list);
}

async function getAllCategories() {
  return db
    .prepare(
      'SELECT * FROM categories ORDER BY name ASC'
    )
    .all();
}

async function getCategoryById(id) {
  return db
    .prepare(
      'SELECT * FROM categories WHERE id = ? LIMIT 1'
    )
    .get(id);
}

module.exports = {
  clearCategories,
  insertCategories,
  getAllCategories,
  getCategoryById,
};