const { db } =
  require('../db/sqlite.cjs');

const {
  doc,
  writeBatch,
  Timestamp,
  increment,
  getDoc,
  setDoc,
} = require('firebase/firestore');

const {
  firestore,
} = require('../lib/firebaseClient.cjs');


// =====================================================
// CONSTANTS
// =====================================================

const ORDER_COLLECTION =
  'orderMaster';

const ORDER_PRODUCTS_COLLECTION =
  'orderProducts';

const ORDER_ITEMS_COLLECTION =
  'orderItems';

const ORDER_PAYMENTS_COLLECTION =
  'orderPayments';

const DAILY_REPORT_COLLECTION =
  'dailyReports';

const MONTHLY_REPORT_COLLECTION =
  'monthlyReports';


// Firestore batch maximum is 500 writes.
// Keep some room for report documents.
const MAX_BATCH_WRITES =
  450;


// =====================================================
// HELPERS
// =====================================================

function round2(value) {
  return Number(
    Number(value || 0).toFixed(2)
  );
}


function timestampFromMillis(value) {

  const millis =
    Number(value || 0);

  if (!millis) {
    return Timestamp.now();
  }

  return new Timestamp(
    Math.floor(millis / 1000),
    Math.floor(
      (millis % 1000) * 1000000
    )
  );
}


function getOrderDate(millis) {

  const date =
    new Date(Number(millis));

  return date
    .toLocaleDateString(
      'en-CA'
    );
}


function getOrderMonth(millis) {

  const date =
    new Date(Number(millis));

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, '0');

  return `${year}-${month}`;
}


function getOrderYear(millis) {

  return new Date(
    Number(millis)
  ).getFullYear();

}


// =====================================================
// GET PENDING ORDERS
// =====================================================

function getPendingOrders() {

  return db.prepare(`

    SELECT *

    FROM pos_order_master

    WHERE syncStatus = 'PENDING'

    ORDER BY createdAt ASC

  `).all();

}


// =====================================================
// GET ORDER ITEMS
// =====================================================

function getOrderItems(orderId) {

  return db.prepare(`

    SELECT *

    FROM pos_order_items

    WHERE orderMasterId = ?

    ORDER BY createdAt ASC

  `).all(orderId);

}


// =====================================================
// GET ORDER PAYMENTS
// =====================================================

function getOrderPayments(orderId) {

  return db.prepare(`

    SELECT *

    FROM pos_order_payments

    WHERE orderId = ?

    ORDER BY createdAt ASC

  `).all(orderId);

}


// =====================================================
// PAYMENT SUMMARY
// =====================================================

function calculatePaymentSummary(
  payments
) {

  let cash = 0;
  let upi = 0;
  let card = 0;
  let wallet = 0;

  for (
    const payment of payments
  ) {

    if (
      payment.status !==
      'SUCCESS'
    ) {
      continue;
    }

    if (
      Number(payment.isVoided || 0) === 1
    ) {
      continue;
    }

    const amount =
      round2(
        payment.amount
      );

    switch (
      String(
        payment.mode || ''
      ).toUpperCase()
    ) {

      case 'CASH':
        cash += amount;
        break;

      case 'UPI':
        upi += amount;
        break;

      case 'CARD':
        card += amount;
        break;

      case 'WALLET':
        wallet += amount;
        break;

    }

  }


  cash =
    round2(cash);

  upi =
    round2(upi);

  card =
    round2(card);

  wallet =
    round2(wallet);


  let paymentType =
    'MIXED';


  if (
    cash > 0 &&
    upi === 0 &&
    card === 0 &&
    wallet === 0
  ) {

    paymentType =
      'CASH';

  } else if (
    upi > 0 &&
    cash === 0 &&
    card === 0 &&
    wallet === 0
  ) {

    paymentType =
      'UPI';

  } else if (
    card > 0 &&
    cash === 0 &&
    upi === 0 &&
    wallet === 0
  ) {

    paymentType =
      'CARD';

  } else if (
    wallet > 0 &&
    cash === 0 &&
    upi === 0 &&
    card === 0
  ) {

    paymentType =
      'WALLET';

  }


  return {

    cash,
    upi,
    card,
    wallet,
    paymentType,

  };

}


