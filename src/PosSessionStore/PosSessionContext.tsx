"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

// =====================================================
// ORDER TYPES
// =====================================================

export type PosOrderType =
  | "DINE_IN"
  | "TAKEAWAY"
  | "DELIVERY";

// =====================================================
// ACTIVE TABLE
// =====================================================

export type ActiveTable = {
  tableId: string;
  tableName: string;
  status?: string;
};

// =====================================================
// ACTIVE ORDER
// =====================================================

export type ActiveOrder = {
  orderType: PosOrderType;
  orderNo: string;
  tableId: string | null;
  tableName: string | null;
};

// =====================================================
// BILL DRAFT
// =====================================================

export type BillDraft = {
  customerName: string;
  customerPhone: string;
  discount: number;
  discountPercent: number;
  deliveryFee: number;
  paymentMode:
    | "CASH"
    | "CARD"
    | "UPI"
    | "WALLET"
    | "CREDIT";
  paidAmount: number;
};

// =====================================================
// CONTEXT TYPE
// =====================================================

type PosSessionContextType = {
  activeTable: ActiveTable | null;

  setActiveTable: (
    table: ActiveTable | null
  ) => void;

  activeOrder: ActiveOrder | null;

  setActiveOrder: (
    order: ActiveOrder | null
  ) => void;

  billDraft: BillDraft;

  setBillDraft: (
    draft: BillDraft
  ) => void;

  resetBillDraft: () => void;
};

// =====================================================
// INITIAL BILL
// =====================================================

const initialBillDraft: BillDraft = {
  customerName: "Customer",
  customerPhone: "",
  discount: 0,
  discountPercent: 0,
  deliveryFee: 0,
  paymentMode: "CASH",
  paidAmount: 0,
};

// =====================================================
// CONTEXT
// =====================================================

const PosSessionContext =
  createContext<
    PosSessionContextType | undefined
  >(undefined);

// =====================================================
// PROVIDER
// =====================================================

export function PosSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTable, setActiveTable] =
    useState<ActiveTable | null>(null);

  const [activeOrder, setActiveOrder] =
    useState<ActiveOrder | null>(null);

  const [billDraft, setBillDraft] =
    useState<BillDraft>(
      initialBillDraft
    );

  function resetBillDraft() {
    setBillDraft(initialBillDraft);
  }

  return (
    <PosSessionContext.Provider
      value={{
        activeTable,
        setActiveTable,

        activeOrder,
        setActiveOrder,

        billDraft,
        setBillDraft,
        resetBillDraft,
      }}
    >
      {children}
    </PosSessionContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================

export function usePosSession() {
  const ctx = useContext(
    PosSessionContext
  );

  if (!ctx) {
    throw new Error(
      "usePosSession must be used within PosSessionProvider"
    );
  }

  return ctx;
}