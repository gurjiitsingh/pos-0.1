'use client';

import { useEffect, useState } from 'react';
import { usePosTheme } from '@/PosThemeStore/PosThemeContext';


// =====================================================
// TYPES
// =====================================================

type SalesReport = {
  overview: {
    totalOrders: number;
    totalSales: number;
    totalDiscount: number;
    totalTax: number;
    totalPaid: number;
    totalDue: number;
  };

  payments: {
    cash: number;
    card: number;
    upi: number;
    wallet: number;
    credit: number;
  };

  categorySales: {
    categoryId: string;
    categoryName: string;
    quantity: number;
    sales: number;
  }[];

  productSales: {
    productId: string;
    productName: string;
    categoryId: string;
    categoryName: string;
    quantity: number;
    sales: number;
  }[];

  orderTypeSales: {
    orderType: string;
    orders: number;
    sales: number;
  }[];

  staffSales: {
    staffId: string;
    staffName: string;
    orders: number;
    sales: number;
  }[];

  hourlySales: {
    hour: string;
    orders: number;
    sales: number;
  }[];
};


// =====================================================
// PAGE
// =====================================================

export default function SalePage() {

const {
  theme,
  background,
  backgroundName,
} = usePosTheme();


  // ===================================================
  // STATE
  // ===================================================

  const [selectedDate, setSelectedDate] =
    useState('');

  const [report, setReport] =
    useState<SalesReport | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [message, setMessage] =
    useState('');
const [printing, setPrinting] = useState(false);

  // ===================================================
  // INITIAL DATE
  // ===================================================

  useEffect(() => {

    const today =
      new Date()
        .toISOString()
        .split('T')[0];

    setSelectedDate(today);

    loadReport(today);

  }, []);


  // ===================================================
  // LOAD REPORT
  // ===================================================

  async function loadReport(
    businessDate: string
  ) {
console.log("businessDate-----------------", businessDate)
    if (!businessDate) {
      return;
    }

    try {

      setLoading(true);
      setError('');
      setMessage('');

      const result =
        await window.posApi
          .getSalesReport(
            businessDate
          );

      console.log(
        'SALES REPORT:',
        result
      );

      if (!result?.success) {

        throw new Error(
          result?.error ||
          'Failed to load sales report'
        );
      }

      setReport(
        result.data || null
      );

    } catch (e: any) {

      console.error(
        'LOAD SALES REPORT FAILED',
        e
      );

      setError(
        e?.message ||
        'Failed to load sales report'
      );

      setReport(null);

    } finally {

      setLoading(false);

    }
  }


  // ===================================================
  // DATE CHANGE
  // ===================================================

  async function handleDateChange(
    value: string
  ) {

    setSelectedDate(value);

    if (value) {
      await loadReport(value);
    }
  }


  // ===================================================
  // REFRESH
  // ===================================================

  async function handleRefresh() {

    if (!selectedDate) {
      return;
    }

    await loadReport(
      selectedDate
    );
  }


  // ===================================================
  // MONEY
  // ===================================================

  function money(
    value: number
  ) {

    return `₹${Number(
      value || 0
    ).toFixed(2)}`;
  }


  // ===================================================
  // DATE FORMAT
  // ===================================================

  function formatDate(
    value: string
  ) {

    if (!value) {
      return '-';
    }

    try {

      return new Date(
        `${value}T00:00:00`
      ).toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      );

    } catch {

      return value;

    }
  }



  
