import { z } from "zod";



 





export const deliverySchema = z.object({
  // Location name (village / area)
  name: z
    .string()
    .trim()
    .min(2, { message: "Delivery name is very short" })
    .max(30, { message: "Delivery name is very long" }),

  // 💰 DELIVERY PRICE — store as NUMBER
  deliveryFee: z
    .string()
    .trim()
    .refine(v => /^\d+(\.\d+)?$/.test(v), "Enter a valid delivery price")
    .transform(v => Number(v)),   // OUTPUT: number

  // 🛒 MINIMUM SPEND — optional number
  minSpend: z
    .string()
    .trim()
    .optional()
    .refine(v => !v || /^\d+(\.\d+)?$/.test(v), "Enter valid minimum spend")
    .transform(v => (v ? Number(v) : 0)),   // OUTPUT: number

  // 📏 DELIVERY DISTANCE — optional number
  deliveryDistance: z
    .preprocess(value => {
      if (value === undefined || value === null || value === "") return null;
      if (typeof value === "number") return value;
      if (typeof value === "string" && /^\d+(\.\d+)?$/.test(value.trim()))
        return Number(value);
      return NaN;
    },
    z
      .number()
      .nullable()
      .refine(v => v === null || !isNaN(v), "Enter valid distance")
    ),

  // Category (fixed list string)
  productCat: z
    .string()
    .min(1, { message: "Please select category" }),

  // Description
  note: z
    .string()
    .trim()
    .min(1, { message: "Please enter delivery description" }),

  // Optional fields
  company: z.string().optional(),
  featured: z.string().optional(),

  // File upload — leave as-is
  image: typeof window === "undefined" ? z.any() : z.any(),
});

export type TDeliverySchema = z.infer<typeof deliverySchema>;


export type TdeliverySchema = z.infer<typeof deliverySchema>;

export type TdeliverySchemaArr = TdeliverySchema[];

export const newProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(4, { message: "delivery name is required" }),
  deliveryFee: z
    .string(),
   // .refine((value) => /^\d+$/.test(value), "Invalid delivery price"), // Refinement
  productCat: z.string().min(1, { message: "Please select category" }),
  note: z
    .string().optional(),
   // .min(2, { message: "delivery description is required" }),
  minSpend: z.string().optional(),
  //  offerType: z.string().min(1, { message: "Please select category" }),
  //  dimensions:z.string().optional(),
  //weight:z.string().optional(),
  deliveryDistance: z.string().optional(),

  //image: z.any().refine((file: File) => file?.length !== 0, "File is required"),
  image: z.any().optional(),
  // .refine((file) => file.size < MAX_FILE_SIZE, "Max size is 5MB.")
  // .refine(
  //   (file) => checkFileType(file),
  //   "Only .jpg, .jpeg formats are supported."
  // ),
});

export type TnewdeliverySchema = z.infer<typeof newProductSchema>;

export type TnewdeliverySchemaArr = TnewdeliverySchema[];


export const editProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(4, { message: "delivery name is required" }),
  deliveryFee: z
    .string()
    .refine((value) => /^\d+$/.test(value), "Invalid delivery price"), // Refinement
  productCat: z.string().min(1, { message: "Please select category" }),
  note: z
    .string()
    .min(2, { message: "delivery description is required" }),
  // offerType: z.string().optional(),
  // dimensions:z.string().optional(),
  // weight:z.string().optional(),
  deliveryDistance: z.string().optional(),
  minSpend: z.string().optional(),
  image: z.any().optional(),
  oldImageUrl: z.string().optional(),
  // .refine((file) => file.size < MAX_FILE_SIZE, "Max size is 5MB.")
  // .refine(
  //   (file) => checkFileType(file),
  //   "Only .jpg, .jpeg formats are supported."
  // ),
});

export type TeditdeliverySchema = z.infer<typeof editProductSchema>;

export default deliverySchema;

export type Tdelivery = {
  name: string;
  id: string;
  image: string;
  category: string;
};
