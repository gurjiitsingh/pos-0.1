'use client';

import {
  useEffect,
  useState,
} from 'react';
import { Suspense } from "react";
import {
  useSearchParams,
  useRouter,
} from 'next/navigation';

import {
  ArrowLeft,
  Receipt,
  User,
  CreditCard,
  Utensils,
} from 'lucide-react';

import { usePosTheme } from '@/PosThemeStore/PosThemeContext';


// =====================================================
// TYPES
// =====================================================

type OrderMaster = {
  id: string;
  srno: string;

  orderType: string;

  tableNo?: string | null;
  tableName?: string | null;

  customerName?: string | null;
  customerPhone?: string | null;

  itemTotal?: number;
  itemTax?: number;
  taxTotal?: number;
  discountTotal?: number;
  grandTotal?: number;

  paymentMode?: string;
  paymentStatus?: string;

  paidAmount?: number;
  dueAmount?: number;

  orderStatus?: string;

  deviceId?: string;
  deviceName?: string;
  appVersion?: string;

  businessDate?: string;
  createdAt?: number;

  syncStatus?: string;
};


type OrderItem = {
  id: string;
  orderMasterId: string;

  categoryName?: string;
  productMode?: string;
  currentStock?: number;

  productId?: string;
  name?: string;
  categoryId?: string;

  parentId?: string | null;
  isVariant?: number;

  basePrice?: number;
  quantity?: number;
  itemSubtotal?: number;

  currency?: string;
  paymentStatus?: string;

  taxRate?: number;
  taxType?: string;

  taxAmountPerItem?: number;
  taxTotal?: number;

  note?: string;
  modifiersJson?: string;

  modifierPrice?: number;
  modifierSummary?: string;

  finalPricePerItem?: number;
  finalTotal?: number;

  createdAt?: number;
};


// =====================================================
// PAGE
// =====================================================