// =====================================================
// BUILD DAILY TOTALS
// =====================================================

function addToReportMap(
  reportMap,
  order,
  payments,
  orderDate
) {

  const payment =
    calculatePaymentSummary(
      payments
    );


  if (
    !reportMap.has(orderDate)
  ) {

    reportMap.set(
      orderDate,
      {
        sales: 0,
        discount: 0,
        tax: 0,
        cash: 0,
        upi: 0,
        card: 0,
        wallet: 0,
        credit: 0,
      }
    );

  }


  const totals =
    reportMap.get(
      orderDate
    );


  totals.sales +=
    round2(
      order.grandTotal
    );


  totals.discount +=
    Math.abs(
      round2(
        order.discountTotal
      )
    );


  totals.tax +=
    round2(
      order.taxTotal
    );


  totals.cash +=
    payment.cash;


  totals.upi +=
    payment.upi;


  totals.card +=
    payment.card;


  totals.wallet +=
    payment.wallet;


  totals.credit +=
    round2(
      order.dueAmount
    );

}


// =====================================================
// BUILD MONTHLY TOTALS
// =====================================================

function addToMonthlyMap(
  monthlyMap,
  order,
  payments,
  orderMonth
) {

  const payment =
    calculatePaymentSummary(
      payments
    );


  if (
    !monthlyMap.has(orderMonth)
  ) {

    monthlyMap.set(
      orderMonth,
      {
        sales: 0,
        discount: 0,
        tax: 0,
        cash: 0,
        upi: 0,
        card: 0,
        wallet: 0,
        credit: 0,
      }
    );

  }


  const totals =
    monthlyMap.get(
      orderMonth
    );


  totals.sales +=
    round2(
      order.grandTotal
    );


  totals.discount +=
    Math.abs(
      round2(
        order.discountTotal
      )
    );


  totals.tax +=
    round2(
      order.taxTotal
    );


  totals.cash +=
    payment.cash;


  totals.upi +=
    payment.upi;


  totals.card +=
    payment.card;


  totals.wallet +=
    payment.wallet;


  totals.credit +=
    round2(
      order.dueAmount
    );

}


// =====================================================
// CREATE ORDER MASTER DATA
// =====================================================

