"use client";

import { couponType } from "@/lib/types/couponType";
 
import { createContext, useContext } from "react";
import { SettingsDataType } from "@/lib/types/settings";
import { ProductType } from "@/lib/types/productType";

type SiteContextType = {
  allProduct: ProductType[];
  setAllProduct: (e: ProductType[]) => void;
  productToSearchQuery: string;
setProductToSearchQuery: (e: string) => void;
 
 
  open: boolean;
 
  sideBarToggle: (e: boolean) => void;
  openBargerMenu: boolean;
  bargerMenuToggle: (e: boolean) => void;
 
 
  couponDisc: couponType | undefined;
  setCouponDisc: (e: couponType) => void;
 
 
  showProductDetailM: boolean;
  setShowProductDetailM: (e: boolean) => void;
  baseProductId: string;
  setBaseProductId: (e: string) => void;
  adminSideBarToggle: boolean;
  setAdminSideBarToggleG: (e: boolean) => void;
 
 
  
  
 
  
  productCategoryIdG: string;
  setProductCategoryIdG: (e: string) => void;
 
 
 
};

const SiteContext = createContext<SiteContextType>({
  allProduct: [],
  setAllProduct: (e: ProductType[]) => e,
  productToSearchQuery: "",
setProductToSearchQuery: (e: string) => e,
  // handleSearchForm: (e: string) => {},
  // setHandleSearchForm: (fn: (e: string) => void) => {},
 
 
 
  open: false,
  
  sideBarToggle: () => {},
  openBargerMenu: false,
  bargerMenuToggle: () => {},
 
 
  couponDisc: {
    couponDesc: "",
    isFeatured: false,
    minSpend: 0,
    code: "",
    discount: 0,
    productCat: "",
    isActivated: false,
    startDate: "",
    createdAt: undefined,
    date: "",
    message:"",
  },

  setCouponDisc: (e) => {
    return e;
  },
  
 
  showProductDetailM: false,
  setShowProductDetailM: (e) => {
    return e;
  },
  baseProductId: "",
  setBaseProductId: (e) => {
    return e;
  },
  adminSideBarToggle: false,
  setAdminSideBarToggleG: (e) => {
    return e;
  },
 
 
 
 
   
  productCategoryIdG: "",
  setProductCategoryIdG: (e) => {
    return e;
  },

 

 
});

export const UseSiteContext = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartContextProvider");
  }
  return context;
};

export default SiteContext;
