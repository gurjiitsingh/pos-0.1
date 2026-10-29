'use client';

import React, { useEffect, useState } from 'react';
import CartContext from './CartContext';
import { posApi } from '@/lib/pos/clientApi';


import { addressT } from '@/lib/types/addressType';
import { cartProductType } from '@/lib/types/cartDataType';
import { usePosSession } from '@/PosSessionStore/PosSessionContext';

type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

interface Props {
  children: React.ReactNode;
}

export const CartProvider: React.FC<Props> = ({ children }) => {
  const [cartData, setCartData] = useState<cartProductType[]>([]);

  // const [orderType, setOrderType] =
  //   useState<OrderType>('DINE_IN');

  const [address, setAddress] = useState<addressT>({
    name: '',
    mobNo: '',
    city: '',
    state: '',
    zipCode: '',
    addressLine1: '',
    addressLine2: '',
    userId: '',
  });

  const [counter, setCounter] = useState(0);

  const [endTotalG, setEndTotalL] = useState(0);

  const [productTotalCost, setProductTotalCost] =
    useState(0);

  const [totalDiscountG, setTotalDiscountL] =
    useState(0);

  const [scheduledAt, setScheduledAt] = useState<
    string | null
  >(null);
  const {
    activeTable,
    activeOrder,
  } = usePosSession();


  // =====================================================
  // LOAD CART FROM SQLITE
  // =====================================================


  const currentPartition =
    activeOrder?.orderType === 'DINE_IN'
      ? (
        activeTable?.tableId ||
        activeTable?.tableName ||
        ''
      )
      : (
        activeOrder?.orderNo ||
        ''
      );

  useEffect(() => {
    if (!currentPartition) {
      setCartData([]);
      return;
    }

    reloadCart(currentPartition);
  }, [currentPartition]);
  // =====================================================
  // RELOAD CART FROM SQLITE
  // Location: src/store/CartProvider.tsx
  // =====================================================


  async function reloadCart(
    partition?: string
  ) {
    const key =
      partition || currentPartition;

    if (!key) {
      setCartData([]);
      return;
    }

    const rows =
      await posApi.getCartItems(key);
      console.log("row cartitems------------------",rows)

    setCartData(
      rows as cartProductType[]
    );
  }
  // =====================================================
  // CALCULATE TOTALS
  // =====================================================

  useEffect(() => {
    cartTotal();
  }, [cartData]);

  function cartTotal() {
    let total = 0;

    cartData.forEach((item, idx) => {
      const quantity = Number(item.quantity);
      const basePrice = Number(item.basePrice);

      if (isNaN(quantity) || isNaN(basePrice)) {
        console.warn(
          `Skipping bad cart item at index \${idx}`,
          item
        );

        return;
      }

      total += quantity * basePrice;
    });

    setProductTotalCost(
      parseFloat(total.toFixed(2))
    );
  }

  // =====================================================
  // ADD PRODUCT
  // =====================================================

  async function addProductToCart(
    newProduct: cartProductType
  ) {

    //     console.log('========== CART CONTEXT RECEIVED ==========');
    // console.log('Product name:', newProduct.name);
    // console.log(
    //   'discountEligible:',
    //   newProduct.discountEligible,
    //   typeof newProduct.discountEligible
    // );
    // console.log('Full product:', newProduct);
    // console.log('===========================================');

    if (!activeOrder) {
      console.warn(
        'Cannot add product: no active order'
      );

      return;
    }

    if (
      activeOrder.orderType === 'DINE_IN' &&
      !activeTable?.tableId
    ) {
      console.warn(
        'Cannot add product: no table selected'
      );

      return;
    }

    if (
      isNaN(Number(newProduct.quantity)) ||
      isNaN(Number(newProduct.basePrice))
    ) {
      console.warn(
        'Invalid product data, skipping:',
        newProduct
      );

      return;
    }

    await posApi.addCartItem(
      {
        id: newProduct.id ?? 0,

        productId: newProduct.productId,
        productMode: newProduct.productMode,

        currentStock: newProduct.currentStock ?? 0,

        name: newProduct.name,

        categoryId: newProduct.categoryId,
        categoryName: newProduct.categoryName,

        parentId: newProduct.parentId ?? null,
        discountEligible: newProduct.discountEligible,
        isVariant: newProduct.isVariant ?? false,

        basePrice: Number(newProduct.basePrice),
        finalPrice: Number(newProduct.finalPrice),
        modifierTotal: Number(newProduct.modifierTotal ?? 0),

        quantity: 1,

        taxRate: Number(newProduct.taxRate ?? 0),
        taxType: newProduct.taxType ?? 'exclusive',

        sessionId: newProduct.sessionId ?? 'DEFAULT',

        // ACTIVE TABLE
        tableId:
          activeOrder.orderType === 'DINE_IN'
            ? (
              newProduct.tableId ??
              activeTable?.tableId ??
              ''
            )
            : activeOrder.orderNo,

        tableName:
          activeOrder.orderType === 'DINE_IN'
            ? (
              newProduct.tableName ??
              activeTable?.tableName ??
              ''
            )
            : activeOrder.orderNo,

        createdById:
          newProduct.createdById ?? '',

        createdByName:
          newProduct.createdByName ?? '',

        note: newProduct.note ?? '',

        modifiersJson:
          newProduct.modifiersJson ??
          JSON.stringify(
            newProduct.modifiers ?? []
          ),

        sentToKitchen:
          newProduct.sentToKitchen ?? false,

        kitchenPrintReq:
          newProduct.kitchenPrintReq ?? true,

        printStatus:
          newProduct.printStatus ?? 'PENDING',

        createdAt:
          newProduct.createdAt ?? Date.now(),
      },

      // SQLITE PARTITION KEY
      currentPartition
    );

    await reloadCart(currentPartition);



  }

  // =====================================================
  // UPDATE CART ITEM NOTE
  // =====================================================

  async function updateCartItemNote(
    itemId: number,
    note: string
  ) {
    const table =
      activeTable?.tableId ||
      activeTable?.tableName ||
      'T1';

    await posApi.updateCartItemNote(
      itemId,
      note,
      table
    );

    await reloadCart(table);

  }
  // =====================================================
  // DECREASE QUANTITY BY 1
  // =====================================================

  async function decCartProduct(
    item: cartProductType
  ) {
    if (!currentPartition) {
      return;
    }

    await posApi.removeCartItem(
      String(item.id),
      currentPartition,
      false
    );

    await reloadCart(currentPartition);
  }

  // =====================================================
  // REMOVE ALL OF A PRODUCT LINE
  // =====================================================

  async function decCartProductAll(
    item: cartProductType
  ) {
    if (!item.uniqueKey) return;

    if (!currentPartition) {
      return;
    }

    await posApi.removeCartItem(
      item.uniqueKey,
      currentPartition,
      true
    );

    await reloadCart(currentPartition);
  }
  // =====================================================
  // REMOVE PRODUCT
  // =====================================================

  async function removeCartProduct(
    item: cartProductType | undefined
  ) {
    if (!item?.uniqueKey) return;

    if (!currentPartition) {
      return;
    }

    await posApi.removeCartItem(
      item.uniqueKey,
      currentPartition
    );

    await reloadCart(currentPartition);
  }

  // =====================================================
  // EMPTY CART
  // =====================================================

  async function emptyCart() {
    if (!currentPartition) {
      return;
    }

    await posApi.clearCart(
      currentPartition
    );

    await reloadCart(
      currentPartition
    );
  }

  // =====================================================
  // ADD PRODUCT (LEGACY HELPER)
  // =====================================================


  async function addProduct(
    newProduct: cartProductType
  ) {
    console.log(
      '========== ADD PRODUCT TO CART DEBUG =========='
    );

    console.log('Product ID:', newProduct.productId);
    console.log('Product name:', newProduct.name);
    console.log(
      'discountEligible:',
      newProduct.discountEligible
    );
    console.log(
      'discountEligible type:',
      typeof newProduct.discountEligible
    );
    console.log('Full product:', newProduct);

    const cartProduct = {
      ...newProduct,
      quantity: 1,
    };

    console.log(
      'Product passed to addProductToCart:',
      cartProduct
    );
    console.log(
      'discountEligible passed to cart:',
      cartProduct.discountEligible
    );

    await addProductToCart(cartProduct);

    console.log(
      '========== ADD PRODUCT DEBUG END =========='
    );
  }


  // =====================================================
  // ADDRESS
  // =====================================================

  function addAddress(address: addressT) {
    setAddress(address);
  }

  // =====================================================
  // TOTALS
  // =====================================================

  function setEndTotalG(t: number) {
    setEndTotalL(t);
  }

  function setTotalDiscountG(d: number) {
    setTotalDiscountL(d);
  }


  return (
    <CartContext.Provider
      value={{
        cartData,
        setCartData,

        address,
        addProduct,
        addAddress,

        endTotalG,
        setEndTotalG,

        counter,
        productTotalCost,

        reloadCart,

        updateCartItemNote,

        addProductToCart,
        decCartProduct,
        decCartProductAll,
        removeCartProduct,
        emptyCart,

        totalDiscountG,
        setTotalDiscountG,

        orderType:
          activeOrder?.orderType ?? 'DINE_IN',

        setOrderType: () => { },

        tableNo:
          currentPartition || null,

        setTableNo: () => { },

        scheduledAt,
        setScheduledAt,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}