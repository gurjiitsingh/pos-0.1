import { z } from "zod";

export type categoryType = {
  id: string;
  name: string;
  masterCategoryId?: string;
  masterCategoryName?: string;
  desc: string;
  productDesc?: string;
  slug?: string | undefined;
  image?: string | undefined;
  isFeatured?: boolean | undefined;
  sortOrder?: number | undefined;
  disablePickupDiscount?: boolean | undefined;
  taxRate?: string | number;
  taxType: "inclusive" | "exclusive" | undefined;
};



export const categorySchema = z.object({
  id:z.string().optional(),
  name: z
    .string()
    .trim()
    .min(1, { message: "Category name is required" })
    .max(70, { message: "Category name is to long" }),
    masterCategoryId: z.string().optional(),
  sortOrder: z.string().optional(),
  
  desc: z
    .string().optional(),    
    oldImageUrl: z.any().optional(),
  slug: z.string().optional(),
  image: z.any().optional(),
  isFeatured: z.string().optional(),
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

  taxType: z
    .enum(["inclusive", "exclusive"])
    .optional(),
});

export type TcategorySchema = z.infer<typeof categorySchema>;

export const editCategorySchema = z.object({
  id: z.string().optional(),
  sortOrder: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(1, { message: "Category name is required" })
    .max(70, { message: "Category name is to long" }),
      masterCategoryId: z.string().optional(),
  desc: z
    .string()
   .optional(), 
  // slug: z
  // .string()
  // .min(4, { message: "productDescrition of product is needed" })
  // .max(100, { message: "productDescription is too long" }),
  // image: z.any().refine((file: File) => file?.length !== 0, "File is required"),
  image: z.any().optional(),
  oldImageUrl: z.any().optional(),
  isFeatured: z.string().optional(), 
  disablePickupDiscount: z.boolean().optional(),
    taxRate: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value || /^\d*[.,]?\d*$/.test(value),
      "Invalid tax rate"
    ),

  taxType: z
    .enum(["inclusive", "exclusive"])
    .optional(),
});

export type TeditCategorySchema = z.infer<typeof editCategorySchema>;