function createOrderMasterData(
  order,
  items,
  payments
) {

  const createdAt =
    Number(order.createdAt);

  const orderDate =
    getOrderDate(
      createdAt
    );

  const orderMonth =
    getOrderMonth(
      createdAt
    );

  const orderYear =
    getOrderYear(
      createdAt
    );


  const paymentSummary =
    calculatePaymentSummary(
      payments
    );


  const totalQty =
    items.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.quantity || 0
        ),
      0
    );


  return {

    id:
      order.id,

    srno:
      order.srno,

    orderType:
      order.orderType,

    tableNo:
      order.tableNo || '',

    tableName:
      order.tableName || '',

    saleType:
      order.saleType || '',

    reason:
      order.reason || '',


    // -----------------------------------------------
    // CUSTOMER
    // -----------------------------------------------

    customerName:
      order.customerName || 'Customer',

    customerPhone:
      order.customerPhone || '',

    customerId:
      order.customerId || null,


    // -----------------------------------------------
    // USER
    // -----------------------------------------------

    createdById:
      order.createdById || '',

    createdByName:
      order.createdByName || '',

    finalizedById:
      order.finalizedById || '',

    finalizedByName:
      order.finalizedByName || '',


    // -----------------------------------------------
    // DELIVERY ADDRESS
    // -----------------------------------------------

    dAddressLine1:
      order.dAddressLine1 || '',

    dAddressLine2:
      order.dAddressLine2 || '',

    dCity:
      order.dCity || '',

    dState:
      order.dState || '',

    dZipcode:
      order.dZipcode || '',

    dLandmark:
      order.dLandmark || '',


    // -----------------------------------------------
    // AMOUNTS
    // -----------------------------------------------

    deliveryFee:
      round2(
        order.deliveryFee
      ),

    deliveryTax:
      round2(
        order.deliveryTax
      ),

    itemTotal:
      round2(
        order.itemTotal
      ),

    itemTax:
      round2(
        order.itemTax
      ),

    taxTotal:
      round2(
        order.taxTotal
      ),

    discountTotal:
      round2(
        order.discountTotal
      ),

    grandTotal:
      round2(
        order.grandTotal
      ),


    // -----------------------------------------------
    // PAYMENT
    // -----------------------------------------------

    paymentMode:
      order.paymentMode || 'CASH',

    paymentStatus:
      order.paymentStatus || 'PAID',

    paidAmount:
      round2(
        order.paidAmount
      ),

    dueAmount:
      round2(
        order.dueAmount
      ),


    paymentType:
      paymentSummary.paymentType,

    cashAmount:
      paymentSummary.cash,

    upiAmount:
      paymentSummary.upi,

    cardAmount:
      paymentSummary.card,

    walletAmount:
      paymentSummary.wallet,


    // -----------------------------------------------
    // ORDER STATE
    // -----------------------------------------------

    orderStatus:
      order.orderStatus,

    source:
      order.source || 'POS',


    // -----------------------------------------------
    // DEVICE
    // -----------------------------------------------

    deviceId:
      order.deviceId || '',

    deviceName:
      order.deviceName || '',

    appVersion:
      order.appVersion || '',


    // -----------------------------------------------
    // BUSINESS DATE
    // -----------------------------------------------

    businessDate:
      order.businessDate,

    realDate:
      order.realDate,

    createdAt:
      timestampFromMillis(
        createdAt
      ),

    createdAtMillis:
      createdAt,

    updatedAt:
      timestampFromMillis(
        order.updatedAt ||
        createdAt
      ),


    // -----------------------------------------------
    // REPORTING
    // -----------------------------------------------

    orderDate:
      orderDate,

    orderMonth:
      orderMonth,

    orderYear:
      orderYear,

    totalItems:
      totalQty,


    // -----------------------------------------------
    // SYNC
    // -----------------------------------------------

    syncStatus:
      'SYNCED',

    lastSyncedAt:
      Timestamp.now(),


    // -----------------------------------------------
    // EXTRA
    // -----------------------------------------------

    notes:
      order.notes || '',

  };

}


// =====================================================
// CREATE ORDER PRODUCT DATA
// =====================================================

function createOrderProductData(
  item,
  orderId
) {

  const createdAt =
    Number(
      item.createdAt
    );

  const orderDate =
    getOrderDate(
      createdAt
    );

  const orderMonth =
    getOrderMonth(
      createdAt
    );


  return {

    id:
      item.id,

    orderMasterId:
      orderId,

    productId:
      item.productId,

    name:
      item.name,

    categoryId:
      item.categoryId,

    categoryName:
      item.categoryName,

    quantity:
      Number(
        item.quantity || 0
      ),


    // -----------------------------------------------
    // PRICE
    // -----------------------------------------------
    //
    // IMPORTANT:
    // These are item amounts WITHOUT adding tax.
    //

    basePrice:
      round2(
        item.basePrice
      ),

    itemSubtotal:
      round2(
        item.itemSubtotal
      ),

    finalPrice:
      round2(
        item.finalPricePerItem
      ),

    finalTotal:
      round2(
        item.finalTotal
      ),


    // -----------------------------------------------
    // TAX
    // -----------------------------------------------

    taxRate:
      round2(
        item.taxRate
      ),

    taxType:
      item.taxType || 'exclusive',

    taxAmount:
      round2(
        item.taxAmountPerItem
      ),

    taxTotal:
      round2(
        item.taxTotal
      ),


    // -----------------------------------------------
    // ITEM META
    // -----------------------------------------------

    productMode:
      item.productMode || '',

    parentId:
      item.parentId || null,

    isVariant:
      Number(
        item.isVariant || 0
      ) === 1,

    note:
      item.note || '',

    modifiersJson:
      item.modifiersJson || '[]',

    modifierPrice:
      round2(
        item.modifierPrice
      ),

    modifierSummary:
      item.modifierSummary || '',

    currency:
      item.currency || '₹',

    paymentStatus:
      item.paymentStatus || '',

    source:
      item.source || 'POS',


    // -----------------------------------------------
    // DATE
    // -----------------------------------------------

    createdAt:
      timestampFromMillis(
        createdAt
      ),

    orderDate:
      orderDate,

    orderMonth:
      orderMonth,

  };

}


