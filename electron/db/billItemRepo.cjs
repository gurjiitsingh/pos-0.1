const { db } = require('./sqlite.cjs');
const { randomUUID } = require('crypto');

// =====================================================
// INSERT BILL ITEMS
// =====================================================
function insertBillItems(items) {
  const stmt = db.prepare(`
    INSERT INTO pos_bill_items (
      id,
      billItemGroupKey,
      sessionId,
      tableNo,
      tableName,
      productId,
      name,
      categoryId,
      categoryName,
      parentId,
      discountEligible,
      isVariant,
      basePrice,
      finalPrice,
      modifierTotal,
      quantity,
      taxRate,
      taxType,
      note,
      modifiersJson,
      status,
      billed,
      createdAt
    ) VALUES (
      @id,
      @billItemGroupKey,
      @sessionId,
      @tableNo,
      @tableName,
      @productId,
      @name,
      @categoryId,
      @categoryName,
      @parentId,
      @discountEligible,
      @isVariant,
      @basePrice,
      @finalPrice,
      @modifierTotal,
      @quantity,
      @taxRate,
      @taxType,
      @note,
      @modifiersJson,
      'OPEN',
      0,
      @createdAt
    )
  `);

 const insertMany = db.transaction((rows) => {
  for (const item of rows) {
    // console.log('========== INSERT BILL ITEM: INCOMING ==========');
    // console.log('Product:', item.name);
    // console.log('Product ID:', item.productId);
    // console.log(
    //   'discountEligible:',
    //   item.discountEligible,
    //   '| type:',
    //   typeof item.discountEligible
    // );
    // console.log('================================================');

    const normalizedModifiers =
      normalizeModifiersJson(item.modifiersJson);

    stmt.run({
      id: randomUUID(),

      billItemGroupKey: [
        item.tableNo ?? '',
        item.productId,
        item.note ?? '',
        normalizedModifiers,
      ].join('|'),

      sessionId: item.sessionId ?? '',
      tableNo: item.tableNo ?? '',
      tableName: item.tableName ?? '',

      productId: item.productId,
      name: item.name,

      categoryId: item.categoryId,
      categoryName: item.categoryName ?? '',

      parentId: item.parentId ?? null,

      // SQLite INTEGER: false = 0, true = 1; missing = 1
      discountEligible:
        item.discountEligible == null
          ? 1
          : Number(item.discountEligible),

      isVariant: item.isVariant ? 1 : 0,

      basePrice: item.basePrice,
      finalPrice: item.finalPrice ?? item.basePrice,
      modifierTotal: item.modifierTotal ?? 0,

      quantity: item.quantity,

      taxRate: item.taxRate ?? 0,
      taxType: item.taxType ?? 'exclusive',

      note: item.note ?? '',
      modifiersJson: normalizedModifiers,

      createdAt: Date.now(),
    });
  }
});

  insertMany(items);

  return {
    success: true,
    count: items.length,
  };
}

function normalizeModifiersJson(value) {
  if (!value) {
    return '[]';
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return '[]';
    }

    return JSON.stringify(parsed);
  } catch {
    return value;
  }
}
// function insertBillItems(items) {

//   const stmt = db.prepare(`
//     INSERT INTO pos_bill_items (
//       id,
//       billItemGroupKey,
//       sessionId,
//       tableNo,
//       tableName,
//       productId,
//       name,
//       categoryId,
//       categoryName,
//       parentId,
//       isVariant,
//       basePrice,
//       finalPrice,
//       modifierTotal,
//       quantity,
//       taxRate,
//       taxType,
//       note,
//       modifiersJson,
//       status,
//       billed,
//       createdAt
//     ) VALUES (
//       @id,
//       @billItemGroupKey,
//       @sessionId,
//       @tableNo,
//       @tableName,
//       @productId,
//       @name,
//       @categoryId,
//       @categoryName,
//       @parentId,
//       @isVariant,
//       @basePrice,
//       @finalPrice,
//       @modifierTotal,
//       @quantity,
//       @taxRate,
//       @taxType,
//       @note,
//       @modifiersJson,
//       'OPEN',
//       0,
//       @createdAt
//     )
//   `);

//   // =====================================================
//   // DEBUG: FIND EXISTING BILL ITEMS
//   // =====================================================

