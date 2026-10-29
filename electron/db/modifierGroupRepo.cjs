const { db } = require('./sqlite.cjs');

async function clearModifierGroups() {
  db.prepare(
    'DELETE FROM modifier_groups'
  ).run();
}

async function insertModifierGroups(list) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO modifier_groups (
      id, name,
      minSelection, maxSelection,
      sortOrder, status
    ) VALUES (
      @id, @name,
      @minSelection, @maxSelection,
      @sortOrder, @status
    )
  `);

  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      stmt.run({
        id: row.id,
        name: row.name ?? '',
        minSelection:
          Number(row.minSelection ?? 0),
        maxSelection:
          Number(row.maxSelection ?? 0),
        sortOrder:
          Number(row.sortOrder ?? 0),
        status: row.status ?? 'draft',
      });
    }
  });

  insertMany(list);
}

async function getModifierGroups() {
  return db
    .prepare(
      'SELECT * FROM modifier_groups ORDER BY sortOrder ASC, name ASC'
    )
    .all();
}

module.exports = {
  clearModifierGroups,
  insertModifierGroups,
  getModifierGroups,
};