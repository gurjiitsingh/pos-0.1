const { db } = require('./sqlite.cjs');

// =====================================================
// SALE REPORT REPOSITORY
// =====================================================

function getSalesReport(realDate) {

  const allItems = db
  .prepare(`
    SELECT *
    FROM pos_order_items
    ORDER BY createdAt DESC
  `)
  .all();

 

 

  // ===================================================
  // OVERALL SALES
  // ===================================================

  const salesStats = db
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
        ) AS totalTax,

        COALESCE(
          SUM(paidAmount),
          0
        ) AS totalPaid,

        COALESCE(
          SUM(dueAmount),
          0
        ) AS totalDue

      FROM pos_order_master

      WHERE realDate = ?

        AND UPPER(orderStatus) = 'COMPLETED'
    `)
    .get(realDate);


 

// ===================================================
// PAYMENT BREAKDOWN
// ===================================================

const paymentStats = db
  .prepare(`
    SELECT

      COALESCE(
        SUM(
          CASE
            WHEN UPPER(p.mode) = 'CASH'
            THEN p.amount
            ELSE 0
          END
        ),
        0
      ) AS cash,

      COALESCE(
        SUM(
          CASE
            WHEN UPPER(p.mode) = 'CARD'
            THEN p.amount
            ELSE 0
          END
        ),
        0
      ) AS card,

      COALESCE(
        SUM(
          CASE
            WHEN UPPER(p.mode) = 'UPI'
            THEN p.amount
            ELSE 0
          END
        ),
        0
      ) AS upi,

      COALESCE(
        SUM(
          CASE
            WHEN UPPER(p.mode) = 'WALLET'
            THEN p.amount
            ELSE 0
          END
        ),
        0
      ) AS wallet,

      COALESCE(
        SUM(
          CASE
            WHEN UPPER(p.mode) = 'CREDIT'
            THEN p.amount
            ELSE 0
          END
        ),
        0
      ) AS credit

    FROM pos_order_payments p

    INNER JOIN pos_order_master om
      ON om.id = p.orderId

    WHERE om.realDate = ?

      AND UPPER(om.orderStatus) = 'COMPLETED'

      AND (
        p.isVoided IS NULL
        OR p.isVoided = 0
      )

      AND (
        p.status IS NULL
        OR UPPER(p.status) != 'VOIDED'
      )
  `)
  .get(realDate);


  // ===================================================
  // CATEGORY SALES
  // ===================================================

 const categorySales = db
  .prepare(`
    SELECT

      oi.categoryId AS categoryId,

      oi.categoryName AS categoryName,

      COALESCE(
        SUM(oi.quantity),
        0
      ) AS quantity,

      COALESCE(
        SUM(oi.finalTotal),
        0
      ) AS sales

    FROM pos_order_items oi

    INNER JOIN pos_order_master om
      ON om.id = oi.orderMasterId

    WHERE om.realDate = ?

      AND UPPER(om.orderStatus) = 'COMPLETED'

      AND UPPER(oi.status) = 'DONE'

    GROUP BY
      oi.categoryId,
      oi.categoryName

    ORDER BY
      sales DESC
  `)
  .all(realDate);


  // ===================================================
  // PRODUCT SALES
  // ===================================================

  const productSales = db
    .prepare(`
      SELECT

        oi.productId AS productId,

        oi.name AS productName,

        oi.categoryId AS categoryId,

        oi.categoryName AS categoryName,

        COALESCE(
          SUM(oi.quantity),
          0
        ) AS quantity,

        COALESCE(
          SUM(oi.finalTotal),
          0
        ) AS sales

      FROM pos_order_items oi

      INNER JOIN pos_order_master om
        ON om.id = oi.orderMasterId

      WHERE om.realDate = ?

        AND UPPER(oi.status) = 'DONE'

      GROUP BY
        oi.productId,
        oi.name,
        oi.categoryId,
        oi.categoryName

      ORDER BY
        sales DESC
    `)
    .all(realDate);


  // ===================================================
  // ORDER TYPE SALES
  // ===================================================

  const orderTypeSales = db
    .prepare(`
      SELECT

        orderType,

        COUNT(*) AS orders,

        COALESCE(
          SUM(grandTotal),
          0
        ) AS sales

      FROM pos_order_master

      WHERE realDate = ?

        AND UPPER(orderStatus) = 'COMPLETED'

      GROUP BY
        orderType

      ORDER BY
        sales DESC
    `)
    .all(realDate);


  // ===================================================
  // STAFF SALES
  // ===================================================

  const staffSales = db
    .prepare(`
      SELECT

        createdById AS staffId,

        createdByName AS staffName,

        COUNT(*) AS orders,

        COALESCE(
          SUM(grandTotal),
          0
        ) AS sales

      FROM pos_order_master

      WHERE realDate = ?

        AND UPPER(orderStatus) = 'COMPLETED'

      GROUP BY
        createdById,
        createdByName

      ORDER BY
        sales DESC
    `)
    .all(realDate);


  // ===================================================
  // HOURLY SALES
  // ===================================================

  const hourlySales = db
    .prepare(`
      SELECT

        strftime(
          '%H',
          createdAt / 1000,
          'unixepoch'
        ) AS hour,

        COUNT(*) AS orders,

        COALESCE(
          SUM(grandTotal),
          0
        ) AS sales

      FROM pos_order_master

      WHERE realDate = ?

        AND UPPER(orderStatus) = 'COMPLETED'

      GROUP BY
        hour

      ORDER BY
        hour
    `)
    .all(realDate);


  // ===================================================
  // RETURN
  // ===================================================

  return {

    overview: {
      totalOrders:
        Number(
          salesStats?.totalOrders || 0
        ),

      totalSales:
        Number(
          salesStats?.totalSales || 0
        ),

      totalDiscount:
        Number(
          salesStats?.totalDiscount || 0
        ),

      totalTax:
        Number(
          salesStats?.totalTax || 0
        ),

      totalPaid:
        Number(
          salesStats?.totalPaid || 0
        ),

      totalDue:
        Number(
          salesStats?.totalDue || 0
        ),
    },

    payments: {
      cash:
        Number(
          paymentStats?.cash || 0
        ),

      card:
        Number(
          paymentStats?.card || 0
        ),

      upi:
        Number(
          paymentStats?.upi || 0
        ),

      wallet:
        Number(
          paymentStats?.wallet || 0
        ),

      credit:
        Number(
          paymentStats?.credit || 0
        ),
    },

    categorySales,

    productSales,

    orderTypeSales,

    staffSales,

    hourlySales,
  };
}

module.exports = {
  getSalesReport,
};