//   const findExisting = db.prepare(`
//     SELECT
//       id,
//       billItemGroupKey,
//       tableNo,
//       productId,
//       name,
//       note,
//       modifiersJson,
//       quantity,
//       basePrice,
//       finalPrice,
//       modifierTotal,
//       taxRate,
//       taxType,
//       status,
//       billed
//     FROM pos_bill_items

//     WHERE tableNo = ?
//       AND productId = ?
//       AND billed = 0
//       AND status = 'OPEN'
//   `);


//   const insertMany = db.transaction((rows) => {

//     for (const item of rows) {

//       // =================================================
//       // BUILD INCOMING GROUP KEY
//       // =================================================

//       const incomingGroupKey = [
//         item.tableNo ?? '',
//         item.productId,
//         item.note ?? '',
//         item.modifiersJson ?? '',
//       ].join('|');


//       // =================================================
//       // DEBUG INCOMING ITEM
//       // =================================================

//       console.log(
//         '=============================================='
//       );

//       console.log(
//         'INSERT BILL ITEM - INCOMING WAITER/POS ITEM'
//       );

//       console.log(
//         'INCOMING ITEM:',
//         item
//       );

//       console.log(
//         'INCOMING ITEM JSON:',
//         JSON.stringify(
//           item,
//           null,
//           2
//         )
//       );

//       console.log(
//         'INCOMING GROUP KEY:',
//         incomingGroupKey
//       );


//       // =================================================
//       // FIND EXISTING ITEMS FOR SAME TABLE + PRODUCT
//       // =================================================

//       const existingRows =
//         findExisting.all(
//           item.tableNo ?? '',
//           item.productId
//         );


//       console.log(
//         'EXISTING DB ROWS FOR SAME TABLE + PRODUCT:',
//         existingRows
//       );


//       // =================================================
//       // COMPARE
//       // =================================================

//       if (existingRows.length > 0) {

//         for (const existing of existingRows) {

//           console.log(
//             '---------- GROUP KEY COMPARISON ----------'
//           );

//           console.log(
//             'INCOMING:',
//             {
//               tableNo:
//                 item.tableNo ?? '',

//               productId:
//                 item.productId,

//               note:
//                 item.note ?? '',

//               modifiersJson:
//                 item.modifiersJson ?? '',

//               groupKey:
//                 incomingGroupKey,
//             }
//           );

//           console.log(
//             'EXISTING:',
//             {
//               tableNo:
//                 existing.tableNo,

//               productId:
//                 existing.productId,

//               name:
//                 existing.name,

//               note:
//                 existing.note,

//               modifiersJson:
//                 existing.modifiersJson,

//               groupKey:
//                 existing.billItemGroupKey,
//             }
//           );


//           console.log(
//             'GROUP KEY SAME?:',
//             existing.billItemGroupKey ===
//             incomingGroupKey
//           );


//           // Individual comparisons

//           console.log(
//             'TABLE SAME?:',
//             existing.tableNo ===
//             (item.tableNo ?? '')
//           );

//           console.log(
//             'PRODUCT ID SAME?:',
//             existing.productId ===
//             item.productId
//           );

//           console.log(
//             'NOTE SAME?:',
//             existing.note ===
//             (item.note ?? '')
//           );

//           console.log(
//             'MODIFIERS SAME?:',
//             existing.modifiersJson ===
//             (item.modifiersJson ?? '')
//           );
//         }
//       }


//       console.log(
//         '=============================================='
//       );


//       // =================================================
//       // INSERT
//       // =================================================

//       stmt.run({

//         id:
//           randomUUID(),

//         billItemGroupKey:
//           incomingGroupKey,

//         sessionId:
//           item.sessionId ?? '',

//         tableNo:
//           item.tableNo ?? '',

//         tableName:
//           item.tableName ?? '',

//         productId:
//           item.productId,

//         name:
//           item.name,

//         categoryId:
//           item.categoryId,

//         categoryName:
//           item.categoryName ?? '',

//         parentId:
//           item.parentId ?? null,

//         isVariant:
//           item.isVariant ? 1 : 0,

//         basePrice:
//           item.basePrice,

//         finalPrice:
//           item.finalPrice ??
//           item.basePrice,

//         modifierTotal:
//           item.modifierTotal ?? 0,

//         quantity:
//           item.quantity,

//         taxRate:
//           item.taxRate ?? 0,

//         taxType:
//           item.taxType ??
//           'exclusive',