// =====================================================
// CREATE ORDER ITEMS DATA
// =====================================================
//
// Kept compatible with your Android system.
// =====================================================

function createOrderItemData(
  item,
  orderId
) {

  const createdAt =
    Number(
      item.createdAt
    );

  return {

    id:
      item.id,

    orderMasterId:
      orderId,

    itemId:
      item.productId,

    name:
      item.name,

    categoryId:
      item.categoryId,

    categoryName:
      item.categoryName,

    quantity:
      Number(
        item.quantity || 0
      ),


    // -----------------------------------------------
    // PRICE WITHOUT TAX
    // -----------------------------------------------

    basePrice:
      round2(
        item.basePrice
      ),

    itemSubtotal:
      round2(
        item.itemSubtotal
      ),

    finalPrice:
      round2(
        item.finalPricePerItem
      ),

    finalTotal:
      round2(
        item.finalTotal
      ),


    // -----------------------------------------------
    // TAX
    // -----------------------------------------------

    taxRate:
      round2(
        item.taxRate
      ),

    taxType:
      item.taxType || 'exclusive',

    taxAmount:
      round2(
        item.taxAmountPerItem
      ),

    taxTotal:
      round2(
        item.taxTotal
      ),


    // -----------------------------------------------
    // DATE
    // -----------------------------------------------

    createdAt:
      timestampFromMillis(
        createdAt
      ),

    orderDate:
      getOrderDate(
        createdAt
      ),

    orderMonth:
      getOrderMonth(
        createdAt
      ),

  };

}


// =====================================================
// CREATE PAYMENT DATA
// =====================================================

function createPaymentData(
  payment,
  order
) {

  return {

    id:
      payment.id,

    orderId:
      payment.orderId,

    ownerId:
      payment.ownerId || '',

    outletId:
      payment.outletId || '',

    amount:
      round2(
        payment.amount
      ),

    mode:
      payment.mode,

    provider:
      payment.provider || null,

    method:
      payment.method || null,

    status:
      payment.status,

    deviceId:
      payment.deviceId ||
      order.deviceId ||
      '',

    createdAt:
      timestampFromMillis(
        payment.createdAt
      ),

    createdAtMillis:
      Number(
        payment.createdAt || 0
      ),

    businessDate:
      payment.businessDate ||
      order.businessDate,

    orderDate:
      getOrderDate(
        payment.createdAt
      ),

    orderMonth:
      getOrderMonth(
        payment.createdAt
      ),

    isVoided:
      Number(
        payment.isVoided || 0
      ) === 1,

    syncStatus:
      'SYNCED',

    lastSyncedAt:
      Timestamp.now(),

  };

}


// =====================================================
// MARK LOCAL ORDERS SYNCED
// =====================================================

function markOrdersSynced(
  orderIds,
  syncedAt
) {

  if (
    !Array.isArray(orderIds) ||
    orderIds.length === 0
  ) {
    return;
  }


  const placeholders =
    orderIds
      .map(() => '?')
      .join(',');


  db.prepare(`

    UPDATE pos_order_master

    SET
      syncStatus = 'SYNCED',
      lastSyncedAt = ?,
      updatedAt = ?

    WHERE id IN (${placeholders})

  `).run(
    syncedAt,
    syncedAt,
    ...orderIds
  );

}


