"use client"
import { createContext, useContext } from "react";
//import { cartProductType } from  '@/lib/types/cartProductType'
//import { cartProductTypeT } from "@/lib/types/cartProductTypeype";

import { addressT } from "@/lib/types/addressType";
import { cartProductType } from "@/lib/types/cartDataType";
type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";

interface CartContextType {
  counter: number;
  productTotalCost: number;
  cartData: cartProductType[];
  address: addressT;

  addAddress: (a: addressT) => void;

  addProduct: (c: cartProductType) => void;
  addProductToCart: (c: cartProductType) => void;

  decCartProduct: (c: cartProductType) => void;
  decCartProductAll: (c: cartProductType) => void;
  removeCartProduct: (
    c: cartProductType | undefined
  ) => void;

  setCartData: React.Dispatch<
    React.SetStateAction<cartProductType[]>
  >;

  reloadCart: (
    tableName?: string
  ) => Promise<void>;

  updateCartItemNote: (
    itemId: number,
    note: string
  ) => Promise<void>;

  emptyCart: () => void;

  endTotalG: number;
  setEndTotalG: (c: number) => void;

  totalDiscountG: number;
  setTotalDiscountG: (c: number) => void;

  scheduledAt: string | null;
  setScheduledAt: (
    value: string | null
  ) => void;

  orderType: OrderType;
  setOrderType: (t: OrderType) => void;

  tableNo: string | null;
  setTableNo: (t: string | null) => void;
}
//const CartContext = createContext<CartContextType | null>(null);

const CartContext = createContext<CartContextType>({
  counter: 0,
  productTotalCost: 0,
  cartData: [],
  
    setCartData: () => {},

  address: {
    name: "",
    mobNo: "",
    city: "",
    state: "",
    zipCode: "",
    addressLine1: "",
    addressLine2: "",
    userId: "",
  },

  addAddress: () => {},
  addProduct: () => {},
  addProductToCart: () => {},
  decCartProduct: () => {},
  decCartProductAll: () => {},
  removeCartProduct: () => {},
  // reload helper
reloadCart: async () => {}, 
  emptyCart: () => {},

  endTotalG: 0,
  setEndTotalG: () => {},

  totalDiscountG: 0,
  setTotalDiscountG: () => {},
updateCartItemNote: async () => {},
  //  scheduling
  scheduledAt: null,
  setScheduledAt: () => {},

  //  MISSING ONES — NOW ADDED
  orderType: "DELIVERY", // sensible default
  setOrderType: () => {},

  tableNo: null,
  setTableNo: () => {},
});
export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartContextProvider");
  }
  return context;
};

export default CartContext;
