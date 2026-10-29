const { db } = require('./sqlite.cjs');
const { randomUUID } = require('crypto');


// =====================================================
// INSERT ORDER MASTER + ORDER ITEMS
// =====================================================

function insertOrder(master, items) {

  const createdAt =
    master.createdAt ?? Date.now();

  const realDate =
    getRealDate(createdAt);

  console.log('========== INSERT ORDER DATE DEBUG ==========');
  console.log({
    createdAt,
    createdAtISO: new Date(createdAt).toISOString(),
    businessDate: master.businessDate,
    realDate,
  });

  const insertMaster = db.prepare(`
    INSERT INTO pos_order_master (

      id,
      srno,
      orderType,
      tableNo,
      tableName,

      customerName,
      customerPhone,

      itemTotal,
      itemTax,
      taxTotal,
      discountTotal,
      grandTotal,

      paymentMode,
      paymentStatus,
      paidAmount,
      dueAmount,

      orderStatus,

      deviceId,
      deviceName,
      appVersion,

      businessDate,
      realDate,
      createdAt,
      syncStatus

    ) VALUES (

      @id,
      @srno,
      @orderType,
      @tableNo,
      @tableName,

      @customerName,
      @customerPhone,

      @itemTotal,
      @itemTax,
      @taxTotal,
      @discountTotal,
      @grandTotal,

      @paymentMode,
      @paymentStatus,
      @paidAmount,
      @dueAmount,

      @orderStatus,

      @deviceId,
      @deviceName,
      @appVersion,

      @businessDate,
      @realDate,
      @createdAt,

      @syncStatus

    )
  `);


  // ===================================================
  // ORDER ITEMS
  // ===================================================

  const insertItem = db.prepare(`
    INSERT INTO pos_order_items (

      id,
      orderMasterId,

      categoryName,
      productMode,
      currentStock,

      productId,
      name,
      categoryId,

      parentId,
      isVariant,

      basePrice,
      quantity,
      itemSubtotal,

      currency,
      paymentStatus,

      taxRate,
      taxType,

      taxAmountPerItem,
      taxTotal,

      note,
      modifiersJson,

      modifierPrice,
      modifierSummary,

      finalPricePerItem,
      finalTotal,

      createdAt

    ) VALUES (

      @id,
      @orderMasterId,

      @categoryName,
      @productMode,
      @currentStock,

      @productId,
      @name,
      @categoryId,

      @parentId,
      @isVariant,

      @basePrice,
      @quantity,
      @itemSubtotal,

      @currency,
      @paymentStatus,

      @taxRate,
      @taxType,

      @taxAmountPerItem,
      @taxTotal,

      @note,
      @modifiersJson,

      @modifierPrice,
      @modifierSummary,

      @finalPricePerItem,
      @finalTotal,

      @createdAt

    )
  `);


  // ===================================================
  // TRANSACTION
  // ===================================================

  const tx = db.transaction(() => {

    // ================================================
    // ORDER MASTER
    // ================================================

    insertMaster.run({

      id:
        master.id,

      srno:
        master.srno,

      orderType:
        master.orderType,

      tableNo:
        master.tableNo ?? null,

      tableName:
        master.tableName ?? null,


      customerName:
        master.customerName ?? 'Customer',

      customerPhone:
        master.customerPhone ?? '',


      itemTotal:
        master.itemTotal ?? 0,

      itemTax:
        master.itemTax ?? 0,

      taxTotal:
        master.taxTotal ?? 0,

      discountTotal:
        master.discountTotal ?? 0,

      grandTotal:
        master.grandTotal ?? 0,


      paymentMode:
        master.paymentMode ?? 'CASH',

      paymentStatus:
        master.paymentStatus ?? 'PAID',

      paidAmount:
        master.paidAmount ?? 0,

      dueAmount:
        master.dueAmount ?? 0,


      orderStatus:
        master.orderStatus ?? 'COMPLETED',


      deviceId:
        master.deviceId ?? 'POS',

      deviceName:
        master.deviceName ?? 'Electron POS',

      appVersion:
        master.appVersion ?? '1.0',


      businessDate:
        master.businessDate ??
        getLocalBusinessDate(),

      realDate:
        realDate,

      createdAt:
        master.createdAt ??
        Date.now(),


      syncStatus:
        master.syncStatus ?? 'PENDING',

    });


    // ================================================
    // ORDER ITEMS
    // ================================================

    for (const item of items) {

      insertItem.run({

        id:
          randomUUID(),

        orderMasterId:
          master.id,


        categoryName:
          item.categoryName ?? '',

        productMode:
          item.productMode ?? '',

        currentStock:
          item.currentStock ?? 0,


        productId:
          item.productId ?? '',

        name:
          item.name ?? '',

        categoryId:
          item.categoryId ?? '',


        parentId:
          item.parentId ?? null,

        isVariant:
          item.isVariant ? 1 : 0,


        basePrice:
          item.basePrice ?? 0,

        quantity:
          item.quantity ?? 0,


        itemSubtotal:
          item.itemSubtotal ??
          (
            Number(item.basePrice || 0) *
            Number(item.quantity || 0)
          ),


        currency:
          item.currency ?? '₹',

        paymentStatus:
          item.paymentStatus ?? 'PAID',


        taxRate:
          item.taxRate ?? 0,

        taxType:
          item.taxType ?? 'exclusive',


        taxAmountPerItem:
          item.taxAmountPerItem ?? 0,

        taxTotal:
          item.taxTotal ?? 0,


        note:
          item.note ?? '',

        modifiersJson:
          item.modifiersJson ?? '',


        modifierPrice:
          item.modifierPrice ?? 0,

        modifierSummary:
          item.modifierSummary ?? '',


        finalPricePerItem:
          item.finalPricePerItem ??
          item.finalPrice ??
          item.basePrice ??
          0,


        finalTotal:
          item.finalTotal ??
          item.finalPrice ??
          (
            Number(item.basePrice || 0) *
            Number(item.quantity || 0)
          ),


        createdAt:
          item.createdAt ??
          Date.now(),

      });

    }

  });


  tx();
}