// =====================================================
// MARK LOCAL PAYMENTS SYNCED
// =====================================================

function markPaymentsSynced(
  orderIds,
  syncedAt
) {

  if (
    !Array.isArray(orderIds) ||
    orderIds.length === 0
  ) {
    return;
  }


  const placeholders =
    orderIds
      .map(() => '?')
      .join(',');


  db.prepare(`

    UPDATE pos_order_payments

    SET
      syncStatus = 'SYNCED',
      lastSyncedAt = ?

    WHERE orderId IN (${placeholders})

  `).run(
    syncedAt,
    ...orderIds
  );

}


// =====================================================
// ADD REPORT WRITES
// =====================================================

function addDailyReportWrites(
  batch,
  dailyMap
) {

  for (
    const [
      date,
      totals
    ] of dailyMap
  ) {

    const reportRef =
      doc(
        firestore,
        DAILY_REPORT_COLLECTION,
        date
      );


    batch.set(
      reportRef,
      {

        date:
          date,

        dateTimestamp:
          timestampFromMillis(
            new Date(
              `${date}T00:00:00`
            ).getTime()
          ),


        totalSales:
          increment(
            round2(
              totals.sales
            )
          ),

        totalDiscount:
          increment(
            round2(
              totals.discount
            )
          ),

        totalTax:
          increment(
            round2(
              totals.tax
            )
          ),


        cashCollection:
          increment(
            round2(
              totals.cash
            )
          ),

        upiCollection:
          increment(
            round2(
              totals.upi
            )
          ),

        cardCollection:
          increment(
            round2(
              totals.card
            )
          ),

        walletCollection:
          increment(
            round2(
              totals.wallet
            )
          ),

        totalCredit:
          increment(
            round2(
              totals.credit
            )
          ),

        lastUpdated:
          Timestamp.now(),

      },

      {
        merge: true,
      }

    );

  }

}


// =====================================================
// ADD MONTHLY REPORT WRITES
// =====================================================

function addMonthlyReportWrites(
  batch,
  monthlyMap
) {

  for (
    const [
      month,
      totals
    ] of monthlyMap
  ) {

    const reportRef =
      doc(
        firestore,
        MONTHLY_REPORT_COLLECTION,
        month
      );


    batch.set(
      reportRef,
      {

        month:
          month,

        totalSales:
          increment(
            round2(
              totals.sales
            )
          ),

        totalDiscount:
          increment(
            round2(
              totals.discount
            )
          ),

        totalTax:
          increment(
            round2(
              totals.tax
            )
          ),


        cashCollection:
          increment(
            round2(
              totals.cash
            )
          ),

        upiCollection:
          increment(
            round2(
              totals.upi
            )
          ),

        cardCollection:
          increment(
            round2(
              totals.card
            )
          ),

        walletCollection:
          increment(
            round2(
              totals.wallet
            )
          ),

        totalCredit:
          increment(
            round2(
              totals.credit
            )
          ),

        lastUpdated:
          Timestamp.now(),

      },

      {
        merge: true,
      }

    );

  }

}


// =====================================================
// SYNC PENDING ORDERS
// =====================================================