//         note:
//           item.note ?? '',

//         modifiersJson:
//           item.modifiersJson ?? '',

//         createdAt:
//           Date.now(),
//       });
//     }
//   });


//   insertMany(items);


//   return {
//     success: true,
//     count: items.length,
//   };
// }

// =====================================================
// GET OPEN BILL ITEMS
// =====================================================

function getOpenBillItems(tableNo) {
  return db.prepare(`
    SELECT *
    FROM pos_bill_items
    WHERE tableNo = ?
      AND billed = 0
      AND status = 'OPEN'
    ORDER BY createdAt ASC
  `).all(tableNo);
}

function countOpenBillItems(tableNo) {
  const result = db.prepare(`
    SELECT COUNT(*) AS total
    FROM pos_bill_items
    WHERE tableNo = ?
      AND billed = 0
      AND status = 'OPEN'
  `).get(tableNo);

  return Number(result?.total ?? 0);
}
// =====================================================
// GET ALL BILL ITEMS FOR WAITER SYNC
// =====================================================

function getAllBillItemsForWaiterSync() {
  return db.prepare(`
    SELECT *
    FROM pos_bill_items
    ORDER BY createdAt ASC
  `).all();
}

// =====================================================
// MARK BILL ITEMS AS BILLED
// =====================================================

function markBillItemsBilled(tableNo, billId, billNo) {
  return db.prepare(`
    UPDATE pos_bill_items
    SET billed = 1,
        status = 'BILLED',
        billId = ?,
        billNo = ?
    WHERE tableNo = ?
      AND billed = 0
  `).run(billId, billNo, tableNo);
}

 
// =====================================================
// DELETE WITH REASON
// =====================================================

// =====================================================
// DELETE BILL ITEM WITH REASON
// =====================================================

// =====================================================
// DELETE BILL ITEM WITH REASON
// =====================================================

