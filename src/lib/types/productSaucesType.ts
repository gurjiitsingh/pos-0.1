




import { z } from "zod";



export type sauceProductType = {
  id: string | undefined;
  name: string;
  price: string;
  baseProductId: string;
  productDesc: string;
  productCat: string;
  image: string;
  isFeatured: boolean;
  purchaseSession: string | null;
  quantity: number | null;
  status: string | null;
  flavors:boolean;
};


export const saucePorductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(4, { message: "Product name is required" }),
  price: z
    .string()
    .refine((value) =>/[.,\d]+/.test(value), "Invalid product price"),
   // .refine((value) => /^\d+$/.test(value), "Invalid product price"), // Refinement
  productCat: z.string().min(1, { message: "Please select category" }),
  productDesc: z
    .string()
    .min(2, { message: "Product description is required" }),
  baseProductId: z.string().optional(),
  //  brand: z.string().min(1, { message: "Please select category" }),
  //  dimensions:z.string().optional(),
  //weight:z.string().optional(),
  isFeatured: z.boolean().optional(),

  //image: z.any().refine((file: File) => file?.length !== 0, "File is required"),
  image: z.any().optional(),
  // .refine((file) => file.size < MAX_FILE_SIZE, "Max size is 5MB.")
  // .refine(
  //   (file) => checkFileType(file),
  //   "Only .jpg, .jpeg formats are supported."
  // ),
});

export type ProductSchemaType = z.infer<typeof saucePorductSchema>;


