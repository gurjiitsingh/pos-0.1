const { db } = require('./sqlite.cjs');

async function clearProducts() {
  db.prepare('DELETE FROM products').run();
}

async function insertProducts(list) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO products (
      id, searchCode,
      favorite,name,
      price, discountPrice, discountEligible, image,
      foodType,
      sortOrder, kitchenPrintReq,
      categoryId, productCat,
      parentId, baseProductId,
      hasVariants, hasModifiers,
      currentStock,
      productMode,
      taxRate, taxType,
      type,
      outletId
    ) VALUES (
     @id, @searchCode,
@favorite, @name,
@price, @discountPrice, @discountEligible, @image,
      @foodType,
      @sortOrder, @kitchenPrintReq,
      @categoryId, @productCat,
      @parentId, @baseProductId,
      @hasVariants, @hasModifiers,
      @currentStock,
      @productMode,
      @taxRate, @taxType,
      @type,
      @outletId
    )
  `);

  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      stmt.run({
        id: row.id,
        searchCode: row.searchCode ?? null,
        favorite: row.favorite ? 1 : 0,
        name: row.name ?? '',
        price: Number(row.price ?? 0),
        discountPrice:
          row.discountPrice ?? null,

        discountEligible:
          row.discountEligible == null
            ? 1
            : row.discountEligible
              ? 1
              : 0,

        image: row.image ?? null,

        foodType: row.foodType ?? null,

        sortOrder: row.sortOrder ?? 0,
        kitchenPrintReq:
          row.kitchenPrintReq == null
            ? null
            : row.kitchenPrintReq
              ? 1
              : 0,

        categoryId: row.categoryId ?? '',
        productCat: row.productCat ?? '',

        parentId: row.parentId ?? null,
        baseProductId:
          row.baseProductId ?? null,

        hasVariants: row.hasVariants ? 1 : 0,
        hasModifiers:
          row.hasModifiers ? 1 : 0,

        currentStock:
          row.currentStock ?? null,

        productMode:
          row.productMode ?? 'raw_stock',

        taxRate: row.taxRate ?? null,
        taxType: row.taxType ?? null,

        type: row.type ?? null,

        outletId: row.outletId ?? null,
      });
    }
  });

  insertMany(list);
}

async function getAllProducts() {
  const rows = db
    .prepare(
      'SELECT * FROM products ORDER BY sortOrder ASC, name ASC'
    )
    .all();

  return rows.map((row) => ({
    ...row,
    favorite: row.favorite === 1,
  }));
}

async function getProductsByCategory(
  categoryId
) {
  return db
    .prepare(
      'SELECT * FROM products WHERE categoryId = ? ORDER BY sortOrder ASC, name ASC'
    )
    .all(categoryId);
}

async function searchProducts(
  query,
  foodType = null
) {
  const q = `%${query}%`;

  return db
    .prepare(
      `
      SELECT * FROM products
      WHERE
        (? IS NULL OR foodType = ?)
        AND (
          name LIKE ?
          OR searchCode LIKE ?
        )
      ORDER BY sortOrder ASC, name ASC
    `
    )
    .all(foodType, foodType, q, q);
}

async function searchExactCode(
  code,
  foodType = null
) {
  return db
    .prepare(
      `
      SELECT * FROM products
      WHERE
        (? IS NULL OR foodType = ?)
        AND searchCode = ?
      ORDER BY sortOrder ASC, name ASC
    `
    )
    .all(foodType, foodType, code);
}

module.exports = {
  clearProducts,
  insertProducts,
  getAllProducts,
  getProductsByCategory,
  searchProducts,
  searchExactCode,
};