const crypto = require('crypto');

const { db } =
  require('./sqlite.cjs');

const businessDayRepo =
  require('./businessDayRepository.cjs');

const {
  getOrCreateOrderNo,
  attachOrderId,
  clearMapping,
} = require('../lib/orderSequenceRepository.cjs');

const {
  calculateBillAndroid,
} = require('./billCalculation.cjs');

const {
  TERMINAL_CODE,
} = require('../lib/orderSequence.cjs');


// =====================================================
// HELPERS
// =====================================================

function uuid() {
  return crypto.randomUUID();
}


// =====================================================
// GET BILLABLE BILL ITEMS
// =====================================================

function getBillableKotItems(tableNo) {

  if (!tableNo) {
    return [];
  }

  return db.prepare(`
    SELECT *
    FROM pos_bill_items
    WHERE tableNo = ?
      AND billed = 0
     
    ORDER BY createdAt ASC
  `).all(tableNo);
}


// =====================================================
// CREATE BILL
// =====================================================

async function createBillFromKitchen(input) {
  console.log("input-----------------------", input)


  const {

    // ===================================================
    // CORE
    // ===================================================

    tableNo,
    orderType = 'DINE_IN',
    tableName = '',

    saleType = '',
    reason = '',


    // ===================================================
    // CUSTOMER
    // ===================================================

    customerName = 'Customer',
    customerPhone = '',
    customerId = null,


    // ===================================================
    // USER SNAPSHOT
    // ===================================================

    createdById = '',
    createdByName = '',

    finalizedById = '',
    finalizedByName = '',


    // ===================================================
    // DELIVERY ADDRESS
    // ===================================================

    dAddressLine1 = '',
    dAddressLine2 = '',
    dCity = '',
    dState = '',
    dZipcode = '',
    dLandmark = '',


    // ===================================================
    // AMOUNTS
    // ===================================================

    discountTotal = 0,

    deliveryFee = 0,
    deliveryTax = 0,


    // ===================================================
    // PAYMENT
    // ===================================================
    roundOff = 0.0,
    taxableAmount = 0.0,
    paymentMode = 'CASH',
    paymentStatus = 'PAID',

    paidAmount = 0,

    payments = [],


    // ===================================================
    // EXTERNAL / OWNER INFO
    // ===================================================

    ownerId = '',
    outletId = '',


    // ===================================================
    // DEVICE
    // ===================================================

    deviceId = 'POS',
    deviceName = 'Electron POS',
    appVersion = '1.0',


    // ===================================================
    // BUSINESS DATE
    // ===================================================
    orderDate,
    businessDate,


    // ===================================================
    // EXTRA
    // ===================================================

    notes = '',

    currency = '₹',

  } = input || {};


  // ===================================================
  // BASIC VALIDATION
  // ===================================================

  if (!tableNo) {
    throw new Error(
      'tableNo is required'
    );
  }


  // ===================================================
  // READ BILLABLE ITEMS
  // ===================================================

  const kotItems =
    getBillableKotItems(tableNo);


  if (!kotItems.length) {

    throw new Error(
      `No billable kitchen items found for table ${tableNo}`
    );

  }


  // ===================================================
  // CREATE ORDER ID / TIME
  // ===================================================

  const now =
    Date.now();

  const realDate =
    new Date(now)
      .toLocaleDateString('en-CA');

  const orderId =
    uuid();


  // ===================================================
  // ORDER NUMBER
  // Android-compatible order sequence
  // ===================================================

  const mapping =
    getOrCreateOrderNo(
      db,
      tableNo,
      TERMINAL_CODE
    );

  const srno =
    mapping.srno;


  // ===================================================
  // PREPARE CALCULATION ITEMS
  // ===================================================

  // =====================================================
  // CALCULATE ORDER ITEMS
  // Android-compatible calculation
  // =====================================================

  const calculationItems =
    kotItems.map((kot) => ({
      productId:
        kot.productId || '',

      name:
        kot.name || '',

      quantity:
        Number(kot.quantity || 0),

      basePrice:
        Number(kot.basePrice || 0),

      taxRate:
        Number(kot.taxRate || 0),

      taxType:
        (
          kot.taxType || 'exclusive'
        ).toLowerCase() === 'inclusive'
          ? 'inclusive'
          : 'exclusive',
    }));


  // =====================================================
  // SAFE DISCOUNT / DELIVERY
  // =====================================================

  const safeDiscountInput =
    Math.max(
      0,
      Number(discountTotal || 0)
    );

  const safeDeliveryFee =
    Math.max(
      0,
      Number(deliveryFee || 0)
    );


  // =====================================================
  // DELIVERY TAX PERCENT
  // =====================================================

  let deliveryTaxPercent = 0;

  if (
    safeDeliveryFee > 0 &&
    Number(deliveryTax || 0) > 0
  ) {
    deliveryTaxPercent =
      (
        Number(deliveryTax) /
        safeDeliveryFee
      ) * 100;
  }


  // =====================================================
  // ANDROID BILL CALCULATION
  // =====================================================

  const calculation =
    calculateBillAndroid({

      items:
        calculationItems,

      taxMode:
        'PER_ITEM',

      discountFlat:
        safeDiscountInput,

      discountPercent:
        0,

      deliveryFee:
        safeDeliveryFee,

      deliveryTaxPercent:
        deliveryTaxPercent,

    });


  // =====================================================
  // FINAL BILL TOTALS
  // =====================================================

  const itemTotal =
    calculation.itemSubtotalPaise / 100;

  const itemTax =
    (
      calculation.exclusiveTaxPaise +
      calculation.inclusiveTaxPaise
    ) / 100;

  const taxTotal =
    calculation.totalTaxPaise / 100;

  const safeDeliveryTax =
    calculation.deliveryTaxPaise / 100;

  const grandTotal =
    calculation.grandTotalPaise / 100;

  const safeDiscount =
    calculation.discountPaise / 100;


  // =====================================================
  // CREATE ORDER ITEMS
  // =====================================================
  //
  // IMPORTANT:
  // Store the ITEM PRICE separately from the tax.
  //
  // taxAmountPerItem = tax only
  // taxTotal         = tax only
  //
  // finalPricePerItem = actual item selling/base amount
  // finalTotal        = item amount without separately
  //                    adding tax.
  //
  // Tax is shown at bill summary level.
  //

  const orderItems =
    kotItems.map((kot, index) => {

      const calculatedItem =
        calculation.items?.[index] || null;

      const quantity =
        Number(kot.quantity || 0);

      const basePrice =
        Number(kot.basePrice || 0);

      const taxRate =
        Number(kot.taxRate || 0);

      const taxType =
        (
          kot.taxType || 'exclusive'
        ).toLowerCase() === 'inclusive'
          ? 'inclusive'
          : 'exclusive';


      // -----------------------------------------------
      // TAX CALCULATED FOR THIS ITEM
      // -----------------------------------------------

      const itemTaxAmount =
        calculatedItem
          ? Number(
            calculatedItem.taxPaise || 0
          ) / 100
          : 0;


      // -----------------------------------------------
      // ITEM AMOUNT
      // -----------------------------------------------

      const itemSubtotal =
        calculatedItem
          ? Number(
            calculatedItem.subtotalPaise || 0
          ) / 100
          : basePrice * quantity;


      // -----------------------------------------------
      // PRICE TO SAVE
      // -----------------------------------------------
      //
      // For EXCLUSIVE:
      // basePrice is already before tax.
      //
      // For INCLUSIVE:
      // basePrice contains GST.
      //
      // Therefore don't blindly subtract tax here.
      // Preserve the actual selling price.
      //

      const finalPricePerItem =
        basePrice;


      const finalTotal =
        itemSubtotal;


      return {

        id:
          uuid(),

        categoryName:
          kot.categoryName || '',

        productMode:
          kot.productMode || '',

        currentStock:
          Number(
            kot.currentStock || 0
          ),

        orderMasterId:
          orderId,

        productId:
          kot.productId || '',

        createdById:
          createdById || '',

        createdByName:
          createdByName || '',

        name:
          kot.name || '',

        categoryId:
          kot.categoryId || null,

        parentId:
          kot.parentId || null,

        isVariant:
          kot.isVariant ? 1 : 0,

        // ---------------------------------------------
        // PRICE
        // ---------------------------------------------

        basePrice:
          basePrice,

        quantity:
          quantity,

        itemSubtotal:
          itemSubtotal,

        currency:
          currency,

        status:
          kot.status === 'OPEN'
            ? 'DONE'
            : kot.status,
        // paymentStatus,

        // ---------------------------------------------
        // TAX
        // ---------------------------------------------

        taxRate:
          taxRate,

        taxType:
          taxType,

        taxAmountPerItem:
          itemTaxAmount,

        taxTotal:
          itemTaxAmount,

        // ---------------------------------------------
        // EXTRA
        // ---------------------------------------------

        note:
          kot.note || '',

        modifiersJson:
          kot.modifiersJson || '[]',

        modifierPrice:
          Number(
            kot.modifierPrice || 0
          ),

        modifierSummary:
          kot.modifierSummary || '',

        // ---------------------------------------------
        // FINAL ITEM PRICE
        // ---------------------------------------------

        finalPricePerItem:
          finalPricePerItem,

        finalTotal:
          finalTotal,

        source:
          'POS',

        createdAt:
          now,

      };

    });


  // ===================================================
  // PAID AMOUNT
  // ===================================================

  const safePaidAmount =
    Math.max(
      0,
      Number(paidAmount || 0)
    );


  // ===================================================
  // DUE AMOUNT
  // ===================================================

  const dueAmount =
    Math.max(
      0,
      grandTotal -
      safePaidAmount
    );


  // ===================================================
  // PAYMENT ARRAY
  // ===================================================

  let finalPayments =
    payments;


  if (
    !Array.isArray(finalPayments) ||
    finalPayments.length === 0
  ) {

    if (safePaidAmount > 0) {

      finalPayments = [
        {
          mode:
            paymentMode,

          amount:
            safePaidAmount,
        },
      ];

    } else {

      finalPayments = [];

    }

  }


  // ===================================================
  // BUSINESS DAY
  // ===================================================

  const currentBusinessDay =
    businessDayRepo
      .getCurrentBusinessDay();


  if (!currentBusinessDay) {

    throw new Error(
      'Current business day not found.'
    );

  }


  if (
    currentBusinessDay.isClosed
  ) {

    throw new Error(
      'Business day is closed.'
    );

  }


  // ===================================================
  // ACTIVE BUSINESS DATE
  // ===================================================

  const finalBusinessDate =
    currentBusinessDay.businessDate;


  // ===================================================
  // ORDER STATUS
  // ===================================================

  const orderStatus =
    'COMPLETED';


  // ===================================================
  // SYNC STATUS
  // ===================================================

  const syncStatus =
    'PENDING';


  // ===================================================
  // DATABASE TRANSACTION
  // ===================================================

  const transaction =
    db.transaction(() => {


      // =================================================
      // 1. INSERT ORDER MASTER
      // =================================================

      const insertMaster =
        db.prepare(`

          INSERT INTO pos_order_master (

            id,
            srno,

            orderType,

            tableNo,
            tableName,

            saleType,
            reason,

            customerName,
            customerPhone,
            customerId,

            createdById,
            createdByName,

            finalizedById,
            finalizedByName,

            dAddressLine1,
            dAddressLine2,
            dCity,
            dState,
            dZipcode,
            dLandmark,

            deliveryFee,
            deliveryTax,

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

            source,
            deviceId,
            deviceName,
            appVersion,

            businessDate,
            realDate,
            createdAt,
            updatedAt,

            syncStatus,
            lastSyncedAt,

            notes

          )

          VALUES (

            @id,
            @srno,

            @orderType,

            @tableNo,
            @tableName,

            @saleType,
            @reason,

            @customerName,
            @customerPhone,
            @customerId,

            @createdById,
            @createdByName,

            @finalizedById,
            @finalizedByName,

            @dAddressLine1,
            @dAddressLine2,
            @dCity,
            @dState,
            @dZipcode,
            @dLandmark,

            @deliveryFee,
            @deliveryTax,

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

            @source,
            @deviceId,
            @deviceName,
            @appVersion,

            @businessDate,
            @realDate,
            @createdAt,
            @updatedAt,

            @syncStatus,
            @lastSyncedAt,

            @notes

          )

        `);


      insertMaster.run({

        // ---------------------------------------------
        // CORE
        // ---------------------------------------------

        id:
          orderId,

        srno:
          srno,

        orderType:
          orderType,

        tableNo:
          tableNo,

        tableName:
          tableName || '',


        // ---------------------------------------------
        // SALE
        // ---------------------------------------------

        saleType:
          saleType || '',

        reason:
          reason || '',


        // ---------------------------------------------
        // CUSTOMER
        // ---------------------------------------------

        customerName:
          customerName || 'Customer',

        customerPhone:
          customerPhone || '',

        customerId:
          customerId || null,


        // ---------------------------------------------
        // USER SNAPSHOT
        // ---------------------------------------------

        createdById:
          createdById || '',

        createdByName:
          createdByName || '',

        finalizedById:
          finalizedById ||
          createdById ||
          '',

        finalizedByName:
          finalizedByName ||
          createdByName ||
          '',


        // ---------------------------------------------
        // DELIVERY ADDRESS
        // ---------------------------------------------

        dAddressLine1:
          dAddressLine1 || '',

        dAddressLine2:
          dAddressLine2 || '',

        dCity:
          dCity || '',

        dState:
          dState || '',

        dZipcode:
          dZipcode || '',

        dLandmark:
          dLandmark || '',


        // ---------------------------------------------
        // AMOUNTS
        // ---------------------------------------------

        deliveryFee:
          safeDeliveryFee,

        deliveryTax:
          safeDeliveryTax,

        itemTotal:
          itemTotal,

        itemTax:
          itemTax,

        taxTotal:
          taxTotal,

        discountTotal:
          safeDiscount,

        grandTotal:
          grandTotal,


        // ---------------------------------------------
        // PAYMENT
        // ---------------------------------------------

        paymentMode:
          paymentMode,

        paymentStatus:
          paymentStatus,

        paidAmount:
          safePaidAmount,

        dueAmount:
          dueAmount,


        // ---------------------------------------------
        // ORDER STATE
        // ---------------------------------------------

        orderStatus:
          orderStatus,


        // ---------------------------------------------
        // SOURCE / DEVICE
        // ---------------------------------------------

        source:
          'POS',

        deviceId:
          deviceId,

        deviceName:
          deviceName,

        appVersion:
          appVersion,


        // ---------------------------------------------
        // TIMING
        // ---------------------------------------------

        businessDate:
          finalBusinessDate,

        realDate:
          realDate,

        createdAt:
          now,

        updatedAt:
          now,


        // ---------------------------------------------
        // SYNC
        // ---------------------------------------------

        syncStatus:
          syncStatus,

        lastSyncedAt:
          null,


        // ---------------------------------------------
        // EXTRA
        // ---------------------------------------------

        notes:
          notes || '',

      });


      // =================================================
      // 2. INSERT ORDER ITEMS
      // =================================================

      const insertItem =
        db.prepare(`

          INSERT INTO pos_order_items (

            id,

            categoryName,
            productMode,
            currentStock,

            orderMasterId,
            productId,

            createdById,
            createdByName,

            name,
            categoryId,

            parentId,
            isVariant,

            basePrice,
            quantity,
            itemSubtotal,

            currency,
           status,

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

            source,

            createdAt

          )

          VALUES (

            @id,

            @categoryName,
            @productMode,
            @currentStock,

            @orderMasterId,
            @productId,

            @createdById,
            @createdByName,

            @name,
            @categoryId,

            @parentId,
            @isVariant,

            @basePrice,
            @quantity,
            @itemSubtotal,

            @currency,
          @status,

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

            @source,

            @createdAt

          )

        `);


      for (
        const item of orderItems
      ) {

        insertItem.run(item);

      }


      // =================================================
      // 3. INSERT PAYMENTS
      // =================================================

      const insertPayment =
        db.prepare(`

          INSERT INTO pos_order_payments (

            id,
            orderId,

            ownerId,
            outletId,

            amount,

            mode,

            provider,
            method,

            status,

            deviceId,

            createdAt,
            businessDate,

            syncStatus,
            lastSyncedAt,

            isVoided

          )

          VALUES (

            @id,
            @orderId,

            @ownerId,
            @outletId,

            @amount,

            @mode,

            @provider,
            @method,

            @status,

            @deviceId,

            @createdAt,
            @businessDate,

            @syncStatus,
            @lastSyncedAt,

            @isVoided

          )

        `);


      for (
        const payment of finalPayments
      ) {

        const amount =
          Number(
            payment.amount || 0
          );


        if (amount <= 0) {
          continue;
        }


        insertPayment.run({

          id:
            uuid(),

          orderId:
            orderId,

          ownerId:
            ownerId,

          outletId:
            outletId,

          amount:
            amount,

          mode:
            payment.mode ||
            paymentMode,

          provider:
            payment.provider ||
            null,

          method:
            payment.method ||
            null,

          status:
            'SUCCESS',

          deviceId:
            deviceId,

          createdAt:
            now,

          businessDate:
            finalBusinessDate,

          syncStatus:
            'PENDING',

          lastSyncedAt:
            null,

          isVoided:
            0,

        });

      }


      // =================================================
      // 4. CLEAR SERIAL MAPPING
      // =================================================

      clearMapping(
        db,
        tableNo
      );


      // =================================================
      // 5. COMPLETE KOT
      // =================================================

      db.prepare(`

        UPDATE pos_kot_items

        SET
          status = 'PAID'

        WHERE tableNo = ?

          AND status IN (
            'PENDING',
            'DONE'
          )

      `).run(tableNo);


      // =================================================
      // 6. DELETE PAID KOT ITEMS
      // =================================================

      // db.prepare(`

      //   DELETE FROM pos_kot_items

      //   WHERE tableNo = ?

      //     AND status = 'PAID'

      // `).run(tableNo);


      // =================================================
      // 6. DELETE PAID AND DELETED KOT ITEMS
      // =================================================

      const deleteFinishedKotItems = db.prepare(`
        DELETE FROM pos_kot_items
        WHERE tableNo = ?
          AND UPPER(COALESCE(status, '')) IN (
            'PAID',
            'DELETED'
          )
      `);

      const deletedKotResult =
        deleteFinishedKotItems.run(tableNo);

      console.log(
        '[BILL CLEANUP] Paid/deleted KOT items removed:',
        deletedKotResult.changes,
        'table:',
        tableNo
      );



    });


  // ===================================================
  // EXECUTE MAIN TRANSACTION
  // ===================================================

  transaction();


  // ===================================================
  // MARK BILL ITEMS AS BILLED
  // ===================================================

  db.prepare(`

    UPDATE pos_bill_items

    SET
      billed = 1,
      status = 'BILLED',
      billId = ?,
      billNo = ?

    WHERE tableNo = ?

      AND billed = 0

  `).run(
    orderId,
    srno,
    tableNo
  );


  // ===================================================
  // DELETE TEMPORARY BILL ITEMS
  // ===================================================

  db.prepare(`

    DELETE FROM pos_bill_items

    WHERE tableNo = ?

      AND billed = 1

  `).run(tableNo);


  // ===================================================
  // ATTACH ORDER ID
  // ===================================================

  attachOrderId(
    db,
    tableNo,
    orderId
  );


  // ===================================================
  // DEBUG VERIFY ORDER
  // ===================================================

  const savedOrder =
    db.prepare(`

      SELECT
        id,
        srno,
        orderType,
        tableNo,
        tableName,

        saleType,
        reason,

        customerName,
        customerPhone,
        customerId,

        createdById,
        createdByName,

        finalizedById,
        finalizedByName,

        deliveryFee,
        deliveryTax,

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

        source,
        deviceId,
        deviceName,
        appVersion,

        businessDate,
        createdAt,
        updatedAt,

        syncStatus,
        lastSyncedAt,

        notes

      FROM pos_order_master

      WHERE id = ?

    `).get(orderId);


  console.log(
    '========================================'
  );

  console.log(
    'ORDER SAVED SUCCESSFULLY'
  );

  console.log(
    'ORDER ID:',
    orderId
  );

  console.log(
    'SRNO:',
    srno
  );

  console.log(
    'BUSINESS DATE:',
    finalBusinessDate
  );

  console.log(
    'ITEM TOTAL:',
    itemTotal
  );

  console.log(
    'ITEM TAX:',
    itemTax
  );

  console.log(
    'TAX TOTAL:',
    taxTotal
  );

  console.log(
    'DISCOUNT:',
    safeDiscount
  );

  console.log(
    'DELIVERY FEE:',
    safeDeliveryFee
  );

  console.log(
    'DELIVERY TAX:',
    safeDeliveryTax
  );

  console.log(
    'GRAND TOTAL:',
    grandTotal
  );

  console.log(
    'SAVED ORDER:',
    savedOrder
  );

  console.log(
    '========================================'
  );


  // ===================================================
  // FINAL RESULT
  // ===================================================

  return {

    success:
      true,

    orderId:
      orderId,

    srno:
      srno,

    tableNo:
      tableNo,

    itemCount:
      orderItems.length,

    itemTotal:
      itemTotal,

    itemTax:
      itemTax,

    taxTotal:
      taxTotal,

    discountTotal:
      safeDiscount,

    deliveryFee:
      safeDeliveryFee,

    deliveryTax:
      safeDeliveryTax,

    grandTotal:
      grandTotal,

    paidAmount:
      safePaidAmount,

    dueAmount:
      dueAmount,

    paymentStatus:
      paymentStatus,

    businessDate:
      finalBusinessDate,

  };

}


