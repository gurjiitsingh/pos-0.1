import { Timestamp, FieldValue, } from "firebase/firestore";

export type InventoryItemSupplier = {
  id: string;

  inventoryItemId: string;
  supplierId: string;

  preferred: boolean;
  isActive: boolean;

  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
};