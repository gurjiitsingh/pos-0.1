const { db } = require('./sqlite.cjs');

// =====================================================
// CLEAR TABLES
// =====================================================

function clearTables() {
  db.prepare('DELETE FROM tables').run();
}


// =====================================================
// INSERT TABLES
// =====================================================

function insertTables(list) {

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO tables (

      id,
      tableName,
      status,

      waiterName,
      waiterId,

      activeOrderId,
      guestsCount,

      area,
      sortOrder,

      cartCount,
      kitchenCount,

      billCount,
      billAmount,

      updatedAt,
      createdAt,

      notes,
      synced

    ) VALUES (

      @id,
      @tableName,
      @status,

      @waiterName,
      @waiterId,

      @activeOrderId,
      @guestsCount,

      @area,
      @sortOrder,

      @cartCount,
      @kitchenCount,

      @billCount,
      @billAmount,

      @updatedAt,
      @createdAt,

      @notes,
      @synced

    )
  `);


  const tx = db.transaction((rows) => {

    for (const row of rows) {

      stmt.run({

        id:
          row.id,

        tableName:
          row.tableName,

        status:
          row.status ?? 'AVAILABLE',

        waiterName:
          row.waiterName ?? null,

        waiterId:
          row.waiterId ?? null,

        activeOrderId:
          row.activeOrderId ?? null,

        guestsCount:
          row.guestsCount ?? null,

        area:
          row.area ?? 'General',

        sortOrder:
          row.sortOrder ?? 0,

        cartCount:
          row.cartCount ?? 0,

        kitchenCount:
          row.kitchenCount ?? 0,

        billCount:
          row.billCount ?? 0,

        billAmount:
          row.billAmount ?? 0,

        updatedAt:
          row.updatedAt ?? null,

        createdAt:
          row.createdAt ?? null,

        notes:
          row.notes ?? null,

        synced:
          row.synced ? 1 : 0,

      });

    }

  });


  tx(list);
}


// =====================================================
// GET ALL TABLES
// =====================================================

function getAllTables() {

  return db.prepare(`
    SELECT *
    FROM tables
    ORDER BY
      area ASC,
      sortOrder ASC,
      tableName ASC
  `).all();

}


// =====================================================
// REFRESH TABLE VISUAL STATE
// =====================================================
//
// Recalculates the live visual information displayed
// on the Tables screen.
//
// This does NOT change the permanent table metadata
// such as:
//   area
//   sortOrder
//   waiter
//   tableName
//
// It only updates:
//   cartCount
//   kitchenCount
//   billCount
//   billAmount
//   status
//   updatedAt
//
// =====================================================

function refreshTableVisualState(tableNo) {

  if (!tableNo) {
    throw new Error(
      'tableNo is required'
    );
  }


  // ===================================================
  // VERIFY TABLE EXISTS
  // ===================================================

  const table = db.prepare(`
    SELECT
      id,
      status
    FROM tables
    WHERE id = ?
    LIMIT 1
  `).get(tableNo);


  if (!table) {

    throw new Error(
      `Table not found: ${tableNo}`
    );

  }


  // ===================================================
  // CART
  // ===================================================
  //
  // Count quantity, not number of rows.
  //
  // Example:
  //
  // Paneer x 2
  // Coke   x 3
  //
  // cartCount = 5
  //
  // If your UI should show number of distinct products
  // instead, change SUM(quantity) to COUNT(*).
  // ===================================================

  const cartRow = db.prepare(`
    SELECT
      COALESCE(
        SUM(
          CASE
            WHEN quantity > 0
            THEN quantity
            ELSE 0
          END
        ),
        0
      ) AS cartCount
    FROM pos_cart_item
    WHERE tableNo = ?
  `).get(tableNo);


  const cartCount =
    Number(
      cartRow?.cartCount || 0
    );


  // ===================================================
  // KITCHEN
  // ===================================================
  //
  // Count KOT quantities which are still active.
  //
  // PAID / CANCELLED / DELETED items should not appear
  // as active kitchen items.
  //
  // Adjust statuses here if your KOT lifecycle has
  // additional states.
  // ===================================================

  const kitchenRow = db.prepare(`
    SELECT
      COALESCE(
        SUM(
          CASE
            WHEN quantity > 0
            THEN quantity
            ELSE 0
          END
        ),
        0
      ) AS kitchenCount
    FROM pos_kot_items
    WHERE tableNo = ?
      AND status IN (
        'PENDING',
        'DONE',
        'ACTIVE'
      )
  `).get(tableNo);


  const kitchenCount =
    Number(
      kitchenRow?.kitchenCount || 0
    );


  // ===================================================
  // BILL
  // ===================================================
  //
  // Only OPEN / unbilled rows count here.
  // ===================================================

  const billRow = db.prepare(`
    SELECT

      COUNT(*) AS billCount,

      COALESCE(
        SUM(
          COALESCE(finalTotal, 0)
        ),
        0
      ) AS billAmount

    FROM pos_bill_items

    WHERE tableNo = ?

      AND (
        billed = 0
        OR billed IS NULL
      )

      AND (
        status IS NULL
        OR status NOT IN (
          'BILLED',
          'DELETED',
          'CANCELLED'
        )
      )

  `).get(tableNo);


  const billCount =
    Number(
      billRow?.billCount || 0
    );


  const billAmount =
    Number(
      billRow?.billAmount || 0
    );


  // ===================================================
  // TABLE STATUS
  // ===================================================
  //
  // Priority:
  //
  // 1. Cart exists
  // 2. Kitchen items exist
  // 3. Bill exists
  // 4. Otherwise AVAILABLE
  //
  // You can later make this more sophisticated if
  // HOLD / OCCUPIED / RESERVED are manually controlled.
  // ===================================================

  let status = 'AVAILABLE';


  if (cartCount > 0) {

    status = 'RUNNING';

  } else if (kitchenCount > 0) {

    status = 'RUNNING';

  } else if (billCount > 0) {

    status = 'RUNNING';

  }


  // ===================================================
  // UPDATE TABLE
  // ===================================================

  const now = Date.now();


  db.prepare(`
    UPDATE tables

    SET

      cartCount = ?,

      kitchenCount = ?,

      billCount = ?,

      billAmount = ?,

      status = ?,

      updatedAt = ?

    WHERE id = ?

  `).run(

    cartCount,

    kitchenCount,

    billCount,

    billAmount,

    status,

    now,

    tableNo

  );


  // ===================================================
  // RETURN UPDATED TABLE
  // ===================================================

  return db.prepare(`
    SELECT *
    FROM tables
    WHERE id = ?
    LIMIT 1
  `).get(tableNo);

}


// =====================================================
// REFRESH ALL TABLE VISUAL STATES
// =====================================================
//
// Useful after startup / sync / migration.
//
// =====================================================

// =====================================================
// REFRESH TABLE VISUAL STATE
// =====================================================
//
// Recalculates the live state shown on the Tables screen.
//
// Updates:
//
//   cartCount
//   kitchenCount
//   billCount
//   billAmount
//   status
//   updatedAt
//
// tableNo = tables.id
//
// =====================================================

function refreshAllTableCartVisualStates() {

  const now = Date.now();

  const tx = db.transaction(() => {

    // ===============================================
    // CART COUNT
    // ===============================================

    db.prepare(`
      UPDATE tables
      SET
        cartCount = (
          SELECT COALESCE(
            SUM(quantity),
            0
          )
          FROM pos_cart_item
          WHERE pos_cart_item.tableId = tables.id
        ),
        updatedAt = ?
    `).run(now);

  });

  tx();

  return getAllTables();
}



// =====================================================
// REFRESH ALL TABLE BILL VISUAL STATES
// =====================================================

function refreshAllTableBillVisualStates() {

  const now = Date.now();

  const tx = db.transaction(() => {

    db.prepare(`
      UPDATE tables
      SET

        billCount = (
          SELECT COALESCE(
            SUM(quantity),
            0
          )
          FROM pos_bill_items
          WHERE
            pos_bill_items.tableNo = tables.id
            AND pos_bill_items.billed = 0
            AND pos_bill_items.status = 'OPEN'
        ),

        billAmount = (
          SELECT COALESCE(
            SUM(
              quantity * (
                finalPrice + modifierTotal
              )
            ),
            0
          )
          FROM pos_bill_items
          WHERE
            pos_bill_items.tableNo = tables.id
            AND pos_bill_items.billed = 0
            AND pos_bill_items.status = 'OPEN'
        ),

        updatedAt = ?

    `).run(now);

  });

  tx();

  return getAllTables();
}


// =====================================================
// UPDATE TABLE STATUS
// =====================================================

function updateTableStatus(tableNo, status) {

  const result = db.prepare(`
    UPDATE tables
    SET
      status = ?,
      updatedAt = ?
    WHERE id = ?
  `).run(
    status,
    Date.now(),
    tableNo
  );

  return {
    success: true,
    changes: result.changes,
  };
}
// =====================================================
// EXPORTS
// =====================================================

module.exports = {

  clearTables,

  insertTables,

  getAllTables,
  updateTableStatus,
  refreshTableVisualState,
  refreshAllTableBillVisualStates,
  refreshAllTableCartVisualStates,

};