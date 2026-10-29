'use client';

import { CartItem, cartProductType } from '@/lib/types/cartDataType';
import { usePosSession } from '@/PosSessionStore/PosSessionContext';
import { usePosTheme } from '@/PosThemeStore/PosThemeContext';
import { usePosUi } from '@/PosUiStore/PosUiContext';
import { useCartContext } from '@/store/CartContext';
import { useState } from 'react';
import { ChefHat, CookingPot } from "lucide-react";
import { usePosAuth } from "@/store/PosAuthContext";
import { useToast } from '@/hooks/useToast';

 

export default function CartPanel() {

  const {
    currentUser,
  } = usePosAuth();

  const {
    cartData,
    reloadCart,
    productTotalCost,
    addProductToCart,
    decCartProduct,
    setCartData,
    updateCartItemNote,
  } = useCartContext();

  const {
    activeTable,
    activeOrder,
  } = usePosSession();



  const {
    setRightSidebarView,
  } = usePosUi();

  // =====================================================
  // POS THEME
  // =====================================================

  const {
    theme,
    background,
  } = usePosTheme();


  // =====================================================
  // CURRENT ORDER REFERENCE
  // =====================================================

  const currentOrderNo =
    activeOrder?.orderType === 'DINE_IN'
      ? activeTable?.tableId ?? null
      : activeOrder?.orderNo ?? null;

  const currentOrderName =
    activeOrder?.orderType === 'DINE_IN'
      ? activeTable?.tableName ?? null
      : activeOrder?.orderNo ?? null;


  const [editingNoteId, setEditingNoteId] =
    useState<number | null>(null);
const { showToast, toastComponent } = useToast();
  const [noteText, setNoteText] =
    useState('');

  // =====================================================
  // SEND TO KITCHEN
  // =====================================================
  async function sendToKitchenHandle() {

    // ---------------------------------------------------
    // VALIDATE CART
    // ---------------------------------------------------

    if (cartData.length === 0) {
      return;
    }


    // ---------------------------------------------------
    // VALIDATE TABLE
    // ---------------------------------------------------

    // ---------------------------------------------------
    // VALIDATE ORDER
    // ---------------------------------------------------

    if (!activeOrder) {
      showToast(
        'Please select an order type first.'
      );

      return;
    }

    // DINE IN requires table
    if (
      activeOrder.orderType === 'DINE_IN' &&
      !activeTable?.tableId
    ) {
      showToast(
        'Please select a table first.'
      );

      return;
    }

    // TAKEAWAY / DELIVERY require generated order number
    if (
      activeOrder.orderType !== 'DINE_IN' &&
      !activeOrder.orderNo
    ) {
      showToast(
        'Order number is not available yet.'
      );

      return;
    }

    try {

      // =================================================
      // BASIC KOT INFORMATION
      // =================================================

      const kotBatchId =
        crypto.randomUUID();


      const kotNumber =
        await window.posApi.generateNextKotNumber();


      const currentTableId =
        currentOrderNo ?? '';

      const currentTableName =
        currentOrderName ?? '';


      const now =
        Date.now();


      // =================================================
      // BUSINESS DATE
      // =================================================
      //
      // IMPORTANT:
      // KOT history requires businessDate.
      //
      // Use your existing business-date logic here if
      // you already have one.
      //
      // This fallback uses local calendar date.
      // =================================================

      const businessDate =
        new Date().toISOString().slice(0, 10);


      // =================================================
      // COMMON ITEM DATA
      // =================================================
      console.log("cartData-----------------", cartData)
      const convertedCartData =
        cartData.map((item) => ({

          // ------------------------------------------------
          // PRODUCT
          // ------------------------------------------------

          categoryName:
            item.categoryName || '',

          productMode:
            item.productMode || 'raw_stock',

          currentStock:
            Number(item.currentStock ?? 0),

          productId:
            item.productId,

          name:
            item.name || '',

          categoryId:
            item.categoryId || '',


          // ------------------------------------------------
          // SESSION
          // ------------------------------------------------
          sessionId:
            item.sessionId ?? null,
          // ------------------------------------------------
          // TABLE
          // ------------------------------------------------

          tableNo:
            currentTableId,

          tableName:
            currentTableName,


          // ------------------------------------------------
          // USER
          // ------------------------------------------------

          createdById:
            item.createdById ?? '',

          createdByName:
            item.createdByName ?? '',


          kitchenPrintReq: Number(item.kitchenPrintReq) === 1,
          // ------------------------------------------------
          // VARIANT
          // ------------------------------------------------

          parentId:
            item.parentId ?? null,

          isVariant:
            item.isVariant ?? false,


          // ------------------------------------------------
          // PRICE
          // ------------------------------------------------
          discountEligible: item.discountEligible ?? true,
          basePrice:
            Number(item.basePrice ?? 0),

          finalPrice:
            Number(item.finalPrice ?? 0),

          modifierTotal:
            Number(item.modifierTotal ?? 0),


          // ------------------------------------------------
          // QUANTITY
          // ------------------------------------------------

          quantity:
            Number(item.quantity ?? 0),


          // ------------------------------------------------
          // TAX
          // ------------------------------------------------

          taxRate:
            Number(item.taxRate ?? 0),

          taxType:
            item.taxType || 'exclusive',


          // ------------------------------------------------
          // NOTE
          // ------------------------------------------------

          note:
            item.note ?? '',


          // ------------------------------------------------
          // MODIFIERS
          // ------------------------------------------------

          modifiersJson:
            item.modifiersJson ??
            JSON.stringify(
              item.modifiers ?? []
            ),


          // ------------------------------------------------
          // TIMESTAMP
          // ------------------------------------------------

          createdAt:
            now,


          // ------------------------------------------------
          // SOURCE
          // ------------------------------------------------

          source:
            'POS',


          // ------------------------------------------------
          // SYNC
          // ------------------------------------------------

          syncedToCloud:
            false,

          syncedFromCloud:
            false,

        }));

      console.log("Cart to convert convertedCartData--------------------------------", convertedCartData)
      // =================================================
      // CREATE KOT BATCH
      // =================================================

      const kotBatch = {

        id:
          kotBatchId,

        kotNumber:
          kotNumber,

        sessionId:
          cartData[0]?.sessionId ?? '',

        tableNo:
          currentTableId,

        tableName:
          currentTableName,

        orderType:
          activeOrder.orderType,

        businessDate,

        deviceId:
          'POS',

        deviceName:
          'Electron POS',

        appVersion:
          '1.0',

        createdAt:
          now,

        sentBy:
          null,

        syncStatus:
          'PENDING',

        lastSyncedAt:
          null,

      };


      // =================================================
      // CREATE KOT ITEMS
      // =================================================



      const kotItems = convertedCartData.map((item, index) => ({
        id: crypto.randomUUID(),
        kotNumber,
        kotBatchId,
        status: 'PENDING',
        ...item,
        kitchenPrintReq:
          cartData[index].kitchenPrintReq === true,
        kitchenPrinted: false,
      }));




      console.log('kotItems -------------------', kotItems)
      // =================================================
      // CREATE KOT
      // =================================================
      //
      // IMPORTANT:
      //
      // This now creates:
      //
      // 1. pos_kot_batch
      // 2. pos_kot_items
      // 3. pos_kot_history
      // 4. pos_kot_history_items
      //
      // in ONE SQLite transaction.
      //
      // Do NOT separately call:
      //
      // insertKotBatch()
      // insertKotItems()
      //
      // =================================================

      const kotResult =
        await window.posApi.createKot(
          kotBatch,
          kotItems
        );


      if (!kotResult?.success) {

        throw new Error(
          kotResult?.error ||
          'Failed to create KOT'
        );
      }


      // =================================================
      // CREATE BILL ITEMS
      // =================================================
      //
      // These remain OPEN until the actual bill is created.
      //
      // KOT ≠ BILL
      // =================================================

      const billItems =
        convertedCartData.map((item) => ({
          id:
            crypto.randomUUID(),
          billItemGroupKey: [
            item.productId,
            item.basePrice,
            item.taxRate,
            item.taxType,
            item.note,
            item.modifiersJson,
          ].join('|'),

          status:
            'OPEN',

          billed:
            false,

          billNo:
            '',

          billId:
            '',
          ...item,

        }));


      // =================================================
      // PRINT KOT
      // =================================================

      // =================================================
      // PRINT KOT — ONLY ITEMS ENABLED FOR KITCHEN PRINT
      // =================================================

      const kitchenItems = convertedCartData
        .filter((item) => item.kitchenPrintReq === true)
        .map((item) => ({
          name: item.name,
          quantity: item.quantity,
          note: item.note || '',
          createdByName: item.createdByName || '',
        }));


      console.log("kitchenItems to print----", kitchenItems)

      if (kitchenItems.length > 0) {
        try {
          const printResult = await window.posApi.print({
            role: 'KITCHEN',
            source: 'POS',
            data: {
              kotNumber,
              tableNo: currentTableId,
              tableName: currentTableName,
              orderType: activeOrder.orderType,
              createdAt: now,

              createdByName:
                cartData.find((item) => item.createdByName)?.createdByName ||
                currentUser?.fullName || '',

              items: kitchenItems,
            },
          });

          console.log(
            '[POS KITCHEN PRINT] Print result:',
            printResult,
          );
        } catch (printError) {
          console.error(
            '[POS KITCHEN PRINT] Failed:',
            printError,
          );

          throw printError;
        }
      } else {
        // console.log(
        //   '[POS KITCHEN PRINT] Skipped: no items have kitchenPrintReq === true.',
        // );
      }

      //console.log('=============================================');


      // =================================================
      // SAVE BILL ITEMS
      // =================================================
      // console.log(
      //   'BILL ITEMS BEFORE SQLITE SAVE:',
      //   billItems.map((item) => ({
      //     productId: item.productId,
      //     name: item.name,
      //     discountEligible: item.discountEligible,
      //     type: typeof item.discountEligible,
      //   }))
      // );

      await window.posApi.insertBillItems(
        billItems
      );


      // =================================================
      // CLEAR CART
      // =================================================

      await window.posApi.clearCart(
        currentTableId
      );


      // =================================================
      // CLEAR LOCAL CART STATE
      // =================================================

      setCartData([]);


      // =================================================
      // RELOAD TABLE CART
      // =================================================

      await reloadCart(
        currentTableId
      );


      // =================================================
      // OPEN BILL PANEL
      // =================================================

      setRightSidebarView(
        'bill'
      );


    } catch (e) {

      console.error(
        'KOT/BILL SAVE FAILED',
        e
      );


      const message =
        e instanceof Error
          ? e.message
          : String(e);


      showToast(
        `Failed to send items to kitchen.\n\n${message}`
      );

    }

  }



  function startEditingNote(
    item: cartProductType
  ) {
    setEditingNoteId(item.id);
    setNoteText(item.note ?? '');
  }

  function cancelEditingNote() {
    setEditingNoteId(null);
    setNoteText('');
  }

  async function saveItemNote(
    item: cartProductType
  ) {
    try {
      const tableNo =
        currentOrderNo || 'T1';

      await window.posApi.updateCartItemNote(
        item.id,
        noteText.trim(),
        tableNo
      );

      // Reload SQLite → React state
      await reloadCart(tableNo);

      setEditingNoteId(null);
      setNoteText('');

    } catch (error) {
      console.error(
        'FAILED TO UPDATE CART NOTE',
        error
      );

      showToast(
        'Failed to save item note.'
      );
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
    <aside
     className={`
  relative
  flex
  h-[93%]
  min-h-0
  w-full
  flex-col
  overflow-hidden
  ${background.className}
  ${background.text}
`}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className={`
          flex
          justify-between
          shrink-0
          border-b
          ${background.border}
         
          px-4
          py-3
        
        `}
      >

        <div className="flex items-center gap-2">

          {activeOrder && (
            <span
              className="
        rounded
        bg-zinc-300
        dark:bg-zinc-500
        px-1.5
        py-0.5
        text-[9px]
        uppercase
        opacity-70
      "
            >
              {activeOrder.orderType.replace(
                '_',
                ' '
              )}
            </span>
          )}

          <p className="mt-1 text-xs font-medium">

            {currentOrderName ??
              'No order selected'}

          </p>



        </div>


        <div className="flex items-center justify-between">

          <span className="text-sm">

            {cartData.length} items

          </span>

        </div>

      </div>


      {/* =================================================
          CONTENT
      ================================================= */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          app-scrollbar
        "
      >

        {cartData.length === 0 ? (

          <div
            className="
              flex
              h-full
              items-center
              justify-center
            "
          >
<div className='flex flex-col items-left'>
        <p className=" gap-3 text-2xl md:text-4xl font-extrabold tracking-wide text-gray-700 dark:text-gray-200 text-center">
  Your Cart Awaits
</p>
<p className="text-sm md:text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
  Add something delicious to get started!
</p>
</div>
          </div>

        ) : (



          <div
            className="
                h-full
                overflow-y-auto
                app-scrollbar
              "
          >

            <div
              className={`
    divide-y
    ${background.divide}
  `}
            >
              {cartData.map((item) => (

                <div
                  key={`${item.productId}-${item.id}`}
                  className={`
                      px-2
                      py-2
                      border-b
                      ${background.border}
                    `}
                >

                  <div
                    className="
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                  >

                    {/* KITCHEN PRINT TOGGLE */}


                    <button
                      type="button"
                      title={
                        item.kitchenPrintReq === false
                          ? "Kitchen printing disabled"
                          : "Kitchen printing enabled"
                      }
                      aria-label={
                        item.kitchenPrintReq === false
                          ? `Enable kitchen printing for ${item.name}`
                          : `Disable kitchen printing for ${item.name}`
                      }
                      onClick={async () => {
                        const nextKitchenPrint =
                          item.kitchenPrintReq === false;

                        const partition = item.tableId;

                        if (!partition) {
                          throw new Error("Table ID is missing");
                        }

                        const result = await window.posApi.updateKitchenPrint({
                          itemId: item.id,
                          kitchenPrintReq: nextKitchenPrint,
                          partition,
                        });

                        if (result?.success) {
                          setCartData(
                            result.data.map((cartItem: CartItem) => ({
                              ...cartItem,
                              kitchenPrintReq:
                                cartItem.kitchenPrintReq == null
                                  ? true
                                  : Boolean(cartItem.kitchenPrintReq),
                            }))
                          );
                        } else {
                          console.error(
                            "Failed to update kitchen printing:",
                            result?.error
                          );
                        }


                      }}
                      className={`
    flex h-6 w-6 shrink-0
    items-center justify-center
    text-orange-500 transition-opacity
    ${item.kitchenPrintReq === false
                          ? "opacity-25"
                          : "opacity-100"
                        }
  `}
                    >
                      <CookingPot size={15} />
                    </button>


                    {/* =================================================
                          NAME + NOTE
                      ================================================= */}

                    <div
                      className="
    min-w-0
    flex-1
  "
                    >

                      {/* PRODUCT NAME */}

                      <p
                        className="
      truncate
      text-[10px]
      font-medium
  "
                      >
                        {item.name}
                      </p>


                      {/* NOTE */}

                      {editingNoteId === item.id ? (

                        <div
                          className="
        mt-1
        flex
        flex-col
        gap-1
      "
                        >

                          <input
                            type="text"
                            autoFocus
                            value={noteText}
                            onChange={(e) =>
                              setNoteText(e.target.value)
                            }
                            onKeyDown={(e) => {

                              if (e.key === 'Enter') {
                                saveItemNote(item);
                              }

                              if (e.key === 'Escape') {
                                cancelEditingNote();
                              }

                            }}
                            placeholder="Customer note..."
                            className={`
          w-full
          rounded
          border
          ${background.border}
          bg-transparent
          px-2
          py-1
          text-[10px]
          outline-none
        `}
                          />

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
                                saveItemNote(item)
                              }
                              className="
            text-[9px]
            font-semibold
            opacity-80
            hover:opacity-100
          "
                            >
                              SAVE
                            </button>

                            <button
                              type="button"
                              onClick={
                                cancelEditingNote
                              }
                              className="
            text-[9px]
            opacity-50
            hover:opacity-100
          "
                            >
                              CANCEL
                            </button>

                          </div>

                        </div>

                      ) : (

                        <button
                          type="button"
                          onClick={() =>
                            startEditingNote(item)
                          }
                          className="
        mt-0.5
        block
        max-w-full
        text-left
      "
                        >

                          {item.note ? (

                            <span
                              className="
            block
            truncate
            text-[9px]
            opacity-60
          "
                            >
                              📝 {item.note}
                            </span>

                          ) : (

                            <span
                              className="
            text-[9px]
            opacity-40
            hover:opacity-80
          "
                            >
                              + Add note
                            </span>

                          )}

                        </button>

                      )}

                    </div>


                    {/* =================================================
                          UNIT PRICE
                      ================================================= */}

                    <p
                      className="
                          shrink-0
                          whitespace-nowrap
                          text-[9px]
                          opacity-70
                        "
                    >

                      ₹
                      {Number(
                        item.finalPrice ?? 0
                      ).toFixed(2)}

                    </p>


                    {/* =================================================
                          AMOUNT + QTY
                      ================================================= */}

                    <div
                      className="
                          flex
                          shrink-0
                          items-center
                          gap-2
                        "
                    >

                      <p
                        className="
                            whitespace-nowrap
                            text-sm
                            font-semibold
                          "
                      >

                        ₹
                        {(
                          Number(
                            item.finalPrice ?? 0
                          ) *
                          Number(
                            item.quantity ?? 0
                          )
                        ).toFixed(2)}

                      </p>


                      {/* =================================================
                            QUANTITY CONTROL
                        ================================================= */}

                      <div
                        className={`
                            flex
                            w-fit
                            items-center
                            overflow-hidden
                            border
                            ${background.border}
                          `}
                      >

                        <button
                          type="button"
                          onClick={() =>
                            decCartProduct(item)
                          }
                          className="
                              flex
                              h-5
                              w-5
                              items-center
                              justify-center
                              opacity-70
                              transition
                              hover:opacity-100
                            "
                        >
                          −
                        </button>


                        <span
                          className="
                              w-6
                              text-center
                              text-[10px]
                              font-medium
                            "
                        >
                          {item.quantity}
                        </span>


                        <button
                          type="button"
                          onClick={() =>
                            addProductToCart({
                              ...item,
                              quantity: 1,
                            })
                          }
                          className="
                              flex
                              h-5
                              w-5
                              items-center
                              justify-center
                              opacity-70
                              transition
                              hover:opacity-100
                            "
                        >
                          +
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>



        )}

      </div>



{/* =================================================
    BOTTOM AREA — SEND + TOTAL
================================================= */}

<div className="mt-auto shrink-0">

  {/* ACTION BAR */}
  <div
    className={`
      shrink-0
      border-t
      ${background.border}
      px-2
      py-2
      shadow-sm
    `}
  >
    <div className="grid grid-cols-3 gap-2">
      <button
        type="button"
        onClick={sendToKitchenHandle}
        disabled={cartData.length === 0}
        style={{
          backgroundColor:
            cartData.length === 0
              ? '#e3a246'
              : '#87b52d',
              // : theme.primary,
          color:
            cartData.length === 0
              ? '#4d4b4a'
              : '#262644',
        }}
        className="
          h-8
          rounded-lg
          text-xs
          font-semibold
          transition-all
          hover:opacity-90
          active:opacity-80
          disabled:cursor-not-allowed
        "
      >
        SEND
      </button>
    </div>
  </div>

  {/* TOTAL FOOTER */}
  <div
    className={`
      shrink-0
      border-t
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
        text-base
        font-semibold
      "
    >
      <span>Total</span>

      <span>
        ₹{productTotalCost.toFixed(2)}
      </span>
    </div>
  </div>

</div>


    </aside>
        {toastComponent}
  </>
  );
}