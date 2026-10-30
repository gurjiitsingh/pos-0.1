const { db } = require('../db/sqlite.cjs');

const {
  doc,
  getDoc,
} = require('firebase/firestore');

 
const { firestore } = require('../lib/firebaseClient.cjs');

const {
  TERMINAL_CODE,
  getFinancialYearCode,
} = require('../lib/orderSequence.cjs');


async function syncOrderCounter() {

  const financialYear =
    getFinancialYearCode();

  const docId =
    `${TERMINAL_CODE}_${financialYear}`;

  console.log(
    'ORDER COUNTER SYNC DOC =',
    docId
  );


  // Firebase Client SDK
  const snap = await getDoc(
    doc(
      firestore,
      'orderCounters',
      docId
    )
  );


  if (!snap.exists()) {

    console.log(
      'No order counter found in Firestore'
    );

    return {
      invoiceSerialNo: 0,
      source: 'empty',
    };
  }


  const data = snap.data() || {};

  const invoiceSerialNo =
    Number(
      data.invoiceSerialNo || 0
    );


  db.prepare(`
    INSERT INTO order_counter (
      id,
      invoiceSerialNo,
      updatedAt
    ) VALUES (
      1,
      ?,
      ?
    )
    ON CONFLICT(id) DO UPDATE SET
      invoiceSerialNo = excluded.invoiceSerialNo,
      updatedAt = excluded.updatedAt
  `).run(
    invoiceSerialNo,
    Date.now()
  );


  console.log(
    'ORDER COUNTER DOWNLOADED =',
    invoiceSerialNo
  );


  return {
    invoiceSerialNo,
    source: 'firestore',
  };
}

// =====================================================
// SYNC LIQUOR VAT ORDER COUNTER
// =====================================================

async function syncLiquorVatOrderCounter() {

  const financialYear = getFinancialYearCode();
  const docId = `${TERMINAL_CODE}_${financialYear}`;

  console.log('LIQUOR VAT COUNTER SYNC DOC =', docId);

  const snap = await getDoc(
    doc(firestore, 'liquorVatOrderCounters', docId)
  );

  if (!snap.exists()) {
    console.log('No LIQUOR VAT order counter found in Firestore');

    return {
      invoiceSerialNo: 0,
      source: 'empty',
    };
  }

  const data = snap.data() || {};

  const invoiceSerialNo = Number(
    data.invoiceSerialNo || 0
  );

  db.prepare(`
    INSERT INTO liquor_vat_order_counter (
      id,
      invoiceSerialNo,
      updatedAt
    ) VALUES (
      1,
      ?,
      ?
    )
    ON CONFLICT(id) DO UPDATE SET
      invoiceSerialNo = excluded.invoiceSerialNo,
      updatedAt = excluded.updatedAt
  `).run(invoiceSerialNo, Date.now());

  console.log(
    'LIQUOR VAT ORDER COUNTER DOWNLOADED =',
    invoiceSerialNo
  );

  return {
    invoiceSerialNo,
    source: 'firestore',
  };
}



module.exports = {
  syncOrderCounter,
  syncLiquorVatOrderCounter,
};