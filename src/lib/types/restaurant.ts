 
import { Timestamp } from "firebase/firestore";

export type ownerDataT = {
  // ================================
  // CORE
  // ================================
  ownerId: string;           // Auth UID
  restaurantName: string;    // Brand name

  // ================================
  // CONTACT
  // ================================
  supportPhone?: string;
  supportEmail?: string;

  // ================================
  // TAX / LEGAL
  // ================================
  gstNumber?: string;        // India GST
  vatNumber?: string;        // Other countries

  // ================================
  // SETTINGS
  // ================================
  currency: string;          // INR, EUR, USD
  locale?: string;           // en-IN, de-DE

  // ================================
  // META
  // ================================
  createdAt: Timestamp ;
  updatedAt?: Timestamp ;

  isActive: boolean;
};



export type outletDataT = {
  // ================================
  // IDENTIFIERS
  // ================================
  outletId: string;
  ownerId: string;

  // ================================
  // DISPLAY
  // ================================
  outletName: string;       // "Food Corner - Jalandhar"

  // ================================
  // ADDRESS (FLAT)
  // ================================
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;

  // ================================
  // CONTACT
  // ================================
  phone?: string;

  // ================================
  // POS / PRINTER SETTINGS
  // ================================
  printerWidth: 58 | 80;    // mm
  footerNote?: string;      // "Thank you! Visit again"

  // ================================
  // STATUS
  // ================================
  isActive: boolean;

  // ================================
  // META
  // ================================
  createdAt: Timestamp ;
  updatedAt?: Timestamp ;
};
