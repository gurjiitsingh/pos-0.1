'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { usePosTheme } from '@/PosThemeStore/PosThemeContext';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {

  const router = useRouter();
  const dateInputRef =
  useRef<HTMLInputElement>(null);
  const [orders, setOrders] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

    const [selectedOrder, setSelectedOrder] =
  useState<any | null>(null);

const [selectedOrderItems, setSelectedOrderItems] =
  useState<any[]>([]);

const [detailsLoading, setDetailsLoading] =
  useState(false);

  const [selectedDate, setSelectedDate] =
    useState(() => {
      const now = new Date();

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
    });

const {
  theme,
  background,
  backgroundName,
} = usePosTheme();


  // =====================================================
  // LOAD ORDERS FROM SQLITE
  // =====================================================

  useEffect(() => {
    loadOrders(selectedDate);
  }, [selectedDate]);


  async function loadOrders(
    date = selectedDate
  ) {
  console.log('🔥 OrdersPage RENDERED');
    try {

      setLoading(true);

      console.log(
        'GET ORDERS FROM DB:',
        date
      );

      const rows =
        await window.posApi.getOrdersByBusinessDate(
          date
        );

      console.log(
        'ORDERS:',
        rows
      );

      setOrders(
        Array.isArray(rows)
          ? rows
          : []
      );

    } catch (error) {

      console.error(
        'Failed to load orders',
        error
      );

      setOrders([]);

    } finally {

      setLoading(false);

    }
  }


  // =====================================================
  // TOTAL SALES
  // =====================================================

  const totalAmount =
    useMemo(() => {

      return orders.reduce(
        (sum, order) =>
          sum +
          Number(
            order.grandTotal || 0
          ),
        0
      );

    }, [orders]);


  // =====================================================
  // DATE DISPLAY
  // =====================================================

  function formatDate(
    date: string
  ) {

    if (!date) {
      return '-';
    }

    try {

      return new Date(
        `${date}T00:00:00`
      ).toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      );

    } catch {

      return date;

    }
  }


  // =====================================================
  // PAYMENT STYLE
  // =====================================================

  function getPaymentStyle(
    paymentMode: string
  ) {

    const mode =
      String(
        paymentMode || ''
      ).toUpperCase();

    if (mode === 'CASH') {

      return {
        background: '#DCFCE7',
        color: '#166534',
      };

    }

    if (mode === 'CARD') {

      return {
        background: '#DBEAFE',
        color: '#1D4ED8',
      };

    }

    if (mode === 'UPI') {

      return {
        background: '#F3E8FF',
        color: '#7E22CE',
      };

    }

    if (mode === 'CREDIT') {

      return {
        background: '#FEF3C7',
        color: '#92400E',
      };

    }

    return {
      background:
        'rgba(148,163,184,0.15)',

      color:
        'inherit',
    };
  }


  // =====================================================
  // STATUS STYLE
  // =====================================================

  function getStatusStyle(
    status: string
  ) {

    const value =
      String(
        status || ''
      ).toUpperCase();

    if (
      value === 'PAID' ||
      value === 'COMPLETED'
    ) {

      return {
        background: '#DCFCE7',
        color: '#166534',
      };

    }

    if (value === 'PARTIAL') {

      return {
        background: '#FEF3C7',
        color: '#92400E',
      };

    }

    if (value === 'CREDIT') {

      return {
        background: '#FEE2E2',
        color: '#991B1B',
      };

    }

    return {
      background:
        'rgba(148,163,184,0.15)',

      color:
        'inherit',
    };
  }


  // =====================================================
  // RENDER
  // =====================================================





  return (

   <div
  className={`
    h-[calc(100vh-60px)]
    min-h-0
    overflow-y-auto
    app-scrollbar
    ${background.className}
    ${background.text}
    p-4
    pb-14
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
            Orders
          </h1>

          <p
            className="
              mt-1
              text-xs
              opacity-50
            "
          >
            Daily order history
          </p>

        </div>


  

     
{/* =================================================
    DATE SEARCH
================================================= */}

<div className="flex items-center gap-2">

  <div
    className={`
      relative
      flex
      h-10
      items-center
      gap-2
      rounded-xl
      border
      ${background.border}
      px-3
      transition
      hover:opacity-80
    `}
    style={{
      backgroundColor:
        'rgba(255,255,255,0.02)',
    }}
  >

    <span
      className="
        pointer-events-none
        text-sm
        opacity-60
      "
    >
      📅
    </span>

    <input
      ref={dateInputRef}
      type="date"
      value={selectedDate}
      onClick={(e) => {

        e.stopPropagation();

        const input =
          e.currentTarget;

        if (
          typeof input.showPicker ===
          'function'
        ) {
          input.showPicker();
        }

      }}
      onChange={(e) => {

        const value =
          e.target.value;

        console.log(
          'DATE SELECTED:',
          value
        );

        if (value) {
          setSelectedDate(value);
        }

      }}
      className="
        min-w-[145px]
        cursor-pointer
        border-0
        bg-transparent
        px-0
        text-sm
        font-semibold
        outline-none
        focus:outline-none
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


  <button
    type="button"
    onClick={() =>
      loadOrders(selectedDate)
    }
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
      disabled:cursor-not-allowed
      disabled:opacity-50
    "
    style={{
      backgroundColor:
        theme.primary,
    }}
  >
    {loading
      ? 'Loading...'
      : '↻ Refresh'}
  </button>

</div>


      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div
        className="
          mb-4
          grid
          grid-cols-2
          gap-3
          md:grid-cols-3
        "
      >

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
            Orders
          </p>

          <p
            className="
              mt-1
              text-xl
              font-bold
            "
          >
            {orders.length}
          </p>

        </div>


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
            Sales
          </p>

          <p
            className="
              mt-1
              text-xl
              font-bold
            "
          >
            ₹
            {totalAmount.toFixed(2)}
          </p>

        </div>


        <div
          className={`
            hidden
            rounded-xl
            border
            ${background.border}
            p-3
            shadow-sm
            md:block
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
            Business Date
          </p>

          <p
            className="
              mt-1
              text-sm
              font-semibold
            "
          >
            {formatDate(
              selectedDate
            )}
          </p>

        </div>

      </div>


      {/* =================================================
          ORDERS
      ================================================= */}

      {loading ? (

        <div
          className={`
            flex
            min-h-[300px]
            items-center
            justify-center
            rounded-2xl
            border
            ${background.border}
          `}
        >

          <p
            className="
              text-sm
              opacity-50
            "
          >
            Loading orders...
          </p>

        </div>

      ) : orders.length === 0 ? (

        <div
          className={`
            flex
            min-h-[300px]
            items-center
            justify-center
            rounded-2xl
            border
            ${background.border}
          `}
        >

          <div
            className="
              text-center
            "
          >

            <div
              className="
                mb-2
                text-3xl
                opacity-30
              "
            >
              🧾
            </div>

            <p
              className="
                text-sm
                font-medium
                opacity-60
              "
            >
              No orders found
            </p>

            <p
              className="
                mt-1
                text-xs
                opacity-40
              "
            >
              No orders for{' '}
              {formatDate(
                selectedDate
              )}
            </p>

          </div>

        </div>

      ) : (

        <div
          className={`
            overflow-hidden
            rounded-2xl
            border
            ${background.border}
            shadow-sm
          `}
        >

          {/* TABLE HEADER */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              px-4
              py-3
            "
            style={{
              borderColor:
                background.line,
            }}
          >

            <div>

              <p
                className="
                  text-sm
                  font-semibold
                "
              >
                Order History
              </p>

              <p
                className="
                  mt-0.5
                  text-[11px]
                  opacity-40
                "
              >
                {orders.length} orders
              </p>

            </div>

            <div
              className="
                text-xs
                opacity-40
              "
            >
              {formatDate(
                selectedDate
              )}
            </div>

          </div>


          {/* TABLE */}

          <div
            className="
              overflow-x-auto
            "
          >

            <table
              className="
                min-w-full
                text-sm
              "
            >

              <thead>

                <tr
                  className="
                    text-left
                    text-[11px]
                    uppercase
                    tracking-wider
                    opacity-45
                  "
                >

                  <th className="px-4 py-3">
                    Bill No
                  </th>

                  <th className="px-4 py-3">
                    Table
                  </th>

                  <th className="px-4 py-3">
                    Type
                  </th>

                  <th className="px-4 py-3 text-right">
                    Total
                  </th>

                  <th className="px-4 py-3">
                    Payment
                  </th>

                  <th className="px-4 py-3">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {orders.map(
                  (order) => {

                    const paymentStyle =
                      getPaymentStyle(
                        order.paymentMode
                      );

                    const statusStyle =
                      getStatusStyle(
                        order.paymentStatus
                      );

                    return (

<tr
  key={order.id}
  onClick={() =>
    router.push(
      `/orders/detail?orderId=${encodeURIComponent(order.id)}`
    )
  }
  className="
    cursor-pointer
    border-t
    transition
    hover:bg-black/[0.03]
  "
  style={{
    borderColor: background.line,
  }}
>

                        <td
                          className="
                            px-4
                            py-3
                            font-semibold
                          "
                        >
                          {order.srno}
                        </td>


                        <td
                          className="
                            px-4
                            py-3
                            font-medium
                          "
                        >
                          {order.tableName ||
                            order.tableNo ||
                            '-'}
                        </td>


                        <td
                          className="
                            px-4
                            py-3
                            text-xs
                            opacity-65
                          "
                        >
                          {order.orderType ||
                            '-'}
                        </td>


                        <td
                          className="
                            px-4
                            py-3
                            text-right
                            font-bold
                          "
                        >
                          ₹
                          {Number(
                            order.grandTotal ||
                              0
                          ).toFixed(2)}
                        </td>


                        <td
                          className="
                            px-4
                            py-3
                          "
                        >

                          <span
                            className="
                              inline-flex
                              rounded-md
                              px-2
                              py-1
                              text-[10px]
                              font-bold
                            "
                            style={{
                              backgroundColor:
                                paymentStyle.background,

                              color:
                                paymentStyle.color,
                            }}
                          >
                            {order.paymentMode ||
                              '-'}
                          </span>

                        </td>


                        <td
                          className="
                            px-4
                            py-3
                          "
                        >

                          <span
                            className="
                              inline-flex
                              rounded-md
                              px-2
                              py-1
                              text-[10px]
                              font-bold
                            "
                            style={{
                              backgroundColor:
                                statusStyle.background,

                              color:
                                statusStyle.color,
                            }}
                          >
                            {order.paymentStatus ||
                              '-'}
                          </span>

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
}