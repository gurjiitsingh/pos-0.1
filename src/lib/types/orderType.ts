import { cartModifierItem } from "./cartDataType";


export type OrderProductT = {
  id?: string;
  productId: string;
  orderMasterId: string;

  name: string;
  price: number;        // base price per item
  quantity: number;
  itemSubtotal:number;

  // tax values (final, stored forever)
  taxRate: number;
  taxType: 'inclusive' | 'exclusive';
  taxAmount: number;     // tax per item
  taxTotal: number;      // tax * quantity
  finalPrice: number;    // price + tax
  finalTotal: number;    // finalPrice * quantity

  image: string;
  categoryId: string;
  productCat: string;

  purchaseSession: string;
  status: string;
  userId: string;
  productDesc?: string;
   modifiers?: cartModifierItem[];
   note?: string; 
};



export type OrderProductT2 = {
  id?: string;
  orderMasterId: string;

  name: string;
  productDesc?: string;

  image: string;
  categoryId: string;
  productCat: string;

  quantity: number;
  price: number;

  taxRate: number;
  taxType?: 'inclusive' | 'exclusive';

  taxAmount: number;
  taxTotal: number;

  finalPrice: number;
  finalTotal: number;

  userId: string;
};



export type OrderProductT1 = {
  // -----------------------------
  // IDENTIFIERS
  // -----------------------------
  id?: string;                    // Firestore ID (optional before save)
  orderMasterId: string;

  // -----------------------------
  // PRODUCT SNAPSHOT
  // -----------------------------
  name: string;
  productDesc?: string;

  image: string;
  categoryId: string;
  productCat: string;

  // -----------------------------
  // QUANTITY & PRICE
  // -----------------------------
  quantity: number;

  /** Base price per item (before tax & discount) */
  price: number;

  // -----------------------------
  // TAX (FINAL, SERVER CALCULATED)
  // -----------------------------
  taxRate: number;
  taxType?: 'inclusive' | 'exclusive'; // optional, audit only

  taxAmount: number;    // per item
  taxTotal: number;     // taxAmount * quantity

  // -----------------------------
  // FINAL TOTALS (FINAL SNAPSHOT)
  // -----------------------------
  finalPrice: number;   // price + taxAmount
  finalTotal: number;   // finalPrice * quantity

  // -----------------------------
  // SYSTEM
  // -----------------------------
  source: 'WEB' | 'POS' | 'APP';
  status: 'NEW' | 'PREPARING' | 'READY' | 'COMPLETED';


  userId: string;
};
