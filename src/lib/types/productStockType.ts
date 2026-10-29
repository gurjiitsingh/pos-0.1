import { z } from "zod";

export type ProductStock = {
  id: string; // SAME as productId

  // SNAPSHOT (avoid joins)
  name: string;
  categoryId?: string;
  categoryName?: string;

  // INVENTORY CORE
  productMode: "raw_stock" | "finished_stock" | "simple";

  currentStock: number;
  minStock: number;

  // TRACKING
  sku?: string;
  barcode?: string;


  sellingPrice: number;  // 👈 from product.price
  wholesalePrice?: number;    // optional
  costPrice: number;     // 👈 internal cost
  avgCost?: number;      // 👈 future calculation
  sellingUnit: string;

  // 🔁 CONTROL
  priceSyncEnabled: boolean; // 👈 VERY IMPORTANT

  trackInventory?: boolean;
  allowNegativeStock?: boolean;

  // META
  updatedAt: number;
};
export type ProductStockType = {
  id: string; // SAME as productId

  // SNAPSHOT (avoid joins)
  name: string;
  categoryId?: string;
  categoryName?: string;

  // INVENTORY CORE
  productMode: "raw_stock" | "finished_stock" | "simple";

  currentStock: number;
  minStock: number;

  // TRACKING
  sku?: string;
  barcode?: string;


  sellingPrice: number;
  wholesalePrice?: number;
  costPrice: number;
  avgCost?: number;
  sellingUnit: string;

  // 🔁 CONTROL
  priceSyncEnabled: boolean; // 👈 VERY IMPORTANT

  trackInventory?: boolean;
  allowNegativeStock?: boolean;

  // META
  updatedAt: number;
};

export type AddProductStockInput = {
  id: string;
  name: string;

  productMode: "raw_stock" | "finished_stock" | "simple";

  sellingPrice: number;
  costPrice: number;

  sellingUnit?: string;

  sku?: string;
  barcode?: string;

  categoryId?: string;
  categoryName?: string;
};