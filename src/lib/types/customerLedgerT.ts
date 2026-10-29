import { Timestamp, FieldValue } from "firebase/firestore";

export type customerLedgerT = {

  // =====================================================
  // OWNERSHIP
  // =====================================================
  ownerId: string;
  outletId: string;

  // =====================================================
  // CORE IDENTIFIERS
  // =====================================================
  id: string;
  customerId: string;

  // =====================================================
  // REFERENCES
  // =====================================================
  orderId?: string | null;
  paymentId?: string | null;

  // =====================================================
  // TRANSACTION TYPE
  // =====================================================
  type:
    | "ORDER"
    | "PAYMENT"
    | "REFUND"
    | "ADJUSTMENT";

  // =====================================================
  // AMOUNTS
  // =====================================================
  debitAmount: number;     // increases due
  creditAmount: number;    // reduces due

  balanceAfter: number;    // running balance after entry

  // =====================================================
  // META
  // =====================================================
  note?: string;

  source?: "POS" | "WEB" | "APP";
  staffId?: string | null;

  // =====================================================
  // TIMESTAMPS
  // =====================================================
  createdAt: Timestamp | FieldValue;

  // =====================================================
  // SYNC CONTROL
  // =====================================================
  syncStatus?: "NEW" | "SYNCED" | "FAILED";
  lastSyncedAt?: Timestamp | FieldValue;
};
