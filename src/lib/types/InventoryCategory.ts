import { Timestamp, FieldValue, } from "firebase/firestore";
import z from "zod";

export type InventoryCategory = {
  id: string;

  name: string;
  description?: string;

  sortOrder: number;

  trackInventory: boolean;
  allowNegativeStock: boolean;

  color?: string;
  icon?: string;

  isActive: boolean;

  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
};


export  const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name is required")
    .max(100),

  description: z
    .string()
    .optional(),

  sortOrder: z.coerce
    .number()
    .min(0),

  trackInventory:
    z.boolean(),

  allowNegativeStock:
    z.boolean(),

  color: z
    .string()
    .optional(),

  icon: z
    .string()
    .optional(),

  isActive:
    z.boolean(),
});

export type TCategorySchema =
  z.infer<
    typeof categorySchema
  >;
