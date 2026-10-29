const { db } = require('./sqlite.cjs');

const kotHistoryRepo =
  require('./kotHistoryRepository.cjs');


function insertKotBatch(batch) {

  const stmt = db.prepare(`
    INSERT INTO pos_kot_batch (
      id,
      kotNumber,
      sessionId,
      tableNo,
      tableName,
      orderType,
      deviceId,
      deviceName,
      appVersion,
      createdAt,
      sentBy,
      syncStatus,
      lastSyncedAt
    )
    VALUES (
      @id,
      @kotNumber,
      @sessionId,
      @tableNo,
      @tableName,
      @orderType,
      @deviceId,
      @deviceName,
      @appVersion,
      @createdAt,
      @sentBy,
      @syncStatus,
      @lastSyncedAt
    )
  `);

  stmt.run({
    id:
      batch.id,

    kotNumber:
      batch.kotNumber,

    sessionId:
      batch.sessionId ?? null,

    tableNo:
      batch.tableNo ?? null,

    tableName:
      batch.tableName ?? null,

    orderType:
      batch.orderType ?? 'DINE_IN',

    deviceId:
      batch.deviceId ?? null,

    deviceName:
      batch.deviceName ?? null,

    appVersion:
      batch.appVersion ?? null,

    createdAt:
      batch.createdAt ?? Date.now(),

    sentBy:
      batch.sentBy ?? null,

    syncStatus:
      batch.syncStatus ?? 'PENDING',

    lastSyncedAt:
      batch.lastSyncedAt ?? null,
  });

  return {
    success: true,
    id: batch.id,
    kotNumber: batch.kotNumber,
  };
}

async function insertKotItems(items) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO pos_kot_items (
      id, kotNumber, categoryName, productMode, currentStock,
      sessionId, kotBatchId,
      tableNo, tableName,
      productId, name, categoryId,
      createdById, createdByName,
      parentId, isVariant,
      basePrice, finalPrice, modifierTotal, quantity,
      taxRate, taxType,
      status, note, modifiersJson,
      kitchenPrintReq, kitchenPrinted, createdAt,
      source, syncedToCloud, syncedFromCloud
    ) VALUES (
      @id, @kotNumber, @categoryName, @productMode, @currentStock,
      @sessionId, @kotBatchId,
      @tableNo, @tableName,
      @productId, @name, @categoryId,
      @createdById, @createdByName,
      @parentId, @isVariant,
      @basePrice, @finalPrice, @modifierTotal, @quantity,
      @taxRate, @taxType,
      @status, @note, @modifiersJson,
      @kitchenPrintReq, @kitchenPrinted, @createdAt,
      @source, @syncedToCloud, @syncedFromCloud
    )
  `);

  const tx = db.transaction((rows) => {
    for (const row of rows) {
      stmt.run({
        ...row,
        isVariant: row.isVariant ? 1 : 0,
        kitchenPrintReq: row.kitchenPrintReq ? 1 : 0,
        kitchenPrinted: row.kitchenPrinted ? 1 : 0,
        syncedToCloud: row.syncedToCloud ? 1 : 0,
        syncedFromCloud: row.syncedFromCloud ? 1 : 0,
      });
    }
  });

  tx(items);
}

function createKot({
  batch,
  items = [],
}) {
  // console.log("Kot created by createKot-------------------7777777",items) 
  if (!batch?.id) {
    throw new Error('KOT batch id is required');
  }
  if (!batch?.kotNumber) {
    throw new Error('KOT number is required');
  }
  if (!batch?.tableNo) {
    throw new Error('Table number is required');
  }
  if (!items.length) {
    throw new Error('KOT items are required');
  }

  console.log('========== CREATE KOT: INCOMING ITEMS ==========');

for (const item of items) {
  console.log({
    productId: item.productId,
    name: item.name,
    discountEligible: item.discountEligible,
    type: typeof item.discountEligible,
  });
}

 console.log('================================================');
  const transaction = db.transaction(() => {
    // =============================================
    // 1. INSERT KOT BATCH
    // =============================================

    insertKotBatch(batch);
    // =============================================
    // 2. INSERT ACTIVE KOT ITEMS
    // =============================================
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO pos_kot_items (
        id,
        kotNumber,
        categoryName,
        productMode,
        currentStock,
        sessionId,
        kotBatchId, 
        tableNo,
        tableName,
        productId,
        discountEligible,
        name,
        categoryId,
        createdById,
        createdByName,
        parentId,
        isVariant,
        basePrice,
        finalPrice,
        modifierTotal,
        quantity,
        taxRate,
        taxType,
        status,
        note,
        modifiersJson,
        kitchenPrintReq,
        kitchenPrinted,
        createdAt,
        source,
        syncedToCloud,
        syncedFromCloud
      )
      VALUES (
        @id,
        @kotNumber,
        @categoryName,
        @productMode,
        @currentStock,
        @sessionId,
        @kotBatchId,
        @tableNo,
        @tableName,
        @productId,
        @discountEligible,
        @name,
        @categoryId,
        @createdById,
        @createdByName,
        @parentId,
        @isVariant,
        @basePrice,
        @finalPrice,
        @modifierTotal,
        @quantity,
        @taxRate,
        @taxType,
        @status,
        @note,
        @modifiersJson,
        @kitchenPrintReq,
        @kitchenPrinted,
        @createdAt,
        @source,
        @syncedToCloud,
        @syncedFromCloud
      )
    `);

    for (const item of items) {
      stmt.run({
        ...item,

        kotNumber:
          batch.kotNumber,

        kotBatchId:
          batch.id,

        tableNo:
          batch.tableNo,

        tableName:
          batch.tableName ?? '',

        sessionId:
          batch.sessionId ?? 'DEFAULT',

        isVariant:
          item.isVariant ? 1 : 0,

        kitchenPrintReq:
          item.kitchenPrintReq ? 1 : 0,
         
        kitchenPrinted:
          item.kitchenPrinted ? 1 : 0,

        syncedToCloud:
          item.syncedToCloud ? 1 : 0,

        syncedFromCloud:
          item.syncedFromCloud ? 1 : 0,
      });
    }


    // =============================================
    // 3. CREATE KOT HISTORY
    // =============================================

    kotHistoryRepo.insertKotHistoryInTransaction({
      kotBatchId:
        batch.id,

      kotNumber:
        batch.kotNumber,

      tableNo:
        batch.tableNo,

      tableName:
        batch.tableName ?? '',

      orderType:
        batch.orderType ?? 'DINE_IN',

      businessDate:
        batch.businessDate,

      deviceId:
        batch.deviceId ?? 'POS',

      deviceName:
        batch.deviceName ?? 'Electron POS',

      appVersion:
        batch.appVersion ?? '1.0',

      sentBy:
        batch.sentBy ?? null,

      items,
    });

  });

  transaction();

  return {
    success: true,
    kotBatchId: batch.id,
    kotNumber: batch.kotNumber,
    itemCount: items.length,
  };
}


