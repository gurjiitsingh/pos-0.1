const { db } = require('./sqlite.cjs');

// =====================================================
// DAY CLOSING REPOSITORY
// =====================================================


// =====================================================
// DATE HELPER
// =====================================================

function getTodayBusinessDate() {

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


// =====================================================
// GET CURRENT BUSINESS DAY
// =====================================================

function getCurrentBusinessDay() {

  return db
    .prepare(`
      SELECT *
      FROM pos_business_day
      WHERE status = 'OPEN'
      ORDER BY businessDate DESC
      LIMIT 1
    `)
    .get();
}


// =====================================================
// GET BUSINESS DAY BY DATE
// =====================================================

function getBusinessDayByDate(
  businessDate
) {

  if (!businessDate) {
    return undefined;
  }

  return db
    .prepare(`
      SELECT *
      FROM pos_business_day
      WHERE businessDate = ?
      LIMIT 1
    `)
    .get(
      businessDate
    );
}


// =====================================================
// GET BUSINESS DATE
// =====================================================

function getBusinessDate() {

  const businessDay =
    getCurrentBusinessDay();

  if (!businessDay) {
    return null;
  }

  return businessDay.businessDate;
}


// =====================================================
// CHECK IF NEXT BUSINESS DAY CAN BE CREATED
// =====================================================

function canCreateNextBusinessDay() {

  const current =
    getCurrentBusinessDay();

  const today =
    getTodayBusinessDate();

  if (!current) {
    return true;
  }

  /*
    Current = today
      → allowed

    Current > today
      → tomorrow/future already prepared
      → blocked

    Current < today
      → allowed
  */

  return current.businessDate <= today;
}


// =====================================================
// SUMMARY
// =====================================================

function getSummary(
  businessDate
) {

  // ===================================================
  // ORDER SUMMARY
  // ===================================================

  const orderStats =
    db
      .prepare(`
        SELECT

          COUNT(*) AS totalOrders,

          COALESCE(
            SUM(grandTotal),
            0
          ) AS totalSales,

          COALESCE(
            SUM(discountTotal),
            0
          ) AS totalDiscount,

          COALESCE(
            SUM(taxTotal),
            0
          ) AS totalTax

        FROM pos_order_master

        WHERE businessDate = ?

      `)
      .get(
        businessDate
      );


  // ===================================================
  // PAYMENT SUMMARY
  // ===================================================

  const paymentStats =
    db
      .prepare(`
        SELECT

          COALESCE(
            SUM(
              CASE
                WHEN UPPER(mode) = 'CASH'
                THEN amount
                ELSE 0
              END
            ),
            0
          ) AS cashSales,

          COALESCE(
            SUM(
              CASE
                WHEN UPPER(mode) = 'CARD'
                THEN amount
                ELSE 0
              END
            ),
            0
          ) AS cardSales,

          COALESCE(
            SUM(
              CASE
                WHEN UPPER(mode) = 'UPI'
                THEN amount
                ELSE 0
              END
            ),
            0
          ) AS upiSales,

          COALESCE(
            SUM(
              CASE
                WHEN UPPER(mode) = 'WALLET'
                THEN amount
                ELSE 0
              END
            ),
            0
          ) AS walletSales

        FROM pos_order_payments

        WHERE businessDate = ?

          AND (
            isVoided IS NULL
            OR isVoided = 0
          )

          AND UPPER(status) != 'VOIDED'

      `)
      .get(
        businessDate
      );


  // ===================================================
  // CREDIT SALES
  // ===================================================

  const creditStats =
    db
      .prepare(`
        SELECT

          COALESCE(
            SUM(grandTotal),
            0
          ) AS creditSales

        FROM pos_order_master

        WHERE businessDate = ?

          AND UPPER(paymentMode) = 'CREDIT'

      `)
      .get(
        businessDate
      );


  // ===================================================
  // COMPLIMENTARY SALES
  // ===================================================

  const complimentarySales =
    0;


  // ===================================================
  // CASH MOVEMENTS
  // ===================================================

  const cashMovement =
    getCashMovementSummary(
      businessDate
    );


  // ===================================================
  // CASH VALUES
  // ===================================================

  const cashSales =
    Number(
      paymentStats?.cashSales || 0
    );

  const cashTopup =
    Number(
      cashMovement?.cashTopup || 0
    );

  const otherCashIn =
    Number(
      cashMovement?.otherCashIn || 0
    );

  const cashExpenses =
    Number(
      cashMovement?.cashExpenses || 0
    );

  const cashWithdrawals =
    Number(
      cashMovement?.cashWithdrawals || 0
    );

  const cashRefunds =
    Number(
      cashMovement?.cashRefunds || 0
    );


  // ===================================================
  // OPENING CASH
  // ===================================================

  /*
    IMPORTANT:

    Opening cash must belong to the selected
    businessDate.

    Do NOT use current OPEN business day here,
    because this function can be called for
    historical dates.
  */

  const businessDay =
    getBusinessDayByDate(
      businessDate
    );

  const openingCash =
    Number(
      businessDay?.openingCash || 0
    );


  // ===================================================
  // EXPECTED CASH
  // ===================================================

  const expectedCash =
    openingCash
    + cashSales
    + cashTopup
    + otherCashIn
    - cashExpenses
    - cashWithdrawals
    - cashRefunds;


  // ===================================================
  // RETURN SUMMARY
  // =====================================================

  return {

    totalOrders:
      Number(
        orderStats?.totalOrders || 0
      ),

    totalSales:
      Number(
        orderStats?.totalSales || 0
      ),

    totalDiscount:
      Number(
        orderStats?.totalDiscount || 0
      ),

    totalTax:
      Number(
        orderStats?.totalTax || 0
      ),

    complimentarySales:
      Number(
        complimentarySales || 0
      ),


    // =================================================
    // PAYMENT SALES
    // =================================================

    cashSales,

    cardSales:
      Number(
        paymentStats?.cardSales || 0
      ),

    upiSales:
      Number(
        paymentStats?.upiSales || 0
      ),

    walletSales:
      Number(
        paymentStats?.walletSales || 0
      ),

    creditSales:
      Number(
        creditStats?.creditSales || 0
      ),


    // =================================================
    // CASH MOVEMENTS
    // =================================================

    cashTopup,

    otherCashIn,

    cashExpenses,

    cashWithdrawals,

    cashRefunds,


    // =================================================
    // CASH BALANCE
    // =================================================

    openingCash,

    expectedCash,


    // =================================================
    // REFUND
    // =================================================

    totalRefund:
      cashRefunds,

  };
}


// =====================================================
// GET EXPECTED CASH
// =====================================================

function getExpectedCash(
  businessDate
) {

  const summary =
    getSummary(
      businessDate
    );

  return (
    Number(
      summary.openingCash || 0
    ) +
    Number(
      summary.cashSales || 0
    )
  );
}


// =====================================================
// GET DAY CLOSING HISTORY
// =====================================================

function getHistory() {

  return db
    .prepare(`
      SELECT *
      FROM pos_day_closing
      ORDER BY businessDate DESC
    `)
    .all();
}


// =====================================================
// GET CLOSING BY BUSINESS DATE
// =====================================================

function getClosingByDate(
  businessDate
) {

  return db
    .prepare(`
      SELECT *
      FROM pos_day_closing
      WHERE businessDate = ?
      LIMIT 1
    `)
    .get(
      businessDate
    );
}


// =====================================================
// GET BUSINESS INFO BY DATE
// =====================================================

function getBusinessInfoByDate(
  businessDate
) {

  /*
    Business lifecycle information belongs to
    pos_business_day.

    pos_day_closing is only the closing snapshot.
  */

  return db
    .prepare(`
      SELECT
        businessDate,
        openedAt,
        openedById,
        openedByName,
        openingCash,
        closedAt,
        closedById,
        closedByName,
        isClosed,
        status
      FROM pos_business_day
      WHERE businessDate = ?
      LIMIT 1
    `)
    .get(
      businessDate
    );
}


// =====================================================
// ALREADY CLOSED
// =====================================================

function alreadyClosed(
  businessDate
) {

  const row =
    getClosingByDate(
      businessDate
    );

  return !!row;
}


// =====================================================
// CLOSE BUSINESS DAY
// =====================================================

function closeBusinessDay({

  actualCash,

  cashHandedOver = 0,

  notes = '',

  closedById = '',

  closedByName = '',

}) {

  const transaction =
    db.transaction(() => {


      // ===============================================
      // CURRENT OPEN BUSINESS DAY
      // ===============================================

      const businessDay =
        getCurrentBusinessDay();

      if (!businessDay) {

        throw new Error(
          'No open business day found.'
        );

      }


      const businessDate =
        businessDay.businessDate;

      // ===============================================
      // CALCULATE NEXT BUSINESS DATE
      // ===============================================

      const currentDate =
        new Date(
          `${businessDate}T00:00:00`
        );


      const today =
        new Date();


      today.setHours(
        0,
        0,
        0,
        0
      );


      let nextDate;
      // ===============================================
      // ALREADY CLOSED
      // ===============================================

      if (
        alreadyClosed(
          businessDate
        )
      ) {

        return {
          success: true,
          alreadyClosed: true,
          businessDate,
          message:
            'Business day is already closed.',
        };

      }


      // ===============================================
      // PREVENT FUTURE BUSINESS DAY
      // ===============================================

      if (!canCreateNextBusinessDay()) {

        return {
          success: true,
          alreadyPrepared: true,
          businessDate,
          message:
            'Business day is already prepared for the next day.',
        };

      }


            if (
        currentDate > today
      ) {

        return {
          success: true,
          alreadyPrepared: true,
          businessDate,
          message:
            'Business day is already prepared for the next day.',
        };

      }


      // ===============================================
      // SALES SUMMARY
      // ===============================================

      const summary =
        getSummary(
          businessDate
        );


      // ===============================================
      // CASH
      // ===============================================

      const openingCash =
        Number(
          businessDay.openingCash || 0
        );


      /*
        Keep the existing expected cash
        behavior exactly as before.
      */

      const expectedCash =
        openingCash +
        Number(
          summary.cashSales || 0
        );


      const countedCash =
        Number(
          actualCash || 0
        );


      const handedOverCash =
        Number(
          cashHandedOver || 0
        );


      const cashDifference =
        countedCash -
        expectedCash;


      const cashLeftInDrawer =
        countedCash -
        handedOverCash;


      const now =
        Date.now();


      // ===============================================
      // VALIDATE HANDOVER CASH
      // ===============================================

      if (
        !Number.isFinite(
          handedOverCash
        ) ||
        handedOverCash < 0
      ) {

        throw new Error(
          'Cash handed over must be a valid amount.'
        );

      }


      if (
        handedOverCash >
        countedCash
      ) {

        throw new Error(
          'Cash handed over cannot be greater than actual cash counted.'
        );

      }


      // ===============================================
      // DAY CLOSING HISTORY
      // ===============================================

      const closingId =
        `${businessDate}-${now}`;


      db
        .prepare(`
          INSERT INTO pos_day_closing (

            id,

            businessDate,

            openedAt,
            closedAt,

            openedById,
            openedByName,

            closedById,
            closedByName,

            openingCash,

            expectedCash,
            actualCash,
            cashHandedOver,
            cashDifference,

            totalSales,
            totalRefund,

            totalDiscount,
            totalTax,

            cashSales,
            cardSales,
            upiSales,
            walletSales,

            creditSales,

            complimentarySales,

            totalOrders,

            syncStatus,

            createdAt

          )
          VALUES (

            @id,

            @businessDate,

            @openedAt,
            @closedAt,

            @openedById,
            @openedByName,

            @closedById,
            @closedByName,

            @openingCash,

            @expectedCash,
            @actualCash,
            @cashHandedOver,
            @cashDifference,

            @totalSales,
            @totalRefund,

            @totalDiscount,
            @totalTax,

            @cashSales,
            @cardSales,
            @upiSales,
            @walletSales,

            @creditSales,

            @complimentarySales,

            @totalOrders,

            @syncStatus,

            @createdAt

          )
        `)
        .run({

          id:
            closingId,

          businessDate,

          openedAt:
            businessDay.openedAt,

          closedAt:
            now,

          openedById:
            businessDay.openedById || '',

          openedByName:
            businessDay.openedByName || '',

          closedById:
            closedById || '',

          closedByName:
            closedByName || '',

          openingCash,

          expectedCash,

          actualCash:
            countedCash,

          cashHandedOver:
            handedOverCash,

          cashDifference,

          totalSales:
            summary.totalSales,

          totalRefund:
            summary.totalRefund || 0,

          totalDiscount:
            summary.totalDiscount,

          totalTax:
            summary.totalTax,

          cashSales:
            summary.cashSales,

          cardSales:
            summary.cardSales,

          upiSales:
            summary.upiSales,

          walletSales:
            summary.walletSales,

          creditSales:
            summary.creditSales,

          complimentarySales:
            summary.complimentarySales,

          totalOrders:
            summary.totalOrders,

          syncStatus:
            'PENDING',

          createdAt:
            now,

        });


      // ===============================================
      // CLOSE CURRENT BUSINESS DAY
      // ===============================================

      db
        .prepare(`
          UPDATE pos_business_day

          SET

            isClosed = 1,

            status = 'CLOSED',

            closedAt = @closedAt,

            closedById = @closedById,

            closedByName = @closedByName,

            updatedAt = @updatedAt

          WHERE id = @id
        `)
        .run({

          id:
            businessDay.id,

          closedAt:
            now,

          closedById:
            closedById || '',

          closedByName:
            closedByName || '',

          updatedAt:
            now,

        });








      if (
        currentDate < today
      ) {

        nextDate =
          getTodayBusinessDate();

      } else {

        currentDate.setDate(
          currentDate.getDate() + 1
        );

        nextDate =
          `${currentDate.getFullYear()}-${String(
            currentDate.getMonth() + 1
          ).padStart(2, '0')}-${String(
            currentDate.getDate()
          ).padStart(2, '0')}`;

      }


      // ===============================================
      // CREATE NEXT BUSINESS DAY
      // ===============================================

      const existingNextDay =
        getBusinessDayByDate(
          nextDate
        );


      if (!existingNextDay) {

        db
          .prepare(`
            INSERT INTO pos_business_day (

              id,

              businessDate,

              openedAt,

              openedById,

              openedByName,

              openingCash,

              isClosed,

              closedAt,

              closedById,

              closedByName,

              status,

              updatedAt

            )
            VALUES (

              @id,

              @businessDate,

              @openedAt,

              @openedById,

              @openedByName,

              @openingCash,

              0,

              NULL,

              NULL,

              NULL,

              'OPEN',

              @updatedAt

            )
          `)
          .run({

            id:
              nextDate,

            businessDate:
              nextDate,

            openedAt:
              now,

            openedById:
              closedById || '',

            openedByName:
              closedByName || '',

            /*
              Keep the existing behavior:
              cash left after handover becomes
              next day's opening cash.
            */

            openingCash:
              cashLeftInDrawer,

            updatedAt:
              now,

          });

      }


      // ===============================================
      // RETURN
      // ===============================================

      return {

        success:
          true,

        businessDate,

        nextBusinessDate:
          nextDate,

        openingCash,

        expectedCash,

        actualCash:
          countedCash,

        cashHandedOver:
          handedOverCash,

        cashDifference,

        cashLeftInDrawer,

        summary,

        closingId,

      };

    });


  return transaction();
}


// =====================================================
// CASH TRANSACTIONS
// =====================================================

function addCashTransaction({

  type,

  amount,

  reason = '',

  notes = '',

  createdById = '',

  createdByName = ''

}) {

  const businessDay =
    getCurrentBusinessDay();


  if (!businessDay) {

    throw new Error(
      'No current business day found'
    );

  }


  if (
    Number(
      businessDay.isClosed
    ) === 1
  ) {

    throw new Error(
      'Business day is closed'
    );

  }


  const numericAmount =
    Number(amount);


  if (
    !Number.isFinite(
      numericAmount
    ) ||
    numericAmount <= 0
  ) {

    throw new Error(
      'Amount must be greater than 0'
    );

  }


  const allowedTypes = [

    'TOPUP',

    'WITHDRAWAL',

    'EXPENSE',

    'OTHER_IN',

    'REFUND'

  ];


  if (
    !allowedTypes.includes(type)
  ) {

    throw new Error(
      `Invalid cash transaction type: ${type}`
    );

  }


  const now =
    Date.now();


  const id =
    `CASH-${now}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;


  db
    .prepare(`
      INSERT INTO pos_cash_transactions (

        id,

        businessDate,

        type,

        amount,

        reason,

        notes,

        createdById,

        createdByName,

        createdAt

      )

      VALUES (

        @id,

        @businessDate,

        @type,

        @amount,

        @reason,

        @notes,

        @createdById,

        @createdByName,

        @createdAt

      )
    `)
    .run({

      id,

      businessDate:
        businessDay.businessDate,

      type,

      amount:
        numericAmount,

      reason,

      notes,

      createdById,

      createdByName,

      createdAt:
        now

    });


  return {

    success:
      true,

    id,

    businessDate:
      businessDay.businessDate,

    type,

    amount:
      numericAmount

  };

}


function getCashTransactions(
  businessDate
) {

  return db
    .prepare(`
      SELECT

        id,

        businessDate,

        type,

        amount,

        reason,

        notes,

        createdById,

        createdByName,

        createdAt

      FROM pos_cash_transactions

      WHERE businessDate = ?

      ORDER BY createdAt ASC

    `)
    .all(
      businessDate
    );

}


function getCashMovementSummary(
  businessDate
) {

  const rows =
    db
      .prepare(`
        SELECT

          type,

          COALESCE(
            SUM(amount),
            0
          ) AS total

        FROM pos_cash_transactions

        WHERE businessDate = ?

        GROUP BY type

      `)
      .all(
        businessDate
      );


  const result = {

    cashTopup: 0,

    otherCashIn: 0,

    cashExpenses: 0,

    cashWithdrawals: 0,

    cashRefunds: 0

  };


  for (
    const row of rows
  ) {

    const total =
      Number(
        row.total || 0
      );


    switch (
      row.type
    ) {

      case 'TOPUP':

        result.cashTopup =
          total;

        break;


      case 'OTHER_IN':

        result.otherCashIn =
          total;

        break;


      case 'EXPENSE':

        result.cashExpenses =
          total;

        break;


      case 'WITHDRAWAL':

        result.cashWithdrawals =
          total;

        break;


      case 'REFUND':

        result.cashRefunds =
          total;

        break;

    }

  }


  return result;

}


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  getCurrentBusinessDay,

  getBusinessDayByDate,

  getBusinessDate,

  canCreateNextBusinessDay,

  getSummary,

  getExpectedCash,

  getHistory,

  getClosingByDate,

  alreadyClosed,

  closeBusinessDay,

  addCashTransaction,

  getCashTransactions,

  getCashMovementSummary,

  getBusinessInfoByDate,

};