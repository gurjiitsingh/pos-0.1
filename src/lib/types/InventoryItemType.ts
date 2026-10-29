import { z } from "zod";

import {
  Timestamp,
  FieldValue,
} from "firebase/firestore";



export const inventoryUnits = [
  "pcs",
  "kg",
  "gm",
  "ltr",
  "ml",
  "dozen",
  "pair",
  "box",
  "pack",
  "carton",
  "bag",
  "bottle",
  "can",
  "jar",
  "roll",
  "tray",
] as const;



export type InventoryUnit = string;

/* -------------------------------- */
/* UNIT PAIRS */
/* -------------------------------- */

export const UNIT_PAIRS: Record<
  InventoryUnit,
  {
    unit: InventoryUnit;
    factor: number;
  }[]
> = {
  kg: [
    { unit: "kg", factor: 1 },
    { unit: "gm", factor: 1000 },
  ],

  gm: [
    { unit: "gm", factor: 1 },
  ],

  ltr: [
    { unit: "ltr", factor: 1 },
    { unit: "ml", factor: 1000 },
  ],

  ml: [
    { unit: "ml", factor: 1 },
  ],

  dozen: [
    { unit: "dozen", factor: 1 },
    { unit: "pcs", factor: 12 },
    { unit: "bottle", factor: 12 },
    { unit: "can", factor: 12 },
  ],

  pair: [
    { unit: "pair", factor: 1 },
    { unit: "pcs", factor: 2 },
  ],

  carton: [
    { unit: "carton", factor: 1 },
    { unit: "pcs", factor: 24 },
    { unit: "bottle", factor: 24 },
    { unit: "can", factor: 24 },
  ],

  box: [
    { unit: "box", factor: 1 },
    { unit: "pcs", factor: 10 },
  ],

  pack: [
    { unit: "pack", factor: 1 },
    { unit: "pcs", factor: 6 },
  ],

  bag: [
    { unit: "bag", factor: 1 },
    { unit: "gm", factor: 5000 },
  ],

  bottle: [
    { unit: "bottle", factor: 1 },
    { unit: "ml", factor: 1000 },
  ],

  can: [
    { unit: "can", factor: 1 },
    { unit: "ml", factor: 330 },
  ],

  jar: [
    { unit: "jar", factor: 1 },
    { unit: "gm", factor: 500 },
  ],

  tray: [
    { unit: "tray", factor: 1 },
    { unit: "pcs", factor: 30 },
  ],

  roll: [
    { unit: "roll", factor: 1 },
    { unit: "pcs", factor: 1 },
  ],

  pcs: [
    { unit: "pcs", factor: 1 },
  ],
};

/* -------------------------------- */
/* SCHEMA */
/* -------------------------------- */

export const purchaseMappingSchema = z.object({
  purchaseUnit: z.string(),
  consumptionUnit: z.string(),
  factor: z.coerce.number().positive(),
});

export const newInventorySchema =
  z
    .object({
      name: z
        .string()
        .min(
          2,
          "Inventory item name is required"
        )
        .max(120),

      sku: z.string().optional(),

      barcode:
        z.string().optional(),

      supplierId:
        z.string().optional(),

      // purchaseUnit:
      //   z.enum(inventoryUnits),

      // consumptionUnit:
      //   z.enum(inventoryUnits),

      // purchaseUnit: z
      //   .string()
      //   .trim()
      //   .min(1, "Purchase unit required"),

      consumptionUnit: z
        .string()
        .trim()
        .min(1, "Consumption unit required"),

      // conversionFactor:
      //   z.coerce
      //     .number()
      //     .min(
      //       1,
      //       "Conversion factor must be at least 1"
      //     ),


      minStock:
        z.coerce
          .number()
          .min(
            0,
            "Minimum stock cannot be negative"
          ),

    purchaseMappings: z
    .array(purchaseMappingSchema)
    .min(1, "Select at least one purchase unit"),
   

      currentStock: z.coerce
        .number()
        .min(
          0,
          "Stock cannot be negative"
        )
        .optional(),

      costPrice: z.coerce
        .number()
        .min(
          0,
          "Cost price cannot be negative"
        )
        .optional(),

      sellingPrice: z.coerce
        .number()
        .min(
          0,
          "Selling price cannot be negative"
        )
        .optional(),
    
      categoryId:
        z.string().optional(),

       supplierIds: z
  .array(z.string())
  .min(1, "Please select at least one supplier"),

      isActive:
        z.boolean().default(
          true
        ),
    })

    export type PurchaseMapping = {
  purchaseUnit: InventoryUnit;
  consumptionUnit: InventoryUnit;
  factor: number;
};

export type TnewInventorySchema =
  z.infer<
    typeof newInventorySchema
  >;

export type InventoryItemType = {
  id: string;

  name: string;
  nameLower?: string;

  categoryName?: string;
  supplierName?: string;

  sku?: string;
  barcode?: string;

  // Default consumption unit
  consumptionUnit: InventoryUnit;
purchaseUnit:string;
conversionFactor: number;
  // All purchase units for this item
  purchaseMappings: PurchaseMapping[];

  currentStock?: number;
  minStock?: number;

  purchaseUnitCost?: number;
  averageCost?: number;
  stockValue?: number;

  categoryId?: string;

  supplierId?: string;
  supplierIds?: string[];

  isActive: boolean;

  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
};



