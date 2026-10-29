
const { db } = require('./sqlite.cjs');

// =====================================================
// DEBUG: SHOW ALL SQLITE TABLES
// Location: electron/db/cartRepo.cjs
// =====================================================
// console.log(
//   'SQLITE TABLES =>',
//   db.prepare(
//     "SELECT name FROM sqlite_master WHERE type='table'"
//   ).all()
// );



// =====================================================
// ADD CART ITEM
//
// partition = tableId for DINE_IN
// partition = orderNo for TAKEAWAY / DELIVERY
//
// tableName remains the display/reference name.
// =====================================================

async function addCartItem(item, partition) {

  const productId = item.productId;

  if (!productId) {
    throw new Error('productId missing');
  }

  if (!partition) {
    throw new Error('Cart partition missing');
  }

  const note = item.note || '';

  // IMPORTANT:
  // Preserve modifiersJson if it already exists.
  const modifiersJson =
    item.modifiersJson ??
    JSON.stringify(item.modifiers || []);

  // ===================================================
  // CHECK EXISTING CART LINE
  // ===================================================

  const existing = db
    .prepare(
      `SELECT id, quantity
       FROM pos_cart_item
       WHERE productId = ?
         AND tableId = ?
         AND note = ?
         AND modifiersJson = ?`
    )
    .get(
      productId,
      partition,
      note,
      modifiersJson
    );

  // ===================================================
  // INCREASE EXISTING ITEM
  // ===================================================

  if (existing) {

    db.prepare(
      `UPDATE pos_cart_item
       SET quantity = quantity + 1
       WHERE id = ?
         AND tableId = ?`
    ).run(
      existing.id,
      partition
    );

  } else {

    // =================================================
    // INSERT NEW ITEM
    // =================================================

    db.prepare(
      `INSERT INTO pos_cart_item (
        productId,
        productMode,
        currentStock,
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
        sessionId,
        tableId,
        tableName,
        createdById,
        createdByName,
        note,
        modifiersJson,
        sentToKitchen,
        kitchenPrintReq,
        printStatus,
        createdAt
      ) VALUES (
        ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
      )`
    ).run(
      productId,

      item.productMode || 'raw_stock',

      item.currentStock || 0,

      item.name || '',

      item.categoryId || '',

      item.categoryName || '',

      item.parentId || null,
      item.discountEligible,

      item.isVariant ? 1 : 0,

      item.basePrice || item.price || 0,

      item.finalPrice || item.price || 0,

      item.modifierTotal || 0,

      item.quantity || 1,

      item.taxRate || 0,

      item.taxType || 'exclusive',

      item.sessionId || 'DEFAULT',

      // =================================================
      // PARTITION
      //
      // DINE_IN:
      //   tableId
      //
      // TAKEAWAY / DELIVERY:
      //   orderNo
      // =================================================

      partition,

      // =================================================
      // DISPLAY / REFERENCE NAME
      //
      // DINE_IN:
      //   tableName
      //
      // TAKEAWAY / DELIVERY:
      //   orderNo
      // =================================================

      item.tableName || partition,

      item.createdById || '',

      item.createdByName || '',

      note,

      modifiersJson,

      item.sentToKitchen ? 1 : 0,

      item.kitchenPrintReq ? 1 : 0,

      item.printStatus || 'PENDING',

      item.createdAt || Date.now()
    );
  }

  return getCartItems(partition);
}

// =====================================================
// GET CART ITEMS
//
// partition = tableId OR orderNo
// =====================================================

async function getCartItems(partition) {

  if (!partition) {
    return [];
  }

  const rows = db
    .prepare(
      `SELECT *
       FROM pos_cart_item
       WHERE tableId = ?
       ORDER BY id ASC`
    )
    .all(partition);

  return rows;
}

// =====================================================
// REMOVE CART ITEM
//
// partition is ALWAYS required.
//
// This prevents accidentally deleting an item belonging
// to another table/order with the same SQLite id.
// =====================================================