function deleteBillItem({
  tableNo,
  billItemGroupKey,
  reason,
  cancelKitchen,
}) {
  if (!tableNo) {
    throw new Error("tableNo is required");
  }

  if (!billItemGroupKey) {
    throw new Error("billItemGroupKey is required");
  }

  if (!reason || !String(reason).trim()) {
    throw new Error("Delete reason is required");
  }

  // ---------------------------------------------------
  // GET ORIGINAL ITEM
  // ---------------------------------------------------

  const originalItem = db.prepare(`
    SELECT
      id,
      tableNo,
      billItemGroupKey,
      productId,
      name,
      quantity,
      basePrice,
      finalPrice,
      billed,
      status,
      note,
      modifiersJson
    FROM pos_bill_items
    WHERE
      tableNo = ?
      AND billItemGroupKey = ?
      AND billed = 0
      AND status = 'OPEN'
    LIMIT 1
  `).get(
    tableNo,
    billItemGroupKey
  );

  if (!originalItem) {
    throw new Error("Bill item not found or already deleted");
  }

  // ---------------------------------------------------
  // BUILD DELETION NOTE
  // Same idea as Android
  // ---------------------------------------------------

  const deletionNote =
    `${String(reason).trim()} | Deleted Qty: ${originalItem.quantity}  | Original Price: ${Number(
      originalItem.basePrice || 0
    )}`;

  // ---------------------------------------------------
  // LOG BEFORE UPDATE
  // ---------------------------------------------------

  console.log("==============================================");
  console.log("DELETE BILL ITEM - BEFORE UPDATE");
  console.log("==============================================");

  console.log("INPUT:");
  console.log({
    tableNo,
    billItemGroupKey,
    reason,
    cancelKitchen,
  });

  console.log("----------------------------------------------");
  console.log("ORIGINAL ITEM:");
  console.log(originalItem);

  console.log("----------------------------------------------");
  console.log("ORIGINAL ITEM JSON:");
  console.log(
    JSON.stringify(originalItem, null, 2)
  );

  console.log("----------------------------------------------");
  console.log("FIELDS THAT WILL CHANGE:");
  console.log({
    status: {
      old: originalItem.status,
      new: "DELETED",
    },
    note: {
      old: originalItem.note,
      new: deletionNote,
    },
    finalPrice: {
      old: originalItem.finalPrice,
      new: 0.0,
    },
    basePrice: {
      old: originalItem.basePrice,
      new: 0.0,
    },
  });

  console.log("----------------------------------------------");
  console.log("DELETION NOTE:");
  console.log(deletionNote);

  console.log("==============================================");

  // ---------------------------------------------------
  // MARK ITEM AS DELETED
  // ---------------------------------------------------

  const result = db.prepare(`
    UPDATE pos_bill_items

    SET
      status = 'DELETED',
      note = ?,
      finalPrice = 0.0,
      basePrice = 0.0

    WHERE
      id = ?
      AND status = 'OPEN'
  `).run(
    deletionNote,
    originalItem.id
  );

  // ---------------------------------------------------
  // LOG UPDATE RESULT
  // ---------------------------------------------------

  console.log("==============================================");
  console.log("DELETE BILL ITEM - UPDATE RESULT");
  console.log("==============================================");

  console.log("ROWS CHANGED:", result.changes);

  console.log("==============================================");

  // ---------------------------------------------------
  // GET ITEM AGAIN AFTER UPDATE
  // ---------------------------------------------------

  const updatedItem = db.prepare(`
    SELECT
      id,
      tableNo,
      billItemGroupKey,
      productId,
      name,
      quantity,
      basePrice,
      finalPrice,
      billed,
      status,
      note,
      modifiersJson
    FROM pos_bill_items
    WHERE id = ?
    LIMIT 1
  `).get(
    originalItem.id
  );

  // ---------------------------------------------------
  // LOG AFTER UPDATE
  // ---------------------------------------------------

  console.log("==============================================");
  console.log("DELETE BILL ITEM - AFTER UPDATE");
  console.log("==============================================");

  console.log("UPDATED ITEM:");
  console.log(updatedItem);

  console.log("----------------------------------------------");
  console.log("UPDATED ITEM JSON:");
  console.log(
    JSON.stringify(updatedItem, null, 2)
  );

  console.log("----------------------------------------------");
  console.log("VERIFY CHANGES:");

  console.log({
    id: updatedItem?.id,

    status: {
      before: originalItem.status,
      after: updatedItem?.status,
    },

    note: {
      before: originalItem.note,
      after: updatedItem?.note,
    },

    basePrice: {
      before: originalItem.basePrice,
      after: updatedItem?.basePrice,
    },

    finalPrice: {
      before: originalItem.finalPrice,
      after: updatedItem?.finalPrice,
    },

    quantity: {
      before: originalItem.quantity,
      after: updatedItem?.quantity,
    },

    billed: {
      before: originalItem.billed,
      after: updatedItem?.billed,
    },
  });

  console.log("==============================================");

  return {
    success: true,
    changes: result.changes,
    deleted: result.changes > 0,
  };
}

function moveBillItemToTable_all_item(itemId, newTableNo, newTableName) {
  const item = db
    .prepare(`
      SELECT
        id,
        tableNo,
        tableName,
        productId,
        note,
        modifiersJson
      FROM pos_bill_items
      WHERE id = ?
    `)
    .get(itemId);

  if (!item) {
    throw new Error(`Bill item not found: ${itemId}`);
  }

  const normalizedModifiers =
    normalizeModifiersJson(item.modifiersJson);

  const newBillItemGroupKey = [
    newTableNo ?? '',
    item.productId,
    item.note ?? '',
    normalizedModifiers,
  ].join('|');

  const result = db
    .prepare(`
      UPDATE pos_bill_items
      SET
        tableNo = ?,
        tableName = ?,
        billItemGroupKey = ?
      WHERE id = ?
    `)
    .run(
      newTableNo,
      newTableName ?? '',
      newBillItemGroupKey,
      itemId
    );

  return {
    success: result.changes > 0,
    itemId,
    oldTableNo: item.tableNo,
    oldTableName: item.tableName,
    newTableNo,
    newTableName,
  };
}



