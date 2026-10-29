"use client";

import { useState } from "react";
 
import { useToast } from '@/hooks/useToast';

 

export type BillItemData = {
  id: string;
  name: string;
  note?: string;
  quantity: number;
  basePrice: number;
  tableNo: string;
  modifierTotal?: number;
};

type BillItemProps = {
  item: BillItemData;
  processing: boolean;

  onDecrease: (
    item: BillItemData,
    newQuantity: number,
    reason: string,
    cancelKitchen: boolean
  ) => void | Promise<void>;

  onIncrease: (
    item: BillItemData
  ) => void | Promise<void>;

  onDelete?: (
    item: BillItemData,
    reason: string,
    cancelKitchen: boolean
  ) => void | Promise<void>;

  onUpdateQuantity?: (
    item: BillItemData,
    newQuantity: number
  ) => void | Promise<void>;

  onMigrateSuccess?: (
    item: BillItemData,
    newTableNo: string,
    newTableName: string
  ) => void | Promise<void>;
};

export default function BillItem({
  item,
  processing,
  onDecrease,
  onIncrease,
  onDelete,
  onUpdateQuantity,
  onMigrateSuccess,
}: BillItemProps) {
  const [editOpen, setEditOpen] = useState(false);

  const unitPrice =
    item.basePrice + (item.modifierTotal || 0);

  const totalPrice =
    unitPrice * item.quantity;

  const [reason, setReason] = useState("");
  const [cancelKitchen, setCancelKitchen] = useState(false);

  const [migrateOpen, setMigrateOpen] = useState(false);
  const [targetTableNo, setTargetTableNo] = useState("");
  const [tables, setTables] = useState<any[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [selectedTableNo, setSelectedTableNo] = useState("");
  const [moveQuantity, setMoveQuantity] = useState(1);
const { showToast, toastComponent } = useToast();
  const handleDelete = async () => {
    const finalReason = reason.trim();

    // =============================================
    // REASON REQUIRED
    // =============================================

 if (!finalReason) {
  showToast('Please enter a reason for deleting this item.');
  return;
}

    console.log("========================================");
    console.log("DELETE ITEM");
    console.log("========================================");

    console.log("ITEM:", item);

    console.log("QUANTITY:", item.quantity);

    console.log("REASON:", finalReason);

    console.log(
      "CANCEL KITCHEN:",
      cancelKitchen
    );

    console.log("========================================");

    if (onDelete) {
      await onDelete(
        item,
        finalReason,
        cancelKitchen
      );
    }

    // Close popup after successful callback
    setEditOpen(false);

    // Clear popup values
    setReason("");

    setCancelKitchen(false);
  };

  const handleDecrease = async () => {
    const finalReason = reason.trim();

    if (!finalReason) {
      showToast("Please enter a reason for decreasing the quantity.");
      return;
    }

    const currentQuantity = Number(item.quantity || 0);

    if (currentQuantity <= 1) {
      return;
    }

    const newQuantity = currentQuantity - 1;

    console.log("========================================");
    console.log("DECREASE BILL ITEM");
    console.log("ITEM:", item);
    console.log("CURRENT QUANTITY:", currentQuantity);
    console.log("NEW QUANTITY:", newQuantity);
    console.log("REASON:", finalReason);
    console.log("CANCEL KITCHEN:", cancelKitchen);
    console.log("========================================");

    if (onDecrease) {
      await onDecrease(
        item,
        newQuantity,
        finalReason,
        cancelKitchen
      );
    }

    setEditOpen(false);
    setReason("");
    setCancelKitchen(false);
  };

  const handleIncrease = () => {
    // TODO:
    // Open increase quantity + reason popup.
    onIncrease(item);
  };

  // const handleMigrate = async () => {
  //   setSelectedTableNo("");

  //   await loadTables();

  //   setMigrateOpen(true);
  // };
  const handleMigrate = async () => {
     setEditOpen(false); 
    setSelectedTableNo("");
    setMoveQuantity(1);

    await loadTables();

    setMigrateOpen(true);
  };


  async function loadTables() {
    try {
      setLoadingTables(true);

      const rows = await window.posApi.getTables();

      // console.log(
      //   "========== GET TABLES RESULT =========="
      // );

     // console.log("ROWS:", rows);

      if (Array.isArray(rows)) {
        rows.forEach((table, index) => {
          // console.log(
          //   `TABLE [${index}]`,
          //   table
          // );
        });

        setTables(rows);
      } else {
        setTables([]);
      }

    } catch (e) {
      console.error(
        "Failed to load tables",
        e
      );

      setTables([]);

    } finally {
      setLoadingTables(false);
    }
  }

  const handleConfirmMigrate = async () => {
    if (!selectedTableNo) {
       
       showToast("Please select a target table.");
      return;
    }

    if (
      selectedTableNo === String(
        (item as any)?.tableNo || ""
      )
    ) {
    
        showToast("Item is already on this table.");
      return;
    }

    const targetTable = tables.find(
      (table) =>
        String(table.id) ===
        String(selectedTableNo)
    );

 if (!targetTable) {
  showToast('Target table not found.');
  return;
}

    try {
      setMigrating(true);

      console.log(
        "========================================"
      );
      console.log(
        "MIGRATE BILL ITEM"
      );
      console.log(
        "========================================"
      );

      console.log("ITEM:", item);

      console.log(
        "FROM TABLE:",
        (item as any)?.tableNo
      );

      console.log(
        "FROM TABLE NAME:",
        (item as any)?.tableName
      );

      console.log(
        "TO TABLE:",
        targetTable.id
      );

      console.log(
        "TO TABLE NAME:",
        targetTable.tableName
      );

      console.log(
        "========================================"
      );

      const result =
        await window.posApi.migrateBillItem({
          id: item.id,

          currentTableNo:
            (item as any)?.tableNo,

          currentBillItemGroupKey:
            (item as any)?.billItemGroupKey,

          targetTableNo:
            String(targetTable.id),

          targetTableName:
            targetTable.tableName || "",
        });

      console.log(
        "MIGRATE RESULT:",
        result
      );

      if (!result?.success) {
        throw new Error(
          result?.error ||
          "Failed to migrate item"
        );
      }

      setMigrateOpen(false);
      setSelectedTableNo("");

      if (onMigrateSuccess) {
        //  await onMigrateSuccess(item);

        await onMigrateSuccess(
          item,
          String(targetTable.id),
          targetTable.tableName || ""
        );
      }

    } catch (e) {
      console.error(
        "FAILED TO MIGRATE BILL ITEM:",
        e
      );

  showToast(
  e instanceof Error ? e.message : String(e)
);

    } finally {
      setMigrating(false);
    }
  };



  const handleMoveItem = async (
    newTableNo: string,
    quantityToMove: number
  ) => {
    if (!item?.id || !newTableNo) {
      showToast("Select a destination table.");
      return;
    }

    const currentQuantity = Number(item.quantity || 0);

    if (
      !Number.isInteger(quantityToMove) ||
      quantityToMove < 1 ||
      quantityToMove > currentQuantity
    ) {
      showToast("Please select a valid quantity.");
      return;
    }

    const currentTableNo = String(item.tableNo || "");

    if (newTableNo === currentTableNo) {
      showToast("Item is already on this table.");
      return;
    }

    const selectedTable = tables.find(
      (table) => String(table.id) === newTableNo
    );

    if (!selectedTable) {
      showToast("Destination table not found.");
      return;
    }

    const newTableName = selectedTable.tableName || newTableNo;

    try {
      setMigrating(true);

      const result = await window.posApi.moveBillItemToTable({
        itemId: item.id,
        tableNo: newTableNo,
        tableName: newTableName,
        quantity: quantityToMove,
      });

      if (!result?.success) {
        throw new Error(result?.error || "Failed to move item");
      }

      setMigrateOpen(false);
      setEditOpen(false);
      setSelectedTableNo("");
      setMoveQuantity(1);

      await onMigrateSuccess?.(
        item,
        newTableNo,
        newTableName
      );

      showToast(
        `Moved ${quantityToMove} ${quantityToMove === 1 ? "item" : "items"
        } to ${newTableName}.`
      );
    } catch (error) {
      console.error("Failed to move bill item:", error);

      showToast(
        error instanceof Error
          ? error.message
          : String(error)
      );
    } finally {
      setMigrating(false);
    }
  };

  return (
    <>
      {/* ================================================= */}
      {/* ITEM ROW */}
      {/* ================================================= */}

      <div
        className="
          px-3
          py-2
        "
      >
        <div className="flex items-center">

          {/* ============================================= */}
          {/* ITEM NAME */}
          {/* ============================================= */}

          <div className="min-w-0 flex-1">

            <p
              className="
                truncate
                text-[11px]
                font-medium
                leading-tight
                opacity-80
              "
            >
              {item.name}
            </p>

            {item.note ? (
              <p
                className="
                  mt-0.5
                  truncate
                  text-[10px]
                  leading-tight
                  opacity-40
                "
              >
                {item.note}
              </p>
            ) : null}

          </div>

          {/* ============================================= */}
          {/* QTY CONTROLS */}
          {/* ============================================= */}

          <div
            className="
              ml-2
              flex
              shrink-0
              items-center
              gap-0.5
            "
          >

            {/* DECREASE */}



            {/* QUANTITY */}

            <div
              className="
                flex
                min-w-[22px]
                justify-center
                text-[11px]
                font-medium
              "
            >
              {item.quantity}
            </div>

            {/* INCREASE */}



          </div>

          {/* ============================================= */}
          {/* EDIT / PENCIL */}
          {/* ============================================= */}

          <button
            type="button"
            disabled={processing}
            onClick={() => setEditOpen(true)}
            className="
              ml-2
              flex
              h-6
              w-6
              shrink-0
              items-center
              justify-center
              rounded
              text-[12px]
              opacity-50
              transition
              hover:bg-black/5
              hover:opacity-100
              active:scale-95
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
            title="Edit item"
          >
            ✎
          </button>

          {/* ============================================= */}
          {/* PRICE / TOTAL */}
          {/* ============================================= */}

          <div
            className="
              ml-2
              min-w-[70px]
              shrink-0
              text-right
            "
          >

            {/* TOTAL */}

            <p
              className="
                text-[12px]
                font-semibold
                leading-tight
                tabular-nums
                opacity-80
              "
            >
              ₹{totalPrice.toFixed(2)}
            </p>

            {/* UNIT PRICE */}

            <p
              className="
                mt-0.5
                text-[9px]
                leading-tight
                tabular-nums
                opacity-60
              "
            >
              ₹{unitPrice.toFixed(2)}
              {" / item"}
            </p>

          </div>

        </div>
      </div>

      {/* ================================================= */}
      {/* EDIT ITEM POPUP */}
      {/* ================================================= */}

      {editOpen ? (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            p-4
          "
          onClick={() => setEditOpen(false)}
        >
          <div
            className="
              w-full
              max-w-[360px]
              overflow-hidden
              rounded-xl
              border
              bg-background
              shadow-xl
            "
            onClick={(e) => e.stopPropagation()}
          >

            {/* =========================================== */}
            {/* HEADER */}
            {/* =========================================== */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                px-4
                py-3
              "
            >
              <div className="min-w-0">

                <p
                  className="
                    text-[13px]
                    font-semibold
                  "
                >
                  Edit Item
                </p>

                <p
                  className="
                    mt-0.5
                    truncate
                    text-[10px]
                    opacity-50
                  "
                >
                  {item.name}
                </p>

              </div>

              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded
                  text-[16px]
                  opacity-50
                  hover:opacity-100
                "
              >
                ×
              </button>

            </div>

            {/* =========================================== */}
            {/* FIRST ROW */}
            {/* DELETE / CANCEL KITCHEN / QTY */}
            {/* =========================================== */}

            <div className="mx-2 my-1">
              <label className="mb-1 block text-[10px] font-medium opacity-60">
                Reason
              </label>

              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason..."
                className="h-8 w-full rounded-md border bg-transparent px-2 text-[11px] outline-none focus:ring-1"
              />
            </div>

            <div
              className="
                flex
                items-center
                gap-2
                border-b
                px-3
                py-3
              "
            >

              {/* DELETE */}

              <button
                type="button"
                disabled={processing}
                onClick={handleDelete}
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-md
                  border
                  text-[14px]
                  opacity-70
                  transition
                  hover:opacity-100
                  active:scale-95
                  disabled:opacity-30
                "
                title="Delete item"
              >
                🗑
              </button>

              {/* CANCEL KITCHEN */}

              <label
                className="
                  flex
                  min-w-0
                  flex-1
                  cursor-pointer
                  items-center
                  gap-1.5
                "
              >
                <input
                  type="checkbox"
                  checked={cancelKitchen}
                  onChange={(e) =>
                    setCancelKitchen(e.target.checked)
                  }
                  className="
    h-4
    w-4
    cursor-pointer
  "
                />

                <span
                  className="
                    whitespace-nowrap
                    text-[10px]
                    opacity-60
                  "
                >
                  Cancel Kitchen
                </span>
              </label>

              {/* DECREASE */}

              <button
                type="button"
                disabled={
                  processing ||
                  item.quantity <= 1
                }
                onClick={handleDecrease}
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-md
                  border
                  text-[13px]
                  font-medium
                  opacity-70
                  transition
                  hover:opacity-100
                  active:scale-95
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                −
              </button>

              {/* QUANTITY */}

              <div
                className="
                  flex
                  min-w-[24px]
                  justify-center
                  text-[12px]
                  font-semibold
                  tabular-nums
                "
              >
                {item.quantity}
              </div>

              {/* INCREASE */}

              <button
                type="button"
                disabled={processing}
                onClick={handleIncrease}
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-md
                  border
                  text-[13px]
                  font-medium
                  opacity-70
                  transition
                  hover:opacity-100
                  active:scale-95
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                +
              </button>

            </div>


            {/* =========================================== */}
            {/* SECOND ROW */}
            {/* MIGRATE ITEM */}
            {/* =========================================== */}

            <button
              type="button"
              disabled={processing}
              onClick={handleMigrate}
              className="
                flex
                w-full
                items-center
                gap-3
                px-4
                py-3
                text-left
                transition
                hover:bg-black/5
                active:bg-black/10
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >

              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-md
                  border
                  text-[14px]
                "
              >
                ⇄
              </span>

              <span className="flex-1">

                <span
                  className="
                    block
                    text-[11px]
                    font-medium
                  "
                >
                  Migrate item to another table
                </span>

                <span
                  className="
                    mt-0.5
                    block
                    text-[9px]
                    opacity-40
                  "
                >
                  Move this item to another table
                </span>

              </span>

              <span
                className="
                  text-[16px]
                  opacity-40
                "
              >
                ›
              </span>

            </button>

          </div>
        </div>
      ) : null}


    
{migrateOpen && (
  <div
    className="
      fixed
      inset-0
      z-[70]
      flex
      items-center
      justify-center
      bg-black/70
      p-4
    "
    onClick={() => {
      if (!migrating) {
        setMigrateOpen(false);
        setSelectedTableNo("");
        setMoveQuantity(1);
      }
    }}
  >
    <div
      className="
        flex
        w-full
        max-w-6xl
        max-h-[90vh]
        flex-col
        overflow-hidden
        rounded-xl
        bg-slate-400
        shadow-2xl
      "
      onClick={(e) => e.stopPropagation()}
    >
      {/* TOP HEADER: ITEM + QUANTITY + CLOSE */}
      <div className="flex items-center gap-4 bg-white p-4 text-slate-900">
        {/* ITEM DETAILS */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {item.name}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Available: {item.quantity}
            {" · "}
            Remaining: {Number(item.quantity) - moveQuantity}
          </p>
        </div>

        {/* QUANTITY SELECTOR */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled={moveQuantity <= 1 || migrating}
            onClick={() =>
              setMoveQuantity((q) => Math.max(1, q - 1))
            }
            className="
              flex h-9 w-9 items-center justify-center
              rounded-lg border border-slate-300
              text-lg transition hover:bg-slate-100
              disabled:opacity-30
            "
          >
            −
          </button>

          <div className="min-w-12 text-center">
            <p className="text-xl font-bold tabular-nums">
              {moveQuantity}
            </p>
            <p className="text-[10px] text-slate-500">
              to move
            </p>
          </div>

          <button
            type="button"
            disabled={
              moveQuantity >= Number(item.quantity) || migrating
            }
            onClick={() =>
              setMoveQuantity((q) =>
                Math.min(Number(item.quantity), q + 1)
              )
            }
            className="
              flex h-9 w-9 items-center justify-center
              rounded-lg border border-slate-300
              text-lg transition hover:bg-slate-100
              disabled:opacity-30
            "
          >
            +
          </button>
        </div>

        {/* CONFIRM MIGRATION */}
        <button
          type="button"
          disabled={!selectedTableNo || migrating}
          onClick={() =>
            handleMoveItem(selectedTableNo, moveQuantity)
          }
          className="
            shrink-0 rounded-lg bg-violet-600
            px-4 py-2.5 text-xs font-semibold text-white
            transition hover:bg-violet-700
            disabled:cursor-not-allowed disabled:opacity-40
          "
        >
          {migrating ? "Moving..." : "Confirm"}
        </button>

        {/* CLOSE WITHOUT MIGRATING */}
        <button
          type="button"
          disabled={migrating}
          onClick={() => {
            setMigrateOpen(false);
            setSelectedTableNo("");
            setMoveQuantity(1);
          }}
          className="
            flex h-9 w-9 shrink-0 items-center
            justify-center rounded-lg
            text-2xl text-slate-500
            transition hover:bg-slate-100 hover:text-slate-900
            disabled:opacity-30
          "
          title="Close without migrating"
          aria-label="Close migration"
        >
          ×
        </button>
      </div>

      {/* EXISTING TABLE GRID */}
      <div className="overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-9">
          {tables.map((table) => {
            const tableNo = String(table.id);

            const isSelected =
              selectedTableNo === tableNo;

            const isCurrent =
              tableNo === String(item?.tableNo || "");

            const tableColor = isSelected
              ? "#9C27B0"
              : table.billCount > 0
                ? "#E57373"
                : table.kitchenCount > 0
                  ? "#81C784"
                  : table.cartCount > 0
                    ? "#64B5F6"
                    : "#F5F5F5";

            const textColor =
              isSelected ||
              table.billCount > 0 ||
              table.kitchenCount > 0 ||
              table.cartCount > 0
                ? "#FFFFFF"
                : "#333333";

            const statusText =
              table.billCount > 0
                ? "BILL"
                : table.kitchenCount > 0
                  ? "KITCHEN"
                  : table.cartCount > 0
                    ? `${table.cartCount} ITEMS`
                    : "AVAILABLE";

            return (
              <button
                key={table.id}
                type="button"
                disabled={isCurrent || migrating}
                onClick={() => setSelectedTableNo(tableNo)}
                className={`
                  relative h-[90px] w-full overflow-hidden
                  rounded-[10px] border
                  transition-all duration-150
                  ${
                    isCurrent
                      ? "cursor-not-allowed opacity-35"
                      : "cursor-pointer hover:scale-[1.01]"
                  }
                `}
                style={{
                  background: tableColor,
                  color: textColor,
                  borderColor: isSelected
                    ? "#9C27B0"
                    : "transparent",
                  boxShadow: isSelected
                    ? "0 0 0 2px rgba(156,39,176,0.2)"
                    : "0 2px 6px rgba(0,0,0,0.12)",
                }}
              >
                <div className="flex h-full flex-col items-center justify-center">
                  <span className="text-[17px] font-bold leading-tight">
                    {table.tableName || tableNo}
                  </span>

                  <span className="mt-1 text-[10px] font-medium opacity-90">
                    {statusText}
                  </span>
                </div>

                {isSelected && (
                  <span className="
                    absolute right-2 top-2 flex h-5 w-5
                    items-center justify-center rounded-full
                    bg-white/20 text-[12px] font-bold
                  ">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  </div>
)}
  {toastComponent}
  
    </>
  );
}