async function removeCartItem(
  uniqueKey,
  partition,
  removeAll = false
) {

  if (!uniqueKey) {
    return getCartItems(partition);
  }

  if (!partition) {
    return [];
  }

  // ===================================================
  // REMOVE ENTIRE LINE
  // ===================================================

  if (removeAll) {

    db.prepare(
      `DELETE FROM pos_cart_item
       WHERE id = ?
         AND tableId = ?`
    ).run(
      uniqueKey,
      partition
    );

  } else {

    // =================================================
    // FIND ITEM IN CURRENT PARTITION
    // =================================================

    const row = db
      .prepare(
        `SELECT quantity
         FROM pos_cart_item
         WHERE id = ?
           AND tableId = ?`
      )
      .get(
        uniqueKey,
        partition
      );

    if (!row) {
      return getCartItems(partition);
    }

    // ===============================================
    // DELETE WHEN QUANTITY REACHES ZERO
    // ===============================================

    if (row.quantity <= 1) {

      db.prepare(
        `DELETE FROM pos_cart_item
         WHERE id = ?
           AND tableId = ?`
      ).run(
        uniqueKey,
        partition
      );

    } else {

      // =============================================
      // DECREASE QUANTITY
      // =============================================

      db.prepare(
        `UPDATE pos_cart_item
         SET quantity = quantity - 1
         WHERE id = ?
           AND tableId = ?`
      ).run(
        uniqueKey,
        partition
      );
    }
  }

  return getCartItems(partition);
}

// =====================================================
// UPDATE CART ITEM NOTE
//
// partition = tableId OR orderNo
// =====================================================

async function updateCartItemNote(
  itemId,
  note,
  partition
) {

  if (!partition) {
    return [];
  }

  const result = db
    .prepare(
      `UPDATE pos_cart_item
       SET note = ?
       WHERE id = ?
         AND tableId = ?`
    )
    .run(
      note || '',
      itemId,
      partition
    );

  console.log(
    'UPDATE CART NOTE =>',
    {
      itemId,
      partition,
      note: note || '',
      changes: result.changes,
    }
  );

  return getCartItems(partition);
}

// =====================================================
// CLEAR CART
//
// partition = tableId OR orderNo
// =====================================================

async function clearCart(partition) {

  if (!partition) {
    return [];
  }

  const result = db
    .prepare(
      `DELETE FROM pos_cart_item
       WHERE tableId = ?`
    )
    .run(partition);

  console.log(
    'CLEAR CART =>',
    {
      partition,
      deletedRows: result.changes,
    }
  );

  return [];
}



// =====================================================
// TOGGLE CART ITEM KITCHEN PRINT
//
// itemId   = pos_cart_item.id
// partition = tableId OR orderNo
//
// kitchenPrintReq:
//   1 = Enabled
//   0 = Disabled
// =====================================================

async function updateCartItemKitchenPrint1(
  itemId,
  kitchenPrintReq,
  partition
) {
  if (!itemId || !partition) {
    return getCartItems(partition);
  }

  const enabled = kitchenPrintReq ? 1 : 0;

  const result = db.prepare(`
    UPDATE pos_cart_item
    SET kitchenPrintReq = ?
    WHERE id = ?
      AND tableId = ?
  `).run(
    enabled,
    itemId,
    partition
  );

  console.log('UPDATE CART KITCHEN PRINT =>', {
    itemId,
    partition,
    kitchenPrintReq: enabled,
    changes: result.changes,
  });

  return getCartItems(partition);
}


async function updateCartItemKitchenPrint(
  itemId,
  kitchenPrintReq,
  partition
) {
  if (!itemId || !partition) {
    console.error('[KITCHEN PRINT] Missing itemId or partition.');
    return getCartItems(partition);
  }

    const items1 = db.prepare(`
    SELECT *
    FROM pos_cart_item
    WHERE tableId = ?
    ORDER BY id ASC
  `).all(partition);

  console.log(
    '[CART ITEMS BEFORE UPDATE]:',
    JSON.stringify(items1, null, 2)
  );

  console.log("set print kitchenPrintReq----------------", kitchenPrintReq)
  const enabled = kitchenPrintReq ? 1 : 0;
  console.log("set print req----------------", enabled)

  const result = db.prepare(`
    UPDATE pos_cart_item
    SET kitchenPrintReq = ?
    WHERE id = ?
      AND tableId = ?
  `).run(enabled, itemId, partition);

  console.log('[KITCHEN PRINT UPDATE]:', {
    itemId,
    partition,
    kitchenPrintReq: enabled,
    changes: result.changes,
  });

  // Show only items belonging to this table/order
  const items = db.prepare(`
    SELECT *
    FROM pos_cart_item
    WHERE tableId = ?
    ORDER BY id ASC
  `).all(partition);

  console.log(
    '[CART ITEMS AFTER UPDATE]:',
    JSON.stringify(items, null, 2)
  );

  return items;
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  addCartItem,
  getCartItems,
  updateCartItemNote,
  removeCartItem,
  clearCart,
  updateCartItemKitchenPrint,
};