function moveBillItemToTable(
  itemId,
  newTableNo,
  newTableName,
  quantityToMove
) {
  const moveTransaction = db.transaction(() => {
    // =============================================
    // 1. LOAD SOURCE ITEM
    // =============================================

    const item = db
      .prepare(`
        SELECT *
        FROM pos_bill_items
        WHERE id = ?
      `)
      .get(itemId);

    if (!item) {
      throw new Error(`Bill item not found: ${itemId}`);
    }

    const currentQuantity = Number(item.quantity);
    const requestedQuantity = Number(quantityToMove);

    // =============================================
    // 2. VALIDATE
    // =============================================

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1 ||
      requestedQuantity > currentQuantity
    ) {
      throw new Error("Invalid migration quantity.");
    }

    if (
      String(item.tableNo ?? "") ===
      String(newTableNo ?? "")
    ) {
      throw new Error(
        "Source and destination tables are the same."
      );
    }

    const sourceTableNo = String(item.tableNo ?? "");
    const sourceTableName = String(item.tableName ?? "");
    const destinationTableNo = String(newTableNo ?? "");
    const destinationTableName = String(newTableName ?? "");

    const normalizedModifiers =
      normalizeModifiersJson(item.modifiersJson);

    const makeGroupKey = (tableNo) =>
      [
        tableNo,
        item.productId,
        item.note ?? "",
        normalizedModifiers,
      ].join("|");

    const sourceGroupKey = makeGroupKey(sourceTableNo);
    const destinationGroupKey = makeGroupKey(destinationTableNo);

    // =============================================
    // 3. FULL QUANTITY: MOVE EXISTING ROW
    // =============================================

    if (requestedQuantity === currentQuantity) {
      const result = db
        .prepare(`
          UPDATE pos_bill_items
          SET
            tableNo = ?,
            tableName = ?,
            billItemGroupKey = ?,
            syncedToCloud = 0
          WHERE id = ?
            AND quantity = ?
        `)
        .run(
          destinationTableNo,
          destinationTableName,
          destinationGroupKey,
          itemId,
          currentQuantity
        );

      if (result.changes !== 1) {
        throw new Error("Failed to move item.");
      }

      return {
        success: true,
        itemId,
        movedQuantity: requestedQuantity,
        remainingQuantity: 0,
        oldTableNo: sourceTableNo,
        oldTableName: sourceTableName,
        newTableNo: destinationTableNo,
        newTableName: destinationTableName,
      };
    }

    // =============================================
    // 4. PARTIAL QUANTITY: REDUCE SOURCE ROW
    // =============================================

    const remainingQuantity =
      currentQuantity - requestedQuantity;

    const updateSource = db
      .prepare(`
        UPDATE pos_bill_items
        SET
          quantity = ?,
          billItemGroupKey = ?,
          syncedToCloud = 0
        WHERE id = ?
          AND quantity = ?
      `)
      .run(
        remainingQuantity,
        sourceGroupKey,
        itemId,
        currentQuantity
      );

    if (updateSource.changes !== 1) {
      throw new Error(
        "Item changed during migration. Please reload and try again."
      );
    }

    // =============================================
    // 5. CREATE DESTINATION ROW
    // =============================================

    const newItemId = require("crypto").randomUUID();

    db.prepare(`
      INSERT INTO pos_bill_items (
        id,
        billItemGroupKey,
        sessionId,
        tableNo,
        tableName,
        productId,
        name,
        categoryId,
        categoryName,
        parentId,
        isVariant,
        basePrice,
        finalPrice,
        modifierTotal,
        quantity,
        taxRate,
        taxType,
        note,
        modifiersJson,
        status,
        billed,
        billNo,
        billId,
        createdAt,
        source,
        syncedToCloud,
        syncedFromCloud
      )
      VALUES (
        @id,
        @billItemGroupKey,
        @sessionId,
        @tableNo,
        @tableName,
        @productId,
        @name,
        @categoryId,
        @categoryName,
        @parentId,
        @isVariant,
        @basePrice,
        @finalPrice,
        @modifierTotal,
        @quantity,
        @taxRate,
        @taxType,
        @note,
        @modifiersJson,
        @status,
        @billed,
        @billNo,
        @billId,
        @createdAt,
        @source,
        0,
        0
      )
    `).run({
      id: newItemId,
      billItemGroupKey: destinationGroupKey,
      sessionId: item.sessionId,
      tableNo: destinationTableNo,
      tableName: destinationTableName,
      productId: item.productId,
      name: item.name,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      parentId: item.parentId,
      isVariant: item.isVariant,
      basePrice: item.basePrice,
      finalPrice: item.finalPrice,
      modifierTotal: item.modifierTotal,
      quantity: requestedQuantity,
      taxRate: item.taxRate,
      taxType: item.taxType,
      note: item.note,
      modifiersJson: item.modifiersJson,
      status: item.status,
      billed: item.billed,
      billNo: item.billNo,
      billId: item.billId,
      createdAt: Date.now(),
      source: item.source,
    });

    // =============================================
    // 6. RETURN RESULT
    // =============================================

    return {
      success: true,
      itemId,
      newItemId,
      movedQuantity: requestedQuantity,
      remainingQuantity,
      oldTableNo: sourceTableNo,
      oldTableName: sourceTableName,
      newTableNo: destinationTableNo,
      newTableName: destinationTableName,
    };
  });

  // All database changes commit together or roll back.
  return moveTransaction();
}


