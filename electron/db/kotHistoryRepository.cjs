const { db } = require('./sqlite.cjs');
const crypto = require('crypto');

function uuid() {
  return crypto.randomUUID();
}


// =====================================================
// INSERT KOT HISTORY INSIDE EXISTING TRANSACTION
// =====================================================

function insertKotHistoryInTransaction({
  kotBatchId,
  kotNumber,
  tableNo,
  tableName = '',
  orderType = 'DINE_IN',
  businessDate,
  deviceId = 'POS',
  deviceName = 'Electron POS',
  appVersion = '1.0',
  sentBy = null,
  items = [],
}) {


  if (!kotBatchId) {
    throw new Error('kotBatchId is required');
  }

  if (!kotNumber) {
    throw new Error('kotNumber is required');
  }

  if (!tableNo) {
    throw new Error('tableNo is required');
  }

  if (!businessDate) {
    throw new Error('businessDate is required');
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('KOT history items are required');
  }

  const now = Date.now();

  const kotHistoryId = uuid();


  // =====================================================
  // 1. HISTORY HEADER
  // =====================================================

  db.prepare(`
    INSERT INTO pos_kot_history (

      id,

      kotBatchId,
      kotNumber,

      tableNo,
      tableName,

      orderType,

      status,

      businessDate,

      createdAt,
      completedAt,

      deletedAt,
      deletedById,
      deletedByName,

      deviceId,
      deviceName,
      appVersion,

      sentBy,

      syncStatus,
      lastSyncedAt

    ) VALUES (

      @id,

      @kotBatchId,
      @kotNumber,

      @tableNo,
      @tableName,

      @orderType,

      'OPEN',

      @businessDate,

      @createdAt,
      NULL,

      NULL,
      NULL,
      NULL,

      @deviceId,
      @deviceName,
      @appVersion,

      @sentBy,

      'PENDING',
      NULL

    )
  `).run({

    id: kotHistoryId,
    kotBatchId,
    kotNumber,

    tableNo,

    tableName:
     tableName || '',

    orderType,

    businessDate,

    createdAt: now,

    deviceId,
    deviceName,
    appVersion,

    sentBy,
  });


  // =====================================================
  // 2. HISTORY ITEMS
  // =====================================================

  const insertItem = db.prepare(`
    INSERT INTO pos_kot_history_items (

      id,

      kotHistoryId,

      kotBatchId,
      kotNumber,
      tableNo,
      productId,
      name,

      categoryId,
      categoryName,

      parentId,
      isVariant,

      productMode,

      basePrice,
      quantity,

      modifierPrice,
      modifierSummary,
      modifiersJson,

      note,

      taxRate,
      taxType,

      taxAmountPerItem,
      taxTotal,

      finalPricePerItem,
      finalTotal,

      status,

      source,

      createdAt,
      deletedAt,

      syncStatus,
      lastSyncedAt

    ) VALUES (

      @id,

      @kotHistoryId,

      @kotBatchId,
      @kotNumber,

      @tableNo,

      @productId,
      @name,

      @categoryId,
      @categoryName,

      @parentId,
      @isVariant,

      @productMode,

      @basePrice,
      @quantity,

      @modifierPrice,
      @modifierSummary,
      @modifiersJson,

      @note,

      @taxRate,
      @taxType,

      @taxAmountPerItem,
      @taxTotal,

      @finalPricePerItem,
      @finalTotal,

      'ACTIVE',

      @source,

      @createdAt,
      NULL,

      'PENDING',
      NULL

    )
  `);


  // =====================================================
  // 3. INSERT EACH ITEM
  // =====================================================

  for (const item of items) {

    const quantity =
      Number(item.quantity || 0);

    const basePrice =
      Number(item.basePrice || 0);

    const modifierPrice =
      Number(
        item.modifierTotal ??
        item.modifierPrice ??
        0
      );

    const finalPricePerItem =
      Number(
        item.finalPrice ??
        item.finalPricePerItem ??
        (basePrice + modifierPrice)
      );

    const finalTotal =
      Number(
        item.finalTotal ??
        (finalPricePerItem * quantity)
      );

    const taxRate =
      Number(item.taxRate || 0);

    const taxTotal =
      Number(item.taxTotal || 0);

    const taxAmountPerItem =
      Number(
        item.taxAmountPerItem ??
        (
          quantity > 0
            ? taxTotal / quantity
            : 0
        )
      );


    insertItem.run({

      id: uuid(),

      kotHistoryId,

      kotBatchId,
      kotNumber,

      tableNo,

      productId:
        item.productId || '',

      name:
        item.name || '',

      categoryId:
        item.categoryId || '',

      categoryName:
        item.categoryName || '',

      parentId:
        item.parentId || null,

      isVariant:
        item.isVariant ? 1 : 0,

      productMode:
        item.productMode || 'raw_stock',

      basePrice,

      quantity,

      modifierPrice,

      modifierSummary:
        item.modifierSummary || '',

      modifiersJson:
        item.modifiersJson || '',

      note:
        item.note || '',

      taxRate,

      taxType:
        item.taxType || 'exclusive',

      taxAmountPerItem,

      taxTotal,

      finalPricePerItem,

      finalTotal,

      source:
        item.source || 'POS',

      createdAt:
        now,
    });
  }


  return {
    kotHistoryId,
    kotBatchId,
    kotNumber,
    itemCount: items.length,
  };
}


