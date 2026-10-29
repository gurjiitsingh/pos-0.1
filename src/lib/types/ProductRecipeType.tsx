import { Timestamp, FieldValue, } from "firebase/firestore";
import { z } from "zod";

export type ProductRecipeType = {
  id: string;

  productId: string;

  productName: string;

  inventoryItemId: string;

  inventoryItemName: string;

  quantity: number;

   wastagePercent?: number; // optional future

  unit: string;

 createdAt?: Timestamp | FieldValue | string | null;

};


export const newProductRecipeSchema =
  z.object({
    productId: z
      .string()
      .min(1, "Product is required"),

    inventoryItemId: z
      .string()
      .min(
        1,
        "Inventory item is required"
      ),

    quantity: z.coerce
      .number()
      .min(
        0.001,
        "Quantity must be greater than 0"
      ),

    unit: z
      .string()
      .min(1, "Unit is required"),
  });

export type TnewProductRecipeSchema =
  z.infer<
    typeof newProductRecipeSchema
  >;