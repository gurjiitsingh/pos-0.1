import {
  Timestamp,
  FieldValue,
} from "firebase/firestore";

import z from "zod";

export type InventoryItemSupplier = {
  id: string;

  inventoryItemId: string;

  supplierId: string;

  preferred: boolean;

  isActive: boolean;

  createdAt:
    | Timestamp
    | FieldValue;

  updatedAt?:
    | Timestamp
    | FieldValue;
};

export const inventoryItemSupplierSchema =
  z.object({
    inventoryItemId:
      z.string().min(
        1,
        "Inventory item is required"
      ),

    supplierId:
      z.string().min(
        1,
        "Supplier is required"
      ),

    preferred:
      z.boolean(),

    isActive:
      z.boolean(),
  });

export type TInventoryItemSupplierSchema =
  z.infer<
    typeof inventoryItemSupplierSchema
  >;