// =====================================================
// UPDATE BILL ITEM QUANTITY
// =====================================================

// =====================================================
// UPDATE BILL ITEM QUANTITY
// =====================================================

function updateBillItemQuantity({
  id,
  tableNo,
  billItemGroupKey,
  quantity,
  reason,
  cancelKitchen,
}) {
  if (!id) {
    throw new Error("Bill item id is required");
  }

  if (!tableNo) {
    throw new Error("tableNo is required");
  }

  if (!billItemGroupKey) {
    throw new Error("billItemGroupKey is required");
  }

  const newQuantity = Number(quantity);

  if (!Number.isFinite(newQuantity)) {
    throw new Error("Invalid quantity");
  }

  if (newQuantity <= 0) {
    throw new Error(
      "Use deleteBillItem for deleting the complete item"
    );
  }

  if (!reason || !String(reason).trim()) {
    throw new Error(
      "Reason is required for decreasing quantity"
    );
  }

  // ===================================================
  // GET ORIGINAL ACTIVE ITEM
  // ===================================================

  const originalItem = db.prepare(`
    SELECT *
    FROM pos_bill_items
    WHERE
      id = ?
      AND tableNo = ?
      AND billItemGroupKey = ?
      AND billed = 0
      AND status = 'OPEN'
    LIMIT 1
  `).get(
    id,
    tableNo,
    billItemGroupKey
  );

  if (!originalItem) {
    throw new Error(
      "Active bill item not found or already deleted"
    );
  }

  const currentQuantity =
    Number(originalItem.quantity || 0);

  if (newQuantity >= currentQuantity) {
    throw new Error(
      `New quantity must be less than current quantity. Current: ${currentQuantity}, New: ${newQuantity}`
    );
  }

  const deletedQuantity =
    currentQuantity - newQuantity;

  const finalReason =
    String(reason).trim();

  const deletionNote =
    `${finalReason} | ${deletedQuantity} delete out of ${currentQuantity} | item Original Price: ${Number(
      originalItem.basePrice || 0
    )}`;

  // ===================================================
  // LOG BEFORE
  // ===================================================

  console.log("==============================================");
  console.log("PARTIAL QUANTITY REDUCTION - BEFORE");
  console.log("==============================================");

  console.log("ORIGINAL ITEM:");
  console.log(originalItem);

  console.log("----------------------------------------------");

  console.log("QUANTITY:");
  console.log({
    currentQuantity,
    newQuantity,
    deletedQuantity,
  });

  console.log("----------------------------------------------");

  console.log("REASON:");
  console.log(finalReason);

  console.log("----------------------------------------------");

  console.log("CANCEL KITCHEN:");
  console.log(cancelKitchen);

  console.log("==============================================");

  // ===================================================
  // START TRANSACTION
  // ===================================================

  const transaction = db.transaction(() => {

    // -------------------------------------------------
    // UPDATE ORIGINAL ACTIVE ITEM
    // -------------------------------------------------

    const updateResult = db.prepare(`
      UPDATE pos_bill_items
      SET quantity = ?
      WHERE
        id = ?
        AND status = 'OPEN'
    `).run(
      newQuantity,
      originalItem.id
    );

    if (updateResult.changes !== 1) {
      throw new Error(
        "Failed to update active item quantity"
      );
    }

    // -------------------------------------------------
    // CREATE DELETED AUDIT ROW
    // -------------------------------------------------

    const deletedItemId =
      crypto.randomUUID();

    db.prepare(`
      INSERT INTO pos_bill_items (
        id,
        billItemGroupKey,
        sessionId,
        tableNo,
        tableName,
        productId,
        name,
        categoryId,
        categoryName,
        parentId,
        isVariant,
        basePrice,
        finalPrice,
        modifierTotal,
        quantity,
        taxRate,
        taxType,
        note,
        modifiersJson,
        status,
        billed,
        billNo,
        billId,
        createdAt,
        source,
        syncedToCloud,
        syncedFromCloud
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        'DELETED',
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
      )
    `).run(
      deletedItemId,
      originalItem.billItemGroupKey,
      originalItem.sessionId || "DEFAULT",
      originalItem.tableNo,
      originalItem.tableName || null,
      originalItem.productId,
      originalItem.name,
      originalItem.categoryId,
      originalItem.categoryName || null,
      originalItem.parentId || null,
      originalItem.isVariant || 0,
      0.0,
      0.0,
      originalItem.modifierTotal || 0,
      deletedQuantity,
      originalItem.taxRate || 0,
      originalItem.taxType || "inclusive",
      deletionNote,
      originalItem.modifiersJson || "[]",
      originalItem.billed || 0,
      originalItem.billNo || "",
      originalItem.billId || "",
      Date.now(),
      originalItem.source || "POS",
      originalItem.syncedToCloud || 0,
      originalItem.syncedFromCloud || 0
    );

    return deletedItemId;
  });

  // ===================================================
  // EXECUTE TRANSACTION
  // ===================================================

  const deletedItemId =
    transaction();

  // ===================================================
  // GET UPDATED ACTIVE ITEM
  // ===================================================

  const updatedActiveItem =
    db.prepare(`
      SELECT *
      FROM pos_bill_items
      WHERE id = ?
    `).get(
      originalItem.id
    );

  // ===================================================
  // GET DELETED ITEM
  // ===================================================

  const deletedItem =
    db.prepare(`
      SELECT *
      FROM pos_bill_items
      WHERE id = ?
    `).get(
      deletedItemId
    );

  // ===================================================
  // LOG AFTER
  // ===================================================

  console.log("==============================================");
  console.log("PARTIAL QUANTITY REDUCTION - AFTER");
  console.log("==============================================");

  console.log("ACTIVE ITEM:");
  console.log(updatedActiveItem);

  console.log("----------------------------------------------");

  console.log("DELETED ITEM:");
  console.log(deletedItem);

  console.log("----------------------------------------------");

  console.log("RESULT:");
  console.log({
    originalQuantity: currentQuantity,
    activeQuantity: newQuantity,
    deletedQuantity,
    deletedItemId,
  });

  console.log("==============================================");

  return {
    success: true,
    quantity: newQuantity,
    deletedQuantity,
    deletedItemId,
  };
}

