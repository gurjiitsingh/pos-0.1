import { Timestamp, FieldValue, } from "firebase/firestore";

export type LedgerEntry = {
  account: string; // "INVENTORY", "SUPPLIER_PAYABLE", "CASH", "UPI", "CARD", "SALES", "EXPENSE"

  type: "DEBIT" | "CREDIT";

  amount: number;

  supplierId?: string;

  referenceType: "PURCHASE" | "PAYMENT" | "SALE" | "ADJUSTMENT";
  referenceId?: string;

  note?: string;

  createdAt: Timestamp;
};