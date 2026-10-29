import { z } from "zod";

export const addOnPorductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(4, { message: "Product name is required" }),
  price: z
    .string()
    .refine((value) =>/[.,\d]+/.test(value), "Invalid product price"),
    sortOrder: z.string().min(1, { message: "Please add sort order" }),
  desc: z
    .string()
    .min(2, { message: "Product description is required" }),
  baseProductId: z.string().optional(),
  isFeatured: z.boolean().optional(),
  image: z.any().optional(),
  // .refine((file) => file.size < MAX_FILE_SIZE, "Max size is 5MB.")
  // .refine(
  //   (file) => checkFileType(file),
  //   "Only .jpg, .jpeg formats are supported."
  // ),
});

export type AddOnProductSchemaType = z.infer<typeof addOnPorductSchema>;


export const addOnPorductEditSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(4, { message: "Product name is required" }),
  price: z
    .string()
    .refine((value) =>/[.,\d]+/.test(value), "Invalid product price"),
    sortOrder: z.string().min(1, { message: "Please add sort order" }),
  desc: z
    .string()
    .min(2, { message: "Product description is required" }),
  baseProductId: z.string().optional(),
  isFeatured: z.boolean().optional(),
  image: z.any().optional(),
  // .refine((file) => file.size < MAX_FILE_SIZE, "Max size is 5MB.")
  // .refine(
  //   (file) => checkFileType(file),
  //   "Only .jpg, .jpeg formats are supported."
  // ),
});

export type AddOnProductEditSchemaType = z.infer<typeof addOnPorductEditSchema>;