function increaseBillItemQuantity({
  id,
  tableNo,
  billItemGroupKey,
  quantity,
}) {
  if (!id) {
    throw new Error(
      "Bill item id is required"
    );
  }

  if (!tableNo) {
    throw new Error(
      "tableNo is required"
    );
  }

  if (!billItemGroupKey) {
    throw new Error(
      "billItemGroupKey is required"
    );
  }

  const newQuantity =
    Number(quantity);

  if (!Number.isFinite(newQuantity)) {
    throw new Error(
      "Invalid quantity"
    );
  }

  if (newQuantity <= 0) {
    throw new Error(
      "Invalid quantity"
    );
  }

  const originalItem =
    db.prepare(`
      SELECT *
      FROM pos_bill_items
      WHERE
        id = ?
        AND tableNo = ?
        AND billItemGroupKey = ?
        AND billed = 0
        AND status = 'OPEN'
      LIMIT 1
    `).get(
      id,
      tableNo,
      billItemGroupKey
    );

  if (!originalItem) {
    throw new Error(
      "Active bill item not found or already deleted"
    );
  }

  const currentQuantity =
    Number(
      originalItem.quantity || 0
    );

  if (newQuantity <= currentQuantity) {
    throw new Error(
      `New quantity must be greater than current quantity. Current: ${currentQuantity}, New: ${newQuantity}`
    );
  }

  const result =
    db.prepare(`
      UPDATE pos_bill_items
      SET quantity = ?
      WHERE
        id = ?
        AND status = 'OPEN'
        AND billed = 0
    `).run(
      newQuantity,
      originalItem.id
    );

  if (result.changes !== 1) {
    throw new Error(
      "Failed to increase item quantity"
    );
  }

  const updatedItem =
    db.prepare(`
      SELECT *
      FROM pos_bill_items
      WHERE id = ?
    `).get(
      originalItem.id
    );

  console.log(
    "=============================================="
  );
  console.log(
    "INCREASE BILL ITEM - AFTER"
  );
  console.log(
    "=============================================="
  );

  console.log(
    "ORIGINAL QUANTITY:",
    currentQuantity
  );

  console.log(
    "NEW QUANTITY:",
    newQuantity
  );

  console.log(
    "UPDATED ITEM:",
    updatedItem
  );

  console.log(
    "=============================================="
  );

  return {
    success: true,
    quantity: newQuantity,
    changed: result.changes,
  };
}


