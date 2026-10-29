import {
  Timestamp,
  FieldValue,
} from "firebase/firestore";
import z from "zod";

export type SupplierTypeS =
  | "purchase"
  | "sale"
  | "both";

export type SupplierStatus =
  | "active"
  | "inactive";

export type SupplierType = {
  id: string;

  // Company Details
  companyName: string;
  contactPerson: string;

  // Contact
  phone: string;
  email?: string;

  // Address
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;

  // Tax & License
  gstNumber?: string;
  panNumber?: string;
  fssaiLicenseNumber?: string;
  taxCollectedAtSource: boolean;

  // Business
  type: SupplierTypeS;
   isActive: boolean;


  // Other
  notes?: string;

  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
};

export const supplierSchema =
  z.object({
    companyName: z
      .string()
      .min(2, "Company name is required")
      .max(150),

    contactPerson: z
      .string()
      .min(2, "Contact person is required")
      .max(100),

    phone: z
      .string()
      .min(5, "Phone number is required")
      .max(20),

    email: z
  .string()
  .optional()
  .refine(
    (val) =>
      !val ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    {
      message: "Invalid email",
    }
  ),

    address: z
      .string()
      .optional(),

    city: z
      .string()
      .optional(),

    state: z
      .string()
      .optional(),

    pincode: z
      .string()
      .optional(),

    gstNumber: z
      .string()
      .optional(),

    panNumber: z
      .string()
      .optional(),

    fssaiLicenseNumber: z
      .string()
      .optional(),

    taxCollectedAtSource:
      z.boolean(),

    type: z.enum([
      "purchase",
      "sale",
      "both",
    ]),

   isActive: z.boolean(),

    notes: z
      .string()
      .optional(),
  });

export type TSupplierSchema =
  z.infer<
    typeof supplierSchema
  >;