// =====================================================
// CREATE KOT HISTORY
// Standalone version
// =====================================================

function createKotHistory(args) {

  const transaction = db.transaction(() => {

    return insertKotHistoryInTransaction(args);

  });

  const result = transaction();

  return {
    success: true,
    id: result.kotHistoryId,
    kotBatchId: result.kotBatchId,
    kotNumber: result.kotNumber,
    itemCount: result.itemCount,
  };
}


// =====================================================
// GET KOT HISTORY
// =====================================================

function getKotHistory({
  businessDate = null,
} = {}) {

  if (businessDate) {

    return db.prepare(`
      SELECT *
      FROM pos_kot_history
      WHERE businessDate = ?
      ORDER BY createdAt DESC
    `).all(businessDate);

  }

  return db.prepare(`
    SELECT *
    FROM pos_kot_history
    ORDER BY createdAt DESC
  `).all();
}


// =====================================================
// GET KOT HISTORY DETAIL
// =====================================================

function getKotHistoryDetail(kotHistoryId) {

  const kot =
    db.prepare(`
      SELECT *
      FROM pos_kot_history
      WHERE id = ?
    `).get(kotHistoryId);

  if (!kot) {
    return null;
  }

  const items =
    db.prepare(`
      SELECT *
      FROM pos_kot_history_items
      WHERE kotHistoryId = ?
      ORDER BY createdAt ASC
    `).all(kotHistoryId);

  return {
    ...kot,
    items,
  };
}


// =====================================================
// MARK HISTORY ITEM DELETED
// =====================================================

function markHistoryItemDeleted({
  kotHistoryId,
  productId,
  deletedById = '',
  deletedByName = '',
}) {

  const now = Date.now();

  const transaction = db.transaction(() => {

    db.prepare(`
      UPDATE pos_kot_history_items
      SET
        status = 'DELETED',
        deletedAt = ?,
        syncStatus = 'PENDING'
      WHERE kotHistoryId = ?
        AND productId = ?
        AND status = 'ACTIVE'
    `).run(
      now,
      kotHistoryId,
      productId
    );

    updateKotHistoryStatus(
      kotHistoryId
    );

  });

  transaction();

  return {
    success: true,
  };
}


// =====================================================
// UPDATE KOT HISTORY STATUS
// =====================================================

function updateKotHistoryStatus(kotHistoryId) {

  const counts =
    db.prepare(`
      SELECT

        COUNT(*) AS total,

        SUM(
          CASE
            WHEN status = 'ACTIVE'
            THEN 1
            ELSE 0
          END
        ) AS active,

        SUM(
          CASE
            WHEN status = 'DELETED'
            THEN 1
            ELSE 0
          END
        ) AS deleted

      FROM pos_kot_history_items

      WHERE kotHistoryId = ?
    `).get(kotHistoryId);


  let status = 'OPEN';


  if (
    counts.total > 0 &&
    counts.deleted === counts.total
  ) {

    status = 'DELETED';

  } else if (
    counts.deleted > 0
  ) {

    status = 'PARTIAL';
  }


  db.prepare(`
    UPDATE pos_kot_history
    SET
      status = ?,
      syncStatus = 'PENDING'
    WHERE id = ?
  `).run(
    status,
    kotHistoryId
  );


  return status;
}


// =====================================================
// MARK KOT PAID
// =====================================================


