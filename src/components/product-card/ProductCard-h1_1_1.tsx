"use client";

import { useEffect, useMemo } from "react";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { ProductType } from "@/lib/types/productType";
import { addOnType } from "@/lib/types/addOnType";
import { cartProductType } from "@/lib/types/cartDataType";
import { formatCurrencyNumber } from "@/utils/formatCurrency";
import { useState } from "react";
import type { TnewModifierItemSchema } from "@/lib/types/modifierItemType";
import { useCartContext } from "@/store/CartContext";
import { usePosUi } from "@/PosUiStore/PosUiContext";
import { usePosSession } from "@/PosSessionStore/PosSessionContext";
import { useRouter } from 'next/navigation';
import { usePosTheme } from "@/PosThemeStore/PosThemeContext";
import { useToast } from '@/hooks/useToast';

 

export default function ProductCardHorizontical({
  product,
  variants,

  modifierGroups,
  productModifiers,
}: {
  product: ProductType;
  variants: ProductType[];
  allAddOns: addOnType[];
  modifierGroups: any[];
  productModifiers: any[];

}) {

  const router = useRouter();
  type ModifierItem = TnewModifierItemSchema & {
    id: string;
  };
  const { theme, background } = usePosTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductType | null>(null);

  const {
    activeTable,
    activeOrder,
  } = usePosSession();

  // =====================================================
  // CURRENT CART PARTITION
  // =====================================================

  const currentPartition =
    activeOrder?.orderType === 'DINE_IN'
      ? activeTable?.tableId ?? ''
      : activeOrder?.orderNo ?? '';

  const currentDisplayName =
    activeOrder?.orderType === 'DINE_IN'
      ? activeTable?.tableName ?? ''
      : activeOrder?.orderNo ?? '';

  const { addProductToCart } = useCartContext();

  const [selectedModifiers, setSelectedModifiers] = useState<{
    [groupId: string]: any[];
  }>({});


  const shouldOpenPopup =
    product.hasVariants || product.hasModifier;

  const {
    rightSidebarView,
    setRightSidebarView,
  } = usePosUi();


  const [simpleNoteOpen, setSimpleNoteOpen] = useState(false);
  //const [tableNo, setTableNo] = useState<string | null>(null);

  const [popupNote, setPopupNote] = useState("");
  const [quickNote, setQuickNote] = useState("");
const { showToast, toastComponent } = useToast();
  //  FILTER VARIANTS FOR THIS PRODUCT
  const productVariants = useMemo(() => {
    if (!product.hasVariants) return [];
    return variants
      .filter((v) => v.parentId === product.id)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [product.id, product.hasVariants, variants]);
  const [modifiersLoaded, setModifiersLoaded] = useState(false);

  const productGroupIds = useMemo(() => {
    return productModifiers
      .filter((pm) => pm.productId === product.id)
      .map((pm) => pm.groupId);
  }, [product.id, productModifiers]);

  const productModifierGroups = useMemo(() => {
    return modifierGroups.filter((g) =>
      productGroupIds.includes(g.id)
    );
  }, [modifierGroups, productGroupIds]);

  useEffect(() => {
    if (!productModifierGroups.length) return;

    console.log("🍕 Product:", product.name);
    console.log("🔥 FULL GROUPS:", productModifierGroups);
  }, [productModifierGroups]);



  useEffect(() => {
    if (isOpen) {
      setSelectedModifiers({});
      setPopupNote(""); // ✅ reset properly

      if (productVariants.length > 0) {
        setSelectedVariant(productVariants[0]);
      }
    }
  }, [isOpen]);

  // ---------------- PRICE ----------------


  const priceTarget =
    product.discountPrice && product.discountPrice > 0
      ? product.discountPrice
      : product.price ?? 0;



  const cartProduct: cartProductType = {

    id: 0,

    productId: product.id,
    productMode: product.productMode ?? 'raw_stock',
    currentStock: product.currentStock ?? 0,

    name: product.name,
    categoryId: product.categoryId,

    // FIX: always provide a string
    categoryName: product.productCat ?? '',


    parentId: product.parentId ?? null,
    isVariant: product.type === 'variant',
    discountEligible: product.discountEligible,
    basePrice: priceTarget,
    finalPrice: priceTarget,
    modifierTotal: 0,

    quantity: 1,

    taxRate: product.taxRate ?? 0,
    taxType: product.taxType ?? 'exclusive',

    // POS session
    sessionId: 'DEFAULT',



    // =====================================================
    // ORDER / TABLE
    // =====================================================

    tableId:
      currentPartition || null,

    tableName:
      currentDisplayName || null,

    // user snapshot
    createdById: '',
    createdByName: '',

    // kitchen note
    note: quickNote ?? '',

    // modifiers
    modifiersJson: JSON.stringify([]),

    // kitchen workflow
    sentToKitchen: false,
    kitchenPrintReq: true,
    printStatus: 'PENDING',

    createdAt: Date.now(),

    // existing UI fields still used by React cart
    uniqueKey:
      product.id.toString() +
      '_' +
      (quickNote?.trim() || ''),


    image: product.image,

    // FIX: if productCat in cartProductType is required, keep it a string too
    productCat: product.productCat ?? '',
  };

  // DEBUG: Check discount eligibility copied into cart
// console.log('========== PRODUCT CARD DEBUG ==========');
// console.log('Product name:', product.name);
// console.log(
//   'Original discountEligible:',
//   product.discountEligible,
//   typeof product.discountEligible
// );
// console.log(
//   'Cart discountEligible:',
//   cartProduct.discountEligible,
//   typeof cartProduct.discountEligible
// );
// console.log('========================================');

  const modifiersFlat = Object.values(selectedModifiers).flat();



  const uniqueKey =
    (selectedVariant?.id ?? product.id) +
    "_" +
    modifiersFlat.map((m) => m.id).sort().join("_") +
    "_" +
    (popupNote?.trim() || "");

  useEffect(() => {
    if (isOpen && productVariants.length > 0) {
      setSelectedVariant(productVariants[0]);
    }
  }, [isOpen, productVariants]);

  const selectedProduct = selectedVariant ?? product;

  const modifiersTotal = Object.values(selectedModifiers)
    .flat()
    .reduce((sum, item) => sum + (item.price ?? 0), 0);

  const basePrice = selectedProduct.price ?? 0;

  const finalPrice = basePrice + modifiersTotal;


  const isValidSelection = productModifierGroups.every((groupData) => {
    const selected = selectedModifiers[groupData.group.id] || [];

    return (
      selected.length >= groupData.group.minSelection &&
      selected.length <= groupData.group.maxSelection
    );
  });

  // ---------------- UI ----------------

  const handleAdd = () => {
    // =====================================================
    // NO ACTIVE ORDER
    // =====================================================

    if (!activeOrder) {
      showToast('Please select an order type first.');
      return;
    }

    // =====================================================
    // DINE IN REQUIRES TABLE
    // =====================================================

    if (
      activeOrder.orderType === 'DINE_IN' &&
      !activeTable?.tableId
    ) {
      router.push('/tables');
      return;
    }

    // =====================================================
    // TAKEAWAY / DELIVERY REQUIRE ORDER NUMBER
    // =====================================================

    if (
      activeOrder.orderType !== 'DINE_IN' &&
      !activeOrder.orderNo
    ) {
      showToast('Order number is not available yet.');
      return;
    }

    // =====================================================
    // ADD TO CART
    // =====================================================

    setRightSidebarView('cart');

    addProductToCart(cartProduct);
  };


  return (
    <>

      <button
        type="button"
        onClick={handleAdd}
        style={{
          borderColor: undefined,
        }}
        className={`
    group
    w-[160px]
    min-h-[90px]
    border
    ${background.border}
    p-4
    text-left
    shadow-sm
    hover:shadow-md
    active:scale-[0.99]
    transition-all
    duration-100
    flex
    flex-col
    justify-between
  `}
      >
        {/* Name */}
        <div className="flex flex-col items-start justify-between gap-3">
          <div className="flex gap-2 row-wrap">
            <h3 className="text-[10px]    leading-snug line-clamp-2">
              {product.name}
            </h3>
            <div className="text-[8px]">{product.searchCode}</div>
          </div>
          <p className="text-[10px]    leading-snug line-clamp-2">
            <span className="text-[7px]">Rs</span> {product.price}
          </p>

          {shouldOpenPopup && (
            <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap">
              Options
            </span>
          )}
        </div>

        {/* Description */}
        {/* {product.productDesc && (
        <p className="mt-1 text-xs text-slate-500 line-clamp-2">
          {product.productDesc}
        </p>
      )} */}

        {/* Footer */}
        {/* <div className="mt-3 flex items-end justify-between">
        <div className="flex items-baseline gap-1">
          {priceDiscounted ? (
            <>
              <span className="text-xl font-black text-slate-900">
                {priceDiscounted}
              </span>
              <span className="text-xs text-slate-400 line-through">
                {priceRegular}
              </span>
            </>
          ) : (
            <span className="text-lg font-black text-slate-900">
              {priceRegular}
            </span>
          )}
        </div>

       
      </div> */}
      </button>

      {/* KEEP YOUR EXISTING POPUPS BELOW THIS LINE */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-0 rounded-xl">
          {/* existing popup code */}
        </div>
      )}

      {simpleNoteOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          {/* existing note popup code */}
        </div>
      )}
        {toastComponent}
  </>
  );
}
