 
  
  "use client";
import React, { useContext } from "react";
import CartContext from "@/store/CartContext";
import Image from "next/image";
import { IoMdAdd } from "react-icons/io";
import { IoMdRemove } from "react-icons/io";

const ProductList = ({ item }) => {
 
  const { addProductToCart, decCartProduct, removeCartProduct } =
    useContext(CartContext);

  //   console.log("cart item", item)

  function addProductToCartNew() {
    //console.log("llll")
    addProductToCart(item);
  }

  const total = parseInt(item.quantity) * parseFloat(item.price);
  return (
    <div className="flex flex-row gap-2 bg-[#f2f0ec]  justify-between border-b mt-2 rounded-xl">
      <div className="w-[20%]">
        <div className="w-[100px]">
          {" "}
          <Image
            src={item.image}
            width="0"
            height="0"
            sizes="100vw"
            loading="eager"
            priority={true}
            className="w-full h-[100px] rounded-tl-xl rounded-bl-xl"
            alt={item.name}
          />
        </div>
      </div>
      <div className="w-full flex flex-col justify-between gap-2 p-2 ">
        <div className="flex flex-row gap-3  items-start ">
          <div className="text-sm w-[87%] flex items-start ">{item.name}</div>

          <div className="text-[1rem] w-[13%] flex items-start justify-end "> &euro;{item.price}</div>
        </div>
        <div> {item.productDesc} </div>

        <div className="flex flex-row justify-between ">
          <div className="flex justify-between items-center gap-2 ">
          <div className="flex justify-center items-center gap-4 bg-red-500">
            <div className="flex justify-center items-center gap-2 bg-slate-500">
              <button
                className=" rounded-sm bg-slate-300 p-1"
                onClick={decCartProduct.bind(null, item)}
              >
                <IoMdRemove />
              </button>
              <div className="text-white"> {item.quantity}</div>
              <button
                //onClick={addProductToCart.bind(null, item)}
                onClick={addProductToCartNew}
                className="rounded-sm bg-slate-300 p-1"
              >
                <IoMdAdd />
              </button>
            </div>

            <div className="border-r px-2 text-sm text-orange-500">
              <button
                onClick={removeCartProduct.bind(null, item)}
                className=" rounded-sm text-white"
              >
                Remove
              </button>
            </div>
            </div>
          </div>

          <div className="flex justify-end   text-sm ">
            &euro;{total.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
