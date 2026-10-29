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

  const [printingOrderId, setPrintingOrderId] =
  useState<string | null>(null);  

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

    const [toastMessage, setToastMessage] = useState('');
const [toastType, setToastType] = useState<'success' | 'error'>('error');

function showToast(
  message: string,
  type: 'success' | 'error' = 'error'
) {
  setToastMessage(message);
  setToastType(type);
}

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
        await window.posApi.getOrdersByRealDate(
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


async function printBill(orderId: string) {
  if (printingOrderId) return;

  try {
    setPrintingOrderId(orderId);

    console.log('[ORDER LIST] Reprint requested:', orderId);

    // 1. Fetch the saved order from SQLite.
    const orderResult =
      await window.posApi.getOrderById(orderId);

    // Support either a direct order object or an IPC
    // result shaped as { success, data }.
    const savedOrder =
      orderResult?.data ?? orderResult;

    if (
      !savedOrder ||
      savedOrder.success === false ||
      !savedOrder.id
    ) {
      throw new Error('Saved order not found.');
    }

    // 2. Fetch the saved items for this order.
    const itemsResult =
      await window.posApi.getOrderItems(orderId);

  const savedItems = itemsResult;

    if (!Array.isArray(savedItems) || savedItems.length === 0) {
      throw new Error(
        'No saved order items found. Check the order items status in SQLite.'
      );
    }

    console.log('[ORDER LIST] Saved order:', savedOrder);
    console.log('[ORDER LIST] Saved items:', savedItems);

    // 3. Build the receipt from saved database values.
    const receiptData = {
      billNo: savedOrder.srno,
      orderNo: savedOrder.srno,

      tableNo: savedOrder.tableNo ?? '',
      tableName: savedOrder.tableName ?? '',
      orderType: savedOrder.orderType ?? '',

      paymentMode: savedOrder.paymentMode ?? 'CASH',
      createdAt: savedOrder.createdAt ?? Date.now(),

      items: savedItems.map((item: any) => {
        const quantity = Number(item.quantity ?? 0);

        const price = Number(
          item.finalPricePerItem ??
          item.basePrice ??
          0
        );

        return {
          name: item.name ?? '',
          quantity,
          price,
          subtotal: Number(
            item.finalTotal ?? price * quantity
          ),
          modifiersJson: item.modifiersJson ?? '',
          note: item.note ?? '',
        };
      }),

      subtotal: Number(savedOrder.itemTotal ?? 0),
      tax: Number(
        savedOrder.taxTotal ?? savedOrder.itemTax ?? 0
      ),
      discount: Number(savedOrder.discountTotal ?? 0),
      deliveryFee: Number(savedOrder.deliveryFee ?? 0),
      deliveryTax: 0,

      grandTotal: Number(savedOrder.grandTotal ?? 0),

      customerName: savedOrder.customerName ?? '',
      customerPhone: savedOrder.customerPhone ?? '',

      kotNumberText: '',
      stewardName: savedOrder.finalizedByName ?? '',

      paymentStatus: savedOrder.paymentStatus ?? '',
      paidAmount: Number(savedOrder.paidAmount ?? 0),
      dueAmount: Number(savedOrder.dueAmount ?? 0),
      businessDate: savedOrder.businessDate ?? '',

      isReprint: true,
    };

    console.log(
      '[ORDER LIST] Sending saved bill to printer:',
      receiptData
    );

    // 4. Use the existing BILL printer pipeline.
    const result = await window.posApi.print({
      role: 'BILL',
      source: 'POS',
      data: receiptData,
    });

    console.log('[ORDER LIST] Print result:', result);

    if (!result?.success) {
      throw new Error(
        result?.error || 'Printer failed to print the bill.'
      );
    }

    showToast(
  `Bill ${savedOrder.srno ?? ''} sent to printer.`,
  'success'
);
  } catch (error: any) {
    console.error('[ORDER LIST] Reprint failed:', error);

 showToast(
    'Bill printing failed: ' +
      (error?.message || 'Unknown error'),
    'error'
  );
  } finally {
    setPrintingOrderId(null);
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
<>
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

          {/* <button
  type="button"
  onClick={() => router.push("/orders/deleted-items")}
  className="rounded-md border px-3 py-2 text-sm"
>
  Deleted Items
</button> */}

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
                  <th className="px-4 py-3 text-right">Finalized By</th>
                  <th className="px-4 py-3 text-right">
                    Total
                  </th>

                  <th className="px-4 py-3">
                    Payment
                  </th>

                  <th className="px-4 py-3">
                    Status
                  </th>
<th className="px-4 py-3 text-center">
  Actions
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

                        <td className="
                            px-4
                            py-3
                            text-right
                            font-bold
                          ">
                          {order.finalizedByName}
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
                        
<td className="px-4 py-3 text-center">
  <button
    type="button"
    disabled={printingOrderId !== null}
    onClick={(e) => {
      e.stopPropagation();
      void printBill(order.id);
    }}
    className="
      inline-flex
      items-center
      justify-center
      gap-2
      rounded-lg
      border
      px-3
      py-2
      text-xs
      font-semibold
      transition
      hover:opacity-80
      disabled:cursor-not-allowed
      disabled:opacity-50
    "
    style={{
      borderColor: background.line,
      color: theme.primary,
    }}
  >
    {printingOrderId === order.id
      ? 'Printing...'
      : '🖨 Print Bill'}
  </button>
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
    
{toastMessage && (
  <div
    role="status"
    aria-live="polite"
    className={`fixed right-5 top-5 z-[9999] flex max-w-md items-center gap-3 rounded-lg px-4 py-3 text-white shadow-lg ${
      toastType === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}
  >
    <span className="flex-1">{toastMessage}</span>

    <button
      type="button"
      onClick={() => setToastMessage('')}
      className="text-xl font-bold"
      aria-label="Dismiss notification"
    >
      ×
    </button>
  </div>
)}
</>
  );
}