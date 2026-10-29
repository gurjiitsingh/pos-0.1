 
    "use client";
import React, { useContext } from "react";
import CartContext from "@/store/CartContext";
import { IoMdAdd, IoMdRemove } from "react-icons/io";
import { formatCurrencyNumber } from "@/utils/formatCurrency";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { IoMdTrash } from "react-icons/io";
import Image from "next/image";

const ProductList = ({ item }) => {
  const { addProductToCart, decCartProduct, removeCartProduct } =
    useContext(CartContext);
  const { settings } = UseSiteContext();

  function addProductToCartNew() {
    const newProductToAdd = { ...item, quantity: 1 };
    addProductToCart(newProductToAdd);
  }

  const total = item.quantity * parseFloat(item.price);
  const totalFormatted = formatCurrencyNumber(
    total ?? 0,
    settings.currency,
    settings.locale
  );

  const priceFormatted = formatCurrencyNumber(
    parseFloat(item.price) ?? 0,
    settings.currency,
    settings.locale
  );

  return (
    <div className="flex items-start gap-3 bg-white  rounded-2xl  hover:shadow-md transition-all duration-300">
      {/* Product image */}
      {item.image ? (
        <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-gray-100">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="100px"
          />
        </div>
      ) : (
        <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
          No image
        </div>
      )}

      {/* Product details */}
      <div className="flex flex-col flex-1 gap-2">
        {/* Title + Price */}
        <div className="flex justify-between items-start">
          <div className="font-medium text-gray-800 leading-tight">
            {item.name}
            {item.productDesc ? (
              <p className="text-sm text-gray-500">{item.productDesc}</p>
            ) : null}
          </div>


          <div className="text-sm font-light text-gray-600">
            {priceFormatted}
          </div>
        </div>
        {item.note && (
          <p className="text-xs text-gray-500 mt-1 italic">
            📝 {item.note}
          </p>
        )}

        {item.modifiers && item.modifiers.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            {item.modifiers.map((mod, idx) => (
              <div key={idx}>
                • {mod.name} {mod.price ? `(+${mod.price})` : ""}
              </div>
            ))}
          </div>
        )}

        {/* Quantity & Actions */}
       <div className="flex justify-between items-center">
  
  <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
    {item.quantity > 1 ? (
      <button
        onClick={decCartProduct.bind(null, item)}
        className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-200 transition"
        aria-label="Decrease quantity"
      >
        <IoMdRemove size={18} className="text-gray-700" />
      </button>
    ) : (
      <button
        onClick={removeCartProduct.bind(null, item)}
        className="p-1 bg-white rounded-full shadow-sm hover:bg-red-100 transition"
        aria-label="Remove item"
      >
        <IoMdTrash size={18} className="text-red-600" />
      </button>
    )}

    <span className="min-w-[24px] text-center font-semibold text-gray-800">
      {item.quantity}
    </span>

    <button
      onClick={addProductToCartNew}
      className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-200 transition"
      aria-label="Increase quantity"
    >
      <IoMdAdd size={18} className="text-gray-700" />
    </button>
  </div>

  {/* ✅ Total at right end */}
  <div className="text-gray-900 font-semibold tracking-tight text-sm">
    {totalFormatted}
  </div>

</div>
      </div>
    </div>
  );
};

export default ProductList;
