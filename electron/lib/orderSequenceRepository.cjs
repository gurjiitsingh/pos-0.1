const { getFinancialYearCode } = require('./orderSequence.cjs');

function getOrCreateOrderNo(db, mapKey, deviceCode = 'P2') {
  const now = Date.now();
  const financialYear = getFinancialYearCode();

  const transaction = db.transaction(() => {
    // =====================================================
    // CHECK EXISTING RESERVATION
    // =====================================================

    const existing = db
      .prepare(`
        SELECT *
        FROM order_serial_map
        WHERE mapKey = ?
        LIMIT 1
      `)
      .get(mapKey);

    if (existing) {
      return existing;
    }

    // =====================================================
    // READ CURRENT COUNTER
    // =====================================================

    const current = db
      .prepare(`
        SELECT invoiceSerialNo
        FROM order_counter
        WHERE id = 1
      `)
      .get();

    const oldCounter = Number(
      current?.invoiceSerialNo || 0
    );

    const nextSerial = oldCounter + 1;

    // =====================================================
    // UPDATE COUNTER
    // =====================================================

    db.prepare(`
      UPDATE order_counter
      SET invoiceSerialNo = ?,
          updatedAt = ?
      WHERE id = 1
    `).run(
      nextSerial,
      now
    );

    // =====================================================
    // CREATE PRINTABLE SERIAL NUMBER
    // =====================================================

    const srno =
      `${deviceCode}-${financialYear}-${nextSerial}`;

    // =====================================================
    // CREATE SERIAL MAPPING
    // =====================================================

    const mapping = {
      mapKey,
      orderId: null,
      orderSerialNo: nextSerial,
      srno,
      createdAt: now,
    };

    db.prepare(`
      INSERT INTO order_serial_map (
        mapKey,
        orderId,
        orderSerialNo,
        srno,
        createdAt
      )
      VALUES (
        @mapKey,
        @orderId,
        @orderSerialNo,
        @srno,
        @createdAt
      )
    `).run(mapping);

    return mapping;
  });

  return transaction();
}

function getOrCreateLiquorVatOrderNo(db, mapKey, deviceCode = 'P2') {
  const now = Date.now();
  const financialYear = getFinancialYearCode();

  const transaction = db.transaction(() => {

    // =====================================================
    // CHECK EXISTING LIQUOR VAT RESERVATION
    // =====================================================

    const existing = db
      .prepare(`
        SELECT *
        FROM liquor_vat_order_serial_map
        WHERE mapKey = ?
        LIMIT 1
      `)
      .get(mapKey);

    if (existing) {
      return existing;
    }

    // =====================================================
    // READ LIQUOR VAT COUNTER
    // =====================================================

    const current = db
      .prepare(`
        SELECT invoiceSerialNo
        FROM liquor_vat_order_counter
        WHERE id = 1
      `)
      .get();

    const oldCounter = Number(
      current?.invoiceSerialNo || 0
    );

    const nextSerial = oldCounter + 1;

    // =====================================================
    // UPDATE LIQUOR VAT COUNTER
    // =====================================================

    db.prepare(`
      UPDATE liquor_vat_order_counter
      SET invoiceSerialNo = ?,
          updatedAt = ?
      WHERE id = 1
    `).run(
      nextSerial,
      now
    );

    // =====================================================
    // CREATE PRINTABLE SERIAL NUMBER
    // =====================================================

    const srno =
      `${deviceCode}-L-${financialYear}-${nextSerial}`;
      

    // =====================================================
    // CREATE LIQUOR VAT SERIAL MAPPING
    // =====================================================

    const mapping = {
      mapKey,
      orderId: null,
      orderSerialNo: nextSerial,
      srno,
      createdAt: now,
    };

    db.prepare(`
      INSERT INTO liquor_vat_order_serial_map (
        mapKey,
        orderId,
        orderSerialNo,
        srno,
        createdAt
      )
      VALUES (
        @mapKey,
        @orderId,
        @orderSerialNo,
        @srno,
        @createdAt
      )
    `).run(mapping);

    return mapping;
  });

  return transaction();
}
// =====================================================
// ATTACH ORDER ID
// =====================================================

function attachOrderId(db, mapKey, orderId) {
  db.prepare(`
    UPDATE order_serial_map
    SET orderId = ?
    WHERE mapKey = ?
  `).run(
    orderId,
    mapKey
  );
}


// =====================================================
// CLEAR SERIAL MAPPING
// =====================================================

function clearMapping(db, mapKey) {
  db.prepare(`
    DELETE FROM order_serial_map
    WHERE mapKey = ?
  `).run(mapKey);
}

function clearLiquorVatMapping(db, mapKey) {
  db.prepare(`
    DELETE FROM liquor_vat_order_serial_map
    WHERE mapKey = ?
  `).run(mapKey);
}
// =====================================================
// MOVE TABLE MAPPING
// =====================================================

function moveTableMapping(
  db,
  oldTableId,
  newTableId
) {
  db.prepare(`
    UPDATE order_serial_map
    SET mapKey = ?
    WHERE mapKey = ?
  `).run(
    newTableId,
    oldTableId
  );
}

function getExistingOrderNo(db, mapKey) {
  return db.prepare(`
    SELECT srno, orderSerialNo, orderId
    FROM order_serial_map
    WHERE mapKey = ?
    LIMIT 1
  `).get(mapKey);
}


module.exports = {
  getOrCreateOrderNo,
  getOrCreateLiquorVatOrderNo,
  attachOrderId,
  clearMapping,
  clearLiquorVatMapping,
  moveTableMapping,
  getExistingOrderNo,
};