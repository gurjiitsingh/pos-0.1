import { z } from "zod";
import { FieldValue } from "firebase/firestore";

// =====================================================
// SCHEMA
// =====================================================

export const outletSchema = z.object({
  outletId: z.string().optional(),
  ownerId: z.string().optional(),

  // TAX
  taxType: z
    .string()
    .min(2, "Tax type")
    .optional()
    .nullable(),

  gstVatNumber: z
    .string()
    .min(4, "Invalid GST / VAT number")
    .optional()
    .nullable(),

  // DISPLAY
  outletName: z
    .string()
    .min(1, "Outlet name is required"),

  // ADDRESS
  addressLine1: z
    .string()
    .min(1, "Address line 1 required"),

  addressLine2: z.string().optional(),
  addressLine3: z.string().optional(),

  city: z.string().optional(),
  state: z.string().optional(),
  zipcode: z.string().optional(),

  // COUNTRY
  countryCode: z
    .string()
    .min(2, "Country is required"),

  // CONTACT
  phone: z.string().optional(),
  phone2: z.string().optional(),
  email: z.string().optional(),
  web: z.string().optional(),

  // POS / PRINTER
  printerWidth: z.enum(["58", "80"]),
  footerNote: z.string().optional(),

  taxMode: z.enum([
  "FORCE_INCLUSIVE",
  "FORCE_EXCLUSIVE",
  "PER_ITEM",
]).default("PER_ITEM"),
  // QR
  qrEnabled: z.boolean().optional(),

  qrText: z
    .string()
    .optional()
    .nullable(),

  qrTitle: z
    .string()
    .optional()
    .nullable(),

  // STATUS
  isActive: z.boolean(),

  // UPI
  // UPI
upiId: z.preprocess(
  (v) => (v === "" ? undefined : v),
  z
    .string()
    .regex(
      /^[\w.-]+@[\w.-]+$/,
      "Invalid UPI ID"
    )
    .optional()
),

upiName: z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.string().optional()
),

upiTitle: z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.string().optional()
),
});

export type ToutletSchema = z.infer<typeof outletSchema>;

// =====================================================
// TYPE
// =====================================================

export type OutletType = {
  outletId?: string;
  ownerId?: string;

  outletName: string;

  // ADDRESS
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;

  city?: string;
  state?: string;
  zipcode?: string;

  // COUNTRY CONFIG
  countryCode: string;
  countryName?: string;

  currencyCode?: string;
  localeTag?: string;

  // TAX
  taxType?: string;
  gstVatNumber?: string;

  // CONTACT
  phone?: string;
  phone2?: string;
  email?: string;
  web?: string;

  // POS / PRINTER
  printerWidth?: 58 | 80;
  printerName?: string;
  footerNote?: string;

  // QR
  qrEnabled?: boolean;
  qrText?: string;
  qrTitle?: string;

  // UPI
  upiId?: string;
  upiName?: string;
  upiTitle?: string;


  posType: "RESTAU" | "RETAIL" | "FAST_FOOD" 
  // STATUS
  isActive: boolean;

  // METADATA
  createdAt?: any;
  updatedAt?: any;
};



export const POS_TYPES = {
  RESTAU: "RESTAU",
  RETAIL: "RETAIL",
  FAST_FOOD: "FAST_FOOD",
} as const;

export type PosType = typeof POS_TYPES[keyof typeof POS_TYPES];