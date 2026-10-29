'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  calculateBill,
  groupBillItems,
} from '@/lib/billing/calculateBill';

import { usePosUi } from '@/PosUiStore/PosUiContext';
import { usePosSession } from '@/PosSessionStore/PosSessionContext';
import { usePosTheme } from '@/PosThemeStore/PosThemeContext';

type KitchenViewProps = {
  onSuccess?: () => void;
};

type OrderType =
  | 'DINE_IN'
  | 'TAKEAWAY'
  | 'DELIVERY';

export default function KitchenView({
  onSuccess,
}: KitchenViewProps) {

  // =====================================================
  // POS SESSION
  // =====================================================

  const {
    activeTable,
    activeOrder,
  } = usePosSession();

  const {
    theme,
    background,
  } = usePosTheme();

  const {
    setRightSidebarView,
  } = usePosUi();

  // =====================================================
  // CURRENT POS SELECTION
  //
  // DINE_IN:
  //   activeTable
  //
  // TAKEAWAY / DELIVERY:
  //   activeOrder
  // =====================================================

  const orderType: OrderType =
    activeOrder?.orderType ??
    'DINE_IN';

  const currentTableId =
    orderType === 'DINE_IN'
      ? (
          activeTable?.tableId ??
          activeTable?.tableName ??
          ''
        )
      : (
          activeOrder?.tableId ??
          activeOrder?.orderNo ??
          ''
        );

  const currentTableName =
    orderType === 'DINE_IN'
      ? (
          activeTable?.tableName ??
          activeTable?.tableId ??
          ''
        )
      : (
          activeOrder?.tableName ??
          activeOrder?.orderNo ??
          ''
        );

  // =====================================================
  // KITCHEN ITEMS
  // =====================================================

  const [kitchenItems, setKitchenItems] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // BILL STATE
  // =====================================================

  const [customerName, setCustomerName] =
    useState('Customer');

  const [customerPhone, setCustomerPhone] =
    useState('');

  const [discount, setDiscount] =
    useState(0);

  const [deliveryFee, setDeliveryFee] =
    useState(0);

  const [paymentMode, setPaymentMode] =
    useState<
      | 'CASH'
      | 'CARD'
      | 'UPI'
      | 'WALLET'
      | 'CREDIT'
    >('CASH');

  const [paidAmount, setPaidAmount] =
    useState(0);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // =====================================================
  // LOAD KITCHEN ITEMS
  // =====================================================

  useEffect(() => {
    loadKitchen();
  }, [
    currentTableId,
    orderType,
  ]);

  async function loadKitchen() {

    if (!currentTableId) {
      setKitchenItems([]);
      return;
    }

    try {

      setLoading(true);
      setError(null);

      console.log(
        'LOAD KITCHEN:',
        {
          orderType,
          currentTableId,
          currentTableName,
        }
      );

      const rows =
        await window.posApi.getPendingKotByTable(
          currentTableId
        );

      console.log(
        'KITCHEN ITEMS:',
        rows
      );

      setKitchenItems(
        rows || []
      );

    } catch (e) {

      console.error(
        'Failed to load kitchen items',
        e
      );

      setError(
        e instanceof Error
          ? e.message
          : 'Failed to load kitchen items'
      );

    } finally {

      setLoading(false);

    }
  }

  // =====================================================
  // BILL ITEMS
  // =====================================================

  const billItems = useMemo(
    () =>
      groupBillItems(
        kitchenItems
      ),
    [kitchenItems]
  );

  // =====================================================
  // CALCULATE BILL
  // =====================================================

  const calculation = useMemo(
    () =>
      calculateBill(
        billItems,
        discount,
        deliveryFee
      ),
    [
      billItems,
      discount,
      deliveryFee,
    ]
  );

  // =====================================================
  // PAYMENT
  // =====================================================

  const dueAmount =
    Math.max(
      0,
      calculation.grandTotal -
      Number(paidAmount || 0)
    );

  const paymentStatus =
    paymentMode === 'CREDIT'
      ? 'CREDIT'
      : dueAmount > 0
        ? 'PARTIAL'
        : 'PAID';

  // =====================================================
  // GROUP KOTS
  // =====================================================

  const groupedKitchenItems =
    useMemo(() => {

      const groups:
        Record<string, typeof kitchenItems> = {};

      for (
        const item of kitchenItems
      ) {

        const kotNumber =
          item.kotNumber ||
          'NO KOT';

        if (
          !groups[kotNumber]
        ) {
          groups[kotNumber] = [];
        }

        groups[kotNumber].push(
          item
        );
      }

      return Object.entries(
        groups
      );

    }, [kitchenItems]);

  // =====================================================
  // FINALIZE BILL
  // =====================================================

  async function handleCheckout() {

    if (processing) {
      return;
    }

    if (!currentTableId) {

      setError(
        'No table or order selected'
      );

      return;
    }

    if (
      billItems.length === 0
    ) {

      setError(
        'No kitchen items'
      );

      return;
    }

    try {

      setProcessing(true);
      setError(null);

      console.log(
        'CHECKOUT:',
        {
          currentTableId,
          currentTableName,
          orderType,
          billItems,
        }
      );

      // =================================================
      // CREATE BILL
      // =================================================

      const result =
        await window.posApi.createBill({

          // DINE_IN => T1
          // TAKEAWAY => TW1
          // DELIVERY => DL1

          tableNo:
            currentTableId,

          tableName:
            currentTableName,

          orderType,

          customerName:
            customerName.trim() ||
            'Customer',

          customerPhone:
            customerPhone.trim(),

          discountTotal:
            calculation.discount,

          deliveryFee:
            calculation.deliveryFee,

          deliveryTax:
            0,

          paymentMode,

          paymentStatus,

          paidAmount:
            Number(paidAmount) || 0,

          payments:
            paidAmount > 0
              ? [
                  {
                    mode:
                      paymentMode,

                    amount:
                      Number(
                        paidAmount
                      ),
                  },
                ]
              : [],

          deviceId:
            'POS',

          deviceName:
            'Electron POS',

          appVersion:
            '1.0',

          businessDate:
            new Date()
              .toISOString()
              .slice(0, 10),

          currency:
            '₹',
        });

      if (
        !result?.success
      ) {

        throw new Error(
          result?.error ||
          'Failed to create bill'
        );
      }

      console.log(
        'BILL CREATED:',
        result
      );

      // =================================================
      // CLEAR KITCHEN UI
      // =================================================

      setKitchenItems([]);

      // =================================================
      // RELOAD
      // =================================================

      await loadKitchen();

      // =================================================
      // RETURN TO CART
      // =================================================

      setRightSidebarView(
        'cart'
      );

      onSuccess?.();

    } catch (e: any) {

      console.error(
        'BILL FAILED',
        e
      );

      setError(
        e?.message ||
        'Payment failed'
      );

    } finally {

      setProcessing(false);

    }
  }

  // =====================================================
  // ORDER TYPE LABEL
  // =====================================================

  const orderTypeLabel =
    orderType === 'DINE_IN'
      ? 'DINE IN'
      : orderType === 'TAKEAWAY'
        ? 'TAKEAWAY'
        : 'DELIVERY';

  // =====================================================
  // UI
  // =====================================================

  return (

    <div
      className={`
        flex
        h-full
        flex-col
        mb-16
        ${background.className}
        ${background.text}
      `}
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div
        className={`
          shrink-0
          border-b
          ${background.border}
          px-4
          py-2
        `}
      >

        <div
          className="
            flex
            items-center
            justify-between
          "
        >

          {/* ORDER INFO */}

          <div>

            <div
              className="
                text-sm
                font-semibold
              "
              style={{
                color:
                  theme.primaryText,
              }}
            >
              {currentTableName ||
                'No Selection'}
            </div>

            <div
              className="
                mt-0.5
                text-[10px]
                opacity-60
              "
            >
              {orderTypeLabel}
            </div>

          </div>

          {/* ITEM COUNT */}

          <div
            className="
              text-xs
              opacity-60
            "
          >
            {kitchenItems.length}{' '}
            items
          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error ? (

        <div
          className="
            shrink-0
            border-b
            border-red-200
            bg-red-50
            px-4
            py-2
            text-xs
            text-red-600
          "
        >
          {error}
        </div>

      ) : null}

      {/* ================================================= */}
      {/* ITEM LIST */}
      {/* ================================================= */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          app-scrollbar
        "
      >

        {loading ? (

          <div
            className="
              flex
              h-full
              items-center
              justify-center
            "
          >

            <p
              className="
                text-sm
                opacity-60
              "
            >
              Loading...
            </p>

          </div>

        ) : kitchenItems.length === 0 ? (

          <div
            className="
              flex
              h-full
              items-center
              justify-center
            "
          >

            <div
              className="
                text-center
              "
            >

              <p
                className="
                  text-sm
                  opacity-60
                "
              >
                No kitchen items
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  opacity-40
                "
              >
                {currentTableName ||
                  'No order selected'}
              </p>

            </div>

          </div>

        ) : (

          <div
            className={`
              divide-y
              ${background.divide}
            `}
          >

            {groupedKitchenItems.map(
              ([kotNumber, items]) => {

                const firstItem =
                  items[0];

                return (

                  <div
                    key={kotNumber}
                    className="
                      border-b
                      px-3
                      py-3
                    "
                  >

                    {/* KOT HEADER */}

                    <div
                      className="
                        mb-2
                        flex
                        items-center
                        justify-between
                      "
                    >

                      <span
                        className="
                          text-xs
                          font-bold
                        "
                        style={{
                          color:
                            theme.primaryText,
                        }}
                      >
                        {kotNumber}
                      </span>

                      <span
                        className="
                          rounded-lg
                          px-2
                          py-1
                          text-[10px]
                          font-semibold
                        "
                        style={{
                          backgroundColor:
                            theme.primarySelected,

                          color:
                            theme.primaryText,
                        }}
                      >
                        {firstItem?.status}
                      </span>

                    </div>

                    {/* KOT ITEMS */}

                    <div
                      className="
                        space-y-2
                      "
                    >

                      {items.map(
                        (item) => (

                          <div
                            key={item.id}
                          >

                            <p
                              className="
                                text-xs
                                opacity-60
                              "
                            >
                              {item.quantity}
                              {' × '}
                              {item.name}
                            </p>

                            {item.note ? (

                              <p
                                className="
                                  mt-1
                                  text-xs
                                  opacity-60
                                "
                              >
                                {item.note}
                              </p>

                            ) : null}

                          </div>

                        )
                      )}

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

      </div>

    </div>
  );
}