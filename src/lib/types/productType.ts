import { z } from "zod";

export type ProductType = {
  id: string;
  name: string;
  price: number;
  quantity: number | null;
  discountPrice: number | undefined;
  discountEligible?: boolean;
  categoryId: string;
  masterCategoryId?: string;
  masterCategoryName?: string;
  productCat: string | undefined;
  baseProductId: string;
  productDesc: string;
  sortOrder: number;
  image: string;
  isFeatured: boolean;

  flavors: boolean;
  publishStatus: 'published' | 'draft';
  stockStatus: 'in_stock' | 'out_of_stock';


  searchCode?: string | null;   // barcode / short code / SKU (nullable)
  // NEW FIELDS
  taxRate: number | undefined;
  taxType: 'inclusive' | 'exclusive' | undefined;

  parentId?: string;
  hasVariants?: boolean;
  hasModifier?: boolean;
  type?: 'parent' | 'variant';

  purchaseSession: string | null;


  // NEW STOCK MAINTAIN
  productMode?:
  | "raw_stock"
  | "finished_stock"
  | "simple";

  sku?: string;
  barcode?: string;
  currentStock?: number;
  minStock?: number;      // alert level

  // FOR SIMPLE PRODUCTS ONLY
  inventoryItemId?: string;
  trackInventory?: boolean;
  allowNegativeStock?: boolean;
  favorite?: boolean;
};






export const newProductSchema = z.object({
  id: z.string().optional(),
  parentId: z.string().optional(),
  hasVariants: z.boolean().optional(),
  type: z.enum(["parent", "variant"]).optional(),
  searchCode: z.string().max(50).optional(),
  // --------------------------
  // MANDATORY
  // --------------------------

  name: z.string().min(1, { message: "Product name is required" }),

  price: z
    .union([z.string(), z.number()])
    .refine((val) => {
      const num =
        typeof val === "string" ? parseFloat(val.replace(",", ".")) : val;
      return !isNaN(num) && num >= 0;
    }, { message: "Invalid product price" }),

  sortOrder: z
    .union([z.string(), z.number()])
    .refine((val) => {
      const num = typeof val === "string" ? parseInt(val) : val;
      return !isNaN(num);
    }, { message: "Invalid sort order" }),

  categoryId: z.string().min(1, { message: "Please select category" }),
masterCategoryId: z.string().optional(),
  // --------------------------
  // ✅ NEW STATUS FIELDS (CLEAN)
  // --------------------------

  publishStatus: z
    .enum(["published", "draft"])
    .default("published"),

  stockStatus: z
    .enum(["in_stock", "out_of_stock"])
    .optional()
    .nullable(), // ✅ allows null or undefined

  // --------------------------
  // OPTIONAL
  // --------------------------

  discountPrice: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === undefined || val === ""
        ? undefined
        : Number(val.toString().replace(",", "."))
    )
    .refine(
      (val) => val === undefined || (!isNaN(val) && val >= 0),
      { message: "Invalid discount price" }
    ),

  currentStock: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === undefined || val === "" ? undefined : Number(val)
    )
    .refine(
      (val) => val === undefined || !isNaN(val),
      { message: "Invalid stock quantity" }
    ),

  productDesc: z.string().optional(),
  isFeatured: z.boolean().optional(),
  image: z.any().optional(),
  baseProductId: z.string().optional(),
  flavors: z.boolean().optional(),

  // --------------------------
  // TAX
  // --------------------------

  taxRate: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === undefined || val === ""
        ? undefined
        : Number(val.toString().replace(",", "."))
    )
    .refine(
      (val) => val === undefined || (!isNaN(val) && val >= 0),
      { message: "Invalid tax rate" }
    ),

  taxType: z.enum(["inclusive", "exclusive"]).optional(),
});


export type TnewProductSchema = z.infer<typeof newProductSchema>;

export const editProductSchema = z.object({
  id: z.string().optional(),
  parentId: z.string().optional(),
  hasVariants: z.boolean().optional(),
  type: z.enum(["parent", "variant"]).optional(),
  masterCategoryId: z.string().optional(),
  searchCode: z.string().max(50).optional(),
  // --------------------------
  // REQUIRED
  // --------------------------

  name: z.string().min(1, { message: "Product name is required" }),

  price: z
    .string()
    .refine(
      (value) => /^\d*[.,]?\d*$/.test(value),
      "Invalid product price"
    ),

  sortOrder: z.string().min(1, { message: "Invalid sort order" }),

  // --------------------------
  // OPTIONAL PRICING
  // --------------------------

  discountPrice: z
    .string()
    .optional()
    .refine(
      (value) => !value || /^\d*[.,]?\d*$/.test(value),
      "Invalid discount price"
    ),

  currentStock: z
    .string()
    .optional()
    .refine(
      (value) => !value || /^\d*[.,]?\d*$/.test(value),
      "Invalid stock quantity"
    ),

  // --------------------------
  // CATEGORY
  // --------------------------

  categoryId: z.string().optional(),
  categoryIdOld: z.string().optional(),

  // --------------------------
  // CONTENT
  // --------------------------

  productDesc: z.string().optional(),
  isFeatured: z.boolean().optional(),

  image: z.any().optional(),
  oldImageUrl: z.string().optional(),

  // --------------------------
  // ✅ NEW STATUS FIELDS (CLEAN)
  // --------------------------

  publishStatus: z
    .enum(["published", "draft"])
    .default("published"),

  stockStatus: z
    .enum(["in_stock", "out_of_stock"])
    .optional()
    .nullable(), // ✅ can be null / undefined

  // --------------------------
  // TAX
  // --------------------------

  taxRate: z
    .string()
    .optional()
    .refine(
      (value) => !value || /^\d*[.,]?\d*$/.test(value),
      "Invalid tax rate"
    ),

  taxType: z
    .enum(["inclusive", "exclusive"])
    .optional(),
});

export type TeditProductSchema = z.infer<typeof editProductSchema>;







