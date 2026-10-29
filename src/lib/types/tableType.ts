 
import { Timestamp } from "firebase/firestore";

export type tableDataT = {
  /** Unique ID of the table, e.g. "T1", "T5" */
  id: string;

  /** Human-readable table name or number */
  tableName: string;

  /** Current table status */
  status: "AVAILABLE" | "OCCUPIED" | "BILL_REQUESTED" | "CLEANING" | "RESERVED";

  /** Optional assigned waiter or staff member */
  waiterName?: string;
  waiterId?: string;

  /** Firestore ID of the active order linked to this table (if any) */
  activeOrderId?: string;

  /** Number of guests currently seated (if any) */
  guestsCount?: number;

  /** Table area (e.g. "Indoor", "Outdoor", "Rooftop", etc.) */
  area?: string;

  /** Sort order for display (lower number = higher priority) */
  sortOrder?: number;

  /** When table was last updated */
  updatedAt: Timestamp ;

  /** When table was created */
  createdAt: Timestamp  ;

  /** Optional notes (special requests, reservation name, etc.) */
  notes?: string;

  /** Whether the table is synced with POS device (for offline sync) */
  synced?: boolean;
};
