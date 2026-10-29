'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { usePosSession } from '@/PosSessionStore/PosSessionContext';

type PosOrderType =
  | 'TAKEAWAY'
  | 'DELIVERY';

type PosOrder = {
  orderNo: string;
  tableId: string;
  tableName: string;
  orderType: PosOrderType;
};

export default function RunningOrders() {

  const {
    activeOrder,
    setActiveOrder,
    setActiveTable,
  } = usePosSession();

  const [
    takeawayOrders,
    setTakeawayOrders,
  ] = useState<PosOrder[]>([]);

  const [
    deliveryOrders,
    setDeliveryOrders,
  ] = useState<PosOrder[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  // =====================================================
  // LOAD TODAY'S ORDER NUMBERS
  // =====================================================

  const loadOrders = useCallback(
    async () => {

      try {

        setLoading(true);
        setError(null);

        console.log(
          'RUNNING ORDERS: loading...'
        );


        // =================================================
        // TAKEAWAY
        // =================================================

        const takeaway =
          await window.posApi.getTodayPosOrders(
            'TAKEAWAY'
          );

        console.log(
          'TAKEAWAY ORDERS =>',
          takeaway
        );


        // =================================================
        // DELIVERY
        // =================================================

        const delivery =
          await window.posApi.getTodayPosOrders(
            'DELIVERY'
          );

        console.log(
          'DELIVERY ORDERS =>',
          delivery
        );


        // =================================================
        // NORMALIZE TAKEAWAY
        // =================================================

        const normalizedTakeaway: PosOrder[] =
          Array.isArray(takeaway)
            ? takeaway.map(
                (order: any) => ({
                  orderNo:
                    order.orderNo,

                  tableId:
                    order.tableId ??
                    order.orderNo,

                  tableName:
                    order.tableName ??
                    order.orderNo,

                  orderType:
                    'TAKEAWAY',
                })
              )
            : [];


        // =================================================
        // NORMALIZE DELIVERY
        // =================================================

        const normalizedDelivery: PosOrder[] =
          Array.isArray(delivery)
            ? delivery.map(
                (order: any) => ({
                  orderNo:
                    order.orderNo,

                  tableId:
                    order.tableId ??
                    order.orderNo,

                  tableName:
                    order.tableName ??
                    order.orderNo,

                  orderType:
                    'DELIVERY',
                })
              )
            : [];


        setTakeawayOrders(
          normalizedTakeaway
        );

        setDeliveryOrders(
          normalizedDelivery
        );


        console.log(
          'RUNNING ORDERS LOADED =>',
          {
            takeaway:
              normalizedTakeaway,

            delivery:
              normalizedDelivery,
          }
        );

      } catch (err: any) {

        console.error(
          'RUNNING ORDERS LOAD FAILED =>',
          err
        );

        setError(
          err?.message ||
          'Failed to load running orders'
        );

        setTakeawayOrders([]);
        setDeliveryOrders([]);

      } finally {

        setLoading(false);

      }

    },
    []
  );


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadOrders();

  }, [loadOrders]);


  // =====================================================
  // SELECT ORDER
  // =====================================================

  function selectOrder(
    order: PosOrder
  ) {

    console.log(
      'SELECTING POS ORDER =>',
      order
    );


    // ===================================================
    // IMPORTANT
    //
    // TW / DL orders are NOT normal dine-in tables.
    // ===================================================

    setActiveTable(null);


    // ===================================================
    // SET ACTIVE ORDER
    // ===================================================

    setActiveOrder({

      orderType:
        order.orderType,

      orderNo:
        order.orderNo,

      tableId:
        order.orderNo,

      tableName:
        order.orderNo,

    });


    console.log(
      'ACTIVE POS ORDER SET =>',
      {
        orderType:
          order.orderType,

        orderNo:
          order.orderNo,

        tableId:
          order.orderNo,

        tableName:
          order.orderNo,
      }
    );
  }


  // =====================================================
  // ORDER BUTTON
  // =====================================================

  function OrderButton({
    order,
  }: {
    order: PosOrder;
  }) {

    const isSelected =
      activeOrder?.orderType ===
        order.orderType &&
      activeOrder?.orderNo ===
        order.orderNo;


    return (

      <button
        type="button"
        onClick={() =>
          selectOrder(order)
        }
        className={`
          flex
          w-full
          items-center
          justify-between

          rounded-md
          border

          px-3
          py-3

          text-left

          transition

          ${
            isSelected
              ? `
                border-zinc-900
                bg-zinc-900
                text-white

                dark:border-white
                dark:bg-white
                dark:text-zinc-900
              `
              : `
                border-zinc-200
                bg-white
                text-zinc-800

                hover:bg-zinc-100

                dark:border-zinc-700
                dark:bg-zinc-800
                dark:text-white
                dark:hover:bg-zinc-700
              `
          }
        `}
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          {/* ORDER NUMBER */}

          <span
            className="
              text-sm
              font-bold
            "
          >
            {order.orderNo}
          </span>


          {/* TYPE */}

          <span
            className="
              text-[10px]
              font-medium
              opacity-60
            "
          >
            {order.orderType ===
            'TAKEAWAY'
              ? 'TAKEAWAY'
              : 'DELIVERY'}
          </span>

        </div>


        {/* SELECTED */}

        {isSelected && (

          <span
            className="
              text-[10px]
              font-semibold
            "
          >
            SELECTED
          </span>

        )}

      </button>

    );
  }


  // =====================================================
  // SECTION
  // =====================================================

  function OrderSection({
    title,
    orders,
    emptyText,
  }: {
    title: string;
    orders: PosOrder[];
    emptyText: string;
  }) {

    return (

      <section>

        {/* ============================================= */}
        {/* SECTION HEADER */}
        {/* ============================================= */}

        <div
          className="
            mb-2
            flex
            items-center
            justify-between
          "
        >

          <h3
            className="
              text-xs
              font-bold
              text-zinc-700
              dark:text-zinc-200
            "
          >
            {title}
          </h3>


          <span
            className="
              min-w-[22px]
              rounded-full
              bg-zinc-100
              px-2
              py-0.5
              text-center
              text-[10px]
              font-semibold
              text-zinc-600

              dark:bg-zinc-700
              dark:text-zinc-300
            "
          >
            {orders.length}
          </span>

        </div>


        {/* ============================================= */}
        {/* ORDERS */}
        {/* ============================================= */}

        {orders.length === 0 ? (

          <div
            className="
              rounded-md
              border
              border-dashed
              border-zinc-300
              px-3
              py-5
              text-center
              text-xs
              text-zinc-400

              dark:border-zinc-700
            "
          >
            {emptyText}
          </div>

        ) : (

          <div
            className="
              space-y-2
            "
          >

            {orders.map(
              (order) => (

                <OrderButton
                  key={
                    `${order.orderType}-${order.orderNo}`
                  }
                  order={order}
                />

              )
            )}

          </div>

        )}

      </section>

    );
  }


  // =====================================================
  // TOTAL
  // =====================================================

  const totalOrders =
    takeawayOrders.length +
    deliveryOrders.length;


  // =====================================================
  // UI
  // =====================================================

  return (

    <div
      className="
        flex
        h-full
        w-full
        flex-col
        overflow-hidden

        bg-white
        dark:bg-zinc-900
      "
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div
        className="
          shrink-0
          border-b
          border-zinc-200
          px-4
          py-3

          dark:border-zinc-700
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
          "
        >

          <div>

            <h2
              className="
                text-sm
                font-bold
                text-zinc-800
                dark:text-white
              "
            >
              Running Orders
            </h2>

            <p
              className="
                mt-0.5
                text-[10px]
                text-zinc-500
              "
            >
              {totalOrders}{' '}
              order
              {totalOrders === 1
                ? ''
                : 's'} today
            </p>

          </div>


          {/* REFRESH */}

          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="
              rounded-md
              border
              border-zinc-300

              px-3
              py-1.5

              text-[11px]
              font-semibold

              text-zinc-600

              hover:bg-zinc-100

              disabled:cursor-not-allowed
              disabled:opacity-50

              dark:border-zinc-600
              dark:text-zinc-300
              dark:hover:bg-zinc-700
            "
          >

            {loading
              ? 'Loading...'
              : 'Refresh'}

          </button>

        </div>

      </div>


      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          app-scrollbar
          p-3
        "
      >

        {/* =============================================== */}
        {/* ERROR */}
        {/* =============================================== */}

        {error && (

          <div
            className="
              mb-3
              rounded-md
              border
              border-red-200
              bg-red-50
              px-3
              py-3
              text-xs
              text-red-600

              dark:border-red-900
              dark:bg-red-950
              dark:text-red-300
            "
          >

            <div
              className="
                font-semibold
              "
            >
              Failed to load orders
            </div>

            <div
              className="
                mt-1
              "
            >
              {error}
            </div>

          </div>

        )}


        {/* =============================================== */}
        {/* LOADING */}
        {/* =============================================== */}

        {loading ? (

          <div
            className="
              flex
              h-40
              items-center
              justify-center
            "
          >

            <span
              className="
                text-sm
                text-zinc-500
              "
            >
              Loading orders...
            </span>

          </div>

        ) : (

          <div
            className="
              space-y-6
            "
          >

            {/* ========================================= */}
            {/* TAKEAWAY */}
            {/* ========================================= */}

            <OrderSection
              title="TAKEAWAY"
              orders={takeawayOrders}
              emptyText="No takeaway orders today"
            />


            {/* ========================================= */}
            {/* DELIVERY */}
            {/* ========================================= */}

            <OrderSection
              title="DELIVERY"
              orders={deliveryOrders}
              emptyText="No delivery orders today"
            />

          </div>

        )}

      </div>

    </div>

  );
}