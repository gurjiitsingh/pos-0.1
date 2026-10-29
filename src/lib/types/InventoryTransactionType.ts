
import { z } from "zod";
import { Timestamp, FieldValue, } from "firebase/firestore";
import {
  InventoryUnit,
} from "./InventoryItemType";

export type  InventoryTransactionNameType =
 | "SALE"
   | "PURCHASE"
  | "OPENING"
  | "ADJUSTMENT"
  | "WASTAGE"
  | "SUPPLIER_RETURN"
  | "CUSTOMER_RETURN"
  | "RETURN" 
  | "OPENING_STOCK"
  | "CONSUMPTION"
  | "CLEAR"

export type Inventorytype = {
  id: string;

  inventoryItemId: string;
  supplierId?: string;

  inventoryItemName: string;

  type: InventoryTransactionNameType;

  direction:
    | "IN"
    | "OUT";

  quantity: number;

  beforeStock: number;
  afterStock: number;

  unit: InventoryUnit;

  unitCost?: number;
  totalCost?: number;

  referenceType:
    | "ORDER"
    | "PURCHASE"
    | "MANUAL";

  referenceId?: string;

  productId?: string;
  productName?: string;

  note?: string;

  orderId?: string;
  purchaseId?: string;

  source?:
    | "POS"
    | "ADMIN"
    | "SYSTEM"
    | null;

  createdBy?: string;

  createdAt:
    | Timestamp
    | FieldValue;
};


// export type Inventorytype = {
//   id: string;

//   inventoryItemId: string;

//   inventoryItemName: string;

//   type:
//     | "purchase"
//     | "sale"
//     | "adjustment"
//     | "wastage"
//     | "return";

//   quantity: number;

//   previousStock: number;

//   newStock: number;

//   note?: string;

//   createdBy?: string;

//   createdAt: number;
// };

export const newInventoryTransactionSchema =
  z.object({
    inventoryItemId: z
      .string()
      .min(
        1,
        "Inventory item is required"
      ),

    type: z.enum([
      "purchase",
      "sale",
      "adjustment",
      "wastage",
      "return",
    ]),

    quantity: z.coerce
      .number()
      .min(
        0.01,
        "Quantity must be greater than 0"
      ),

    note: z
      .string()
      .max(500)
      .optional(),
  });

export type TnewInventoryTransactionSchema =
  z.infer<
    typeof newInventoryTransactionSchema
  >;