// =====================================================
// GET ORDER BY ID
// =====================================================

function getOrderById(id) {

  return db
    .prepare(`
      SELECT *
      FROM pos_order_master
      WHERE id = ?
    `)
    .get(id);
}


// =====================================================
// GET ORDER ITEMS
// =====================================================

function getOrderItems(orderMasterId) {

  return db
    .prepare(`
      SELECT *
      FROM pos_order_items
      WHERE orderMasterId = ?
       AND status = 'DONE'
      ORDER BY createdAt ASC
    `)
    .all(orderMasterId);
}



function getOrderDeletedItems(orderMasterId) {
  return db
    .prepare(`
      SELECT *
      FROM pos_order_items
      WHERE
        orderMasterId = ?
        AND status = 'DELETED'
      ORDER BY createdAt ASC
    `)
    .all(orderMasterId);
}


// =====================================================
// LOCAL BUSINESS DATE
// =====================================================

function getLocalBusinessDate() {

  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, '0');


  const day =
    String(
      now.getDate()
    ).padStart(2, '0');


  return `${year}-${month}-${day}`;
}

function getRealDate(createdAt) {
  const date = new Date(createdAt);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
// =====================================================
// GET ORDERS BY BUSINESS DATE
// =====================================================
//
// No date:
//   → today's orders
//
// With date:
//   → selected day's orders
//
// Example:
//
// getOrders()
//
// getOrders('2026-08-16')
//
// =====================================================

function getOrders(date) {
  const businessDate =
    date || getLocalBusinessDate();
console.log("show----------------------------------")
  const orders = db
    .prepare(`
      SELECT
        id,
        srno,
        orderType,
        tableNo,
        tableName,
        customerName,
        customerPhone,
        itemTotal,
        itemTax,
        taxTotal,
        discountTotal,
        grandTotal,
        paymentMode,
        paymentStatus,
        paidAmount,
        dueAmount,
        createdById,
        createdByName,
        finalizedById,
        finalizedByName,
        orderStatus,
        deviceId,
        deviceName,
        appVersion,
        businessDate,
        createdAt,
        syncStatus
      FROM pos_order_master
      WHERE businessDate = ?
      ORDER BY createdAt DESC
    `)
    .all(businessDate);

  console.log(
    "GET ORDERS FINALIZER:",
    orders.map(order => ({
      srno: order.srno,
      finalizedById: order.finalizedById,
      finalizedByName: order.finalizedByName,
    }))
  );

  return orders;
}

function getOrdersByBusinessDate(date) {
  const businessDate =
    date || getCurrentBusinessDate();

  return db
    .prepare(`
      SELECT
        id,
        srno,
        orderType,
        tableNo,
        tableName,

        customerName,
        customerPhone,

        itemTotal,
        itemTax,
        taxTotal,
        discountTotal,
        grandTotal,

        paymentMode,
        paymentStatus,

        paidAmount,
        dueAmount,
         createdById,
        createdByName,
        finalizedById,
        finalizedByName,

        orderStatus,

        deviceId,
        deviceName,
        appVersion,

        businessDate,
        realDate,
        createdAt,

        syncStatus

      FROM pos_order_master

      WHERE businessDate = ?

      ORDER BY createdAt DESC
    `)
    .all(businessDate);
}


function getOrdersByRealDate(date) {

  console.log("getOrdersByRealDate----------------------------------")
  const realDate =
    date || getLocalBusinessDate();

  return db
    .prepare(`
      SELECT
        id,
        srno,
        orderType,
        tableNo,
        tableName,

        customerName,
        customerPhone,

        itemTotal,
        itemTax,
        taxTotal,
        discountTotal,
        grandTotal,

        paymentMode,
        paymentStatus,

        paidAmount,
        dueAmount,
         createdById,
        createdByName,
        finalizedById,
        finalizedByName,

        orderStatus,

        deviceId,
        deviceName,
        appVersion,

        businessDate,
        realDate,
        createdAt,

        syncStatus

      FROM pos_order_master

      WHERE realDate = ?

      ORDER BY createdAt DESC
    `)
    .all(realDate);

 
}

function generateNextPosOrderNumber(orderType) {
  let prefix;

  if (orderType === 'TAKEAWAY') {
    prefix = 'TW';
  } else if (orderType === 'DELIVERY') {
    prefix = 'DL';
  } else {
    throw new Error(
      `Unsupported POS order type: ${orderType}`
    );
  }

  // =====================================================
  // BUSINESS DATE
  // Resets automatically every new day
  // =====================================================

  const now = new Date();

  const dateKey =
    `${now.getFullYear()}-` +
    `${String(now.getMonth() + 1).padStart(2, '0')}-` +
    `${String(now.getDate()).padStart(2, '0')}`;

  // =====================================================
  // SEQUENCE TABLE
  // =====================================================

  db.prepare(`
    CREATE TABLE IF NOT EXISTS pos_daily_order_sequence (
      dateKey TEXT NOT NULL,
      orderType TEXT NOT NULL,
      lastNumber INTEGER NOT NULL DEFAULT 0,

      PRIMARY KEY (
        dateKey,
        orderType
      )
    )
  `).run();

  // =====================================================
  // GENERATE NEXT NUMBER
  // =====================================================

  const transaction = db.transaction(() => {

    const existing = db
      .prepare(`
        SELECT lastNumber
        FROM pos_daily_order_sequence
        WHERE dateKey = ?
          AND orderType = ?
      `)
      .get(
        dateKey,
        orderType
      );

    let nextNumber;

    if (!existing) {

      nextNumber = 1;

      db.prepare(`
        INSERT INTO pos_daily_order_sequence (
          dateKey,
          orderType,
          lastNumber
        )
        VALUES (?, ?, ?)
      `).run(
        dateKey,
        orderType,
        nextNumber
      );

    } else {

      nextNumber =
        existing.lastNumber + 1;

      db.prepare(`
        UPDATE pos_daily_order_sequence
        SET lastNumber = ?
        WHERE dateKey = ?
          AND orderType = ?
      `).run(
        nextNumber,
        dateKey,
        orderType
      );
    }

    return `${prefix}${nextNumber}`;
  });

  const orderNumber = transaction();

  console.log(
    'POS ORDER NUMBER =>',
    {
      orderType,
      dateKey,
      orderNumber,
    }
  );

  return orderNumber;
}


async function getTodayPosOrderNumbers(orderType) {

  if (
    orderType !== 'TAKEAWAY' &&
    orderType !== 'DELIVERY'
  ) {
    return [];
  }

  const prefix =
    orderType === 'TAKEAWAY'
      ? 'TW'
      : 'DL';

  const now = new Date();

  const dateKey =
    `${now.getFullYear()}-` +
    `${String(now.getMonth() + 1).padStart(2, '0')}-` +
    `${String(now.getDate()).padStart(2, '0')}`;

    
  db.prepare(`
    CREATE TABLE IF NOT EXISTS pos_daily_order_sequence (
      dateKey TEXT NOT NULL,
      orderType TEXT NOT NULL,
      lastNumber INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (dateKey, orderType)
    )
  `).run();


  const row = db
    .prepare(`
      SELECT lastNumber
      FROM pos_daily_order_sequence
      WHERE dateKey = ?
        AND orderType = ?
    `)
    .get(
      dateKey,
      orderType
    );

  if (!row) {
    return [];
  }

  const orders = [];

  for (
    let i = 1;
    i <= row.lastNumber;
    i++
  ) {
    const orderNo = `${prefix}${i}`;

    orders.push({
      orderNo,
      tableId: orderNo,
      tableName: orderNo,
      orderType,
    });
  }

  return orders;
}
// =====================================================
// EXPORTS
// =====================================================

module.exports = {

  insertOrder,
  getTodayPosOrderNumbers,
  generateNextPosOrderNumber,
  getOrdersByBusinessDate,
  getOrdersByRealDate,

  getOrders,

  getOrderById,

  getOrderItems,
  getOrderDeletedItems,

  getLocalBusinessDate,

};