// =====================================================
// CREATE BILL
// =====================================================

async function cancelBillFromKitchen(input) {
  const status = "CANCEL"
  const {

    // ===================================================
    // CORE
    // ===================================================

    tableNo,
    orderType = 'DINE_IN',
    tableName = '',

    saleType = '',
    reason = '',


    // ===================================================
    // CUSTOMER
    // ===================================================

    customerName = 'Customer',
    customerPhone = '',
    customerId = null,


    // ===================================================
    // USER SNAPSHOT
    // ===================================================

    createdById = '',
    createdByName = '',

    finalizedById = '',
    finalizedByName = '',


    // ===================================================
    // DELIVERY ADDRESS
    // ===================================================

    dAddressLine1 = '',
    dAddressLine2 = '',
    dCity = '',
    dState = '',
    dZipcode = '',
    dLandmark = '',


    // ===================================================
    // AMOUNTS
    // ===================================================

    discountTotal = 0,

    deliveryFee = 0,
    deliveryTax = 0,


    // ===================================================
    // PAYMENT
    // ===================================================
    roundOff = 0.0,
    taxableAmount = 0.0,
    paymentMode = 'CANCEL',
    paymentStatus = 'CANCEL',

    paidAmount = 0,

    payments = [],


    // ===================================================
    // EXTERNAL / OWNER INFO
    // ===================================================

    ownerId = '',
    outletId = '',


    // ===================================================
    // DEVICE
    // ===================================================

    deviceId = 'POS',
    deviceName = 'Electron POS',
    appVersion = '1.0',


    // ===================================================
    // BUSINESS DATE
    // ===================================================
    orderDate,
    businessDate: finalBusinessDate,


    // ===================================================
    // EXTRA
    // ===================================================

    notes = '',

    currency = '₹',

  } = input || {};


  // ===================================================
  // BASIC VALIDATION
  // ===================================================

  if (!tableNo) {
    throw new Error(
      'tableNo is required'
    );
  }


  // ===================================================
  // READ BILLABLE ITEMS
  // ===================================================

  const kotItems =
    getBillableKotItems(tableNo);


  if (!kotItems.length) {

    throw new Error(
      `No billable kitchen items found for table ${tableNo}`
    );

  }


  // ===================================================
  // CREATE ORDER ID / TIME
  // ===================================================

  const now =
    Date.now();

  const realDate =
    new Date(now)
      .toLocaleDateString('en-CA');

  const orderId =
    uuid();


  // ===================================================
  // ORDER NUMBER
  // Android-compatible order sequence
  // ===================================================

  const mapping =
    getOrCreateOrderNo(
      db,
      tableNo,
      TERMINAL_CODE
    );

  const srno =
    mapping.srno;


  // ===================================================
  // PREPARE CALCULATION ITEMS
  // ===================================================

  // =====================================================
  // CALCULATE ORDER ITEMS
  // Android-compatible calculation
  // =====================================================

  const calculationItems =
    kotItems.map((kot) => ({
      productId:
        kot.productId || '',

      name:
        kot.name || '',

      quantity:
        Number(kot.quantity || 0),

      basePrice:
        Number(kot.basePrice || 0),

      taxRate:
        Number(kot.taxRate || 0),

      taxType:
        (
          kot.taxType || 'exclusive'
        ).toLowerCase() === 'inclusive'
          ? 'inclusive'
          : 'exclusive',
    }));


  // =====================================================
  // SAFE DISCOUNT / DELIVERY
  // =====================================================

  const safeDiscountInput =
    Math.max(
      0,
      Number(discountTotal || 0)
    );

  const safeDeliveryFee =
    Math.max(
      0,
      Number(deliveryFee || 0)
    );


  // =====================================================
  // DELIVERY TAX PERCENT
  // =====================================================

  let deliveryTaxPercent = 0;

  if (
    safeDeliveryFee > 0 &&
    Number(deliveryTax || 0) > 0
  ) {
    deliveryTaxPercent =
      (
        Number(deliveryTax) /
        safeDeliveryFee
      ) * 100;
  }


  // =====================================================
  // ANDROID BILL CALCULATION
  // =====================================================

  const calculation =
    calculateBillAndroid({

      items:
        calculationItems,

      taxMode:
        'PER_ITEM',

      discountFlat:
        safeDiscountInput,

      discountPercent:
        0,

      deliveryFee:
        safeDeliveryFee,

      deliveryTaxPercent:
        deliveryTaxPercent,

    });


  // =====================================================
  // FINAL BILL TOTALS
  // =====================================================

  const itemTotal =
    calculation.itemSubtotalPaise / 100;

  const itemTax =
    (
      calculation.exclusiveTaxPaise +
      calculation.inclusiveTaxPaise
    ) / 100;

  const taxTotal =
    calculation.totalTaxPaise / 100;

  const safeDeliveryTax =
    calculation.deliveryTaxPaise / 100;

  const grandTotal =
    calculation.grandTotalPaise / 100;

  const safeDiscount =
    calculation.discountPaise / 100;


  // =====================================================
  // CREATE ORDER ITEMS
  // =====================================================
  //
  // IMPORTANT:
  // Store the ITEM PRICE separately from the tax.
  //
  // taxAmountPerItem = tax only
  // taxTotal         = tax only
  //
  // finalPricePerItem = actual item selling/base amount
  // finalTotal        = item amount without separately
  //                    adding tax.
  //
  // Tax is shown at bill summary level.
  //

  const orderItems =
    kotItems.map((kot, index) => {

      const calculatedItem =
        calculation.items?.[index] || null;

      const quantity =
        Number(kot.quantity || 0);

      const basePrice =
        Number(kot.basePrice || 0);

      const taxRate =
        Number(kot.taxRate || 0);

      const taxType =
        (
          kot.taxType || 'exclusive'
        ).toLowerCase() === 'inclusive'
          ? 'inclusive'
          : 'exclusive';


      // -----------------------------------------------
      // TAX CALCULATED FOR THIS ITEM
      // -----------------------------------------------

      const itemTaxAmount =
        calculatedItem
          ? Number(
            calculatedItem.taxPaise || 0
          ) / 100
          : 0;


      // -----------------------------------------------
      // ITEM AMOUNT
      // -----------------------------------------------

      const itemSubtotal =
        calculatedItem
          ? Number(
            calculatedItem.subtotalPaise || 0
          ) / 100
          : basePrice * quantity;


      // -----------------------------------------------
      // PRICE TO SAVE
      // -----------------------------------------------
      //
      // For EXCLUSIVE:
      // basePrice is already before tax.
      //
      // For INCLUSIVE:
      // basePrice contains GST.
      //
      // Therefore don't blindly subtract tax here.
      // Preserve the actual selling price.
      //

      const finalPricePerItem =
        basePrice;


      const finalTotal = itemSubtotal;


      return {

        id:
          uuid(),

        categoryName:
          kot.categoryName || '',

        productMode:
          kot.productMode || '',

        currentStock:
          Number(
            kot.currentStock || 0
          ),

        orderMasterId:
          orderId,

        productId:
          kot.productId || '',

        createdById:
          createdById || '',

        createdByName:
          createdByName || '',

        name:
          kot.name || '',

        categoryId:
          kot.categoryId || null,

        parentId:
          kot.parentId || null,

        isVariant:
          kot.isVariant ? 1 : 0,

        // ---------------------------------------------
        // PRICE
        // ---------------------------------------------

        basePrice:
          basePrice,

        quantity:
          quantity,

        itemSubtotal:
          itemSubtotal,

        currency:
          currency,

        status: "CANCEL",

        // ---------------------------------------------
        // TAX
        // ---------------------------------------------

        taxRate:
          taxRate,

        taxType:
          taxType,

        taxAmountPerItem:
          itemTaxAmount,

        taxTotal:
          itemTaxAmount,

        // ---------------------------------------------
        // EXTRA
        // ---------------------------------------------

        note:
          kot.note || '',

        modifiersJson:
          kot.modifiersJson || '[]',

        modifierPrice:
          Number(
            kot.modifierPrice || 0
          ),

        modifierSummary:
          kot.modifierSummary || '',

        // ---------------------------------------------
        // FINAL ITEM PRICE
        // ---------------------------------------------

        finalPricePerItem:
          finalPricePerItem,

        finalTotal:
          finalTotal,

        source:
          'POS',

        createdAt:
          now,

      };

    });


  // ===================================================
  // PAID AMOUNT
  // ===================================================

  const safePaidAmount =
    Math.max(
      0,
      Number(paidAmount || 0)
    );


  // ===================================================
  // DUE AMOUNT
  // ===================================================

  const dueAmount =
    Math.max(
      0,
      grandTotal -
      safePaidAmount
    );


  // ===================================================
  // PAYMENT ARRAY
  // ===================================================

  let finalPayments =
    payments;


  if (
    !Array.isArray(finalPayments) ||
    finalPayments.length === 0
  ) {

    if (safePaidAmount > 0) {

      finalPayments = [
        {
          mode:
            paymentMode,

          amount:
            safePaidAmount,
        },
      ];

    } else {

      finalPayments = [];

    }

  }


  // ===================================================
  // BUSINESS DAY
  // ===================================================

  const currentBusinessDay =
    businessDayRepo
      .getCurrentBusinessDay();


  if (!currentBusinessDay) {

    throw new Error(
      'Current business day not found.'
    );

  }


  if (
    currentBusinessDay.isClosed
  ) {

    throw new Error(
      'Business day is closed.'
    );

  }





  // ===================================================
  // ORDER STATUS
  // ===================================================

  const orderStatus =
    'COMPLETED';


  // ===================================================
  // SYNC STATUS
  // ===================================================

  const syncStatus =
    'PENDING';


  // ===================================================
  // DATABASE TRANSACTION
  // ===================================================

  const transaction =
    db.transaction(() => {


      // =================================================
      // 1. INSERT ORDER MASTER
      // =================================================

      const insertMaster =
        db.prepare(`

          INSERT INTO pos_order_master (

            id,
            srno,

            orderType,

            tableNo,
            tableName,

            saleType,
            reason,

            customerName,
            customerPhone,
            customerId,

            createdById,
            createdByName,

            finalizedById,
            finalizedByName,

            dAddressLine1,
            dAddressLine2,
            dCity,
            dState,
            dZipcode,
            dLandmark,

            deliveryFee,
            deliveryTax,

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

            source,
            deviceId,
            deviceName,
            appVersion,

            businessDate,
            realDate,
            createdAt,
            updatedAt,

            syncStatus,
            lastSyncedAt,

            notes

          )

          VALUES (

            @id,
            @srno,

            @orderType,

            @tableNo,
            @tableName,

            @saleType,
            @reason,

            @customerName,
            @customerPhone,
            @customerId,

            @createdById,
            @createdByName,

            @finalizedById,
            @finalizedByName,

            @dAddressLine1,
            @dAddressLine2,
            @dCity,
            @dState,
            @dZipcode,
            @dLandmark,

            @deliveryFee,
            @deliveryTax,

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

            @source,
            @deviceId,
            @deviceName,
            @appVersion,

            @businessDate,
            @realDate,
            @createdAt,
            @updatedAt,

            @syncStatus,
            @lastSyncedAt,

            @notes

          )

        `);


      insertMaster.run({

        // ---------------------------------------------
        // CORE
        // ---------------------------------------------

        id:
          orderId,

        srno:
          srno,

        orderType:
          orderType,

        tableNo:
          tableNo,

        tableName:
          tableName || '',


        // ---------------------------------------------
        // SALE
        // ---------------------------------------------

        saleType:
          saleType || '',

        reason:
          reason || '',


        // ---------------------------------------------
        // CUSTOMER
        // ---------------------------------------------

        customerName:
          customerName || 'Customer',

        customerPhone:
          customerPhone || '',

        customerId:
          customerId || null,


        // ---------------------------------------------
        // USER SNAPSHOT
        // ---------------------------------------------

        createdById:
          createdById || '',

        createdByName:
          createdByName || '',

        finalizedById:
          finalizedById ||
          createdById ||
          '',

        finalizedByName:
          finalizedByName ||
          createdByName ||
          '',


        // ---------------------------------------------
        // DELIVERY ADDRESS
        // ---------------------------------------------

        dAddressLine1:
          dAddressLine1 || '',

        dAddressLine2:
          dAddressLine2 || '',

        dCity:
          dCity || '',

        dState:
          dState || '',

        dZipcode:
          dZipcode || '',

        dLandmark:
          dLandmark || '',


        // ---------------------------------------------
        // AMOUNTS
        // ---------------------------------------------

        deliveryFee: 0.0,

        deliveryTax: 0.0,

        itemTotal: 0.0,
        // itemTotal,

        itemTax: 0.0,

        taxTotal: 0.0,

        discountTotal: 0.0,

        grandTotal: 0.0,


        // ---------------------------------------------
        // PAYMENT
        // ---------------------------------------------

        paymentMode: "FREE",

        paymentStatus:
          paymentStatus,

        paidAmount: 0.0,

        dueAmount: 0.0,


        // ---------------------------------------------
        // ORDER STATE
        // ---------------------------------------------

        orderStatus:
          orderStatus,


        // ---------------------------------------------
        // SOURCE / DEVICE
        // ---------------------------------------------

        source:
          'POS',

        deviceId:
          deviceId,

        deviceName:
          deviceName,

        appVersion:
          appVersion,


        // ---------------------------------------------
        // TIMING
        // ---------------------------------------------

        businessDate:
          finalBusinessDate,

        realDate:
          realDate,

        createdAt:
          now,

        updatedAt:
          now,


        // ---------------------------------------------
        // SYNC
        // ---------------------------------------------

        syncStatus:
          syncStatus,

        lastSyncedAt:
          null,


        // ---------------------------------------------
        // EXTRA
        // ---------------------------------------------

        notes:
          notes || '',

      });


      // =================================================
      // 2. INSERT ORDER ITEMS
      // =================================================

      const insertItem =
        db.prepare(`

          INSERT INTO pos_order_items (

            id,

            categoryName,
            productMode,
            currentStock,

            orderMasterId,
            productId,

            createdById,
            createdByName,

            name,
            categoryId,

            parentId,
            isVariant,

            basePrice,
            quantity,
            itemSubtotal,

            currency,
            status,

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

            source,

            createdAt

          )

          VALUES (

            @id,

            @categoryName,
            @productMode,
            @currentStock,

            @orderMasterId,
            @productId,

            @createdById,
            @createdByName,

            @name,
            @categoryId,

            @parentId,
            @isVariant,

            @basePrice,
            @quantity,
            @itemSubtotal,

            @currency,
            @status,

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

            @source,

            @createdAt

          )

        `);


      for (
        const item of orderItems
      ) {

        insertItem.run(item);

      }


      // =================================================
      // 3. INSERT PAYMENTS
      // =================================================

      const insertPayment =
        db.prepare(`

          INSERT INTO pos_order_payments (

            id,
            orderId,

            ownerId,
            outletId,

            amount,

            mode,

            provider,
            method,

            status,

            deviceId,

            createdAt,
            businessDate,

            syncStatus,
            lastSyncedAt,

            isVoided

          )

          VALUES (

            @id,
            @orderId,

            @ownerId,
            @outletId,

            @amount,

            @mode,

            @provider,
            @method,

            @status,

            @deviceId,

            @createdAt,
            @businessDate,

            @syncStatus,
            @lastSyncedAt,

            @isVoided

          )

        `);


      for (
        const payment of finalPayments
      ) {

        const amount =
          Number(
            payment.amount || 0
          );


        if (amount <= 0) {
          continue;
        }


        insertPayment.run({

          id:
            uuid(),

          orderId:
            orderId,

          ownerId:
            ownerId,

          outletId:
            outletId,

          amount:
            amount,

          mode:
            payment.mode ||
            paymentMode,

          provider:
            payment.provider ||
            null,

          method:
            payment.method ||
            null,

          status:
            'SUCCESS',

          deviceId:
            deviceId,

          createdAt:
            now,

          businessDate:
            finalBusinessDate,

          syncStatus:
            'PENDING',

          lastSyncedAt:
            null,

          isVoided:
            0,

        });

      }


      // =================================================
      // 4. CLEAR SERIAL MAPPING
      // =================================================

      clearMapping(
        db,
        tableNo
      );


      // =================================================
      // 5. COMPLETE KOT
      // =================================================

      db.prepare(`

        UPDATE pos_kot_items

        SET
          status = 'PAID'

        WHERE tableNo = ?

          AND status IN (
            'PENDING',
            'DONE'
          )

      `).run(tableNo);


      // =================================================
      // 6. DELETE PAID KOT ITEMS
      // =================================================

      db.prepare(`

        DELETE FROM pos_kot_items

        WHERE tableNo = ?

          AND status = 'PAID'

      `).run(tableNo);

    });


  // ===================================================
  // EXECUTE MAIN TRANSACTION
  // ===================================================

  transaction();


  // ===================================================
  // MARK BILL ITEMS AS BILLED
  // ===================================================

  db.prepare(`

    UPDATE pos_bill_items

    SET
      billed = 1,
      status = 'BILLED',
      billId = ?,
      billNo = ?

    WHERE tableNo = ?

      AND billed = 0

  `).run(
    orderId,
    srno,
    tableNo
  );


  // ===================================================
  // DELETE TEMPORARY BILL ITEMS
  // ===================================================

  db.prepare(`

    DELETE FROM pos_bill_items

    WHERE tableNo = ?

      AND billed = 1

  `).run(tableNo);


  // ===================================================
  // ATTACH ORDER ID
  // ===================================================

  attachOrderId(
    db,
    tableNo,
    orderId
  );


  // ===================================================
  // DEBUG VERIFY ORDER
  // ===================================================

  const savedOrder =
    db.prepare(`

      SELECT
        id,
        srno,
        orderType,
        tableNo,
        tableName,

        saleType,
        reason,

        customerName,
        customerPhone,
        customerId,

        createdById,
        createdByName,

        finalizedById,
        finalizedByName,

        deliveryFee,
        deliveryTax,

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

        source,
        deviceId,
        deviceName,
        appVersion,

        businessDate,
        createdAt,
        updatedAt,

        syncStatus,
        lastSyncedAt,

        notes

      FROM pos_order_master

      WHERE id = ?

    `).get(orderId);


  console.log(
    '========================================'
  );

  console.log(
    'ORDER SAVED SUCCESSFULLY'
  );

  console.log(
    'ORDER ID:',
    orderId
  );

  console.log(
    'SRNO:',
    srno
  );

  console.log(
    'BUSINESS DATE:',
    finalBusinessDate
  );

  console.log(
    'ITEM TOTAL:',
    itemTotal
  );

  console.log(
    'ITEM TAX:',
    itemTax
  );

  console.log(
    'TAX TOTAL:',
    taxTotal
  );

  console.log(
    'DISCOUNT:',
    safeDiscount
  );

  console.log(
    'DELIVERY FEE:',
    safeDeliveryFee
  );

  console.log(
    'DELIVERY TAX:',
    safeDeliveryTax
  );

  console.log(
    'GRAND TOTAL:',
    grandTotal
  );

  console.log(
    'SAVED ORDER:',
    savedOrder
  );

  console.log(
    '========================================'
  );


  // ===================================================
  // FINAL RESULT
  // ===================================================

  return {

    success:
      true,

    orderId:
      orderId,

    srno:
      srno,

    tableNo:
      tableNo,

    itemCount:
      orderItems.length,

    itemTotal:
      itemTotal,

    itemTax:
      itemTax,

    taxTotal:
      taxTotal,

    discountTotal:
      safeDiscount,

    deliveryFee:
      safeDeliveryFee,

    deliveryTax:
      safeDeliveryTax,

    grandTotal:
      grandTotal,

    paidAmount:
      safePaidAmount,

    dueAmount:
      dueAmount,

    paymentStatus:
      paymentStatus,

    businessDate:
      finalBusinessDate,

  };

}



// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createBillFromKitchen,
  cancelBillFromKitchen,
  getBillableKotItems,
};