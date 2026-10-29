import { ProductType } from "./productType";






export type cartModifierItem = {
  id: string;
  name: string;
  price: number;
};

export type cartProductType = {
  // =====================================================
  // Android PosCartEntity compatible fields
  // =====================================================

  id: number; // local SQLite row id (0 before insert)

  productId: string;
  productMode: string;

  currentStock: number;

  name: string;

  categoryId: string;
  categoryName: string;
  discountEligible?: boolean;
  parentId?: string | null;

  isVariant: boolean;

  basePrice: number;

  finalPrice: number;

  modifierTotal: number;

  quantity: number;

  taxRate: number;

  taxType: 'inclusive' | 'exclusive';

  // =====================================================
  // POS session
  // =====================================================

  sessionId: string;

  // =====================================================
  // DINE_IN
  // =====================================================

  tableId?: string | null;

  tableName?: string | null;

  // =====================================================
  // User snapshot
  // =====================================================

  createdById?: string;

  createdByName?: string;

  // =====================================================
  // Kitchen note
  // =====================================================

  note?: string;

  // =====================================================
  // Modifiers
  // =====================================================

  modifiersJson?: string;

  modifiers?: cartModifierItem[];

  // =====================================================
  // Kitchen workflow
  // =====================================================

  sentToKitchen?: boolean;

  kitchenPrintReq?: boolean;

  printStatus?: 'PENDING' | 'PRINTED';

  // =====================================================
  // Timestamps
  // =====================================================

  createdAt?: number;

  // =====================================================
  // Web / React helper fields (NOT stored directly in DB)
  // =====================================================

  uniqueKey?: string;

  image?: string;

  productCat?: string;

  parentProductId?: string;
};


// export type cartProductType = {
//   id: string ;
//   price: number;
//   quantity: number;
//   currentStock: number | null;
//   categoryId: string;
//   productCat: string;
//   name: string;
//   image: string;
//   taxRate: number | undefined;
//   taxType: "inclusive" | "exclusive" | undefined;

// // variantId?: string;
// // variantName?: string;
// // notes?: string;
// };

export type newOrderConditionType = {
  success: boolean;
  message: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  currentStock: number | null;
  productMode?: string;
  // category + tax info copied from product
  kitchenPrintReq: boolean;
  categoryId: string;
  productCat: string;
  taxRate?: number;
  taxType?: 'inclusive' | 'exclusive';
  image: string;

  modifiers?: cartModifierItem[];
  note?: string;
};

export type CartItemWithTax = CartItem & {
  itemSubtotal: number;
  taxAmount: number;   // per one item
  taxTotal: number;    // tax * quantity
  finalPrice: number;  // price + tax
  finalTotal: number;  // finalPrice * quantity
};

export type cartDataT = {
  productDesc: string;
  productCat: string;
  id: string;
  image: string;
  isFeatured: boolean;
  name: string;
  uniqueKey: string;
  modifiers?: cartModifierItem[];

  note?: string;
  price: number;
  basePrice: number;
  purchaseSession: string | null;
  quantity: number;
  status: string;
};




// export type ProductType ={
//   name: string;
//    price: string;
//     productCat: string;
//      productDesc: string;
//       image:string;
//        isFeatured?: boolean | undefined;
//       }

export type purchaseDataT = {
  userId: string | undefined;
  cartData: ProductType[];
  total: number;
  totalDiscountG: number;
  address: {
    firstName: string;
    lastName: string;
    //   password:string;
    userId: string | undefined;
    email: string;
    mobNo: string;
    addressLine1: string | undefined;
    addressLine2: string | undefined;
    city: string;
    state: string;
    zipCode: string;
  };
};

export type orderDataType = {
  // -----------------------------
  // BASIC INFO
  // -----------------------------
  userId: string;                  // Customer ID
  customerName: string;
  customerPhone?: string;          //  NEW (important)
  email: string;

  tableNo: string | null;          // Only for DINE_IN
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY" | "ONLINE";

  // -----------------------------
  // CART SNAPSHOT (REQUIRED)
  // -----------------------------
  cartData: cartProductType[];

  // -----------------------------
  // REQUIRED LEGACY TOTALS
  // -----------------------------
  totalDiscountG: number;
  couponFlat: number;

  // -----------------------------
  // ORDER INFO
  // -----------------------------
  addressId: string;

  // -----------------------------
  // DELIVERY ADDRESS (FLAT SNAPSHOT)
  // -----------------------------
  deliveryAddressLine1?: string;   //  NEW
  deliveryAddressLine2?: string;   //  NEW
  deliveryCity?: string;           //  NEW
  deliveryState?: string;          //  NEW
  deliveryZipcode?: string;        //  NEW

  // -----------------------------
  // PAYMENT
  // -----------------------------
  paymentType: string;             // CASH | UPI | CARD | ONLINE | PAYPAL | STRIPE
  paymentStatus?: "PAID" | "UNPAID" | "FAILED";

  // -----------------------------
  // TOTALS
  // -----------------------------
  itemTotal: number;
  deliveryFee: number;

  // -----------------------------
  //  NEW CLEAN TOTALS (OPTIONAL)
  // -----------------------------
  discountTotal?: number;
  taxTotal?: number;
  subTotal?: number;
  grandTotal?: number;

  // -----------------------------
  // DISCOUNTS (LEGACY + CLEAN)
  // -----------------------------
  calcouponPercent: number;
  flatcouponPercent: number;
  couponPercentPercentL: number;
  couponCode: string | undefined;

  pickUpDiscountPercentL: number;
  calculatedPickUpDiscountL: number;

  // -----------------------------
  // FLAGS
  // -----------------------------
  noOffers: boolean;

  // -----------------------------
  // SYSTEM / SOURCE
  // -----------------------------
  source?: "POS" | "WEB";
  orderStatus?: "NEW" | "ACCEPTED" | "COMPLETED" | "CANCELLED";
  printed?: boolean;

  // -----------------------------
  // SCHEDULING
  // -----------------------------
  isScheduled?: boolean;
  scheduledAt: string | null;
};



// export type OrderProductType = {
//   id: string;
//   orderMasterId: string;

//   name: string;
//   price: number;
//   quantity: number;

//   taxRate: number;
//   taxType: "inclusive" | "exclusive";
//   taxAmount: number;
//   taxTotal: number;

//   finalPrice: number;
//   finalTotal: number;

//   categoryId: string;
//   productCat: string;
//   image: string;

//   status: string;
// };