async function handlePrintReport() {
  if (!report || !selectedDate || printing) {
    return;
  }

  try {
    setPrinting(true);
    setError('');
    setMessage('');

    const reportData = {
      reportTitle: 'SALES REPORT',
      businessDate: selectedDate,
      printedAt: new Date().toISOString(),

      overview: {
        totalOrders: Number(report.overview.totalOrders || 0),
        totalSales: Number(report.overview.totalSales || 0),
        totalDiscount: Number(report.overview.totalDiscount || 0),
        totalTax: Number(report.overview.totalTax || 0),
        totalPaid: Number(report.overview.totalPaid || 0),
        totalDue: Number(report.overview.totalDue || 0),
      },

      payments: {
        cash: Number(report.payments.cash || 0),
        card: Number(report.payments.card || 0),
        upi: Number(report.payments.upi || 0),
        wallet: Number(report.payments.wallet || 0),
        credit: Number(report.payments.credit || 0),
      },

      categorySales: report.categorySales || [],
      orderTypeSales: report.orderTypeSales || [],
      productSales: report.productSales || [],
      staffSales: report.staffSales || [],
      hourlySales: report.hourlySales || [],
    };

    console.log('[REPORT PRINT] Data:', reportData);

    // This requires REPORT support in the Electron printer pipeline.
    const result = await window.posApi.print({
      role: 'REPORT',
      source: 'POS',
      data: reportData,
    });

    console.log('[REPORT PRINT] Result:', result);

    if (!result?.success) {
      throw new Error(
        result?.error || 'Failed to print sales report.'
      );
    }

    setMessage('Sales report sent to printer.');
  } catch (e: any) {
    console.error('[REPORT PRINT] Failed:', e);

    setError(
      e?.message || 'Failed to print sales report.'
    );
  } finally {
    setPrinting(false);
  }
}

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {

    return (
      <div
        className={`
          min-h-full
          ${background.className}
          ${background.text}
          flex
          items-center
          justify-center
          p-5
        `}
      >

        <div
          className={`
            rounded-2xl
            border
            ${background.border}
            px-6
            py-5
            text-sm
            opacity-60
          `}
        >
          Loading sales report...
        </div>

      </div>
    );
  }


  // ===================================================
  // DATA
  // ===================================================

  const overview =
    report?.overview || {
      totalOrders: 0,
      totalSales: 0,
      totalDiscount: 0,
      totalTax: 0,
      totalPaid: 0,
      totalDue: 0,
    };

  const payments =
    report?.payments || {
      cash: 0,
      card: 0,
      upi: 0,
      wallet: 0,
      credit: 0,
    };


  // ===================================================
  // RENDER
  // ===================================================

  return (

 <div
  className={`
    h-full
    min-h-0
    overflow-y-auto
    app-scrollbar
    ${background.className}
    ${background.text}
    p-4
    pb-8
    md:p-5
  `}
>

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className={`
          mb-4
          flex
          flex-col
          gap-3
          rounded-2xl
          border
          ${background.border}
          p-4
          shadow-sm
          md:flex-row
          md:items-center
          md:justify-between
        `}
      >

        <div>

          <h1
            className="
              text-xl
              font-bold
              tracking-tight
            "
          >
            Sales Report
          </h1>

          <p
            className="
              mt-1
              text-xs
              opacity-50
            "
          >
            Review sales, payments and product
            performance.
          </p>

        </div>



        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          {/* DATE */}

          {/* <label
            className={`
              flex
              h-10
              items-center
              gap-2
              rounded-xl
              border
              ${background.border}
              px-3
            `}
          >

            <span
              className="
                text-sm
                opacity-60
              "
            >
              📅
            </span>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                handleDateChange(
                  e.target.value
                )
              }
              className="
                bg-transparent
                text-sm
                font-semibold
                outline-none
              "
              style={{
                colorScheme:
                  theme.mode === 'dark'
                    ? 'dark'
                    : 'light',
              }}
            />

          </label> */}
<div
  className={`
    flex
    h-10
    items-center
    gap-2
    rounded-xl
    border
    ${background.border}
    px-3
  `}
>
  

  <input
    type="date"
    value={selectedDate}
    onChange={(e) =>
      handleDateChange(e.target.value)
    }
    className="
      h-full
      cursor-pointer
      bg-transparent
      text-sm
      font-semibold
      outline-none
    "
 style={{
  colorScheme:
    backgroundName === 'darkSlate' ||
    backgroundName === 'black' ||
    backgroundName === 'dark'
      ? 'dark'
      : 'light',
}}
  />
</div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="
              h-10
              rounded-xl
              px-4
              text-xs
              font-semibold
              text-white
              transition
              hover:opacity-90
              disabled:opacity-50
            "
            style={{
              backgroundColor:
                theme.primary,
            }}
          >
            ↻ Refresh
          </button>


          
<button
  type="button"
  onClick={handlePrintReport}
  disabled={loading || printing || !report}
  className="
    h-10
    rounded-xl
    px-4
    text-xs
    font-semibold
    text-white
    transition
    hover:opacity-90
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
  style={{
    backgroundColor: theme.primary,
  }}
>
  {printing ? 'Printing...' : '🖨 Print Report'}
</button>

        </div>

      </div>


      {/* =================================================
          DATE
      ================================================= */}

      <div
        className="
          mb-4
          text-xs
          opacity-50
        "
      >
        Showing sales for{' '}
        <span className="font-semibold opacity-100">
          {formatDate(selectedDate)}
        </span>
      </div>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (

        <div
          className="
            mb-4
            rounded-xl
            border
            border-green-200
            bg-green-50
            px-4
            py-3
            text-sm
            font-medium
            text-green-700
          "
        >
          {message}
        </div>

      )}


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div
          className="
            mb-4
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            font-medium
            text-red-700
          "
        >
          {error}
        </div>

      )}


      {/* =================================================
          OVERVIEW
      ================================================= */}

      <div
        className="
          mb-4
          grid
          grid-cols-2
          gap-3
          md:grid-cols-3
          xl:grid-cols-6
        "
      >

        <SummaryCard
          title="Orders"
          value={String(
            overview.totalOrders
          )}
          background={background}
        />

        <SummaryCard
          title="Total Sales"
          value={money(
            overview.totalSales
          )}
          background={background}
        />

        <SummaryCard
          title="Discount"
          value={money(
            overview.totalDiscount
          )}
          background={background}
        />

        <SummaryCard
          title="Tax"
          value={money(
            overview.totalTax
          )}
          background={background}
        />

        <SummaryCard
          title="Paid"
          value={money(
            overview.totalPaid
          )}
          background={background}
        />

        <SummaryCard
          title="Due"
          value={money(
            overview.totalDue
          )}
          background={background}
        />

      </div>


      {/* =================================================
          PAYMENT BREAKDOWN
      ================================================= */}

      <SectionCard
        title="Payment Breakdown"
        background={background}
      >

        <div
          className="
            grid
            grid-cols-2
            gap-3
            md:grid-cols-5
          "
        >

          <PaymentCard
            title="Cash"
            value={payments.cash}
          />

          <PaymentCard
            title="Card"
            value={payments.card}
          />

          <PaymentCard
            title="UPI"
            value={payments.upi}
          />

          <PaymentCard
            title="Wallet"
            value={payments.wallet}
          />

          <PaymentCard
            title="Credit"
            value={payments.credit}
          />

        </div>

      </SectionCard>


      {/* =================================================
          CATEGORY + ORDER TYPE
      ================================================= */}

      <div
        className="
          mt-4
          grid
          gap-4
          lg:grid-cols-2
        "
      >

        {/* CATEGORY */}

        <SectionCard
          title="Category Sales"
          background={background}
        >

          <SalesTable
            background={background}
            headers={[
              'Category',
              'Qty',
              'Sales',
            ]}
          >

            {report?.categorySales?.length ? (

              report.categorySales.map(
                (item) => (

                  <tr
                    key={
                      item.categoryId ||
                      item.categoryName
                    }
                    className="
                      border-b
                      last:border-0
                    "
                    style={{
                      borderColor:
                        background.line,
                    }}
                  >

                    <TableCell>
                      {item.categoryName || '-'}
                    </TableCell>

                    <TableCell align="right">
                      {item.quantity}
                    </TableCell>

                    <TableCell align="right">
                      {money(item.sales)}
                    </TableCell>

                  </tr>

                )
              )

            ) : (

              <EmptyRow
                colSpan={3}
                background={background}
              />

            )}

          </SalesTable>

        </SectionCard>


        {/* ORDER TYPE */}

        <SectionCard
          title="Sales by Order Type"
          background={background}
        >

          <SalesTable
            background={background}
            headers={[
              'Order Type',
              'Orders',
              'Sales',
            ]}
          >

            {report?.orderTypeSales?.length ? (

              report.orderTypeSales.map(
                (item) => (

                  <tr
                    key={item.orderType}
                    className="
                      border-b
                      last:border-0
                    "
                    style={{
                      borderColor:
                        background.line,
                    }}
                  >

                    <TableCell>
                      {item.orderType || '-'}
                    </TableCell>

                    <TableCell align="right">
                      {item.orders}
                    </TableCell>

                    <TableCell align="right">
                      {money(item.sales)}
                    </TableCell>

                  </tr>

                )
              )

            ) : (

              <EmptyRow
                colSpan={3}
                background={background}
              />

            )}

          </SalesTable>

        </SectionCard>

      </div>


      {/* =================================================
          PRODUCT SALES
      ================================================= */}

      <div className="mt-4">

        <SectionCard
          title="Product Sales"
          background={background}
        >

          <div
            className="
              max-h-[420px]
              overflow-y-auto
              app-scrollbar
            "
          >

            <table
              className="
                w-full
                border-collapse
                text-sm
              "
            >

              <thead>

                <tr
                  className="
                    border-b
                    text-left
                  "
                  style={{
                    borderColor:
                      background.line,
                  }}
                >

                  <TableHeader>
                    Product
                  </TableHeader>

                  <TableHeader>
                    Category
                  </TableHeader>

                  <TableHeader align="right">
                    Qty
                  </TableHeader>

                  <TableHeader align="right">
                    Sales
                  </TableHeader>

                </tr>

              </thead>

              <tbody>

                {report?.productSales?.length ? (

                  report.productSales.map(
                    (item) => (

                      <tr
                        key={
                          item.productId
                        }
                        className="
                          border-b
                          last:border-0
                        "
                        style={{
                          borderColor:
                            background.line,
                        }}
                      >

                        <TableCell>
                          <span className="font-semibold">
                            {item.productName}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="opacity-60">
                            {item.categoryName || '-'}
                          </span>
                        </TableCell>

                        <TableCell align="right">
                          {item.quantity}
                        </TableCell>

                        <TableCell align="right">
                          {money(item.sales)}
                        </TableCell>

                      </tr>

                    )
                  )

                ) : (

                  <EmptyRow
                    colSpan={4}
                    background={background}
                  />

                )}

              </tbody>

            </table>

          </div>

        </SectionCard>

      </div>


      {/* =================================================
          STAFF + HOURLY
      ================================================= */}

      <div
        className="
          mt-4
          grid
          gap-4
          lg:grid-cols-2
        "
      >

        {/* STAFF */}

        <SectionCard
          title="Staff Sales"
          background={background}
        >

          <SalesTable
            background={background}
            headers={[
              'Staff',
              'Orders',
              'Sales',
            ]}
          >

            {report?.staffSales?.length ? (

              report.staffSales.map(
                (item, index) => (

                  <tr
                    key={
                      item.staffId ||
                      `${item.staffName}-${index}`
                    }
                    className="
                      border-b
                      last:border-0
                    "
                    style={{
                      borderColor:
                        background.line,
                    }}
                  >

                    <TableCell>
                      {item.staffName || 'Unknown'}
                    </TableCell>

                    <TableCell align="right">
                      {item.orders}
                    </TableCell>

                    <TableCell align="right">
                      {money(item.sales)}
                    </TableCell>

                  </tr>

                )
              )

            ) : (

              <EmptyRow
                colSpan={3}
                background={background}
              />

            )}

          </SalesTable>

        </SectionCard>


        {/* HOURLY */}

        <SectionCard
          title="Hourly Sales"
          background={background}
        >

          <SalesTable
            background={background}
            headers={[
              'Hour',
              'Orders',
              'Sales',
            ]}
          >

            {report?.hourlySales?.length ? (

              report.hourlySales.map(
                (item) => (

                  <tr
                    key={item.hour}
                    className="
                      border-b
                      last:border-0
                    "
                    style={{
                      borderColor:
                        background.line,
                    }}
                  >

                    <TableCell>
                      {formatHour(
                        item.hour
                      )}
                    </TableCell>

                    <TableCell align="right">
                      {item.orders}
                    </TableCell>

                    <TableCell align="right">
                      {money(item.sales)}
                    </TableCell>

                  </tr>

                )
              )

            ) : (

              <EmptyRow
                colSpan={3}
                background={background}
              />

            )}

          </SalesTable>

        </SectionCard>

      </div>


      {/* =================================================
          BOTTOM SPACE
      ================================================= */}

      <div className="h-8" />

    </div>
  );
}


// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({
  title,
  value,
  background,
}: any) {

  return (

    <div
      className={`
        rounded-xl
        border
        ${background.border}
        p-3
        shadow-sm
      `}
    >

      <p
        className="
          text-[11px]
          uppercase
          tracking-wider
          opacity-45
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-xl
          font-bold
        "
      >
        {value}
      </p>

    </div>
  );
}


// =====================================================
// SECTION CARD
// =====================================================

function SectionCard({
  title,
  children,
  background,
}: any) {

  return (

    <section
      className={`
        rounded-2xl
        border
        ${background.border}
        p-4
        shadow-sm
      `}
    >

      <h2
        className="
          mb-3
          text-sm
          font-bold
        "
      >
        {title}
      </h2>

      <div
        className="
          border-t
          pt-3
        "
        style={{
          borderColor:
            background.line,
        }}
      >
        {children}
      </div>

    </section>
  );
}


// =====================================================
// PAYMENT CARD
// =====================================================

function PaymentCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {

  return (

    <div
      className="
        rounded-xl
        border
        p-3
      "
    >

      <p
        className="
          text-xs
          font-semibold
          opacity-55
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-lg
          font-bold
        "
      >
        ₹{Number(
          value || 0
        ).toFixed(2)}
      </p>

    </div>
  );
}


