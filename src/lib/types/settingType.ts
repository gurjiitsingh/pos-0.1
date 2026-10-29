import { z } from "zod";



export const settingSchema = z.object({
  name: z.string().min(1, "Setting name is required"),
  value: z.string().optional(),
  key:z.string().optional(),
  type:z.string().optional(),
});

export type settingSchemaType = z.infer<typeof settingSchema>;




// export type settingSchemaType = {
//   id?:string;
//   name?: string;
//   value: string;
//   key: string; // <-- Add this
//   type?: string;
// };

export const editSettingSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  //.min(2, { message: "Setting name is required" }),
  value: z
    .string().optional(),
    // .refine((value) => /^\d+$/.test(value), "Invalid product price"), // Refinement
    //.refine((value) => /[.,\d]+/.test(value), "Invalid setting value"),
   
});

export type editSettingSchemaType = z.infer<typeof editSettingSchema>;