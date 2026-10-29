const {
  collection,
  getDocs,
} = require('firebase/firestore');

const { firestore } = require('../lib/firebaseClient.cjs');

const {
  clearTables,
  insertTables,
} = require('../db/tableRepo.cjs');

async function syncTables() {

  const snapshot = await getDocs(
    collection(firestore, 'tables')
  );

  const list = snapshot.docs.map((doc) => {

    const data = doc.data() || {};

    return {
      id: data.id || doc.id,
      tableName: data.tableName || doc.id,
      status: data.status || 'AVAILABLE',

      waiterName: data.waiterName || null,
      waiterId: data.waiterId || null,

      activeOrderId: data.activeOrderId || null,

      guestsCount:
        typeof data.guestsCount === 'number'
          ? data.guestsCount
          : null,

      area: data.area || 'General',

      sortOrder:
        typeof data.sortOrder === 'number'
          ? data.sortOrder
          : 0,

      cartCount: 0,
      kitchenCount: 0,
      billCount: 0,
      billAmount: 0,

      updatedAt:
        data.updatedAt?.toMillis
          ? data.updatedAt.toMillis()
          : null,

      createdAt:
        data.createdAt?.toMillis
          ? data.createdAt.toMillis()
          : null,

      notes: data.notes || null,

      synced: data.synced ?? true,
    };
  });

  clearTables();
  insertTables(list);

  console.log(
    `SYNC_TABLES: inserted ${list.length}`
  );
}

module.exports = { syncTables };