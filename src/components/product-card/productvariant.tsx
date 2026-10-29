"use client";

//import { flavorsProductGType } from "@/lib/types/flavorsProductGType";
import { ProductType } from "@/lib/types/productType";
//import { ProductType } from "@/lib/types/ProductTypeype";

//import { ProductType } from "@/lib/types/productType";
//import Link from "next/link";
import React from "react";
// : { product: ProductType,addExtra:()=>void }
export default function Productvariant({
  product,
  addExtra,
}: {
  product: ProductType;
  addExtra: ({name,price}:{name:string,price:number}) => void;
}) {
  //console.log("----------product data----", product,typeof(product.price));
 const priceS = product.price.toString() as string;
  const price = priceS.replace(/\./g, ',')  
  return (
   
      <div className="w-full  bg-white flex flex-row border-b ">
        <div className="w-full flex flex-col p-3 justify-between">
          <div className="w-full flex justify-between gap-2">
          <div className="flex gap-4 justify-start">
            <div>
              <input
                type="radio"
                name="extra"
                value={product.id}
                // checked={}
                onChange={() => {
                  addExtra({name:product.name,price:product.price});
                }}
              />
            </div>
            <div className="font-thin">{product.name}</div>
            </div>
            <div className="font-thin">&euro;{price}</div>
          </div>
        </div>
      </div>
   
  );
}
