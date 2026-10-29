import { z } from "zod";

// const couponSchema = z.object({
//   // id: z.number().optional(),
//   code: z
//     .string()
//     .trim()
//     .min(2, { message: "coupon code is very short" })
//     .max(30, { message: "coupon code is very long" }),
//   discount: z
//     .string()
//     .refine((value) => /^\d+$/.test(value), "Invalid coupon discount"), // Refinement
//   productCat: z.string().min(1, { message: "Please select category" }),

//   couponDesc: z.string().min(1, { message: "Please select category" }),
//   company: z.string().optional(),
//   featured: z.string().optional(),
//   image: typeof window === "undefined" ? z.any() : z.any(),
//   minSpend: z.string().optional(),
//   // image:z.object({
//   //   size: z.number(),
//   // type: z.string(),
//   // code: z.string(),
//   // lastModified: z.number(),
//   //  }),
// });
// export type TcouponSchema = z.infer<typeof couponSchema>;

// export type TcouponSchemaArr = TcouponSchema[];

export const couponSchema = z.object({
  id: z.string().optional(),
  message: z.string().optional(),
  code: z.string().min(4, { message: "coupon code is required" }),
  discount: z.string(),
  // .refine((value) => /^\d+$/.test(value), "Invalid coupon discount"), // Refinement
  productCat: z.string().min(1, { message: "Please select category" }),
  couponDesc: z.string().optional(),
  // .min(2, { message: "coupon description is required" }),
  minSpend: z.string().optional(),
  excludedCategoryIds: z.array(z.string()).optional(),
  offerType: z.string().optional(),
  isFeatured: z.boolean().optional(),
  expiry: z.string().optional(),
  discountType: z.string().optional(),
  //image: z.any().refine((file: File) => file?.length !== 0, "File is required"),
  image: z.any().optional(),
  applyPickup: z.boolean().optional(),
  applyDelivery: z.boolean().optional(),
});

export type TcouponSchema = z.infer<typeof couponSchema>;

export type couponType = {
  code: string;
  message: string | undefined;
  discount: number;
  productCat: string;
  id?: string | undefined;
  couponDesc?: string | undefined;
  minSpend?: number | undefined;
  excludedCategoryIds?: string[] | undefined;
  offerType?: string | undefined;
  isFeatured?: boolean | undefined;
  applyPickup?: boolean;
  applyDelivery?: boolean;
  isActivated: boolean | undefined;
  expiry?: string | undefined;
  discountType?: string | undefined;
  startDate: string | undefined;
  date: string | undefined;
  createdAt: Date | undefined;
  image?: any;
};



export const editCouponSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(4, { message: "coupon code is required" }),
  message: z.string().optional(),
  discount: z
    .string()
    .refine((value) => /^\d+$/.test(value), "Invalid coupon discount"), // Refinement
  productCat: z.string().min(1, { message: "Please select category" }),
  couponDesc: z.string().min(2, { message: "coupon description is required" }),
  // offerType: z.string().optional(),
  // dimensions:z.string().optional(),
  // weight:z.string().optional(),
  isFeatured: z.boolean().optional(),
  minSpend: z.string().optional(),
  image: z.any().optional(),
  oldImageUrl: z.string().optional(),
  // .refine((file) => file.size < MAX_FILE_SIZE, "Max size is 5MB.")
  // .refine(
  //   (file) => checkFileType(file),
  //   "Only .jpg, .jpeg formats are supported."
  // ),
});

export type TeditcouponSchema = z.infer<typeof editCouponSchema>;

//export default couponSchema;

export type Tcoupon = {
  code: string;
  message: string | undefined;
  id: string;
  image: string;
  category: string;
};