function generateNextKotNumber() {
  const transaction = db.transaction(() => {

    const row = db.prepare(`
      SELECT nextNumber
      FROM pos_kot_sequence
      WHERE id = 1
    `).get();

    if (!row) {
      throw new Error(
        'KOT sequence is not initialized'
      );
    }

    const number = Number(row.nextNumber);

    if (!Number.isInteger(number) || number < 1) {
      throw new Error(
        `Invalid KOT sequence number: ${row.nextNumber}`
      );
    }

    db.prepare(`
      UPDATE pos_kot_sequence
      SET nextNumber = ?
      WHERE id = 1
    `).run(number + 1);

    return `K${number}`;
  });

  return transaction();
}

async function getPendingKotByTable(tableNo) {
  return db.prepare(`
    SELECT * FROM pos_kot_items
    WHERE tableNo = ? AND status = 'PENDING'
    ORDER BY createdAt ASC
  `).all(tableNo);
}

async function getKotByBatch(kotBatchId) {
  return db.prepare(`
    SELECT * FROM pos_kot_items
    WHERE kotBatchId = ?
    ORDER BY createdAt ASC
  `).all(kotBatchId);
}

async function markKotPrinted(kotBatchId) {
  return db.prepare(`
    UPDATE pos_kot_items
    SET kitchenPrinted = 1
    WHERE kotBatchId = ?
  `).run(kotBatchId);
}

async function updateKotStatus(id, status) {
  return db.prepare(`
    UPDATE pos_kot_items
    SET status = ?
    WHERE id = ?
  `).run(status, id);
}

module.exports = {
  createKot,
  generateNextKotNumber,
  insertKotBatch,
  insertKotItems,
  getPendingKotByTable,
  getKotByBatch,
  markKotPrinted,
  updateKotStatus,
};