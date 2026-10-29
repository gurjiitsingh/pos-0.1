const { db } = require('../db/sqlite.cjs');

const {
  doc,
  getDoc,
  setDoc,
} = require('firebase/firestore');

const { firestore } = require('../lib/firebaseClient.cjs');

const {
  TERMINAL_CODE,
  getFinancialYearCode,
} = require('../lib/orderSequence.cjs');


async function uploadOrderCounter() {

  const row = db.prepare(`
    SELECT invoiceSerialNo
    FROM order_counter
    WHERE id = 1
  `).get();

  const localSerial =
    Number(row?.invoiceSerialNo || 0);

  if (localSerial <= 0) {
    return;
  }


  const financialYear =
    getFinancialYearCode();

  const docId =
    `${TERMINAL_CODE}_${financialYear}`;


  // Firebase Client SDK
  const ref = doc(
    firestore,
    'orderCounters',
    docId
  );


  const snap = await getDoc(ref);


  const remoteSerial =
    snap.exists()
      ? Number(
          snap.data()?.invoiceSerialNo || 0
        )
      : 0;


  // Only move forward
  if (localSerial > remoteSerial) {

    await setDoc(
      ref,
      {
        invoiceSerialNo: localSerial,
        deviceCode: TERMINAL_CODE,
        financialYear,
        updatedAt: Date.now(),
      },
      {
        merge: true,
      }
    );


    console.log(
      'ORDER COUNTER UPLOADED =',
      localSerial
    );

  } else {

    console.log(
      'ORDER COUNTER ALREADY UP TO DATE'
    );
  }
}


module.exports = {
  uploadOrderCounter,
};