async function syncPendingOrders() {

  const pendingOrders =
    getPendingOrders();


  if (
    pendingOrders.length === 0
  ) {

    console.log(
      '[ORDER_SYNC] No pending orders'
    );

    return {
      success: true,
      synced: 0,
    };

  }


  console.log(
    `[ORDER_SYNC] Found ${pendingOrders.length} pending orders`
  );


  let syncedCount = 0;


  // ===================================================
  // PROCESS ORDERS
  // ===================================================

  let batch =
    writeBatch(
      firestore
    );

  let batchWriteCount = 0;

  const batchOrderIds = [];

  const dailyMap =
    new Map();

  const monthlyMap =
    new Map();


  async function commitCurrentBatch() {

    if (
      batchWriteCount === 0
    ) {
      return;
    }


    // -----------------------------------------------
    // REPORTS
    // -----------------------------------------------

    addDailyReportWrites(
      batch,
      dailyMap
    );

    addMonthlyReportWrites(
      batch,
      monthlyMap
    );


    console.log(
      `[ORDER_SYNC] Committing batch with ${batchWriteCount} order writes`
    );


    await batch.commit();


    // -----------------------------------------------
    // MARK LOCAL ORDERS SYNCED
    // -----------------------------------------------

    const syncedAt =
      Date.now();


    markOrdersSynced(
      batchOrderIds,
      syncedAt
    );


    markPaymentsSynced(
      batchOrderIds,
      syncedAt
    );


    syncedCount +=
      batchOrderIds.length;


    // -----------------------------------------------
    // RESET
    // -----------------------------------------------

    batch =
      writeBatch(
        firestore
      );

    batchWriteCount = 0;

    batchOrderIds.length = 0;

    dailyMap.clear();

    monthlyMap.clear();

  }


  for (
    const order
    of pendingOrders
  ) {

    const items =
      getOrderItems(
        order.id
      );


    const payments =
      getOrderPayments(
        order.id
      );


    // =================================================
    // COUNT WRITES
    // =================================================

    const orderWriteCount =
      1 +
      items.length +
      items.length +
      payments.length;


    // Reports need extra writes.
    // Keep enough room for them.
    if (
      batchWriteCount > 0 &&
      (
        batchWriteCount +
        orderWriteCount
      ) >= MAX_BATCH_WRITES
    ) {

      await commitCurrentBatch();

    }


    // =================================================
    // ORDER MASTER
    // =================================================

    const orderRef =
      doc(
        firestore,
        ORDER_COLLECTION,
        order.id
      );


    batch.set(
      orderRef,
      createOrderMasterData(
        order,
        items,
        payments
      ),
      {
        merge: true,
      }
    );


    batchWriteCount++;


    // =================================================
    // ORDER PRODUCTS
    // =================================================

    for (
      const item
      of items
    ) {

      const itemRef =
        doc(
          firestore,
          ORDER_PRODUCTS_COLLECTION,
          item.id
        );


      batch.set(
        itemRef,
        createOrderProductData(
          item,
          order.id
        ),
        {
          merge: true,
        }
      );


      batchWriteCount++;

    }


    // =================================================
    // ORDER ITEMS
    // =================================================

    for (
      const item
      of items
    ) {

      const itemRef =
        doc(
          firestore,
          ORDER_ITEMS_COLLECTION,
          item.id
        );


      batch.set(
        itemRef,
        createOrderItemData(
          item,
          order.id
        ),
        {
          merge: true,
        }
      );


      batchWriteCount++;

    }


    // =================================================
    // PAYMENTS
    // =================================================

    for (
      const payment
      of payments
    ) {

      const paymentRef =
        doc(
          firestore,
          ORDER_PAYMENTS_COLLECTION,
          payment.id
        );


      batch.set(
        paymentRef,
        createPaymentData(
          payment,
          order
        ),
        {
          merge: true,
        }
      );


      batchWriteCount++;

    }


    // =================================================
    // REPORT AGGREGATION
    // =================================================

    const orderDate =
      getOrderDate(
        order.createdAt
      );

    const orderMonth =
      getOrderMonth(
        order.createdAt
      );


    addToReportMap(
      dailyMap,
      order,
      payments,
      orderDate
    );


    addToMonthlyMap(
      monthlyMap,
      order,
      payments,
      orderMonth
    );


    batchOrderIds.push(
      order.id
    );

  }


  // ===================================================
  // COMMIT REMAINING
  // ===================================================

  await commitCurrentBatch();


  console.log(
    `[ORDER_SYNC] Sync successful. Orders synced = ${syncedCount}`
  );


  return {

    success: true,

    synced:
      syncedCount,

    pending:
      pendingOrders.length,

  };

}


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  syncPendingOrders,

  getPendingOrders,

};