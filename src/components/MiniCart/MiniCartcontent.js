 
  "use client";

import React, { useContext, useEffect } from "react";
import ProductList from "@/components/MiniCart/productList";
import CartContext from "@/store/CartContext";

const MiniCartContent = () => {
  const { cartData } = useContext(CartContext);

  useEffect(() => {
    // console.log("in cart content", cartData);
  }, [cartData]);

  return (
    <div className="flex flex-col gap-2">
      <div className="max-h-[400px] overflow-y-auto pr-1">
        {cartData.map((item, i) => (
          <div
            key={i}
            className="p-2 rounded-lg border border-gray-100 shadow-sm hover:shadow-md bg-white mb-2 transition-all"
          >
            <ProductList item={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniCartContent;