function markTableHistoryPaid({
  tableNo,
  billItems = [],
  orderId = null,
}) {
  if (!tableNo) {
    throw new Error('tableNo is required');
  }

  if (!Array.isArray(billItems)) {
    throw new Error('billItems must be an array');
  }

  const now = Date.now();

  let historyCount = 0;
  let paidItemCount = 0;
  let deletedItemCount = 0;

  const transaction = db.transaction(() => {

    // =====================================================
    // 1. GET OPEN / PARTIAL KOT HISTORY FOR TABLE
    // =====================================================

    const histories = db.prepare(`
      SELECT
        id,
        kotBatchId,
        kotNumber,
        tableNo,
        status
      FROM pos_kot_history
      WHERE tableNo = ?
        AND status NOT IN ('PAID', 'DELETED')
      ORDER BY createdAt ASC
    `).all(tableNo);

    historyCount = histories.length;


    // =====================================================
    // 2. PROCESS EACH KOT HISTORY
    // =====================================================

    for (const history of histories) {

      const historyItems = db.prepare(`
        SELECT *
        FROM pos_kot_history_items
        WHERE kotHistoryId = ?
          AND status = 'ACTIVE'
      `).all(history.id);


      // ===================================================
      // 3. MATCH HISTORY ITEMS WITH FINAL BILL
      // ===================================================

      for (const historyItem of historyItems) {

        const existsInBill = billItems.some(
          (billItem) => {

            return (
              billItem.productId ===
                historyItem.productId &&

              Number(billItem.basePrice ?? 0) ===
                Number(historyItem.basePrice ?? 0) &&

              (billItem.parentId ?? null) ===
                (historyItem.parentId ?? null) &&

              Boolean(billItem.isVariant) ===
                Boolean(historyItem.isVariant) &&

              (billItem.note ?? '') ===
                (historyItem.note ?? '') &&

              (billItem.modifiersJson ?? '') ===
                (historyItem.modifiersJson ?? '')
            );

          }
        );


        // =================================================
        // ITEM EXISTS IN FINAL BILL
        // =================================================

        if (existsInBill) {

          db.prepare(`
            UPDATE pos_kot_history_items

            SET
              status = 'PAID',
              syncStatus = 'PENDING',
              lastSyncedAt = NULL

            WHERE id = ?
          `).run(
            historyItem.id
          );

          paidItemCount++;

        }


        // =================================================
        // ITEM DOES NOT EXIST IN FINAL BILL
        // =================================================

        else {

          db.prepare(`
            UPDATE pos_kot_history_items

            SET
              status = 'DELETED',
              deletedAt = ?,
              syncStatus = 'PENDING',
              lastSyncedAt = NULL

            WHERE id = ?
          `).run(
            now,
            historyItem.id
          );

          deletedItemCount++;
        }
      }


      // ===================================================
      // 4. CALCULATE HISTORY STATUS
      // ===================================================

      const counts = db.prepare(`
        SELECT

          COUNT(*) AS total,

          SUM(
            CASE
              WHEN status = 'PAID'
              THEN 1
              ELSE 0
            END
          ) AS paid,

          SUM(
            CASE
              WHEN status = 'ACTIVE'
              THEN 1
              ELSE 0
            END
          ) AS active,

          SUM(
            CASE
              WHEN status = 'DELETED'
              THEN 1
              ELSE 0
            END
          ) AS deleted

        FROM pos_kot_history_items

        WHERE kotHistoryId = ?
      `).get(history.id);


      const total =
        Number(counts.total || 0);

      const paid =
        Number(counts.paid || 0);

      const active =
        Number(counts.active || 0);

      const deleted =
        Number(counts.deleted || 0);


      let status = 'OPEN';


      if (
        total > 0 &&
        paid === total
      ) {

        status = 'PAID';

      } else if (
        total > 0 &&
        deleted === total
      ) {

        status = 'DELETED';

      } else if (
        paid > 0 ||
        deleted > 0
      ) {

        status = 'PARTIAL';

      }


      // ===================================================
      // 5. UPDATE HISTORY HEADER
      // ===================================================

      db.prepare(`
        UPDATE pos_kot_history

        SET
          status = ?,

          completedAt =
            CASE
              WHEN ? = 'PAID'
              THEN ?
              ELSE completedAt
            END,

          syncStatus = 'PENDING',
          lastSyncedAt = NULL

        WHERE id = ?
      `).run(
        status,
        status,
        now,
        history.id
      );


      // console.log(
      //   'KOT HISTORY CHECKOUT:',
      //   {
      //     kotHistoryId: history.id,
      //     kotNumber: history.kotNumber,
      //     total,
      //     paid,
      //     active,
      //     deleted,
      //     status,
      //   }
      // );
    }
  });


  transaction();


  console.log(
    'KOT HISTORY TABLE PAID:',
    {
      tableNo,
      orderId,
      historyCount,
      paidItemCount,
      deletedItemCount,
    }
  );


  return {
    success: true,
    tableNo,
    orderId,
    historyCount,
    paidItemCount,
    deletedItemCount,
  };
}

