"use client";

import SiteContext from "./SiteContext";
import { useEffect, useState } from "react";
 
import { couponType } from "@/lib/types/couponType";
 
import { SettingsDataType } from "@/lib/types/settings";
import { ProductType } from "@/lib/types/productType";

interface Props {
  children: React.ReactNode;
}

export const SiteProvider: React.FC<Props> = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  //     const setcouponType ={
  //         couponDesc:{},
  // isFeatured:boolean,
  // minSpend:number,
  // name:string,
  // price:string,
  // productCat:string,
  // deliveryDis:{},
  // setdeliveryDis:(e)=>{return e}

  //  }

  const [open, setIsOpen] = useState<boolean>(false);
  const [openBargerMenu, setOpenBargerMenu] = useState<boolean>(false);
 
 
 
  
  const [couponDisc, setCouponDiscU] = useState<couponType | undefined>();
 
  const [showProductDetailM, setShowProductDetailML] = useState<boolean>(false);
  const [baseProductId, setBaseProductIdL] = useState<string>("");
  const [adminSideBarToggle, setAdminSideBarToggleL] = useState<boolean>(false);
  const [productCategoryIdG, setProductCategoryIdL] = useState<string>("");
 
 
 
 
 
 
  const [allProduct, setAllProduct] = useState<ProductType[]>([]);
  const [productToSearchQuery, setProductToSearchQuery] = useState("");
 

 
   function togleMenu() {
    setIsOpen(!open);
  }
  function bargerMenuToggle() {
    setOpenBargerMenu(!openBargerMenu);
  }
 

  function setCouponDisc(e: couponType | undefined) {
    setCouponDiscU(e);
  }
  
 
 

  function setShowProductDetailM() {
    setShowProductDetailML(!showProductDetailM);
    //showProductDetailM,
  }

  function setBaseProductId(e: string) {
    setBaseProductIdL(e);
  }

 
 

  function setAdminSideBarToggleG(e: boolean) {
    setAdminSideBarToggleL(e);
  }

  function setProductCategoryIdG(id: string) {
    setProductCategoryIdL(id);
  }
 

 

 
 

 
 
  return (
    <SiteContext.Provider
      value={{
        allProduct,
        setAllProduct,
        //     handleSearchForm,
        // setHandleSearchForm,
        productToSearchQuery,
        setProductToSearchQuery,
   
    
      
        open,
        openBargerMenu,
        sideBarToggle: togleMenu,
        bargerMenuToggle,
    
       
    
        couponDisc,
        setCouponDisc,
    
        showProductDetailM,
        setShowProductDetailM,
        baseProductId,
        setBaseProductId,
        adminSideBarToggle,
        setAdminSideBarToggleG,
       
     
     
    
        setProductCategoryIdG,
        productCategoryIdG,
    
 
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};