export default function OrderDetailContent() {

  const router = useRouter();

  const searchParams =
    useSearchParams();

  const orderId =
    searchParams.get('orderId');


  const {
    theme,
    background,
  } = usePosTheme();


  const [order, setOrder] =
    useState<OrderMaster | null>(null);

  const [items, setItems] =
    useState<OrderItem[]>([]);

  const [loading, setLoading] =
    useState(true);


  // =====================================================
  // LOAD ORDER
  // =====================================================

  useEffect(() => {

    if (!orderId) {
      setLoading(false);
      return;
    }

    loadOrder();

  }, [orderId]);


  async function loadOrder() {

    try {

      setLoading(true);

      console.log(
        'GET ORDER:',
        orderId
      );


      const master =
        await window.posApi.getOrderById(
          orderId!
        );


      console.log(
        'ORDER MASTER:',
        master
      );


      if (!master) {

        setOrder(null);
        setItems([]);

        return;
      }


      const orderItems =
        await window.posApi.getOrderDeletedItems(
          orderId!
        );


      console.log(
        'ORDER ITEMS:',
        orderItems
      );


      setOrder(master);

      setItems(
        Array.isArray(orderItems)
          ? orderItems
          : []
      );


    } catch (error) {

      console.error(
        'Failed to load order:',
        error
      );

      setOrder(null);
      setItems([]);

    } finally {

      setLoading(false);

    }
  }


  // =====================================================
  // FORMAT MONEY
  // =====================================================

  function money(
    value: number | undefined
  ) {

    return Number(
      value || 0
    ).toFixed(2);

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(
    timestamp?: number
  ) {

    if (!timestamp) {
      return '-';
    }

    return new Date(
      timestamp
    ).toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );

  }
console.log("Order------------------",order)

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div
        className={`
          min-h-screen
          ${background.className}
          ${background.text}
          flex
          items-center
          justify-center
        `}
      >

        <div className="text-sm opacity-50">
          Loading order...
        </div>

      </div>

    );

  }


  // =====================================================
  // ORDER NOT FOUND
  // =====================================================

  if (!order) {

    return (

      <div
        className={`
          min-h-screen
          
          ${background.className}
          ${background.text}
          p-5
        `}
      >

        <button
          onClick={() =>
            router.back()
          }
          className="
            mb-5
            flex
            items-center
            gap-2
            text-sm
            font-semibold
            opacity-70
            hover:opacity-100
          "
        >

          <ArrowLeft size={18} />

          Back

        </button>


        <div
          className={`
            rounded-2xl
            border
            ${background.border}
            p-10
            text-center
          `}
        >

          <Receipt
            size={40}
            className="
              mx-auto
              mb-3
              opacity-30
            "
          />

          <p className="font-semibold">
            Order not found
          </p>

          <p className="mt-1 text-xs opacity-50">
            This order could not be loaded.
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div
      className={`
        h-[95%]
         overflow-y-auto
        ${background.className}
        ${background.text}
        p-4
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
          items-center
          justify-between
          rounded-2xl
          border
          ${background.border}
          p-4
          shadow-sm
        `}
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              transition
              hover:bg-black/[0.05]
            "
          >

            <ArrowLeft size={18} />

          </button>


          <div>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <h1
                className="
                  text-xl
                  font-bold
                "
              >
                Order #{order.srno}
              </h1>

            </div>


            <p
              className="
                mt-1
                text-xs
                opacity-50
              "
            >
              {formatDate(
                order.createdAt
              )}
            </p>

          </div>

        </div>


        <div
          className="
            text-right
          "
        >

          <p
            className="
              text-[10px]
              uppercase
              tracking-wider
              opacity-40
            "
          >
            Total
          </p>

          <p
            className="
              text-lg
              font-bold
            "
          >
            ₹{money(order.grandTotal)}
          </p>

        </div>

      </div>


      {/* =================================================
          ORDER INFORMATION
      ================================================= */}

      <div
        className="
          mb-4
          grid
          gap-4
          md:grid-cols-3
        "
      >

        {/* CUSTOMER */}

        <div
          className={`
            rounded-2xl
            border
            ${background.border}
            p-4
          `}
        >

          <div
            className="
              mb-3
              flex
              items-center
              gap-2
            "
          >

            <User size={17} />

            <span
              className="
                text-sm
                font-semibold
              "
            >
              Customer
            </span>

          </div>


          <p className="text-sm font-medium">
            {order.customerName ||
              'Customer'}
          </p>


          {order.customerPhone && (

            <p
              className="
                mt-1
                text-xs
                opacity-50
              "
            >
              {order.customerPhone}
            </p>

          )}

        </div>


        {/* ORDER */}

        <div
          className={`
            rounded-2xl
            border
            ${background.border}
            p-4
          `}
        >

          <div
            className="
              mb-3
              flex
              items-center
              gap-2
            "
          >

            <Utensils size={17} />

            <span
              className="
                text-sm
                font-semibold
              "
            >
              Order
            </span>

          </div>


          <div
            className="
              space-y-1.5
              text-xs
            "
          >

            <div className="flex justify-between">

              <span className="opacity-50">
                Type
              </span>

              <span className="font-medium">
                {order.orderType || '-'}
              </span>

            </div>


            <div className="flex justify-between">

              <span className="opacity-50">
                Table
              </span>

              <span className="font-medium">
                {order.tableName ||
                  order.tableNo ||
                  '-'}
              </span>

            </div>


            <div className="flex justify-between">

              <span className="opacity-50">
                Status
              </span>

              <span className="font-medium">
                {order.orderStatus ||
                  '-'}
              </span>

            </div>

          </div>

        </div>


        {/* PAYMENT */}

        <div
          className={`
            rounded-2xl
            border
            ${background.border}
            p-4
          `}
        >

          <div
            className="
              mb-3
              flex
              items-center
              gap-2
            "
          >

            <CreditCard size={17} />

            <span
              className="
                text-sm
                font-semibold
              "
            >
              Payment
            </span>

          </div>


          <div
            className="
              space-y-1.5
              text-xs
            "
          >

            <div className="flex justify-between">

              <span className="opacity-50">
                Method
              </span>

              <span className="font-semibold">
                {order.paymentMode || '-'}
              </span>

            </div>


            <div className="flex justify-between">

              <span className="opacity-50">
                Status
              </span>

              <span className="font-semibold">
                {order.paymentStatus || '-'}
              </span>

            </div>


            <div className="flex justify-between">

              <span className="opacity-50">
                Paid
              </span>

              <span className="font-semibold">
                ₹{money(order.paidAmount)}
              </span>

            </div>


            <div className="flex justify-between">

              <span className="opacity-50">
                Due
              </span>

              <span className="font-semibold">
                ₹{money(order.dueAmount)}
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          ITEMS
      ================================================= */}

      <div
        className={`
          mb-4
          overflow-hidden
          rounded-2xl
          border
          ${background.border}
          shadow-sm
        `}
      >

        <div
          className="
            border-b
            px-4
            py-3
          "
          style={{
            borderColor:
              background.line,
          }}
        >

          <p
            className="
              text-sm
              font-semibold
            "
          >
            Order Items
          </p>

          <p
            className="
              mt-0.5
              text-[11px]
              opacity-40
            "
          >
            {items.length} items
          </p>

        </div>


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
                  text-[10px]
                  uppercase
                  tracking-wider
                  opacity-45
                "
              >

                <th className="px-4 py-3">
                  Item
                </th>

                <th className="px-4 py-3 text-right">
                  Qty
                </th>

                <th className="px-4 py-3 text-right">
                  Price
                </th>

                <th className="px-4 py-3 text-right">
                  Total
                </th>

              </tr>

            </thead>


            <tbody>

              {items.map(
                (item) => (

                  <tr
                    key={item.id}
                    className="
                      border-t
                    "
                    style={{
                      borderColor:
                        background.line,
                    }}
                  >

                    <td
                      className="
                        px-4
                        py-3
                      "
                    >

                      <p
                        className="
                          font-semibold
                        "
                      >
                        {item.name || '-'}
                      </p>


                      {item.modifierSummary && (

                        <p
                          className="
                            mt-1
                            text-[11px]
                            opacity-45
                          "
                        >
                          {item.modifierSummary}
                        </p>

                      )}


                      {item.note && (

                        <p
                          className="
                            mt-1
                            text-[11px]
                            italic
                            opacity-40
                          "
                        >
                          {item.note}
                        </p>

                      )}

                    </td>


                    <td
                      className="
                        px-4
                        py-3
                        text-right
                      "
                    >
                      {item.quantity ?? 0}
                    </td>


                    <td
                      className="
                        px-4
                        py-3
                        text-right
                      "
                    >
                      ₹
                      {money(
                        item.finalPricePerItem ??
                        item.basePrice
                      )}
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
                      {money(
                        item.finalTotal
                      )}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =================================================
          TOTALS
      ================================================= */}

      {/* <div
        className="
          flex
          justify-end
        "
      >

        <div
          className={`
            w-full
            max-w-sm
            rounded-2xl
            border
            ${background.border}
            p-4
          `}
        >

          <div
            className="
              space-y-2
              text-sm
            "
          >

            <div className="flex justify-between">

              <span className="opacity-50">
                Item Total
              </span>

              <span>
                ₹{money(order.itemTotal)}
              </span>

            </div>


            <div className="flex justify-between">

              <span className="opacity-50">
                Tax
              </span>

              <span>
                ₹{money(order.taxTotal)}
              </span>

            </div>


            <div className="flex justify-between">

              <span className="opacity-50">
                Delivery Fee
              </span>

              <span>
                ₹{money(order.deliveryFee)}
              </span>

            </div>
               <div className="flex justify-between">

              <span className="opacity-50">
                Discount
              </span>

              <span>
                ₹{money(order.discountTotal)}
              </span>

            </div>


            <div
              className="
                my-2
                border-t
              "
              style={{
                borderColor:
                  background.line,
              }}
            />


            <div
              className="
                flex
                justify-between
                text-lg
                font-bold
              "
            >

              <span>
                Grand Total
              </span>

              <span
                style={{
                  color:
                    theme.primary,
                }}
              >
                ₹{money(order.grandTotal)}
              </span>

            </div>

          </div>

        </div>

      </div> */}

    </div>

  );

}