function moveFullTableToTable(
  sourceTableNo,
  sourceTableName,
  destinationTableNo,
  destinationTableName
) {
  console.log("========================================");
  console.log("[MOVE FULL TABLE] START");
  console.log("========================================");

  console.log(
    "[MOVE FULL TABLE] Source table:",
    sourceTableNo
  );

  console.log(
    "[MOVE FULL TABLE] Source table name:",
    sourceTableName
  );

  console.log(
    "[MOVE FULL TABLE] Destination table:",
    destinationTableNo
  );

  console.log(
    "[MOVE FULL TABLE] Destination table name:",
    destinationTableName
  );

  if (!sourceTableNo) {
    throw new Error(
      "Source table number is required"
    );
  }

  if (!destinationTableNo) {
    throw new Error(
      "Destination table number is required"
    );
  }

  if (
    String(sourceTableNo) ===
    String(destinationTableNo)
  ) {
    throw new Error(
      "Source and destination table cannot be the same"
    );
  }

  // =====================================================
  // GET ALL ITEMS FROM SOURCE TABLE
  // =====================================================

  const items = db
    .prepare(`
      SELECT
        id,
        tableNo,
        tableName,
        productId,
        note,
        modifiersJson,
        billItemGroupKey
      FROM pos_bill_items
      WHERE tableNo = ?
    `)
    .all(sourceTableNo);

  console.log(
    "[MOVE FULL TABLE] Items found:",
    items.length
  );

  if (items.length === 0) {
    console.log(
      "[MOVE FULL TABLE] No items found on source table"
    );

    return {
      success: true,
      movedCount: 0,
      sourceTableNo,
      destinationTableNo,
    };
  }

  // =====================================================
  // PREPARE UPDATE
  // =====================================================

  const updateItem = db.prepare(`
    UPDATE pos_bill_items
    SET
      tableNo = ?,
      tableName = ?,
      billItemGroupKey = ?
    WHERE id = ?
  `);

  // =====================================================
  // TRANSACTION
  // =====================================================

  const migrateTransaction = db.transaction(() => {

    for (const item of items) {

      const normalizedModifiers =
        normalizeModifiersJson(
          item.modifiersJson
        );

      const newBillItemGroupKey = [
        destinationTableNo ?? '',
        item.productId,
        item.note ?? '',
        normalizedModifiers,
      ].join('|');

      console.log(
        "[MOVE FULL TABLE] Moving item:",
        {
          id: item.id,
          productId: item.productId,
          oldTableNo: item.tableNo,
          newTableNo: destinationTableNo,
          oldGroupKey: item.billItemGroupKey,
          newGroupKey: newBillItemGroupKey,
        }
      );

      updateItem.run(
        destinationTableNo,
        destinationTableName ?? '',
        newBillItemGroupKey,
        item.id
      );
    }
  });

  migrateTransaction();

  console.log(
    "[MOVE FULL TABLE] Transaction completed"
  );

  // =====================================================
  // VERIFY
  // =====================================================

  const movedItems = db
    .prepare(`
      SELECT
        id,
        tableNo,
        tableName,
        billItemGroupKey
      FROM pos_bill_items
      WHERE tableNo = ?
    `)
    .all(destinationTableNo);

  console.log(
    "[MOVE FULL TABLE] Destination items:",
    movedItems.length
  );

  console.log("========================================");
  console.log("[MOVE FULL TABLE] COMPLETE");
  console.log("========================================");

  return {
    success: true,
    movedCount: items.length,
    sourceTableNo,
    sourceTableName,
    destinationTableNo,
    destinationTableName,
    
  };
}




module.exports = {
   updateBillItemQuantity,
  insertBillItems,
  getOpenBillItems,
  getAllBillItemsForWaiterSync,
  markBillItemsBilled,
  deleteBillItem,
  increaseBillItemQuantity,
  moveBillItemToTable,
 countOpenBillItems,
  moveFullTableToTable,
};