// =====================================================
// SALES TABLE
// =====================================================

function SalesTable({
  headers,
  children,
  background,
}: any) {

  return (

    <div
      className="
        overflow-x-auto
      "
    >

      <table
        className="
          w-full
          border-collapse
          text-sm
        "
      >

        <thead>

          <tr
            className="
              border-b
              text-left
            "
            style={{
              borderColor:
                background.line,
            }}
          >

            {headers.map(
              (
                header: string,
                index: number
              ) => (

                <TableHeader
                  key={header}
                  align={
                    index === 0
                      ? 'left'
                      : 'right'
                  }
                >
                  {header}
                </TableHeader>

              )
            )}

          </tr>

        </thead>

        <tbody>
          {children}
        </tbody>

      </table>

    </div>
  );
}


// =====================================================
// TABLE HEADER
// =====================================================

function TableHeader({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {

  return (

    <th
      className={`
        px-2
        py-2
        text-[11px]
        font-semibold
        uppercase
        tracking-wider
        opacity-50
        ${
          align === 'right'
            ? 'text-right'
            : 'text-left'
        }
      `}
    >
      {children}
    </th>
  );
}


// =====================================================
// TABLE CELL
// =====================================================

function TableCell({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {

  return (

    <td
      className={`
        px-2
        py-2.5
        ${
          align === 'right'
            ? 'text-right'
            : 'text-left'
        }
      `}
    >
      {children}
    </td>
  );
}


// =====================================================
// EMPTY ROW
// =====================================================

function EmptyRow({
  colSpan,
  background,
}: {
  colSpan: number;
  background: any;
}) {

  return (

    <tr>

      <td
        colSpan={colSpan}
        className="
          px-3
          py-8
          text-center
          text-xs
          opacity-45
        "
      >
        No sales data
      </td>

    </tr>
  );
}


// =====================================================
// HOUR FORMAT
// =====================================================

function formatHour(
  hour: string
) {

  const numericHour =
    Number(hour);

  if (
    Number.isNaN(numericHour)
  ) {
    return hour;
  }

  const suffix =
    numericHour >= 12
      ? 'PM'
      : 'AM';

  const displayHour =
    numericHour % 12 || 12;

  return `${displayHour}:00 ${suffix}`;
}