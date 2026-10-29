const { db } = require('./sqlite.cjs');

async function clearModifierItems() {
  db.prepare(
    'DELETE FROM modifier_items'
  ).run();
}

async function insertModifierItems(list) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO modifier_items (
      id, name, groupId,
      price, isDefault,
      sortOrder, status
    ) VALUES (
      @id, @name, @groupId,
      @price, @isDefault,
      @sortOrder, @status
    )
  `);

  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      stmt.run({
        id: row.id,
        name: row.name ?? '',
        groupId: row.groupId ?? '',
        price: Number(row.price ?? 0),
        isDefault:
          row.isDefault ? 1 : 0,
        sortOrder:
          Number(row.sortOrder ?? 0),
        status: row.status ?? 'draft',
      });
    }
  });

  insertMany(list);
}

async function getModifierItemsByGroup(
  groupId
) {
  return db
    .prepare(
      `
      SELECT * FROM modifier_items
      WHERE groupId = ?
      ORDER BY sortOrder ASC, name ASC
    `
    )
    .all(groupId);
}

module.exports = {
  clearModifierItems,
  insertModifierItems,
  getModifierItemsByGroup,
};