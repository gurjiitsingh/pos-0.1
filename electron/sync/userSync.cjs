const {
  collection,
  getDocs,
} = require('firebase/firestore');

const { firestore } = require('../lib/firebaseClient.cjs');

const {
  clearUsers,
  insertUsers,
} = require('../db/userRepo.cjs');

async function syncUsers() {
  const snapshot = await getDocs(
    collection(firestore, 'users')
  );

  const now = Date.now();

  const list = snapshot.docs.map((doc) => {
    const data = doc.data() || {};

    return {
      userId: doc.id,
      outletId: data.outletId || '',
      fullName: data.fullName || '',
      username: data.username || '',
      mobile: data.mobile || '',
      employeeId: data.employeeId || '',
      role: data.role || 'cashier',
      loginPin: data.loginPin || '',
      allowPosLogin: data.allowPosLogin ?? false,
      isActive: (data.status || 'active') === 'active',
      createdAt: data.createdAt?.toDate?.()?.getTime?.() || now,
      updatedAt: data.updatedAt?.toDate?.()?.getTime?.() || now,
      syncStatus: 'SYNCED',
      lastSyncedAt: now,
    };
  });

  clearUsers();
  insertUsers(list);

  console.log(`SYNC_USERS: inserted ${list.length}`);
}

module.exports = { syncUsers };