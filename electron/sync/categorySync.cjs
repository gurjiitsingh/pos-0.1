const {
  collection,
  getDocs,
} = require('firebase/firestore');

const { firestore } = require('../lib/firebaseClient.cjs');
const {
  clearCategories,
  insertCategories,
} = require('../db/categoryRepo.cjs');

async function syncCategories() {
  const snapshot = await getDocs(
    collection(firestore, 'category')
  );

  const list = snapshot.docs.map((doc) => {
    const data = doc.data() || {};

    return {
      id: doc.id,
      name: data.name || '',
      desc: data.desc || '',
      image: data.image || null,
      taxRate:
        typeof data.taxRate === 'number'
          ? data.taxRate
          : null,
      taxType: data.taxType || null,
      sortOrder: data.sortOrder || 0,
      slug: data.slug || null,
      isFeatured:
        data.isFeatured || false,
      kitchenPrintReq:
        data.kitchenPrintReq ?? null,
      updatedAt: data.updatedAt || null,
      isDeleted:
        data.isDeleted || false,
      outletId: data.outletId || null,
    };
  });

  await clearCategories();
  await insertCategories(list);

  console.log(
    `SYNC_CATEGORIES: inserted ${list.length}`
  );
}

module.exports = { syncCategories };