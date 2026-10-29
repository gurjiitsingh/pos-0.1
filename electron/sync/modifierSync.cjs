const {
  collection,
  getDocs,
} = require('firebase/firestore');

const { firestore } = require('../lib/firebaseClient.cjs');

const {
  clearModifierGroups,
  insertModifierGroups,
} = require('../db/modifierGroupRepo.cjs');

const {
  clearModifierItems,
  insertModifierItems,
} = require('../db/modifierItemRepo.cjs');

const {
  clearProductModifiers,
  insertProductModifiers,
} = require('../db/productModifierRepo.cjs');

function anyToDouble(v) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

async function syncModifierGroups() {
  const snapshot = await getDocs(
    collection(firestore, 'modifierGroups')
  );

  const list = snapshot.docs.map((doc) => {
    const data = doc.data() || {};

    return {
      id: doc.id,
      name: data.name || '',
      minSelection:
        data.minSelection || 0,
      maxSelection:
        data.maxSelection || 0,
      sortOrder: data.sortOrder || 0,
      status: data.status || 'draft',
    };
  });

  await clearModifierGroups();
  await insertModifierGroups(list);

  console.log(
    `SYNC_MOD_GROUP: inserted ${list.length}`
  );
}

async function syncModifierItems() {
  const snapshot = await getDocs(
    collection(firestore, 'modifierItems')
  );

  const list = snapshot.docs.map((doc) => {
    const data = doc.data() || {};

    return {
      id: doc.id,
      name: data.name || '',
      groupId: data.groupId || '',
      price: anyToDouble(data.price),
      isDefault:
        data.isDefault || false,
      sortOrder: data.sortOrder || 0,
      status: data.status || 'draft',
    };
  });

  await clearModifierItems();
  await insertModifierItems(list);

  console.log(
    `SYNC_MOD_ITEM: inserted ${list.length}`
  );
}

async function syncProductModifiers() {
  const snapshot = await getDocs(
    collection(firestore, 'productModifiers')
  );

  const list = snapshot.docs.map((doc) => {
    const data = doc.data() || {};

    return {
      id: doc.id,
      productId: data.productId || '',
      groupId: data.groupId || '',
      sortOrder: data.sortOrder || 0,
    };
  });

  await clearProductModifiers();
  await insertProductModifiers(list);

  console.log(
    `SYNC_PRODUCT_MOD: inserted ${list.length}`
  );
}

module.exports = {
  syncModifierGroups,
  syncModifierItems,
  syncProductModifiers,
};