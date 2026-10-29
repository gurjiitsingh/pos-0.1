const {
  collection,
  getDocs,
  query,
  limit,
} = require('firebase/firestore');

const { firestore } = require('../lib/firebaseClient.cjs');

const {
  clearOutlet,
  saveOutlet,
} = require('../db/outletRepo.cjs');

async function syncOutlet() {
  const q = query(
    collection(firestore, 'outlets'),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    clearOutlet();
    console.log('SYNC_OUTLET: no outlet found');
    return;
  }

  const doc = snapshot.docs[0];
  const data = doc.data() || {};

  const outlet = {
    outletId: doc.id,

    outletName: data.outletName || '',
    ownerId: data.ownerId || '',

    addressLine1: data.addressLine1 || '',
    addressLine2: data.addressLine2 || '',
    addressLine3: data.addressLine3 || '',

    city: data.city || '',
    state: data.state || '',
    zipcode: data.zipcode || '',
    countryName: data.countryName || '',

    taxType: data.taxType || '',
    taxMode: data.taxMode || 'PER_ITEM',

    gstVatNumber: data.gstVatNumber || '',
    fssaiNumber: data.fssaiNumber || '',

    phone: data.phone || '',
    phone2: data.phone2 || '',

    email: data.email || '',
    web: data.web || '',

    logoUrl: data.logoUrl || '',

    printerWidth:
      Number(data.printerWidth) === 58 ? 58 : 80,

    printerIPBill: data.printerIPBill || '',
    printerIPKitchen: data.printerIPKitchen || '',
    printerName: data.printerName || '',

    footerNote: data.footerNote || '',

    qrEnabled: data.qrEnabled ?? false,
    qrText: data.qrText || '',
    qrTitle: data.qrTitle || '',

    upiId: data.upiId || '',
    upiName: data.upiName || '',
    upiTitle: data.upiTitle || '',

    countryCode: data.countryCode || 'IN',
    currencyCode: data.currencyCode || 'INR',
    localeTag: data.localeTag || 'en-IN',

    isActive: data.isActive ?? true,

    posType: data.posType || 'RESTAU',

    showCategorySidebar:
      data.showCategorySidebar ?? true,

    startupScreen:
      data.startupScreen || 'tables',
  };

  clearOutlet();
  saveOutlet(outlet);

  console.log(
    `SYNC_OUTLET: saved ${outlet.outletName}`
  );
}

module.exports = { syncOutlet };