function markKotHistoryPaid(kotHistoryId) {



  if (!kotHistoryId) {
    throw new Error(
      'kotHistoryId is required'
    );
  }

  const history = db.prepare(`
    SELECT
      id,
      kotBatchId,
      kotNumber,
      tableNo,
      status
    FROM pos_kot_history
    WHERE id = ?
  `).get(kotHistoryId);

  console.log(
    'KOT HISTORY FOUND:',
    history
  );

  const historyItems = db.prepare(`
    SELECT
      id,
      kotHistoryId,
      kotBatchId,
      kotNumber,
      productId,
      name,
      status
    FROM pos_kot_history_items
    WHERE kotHistoryId = ?
  `).all(kotHistoryId);

  console.log(
    'KOT HISTORY ITEMS FOUND:',
    historyItems
  );

  const now = Date.now();

  const transaction = db.transaction(() => {

    const itemResult = db.prepare(`
      UPDATE pos_kot_history_items
      SET
        status = 'PAID',
        syncStatus = 'PENDING'
      WHERE kotHistoryId = ?
        AND status = 'ACTIVE'
    `).run(kotHistoryId);

    console.log(
      'HISTORY ITEMS UPDATED:',
      itemResult.changes
    );


    const historyResult = db.prepare(`
      UPDATE pos_kot_history
      SET
        status = 'PAID',
        completedAt = ?,
        syncStatus = 'PENDING'
      WHERE id = ?
    `).run(
      now,
      kotHistoryId
    );

    console.log(
      'HISTORY HEADER UPDATED:',
      historyResult.changes
    );

  });

  transaction();


  const verify = db.prepare(`
    SELECT
      id,
      kotBatchId,
      kotNumber,
      status,
      completedAt
    FROM pos_kot_history
    WHERE id = ?
  `).get(kotHistoryId);

  console.log(
    'KOT HISTORY AFTER UPDATE:',
    verify
  );

  console.log(
    '==========================================='
  );

  return {
    success: true,
    changes: {
      items: historyItems.length,
    },
  };
}

function markKotHistoryPaidByTable({
  tableNo,
  orderId,
}) {

  if (!tableNo) {
    throw new Error(
      'tableNo is required'
    );
  }

  if (!orderId) {
    throw new Error(
      'orderId is required'
    );
  }

  const paidAt = Date.now();
  const transaction = db.transaction(() => {
    const result = db.prepare(`
      UPDATE pos_kot_history

      SET
        status = 'PAID',
        completedAt = ?,
        syncStatus = 'PENDING'

      WHERE tableNo = ?
        AND status != 'DELETED'
    `).run(
      paidAt,
      tableNo
    );

    return result.changes;
  });

  const rows = transaction();

  return {
    success: true,
    rows,
  };
}



 // =====================================================
 // GET DELETED KOT ITEMS
 // Returns individual deleted items, including items
 // from KOTs whose overall status is PARTIAL or PAID.
 // =====================================================
function getDeletedKotHistoryItems(selectedDate) {
  console.log('\n========== DELETED KOT DEBUG ==========');
  console.log('Selected date:', selectedDate);

  const allItems = db.prepare(`
    SELECT
      i.*,
      h.tableName AS tableName,
      h.orderType AS orderType,
      h.businessDate AS businessDate
    FROM pos_kot_history_items AS i
    LEFT JOIN pos_kot_history AS h
      ON h.id = i.kotHistoryId
    WHERE UPPER(i.status) = 'DELETED'
    ORDER BY i.deletedAt DESC, i.createdAt DESC
  `).all();

  console.log('Total deleted items:', allItems.length);

  allItems.forEach((item, index) => {
    console.log(`\n--- Deleted Item ${index + 1} ---`);
    console.log(item);
    console.log('All fields:', Object.keys(item));
    console.log('deletedAt value:', item.deletedAt);
    console.log('deletedAt type:', typeof item.deletedAt);
    console.log('createdAt value:', item.createdAt);
    console.log('status:', item.status);
  });

  console.log('\n========== END DELETED KOT DEBUG ==========\n');

  return allItems;
}

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  markTableHistoryPaid,

  createKotHistory,

  insertKotHistoryInTransaction,

  getKotHistory,

  getKotHistoryDetail,

  markHistoryItemDeleted,

  updateKotHistoryStatus,

  markKotHistoryPaid,

  getDeletedKotHistoryItems,

  

};