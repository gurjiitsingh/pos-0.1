import { Timestamp, FieldValue, } from "firebase/firestore";
export type Stocktype = {
  id: string;

  inventoryItemId: string;
  inventoryItemName: string;

  type:
    | "OPENING"
    | "PURCHASE"
    | "SALE"
    | "WASTAGE"
    | "ADJUSTMENT"
    | "RETURN";

  quantity: number;

  beforeStock: number;
  afterStock: number;

  unit: string;

  referenceType?:
    | "ORDER"
    | "PURCHASE"
    | "MANUAL";

  referenceId?: string;

  note?: string;

  createdAt: Timestamp | FieldValue;
};