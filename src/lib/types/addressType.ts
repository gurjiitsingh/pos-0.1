import { string, z } from "zod";




export const addressCheckoutSMALL = z.object({
  id: z.string().optional(),

  // REQUIRED
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
 // mobNo: z.string().min(6, "Mobile number is required"),
//  mobNo: z
//   .string()
//   .transform(v => v.replace(/^0+/, ""))   // remove leading 0s
//   .refine(v => /^[6-9]\d{9}$/.test(v), {
//     message: "Enter valid 10-digit Indian mobile number",
//   }),
mobNo: z
  .string()
  .transform(v =>
    v
      .replace(/\D/g, "")
      .replace(/^0+/, "")
      .replace(/^91/, "")
  )
  .refine(v => v === "" || /^[6-9]\d{9}$/.test(v), {
    message: "Enter valid 10-digit Indian mobile number",
  }),
 addressLine1: z.string().min(2, "Village / Locality / Town  is required"), // Village / Locality / Town
  // OPTIONAL
  email: z.string().optional(),

 
  addressLine2: z.string().optional(), // House / Street
  city: z.string().optional(),          // small city list
  state: z.string().optional(),         // fixed (Punjab)
  zipCode: z.string().optional(),

  userId: z.string().optional(),

});

export type TAddressCheckoutSMALL = z.infer<typeof addressCheckoutSMALL>;




export type addressT = {
    name: string;
    mobNo: string;
    city: string;
    state: string;
    zipCode: string;
    addressLine1: string;
    addressLine2: string;
    userId: string;
}



export const addressSchima = z.object({
  name: z
  .string()
  .trim()
  .min(2, { message: "Product name is very short" })
  .max(30, { message: "Product name is very long" }),
 
  mobNo: z.string().min(2, { message: "Mob No. is required" }),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  zipCode: z.string().min(2, { message: "Zip code is required" }),
  userId: z.string().optional(),
});
export type TaddressSchema = z.infer<typeof addressSchima>;

export const addressSchimaCheckout = z.object({
  id:z.string().optional(),
  firstName: z
  .string()
  .trim()
  .min(2, { message: "First name is required" })
  .max(30, { message: "First name is very long" }),
  lastName: z
  .string()
  .trim()
  .min(2, { message: "Last name is required" })
  .max(30, { message: "Last name is very long" }),
  password:z.string().optional(),
  email: z.string().min(2, { message: "Email is required" }),
  mobNo: z.string().min(2, { message: "Mobile is required" }),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
 // city: z.string().min(2, { message: "City is required" }),
 city: z.string().optional(),
  state: z.string().optional(),//min(2, { message: "State is required" }),
// zipCode: z.string().min(2, { message: "Post code is required" }),
zipCode: z.string().optional(),
  userId: z.string().optional(),
  payment: z.string().optional(),
  
//  orderDetail:z.string().optional(),
});


export type TaddressSchemaCheckout = z.infer<typeof addressSchimaCheckout>;

export const emailZ = z.object({
  email: z.string().min(2, { message: "Email is required" }), 
})

export type TemailZ = z.infer<typeof emailZ>;



export const customerLookupZ = z.object({
  identifier: z
    .string()
    .trim()
    .min(
      3,
      "Enter email or phone number"
    ),
});

export type TCustomerLookup =
  z.infer<typeof customerLookupZ>;

export type TaddressCheckout ={
  id?:string;
  firstName:string;
    lastName:string;
    password?:string;
    email: string;
    mobNo: string;
    addressLine1?: string;
    addressLine2?: string;
    city:string;
    state: string;
    zipCode: string;
    userId?:string;// opttional
    }


export type addressResT = { 
  
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  userId: string;
  mobNo: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  createdAt?: Timestamp | string;
};

export type addressWithId = Omit<addressResT, "createdAt"> & {
  createdAt: string;
  id: string;
};

   import { Timestamp } from 'firebase/firestore';

export type addressResType = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userId: string;
  mobNo: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  createdAt?: Timestamp; // optional Firestore server timestamp
};
