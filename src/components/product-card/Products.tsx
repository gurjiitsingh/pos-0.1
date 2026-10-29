"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import { UseSiteContext } from "@/SiteContext/SiteContext";
import { ProductType } from "@/lib/types/productType";
import { addOnType } from "@/lib/types/addOnType";
import { FAVORITES_CATEGORY_ID } from "../home/PosSidebarCategories";

import { FiSearch, FiX } from "react-icons/fi";
import { usePosSession } from "@/PosSessionStore/PosSessionContext";
import { useToast } from '@/hooks/useToast';

 

export default function Products() {
  const {
    productCategoryIdG,
    productToSearchQuery,
    setProductToSearchQuery,
    setAllProduct,
  } = UseSiteContext();

  const {
    activeTable,
    activeOrder,
    setActiveTable,
    setActiveOrder,
  } = usePosSession();

  // =====================================================
  // DEFAULT ORDER TYPE
  // =====================================================

  useEffect(() => {
    // Do not overwrite an existing order/session
    if (activeOrder) {
      return;
    }

    // Default POS order type
    setActiveOrder({
      orderType: "DINE_IN",
      orderNo: "",
      tableId: activeTable?.tableId ?? "",
      tableName: activeTable?.tableName ?? "",
    });
  }, [
    activeOrder,
    activeTable,
    setActiveOrder,
  ]);

  const [allProducts, setAllProducts] = useState<ProductType[]>([]);
  const [variants, setVariants] = useState<ProductType[]>([]);
  const [addOns] = useState<addOnType[]>([]);

  const [modifierGroups, setModifierGroups] = useState<any[]>([]);
  const [productModifiers, setProductModifiers] = useState<any[]>([]);
const { showToast, toastComponent } = useToast();
  // =====================================================
  // LOAD PRODUCTS FROM SQLITE
  // =====================================================

  useEffect(() => {
    async function loadProducts() {
      try {
        const data: ProductType[] =
          await window.posApi.getAllProducts();
          console.log("data---------------------",data)

        // Keep the same sorting
        const sorted = [...data].sort(
          (a, b) =>
            (a.sortOrder ?? 0) -
            (b.sortOrder ?? 0)
        );

        // SQLite uses parentId instead of type='variant'
        const parents = sorted.filter(
          (p) => !p.parentId
        );

        const childVariants = sorted.filter(
          (p) => !!p.parentId
        );

        setAllProducts(parents);
        setVariants(childVariants);
        setAllProduct(parents);
      } catch (err) {
        console.error(
          "Failed to load products from SQLite",
          err
        );
      }
    }

    loadProducts();
  }, [setAllProduct]);



  // =====================================================
  // FILTER PRODUCTS
  // =====================================================


 
const products = useMemo(() => {
  const query = productToSearchQuery?.trim().toLowerCase();

  if (query) {
    // Numeric input = exact search-code match only
    if (/^\d+$/.test(query)) {
      return allProducts.filter((p) => {
        const searchCode = String(p.searchCode ?? "").trim();
        return searchCode === query;
      });
    }

    // Text input = partial product-name match
    return allProducts.filter((p) => {
      const name = p.name?.toLowerCase() ?? "";
      const searchCode = String(p.searchCode ?? "")
        .trim()
        .toLowerCase();

      return name.includes(query) || searchCode === query;
    });
  }

  if (productCategoryIdG === FAVORITES_CATEGORY_ID) {
    return allProducts.filter((p) => p.favorite === true);
  }

  if (productCategoryIdG) {
    return allProducts.filter(
      (p) => p.categoryId === productCategoryIdG
    );
  }

  return allProducts.filter((p) => p.favorite === true);
}, [
  allProducts,
  productCategoryIdG,
  productToSearchQuery,
]);


 

  // =====================================================
  // LOAD MODIFIERS FROM SQLITE
  // =====================================================

  useEffect(() => {
    async function loadModifiers() {
      try {
        const [groupsData, mappingData] =
          await Promise.all([
            window.posApi.getModifierGroups(),
            window.posApi.getProductModifiers(),
          ]);

        setModifierGroups(groupsData);
        setProductModifiers(mappingData);
      } catch (err) {
        console.error(
          "Error loading modifiers from SQLite",
          err
        );
      }
    }

    loadModifiers();
  }, []);

  // =====================================================
  // CARD COMPONENT
  // =====================================================

  const cardType =
    process.env.NEXT_PUBLIC_PRODUCT_CARD_TYPE;

  const Card = useMemo(() => {
    switch (cardType) {
      // case "1":
      //   return dynamic(
      //     () =>
      //       import("../level-2/ProductCard-h1")
      //   );

      // case "11":
      //   return dynamic(
      //     () =>
      //       import("../level-2/ProductCard-h1_1")
      //   );

      case "111":
        return dynamic(
          () =>
            import(
              "./ProductCard-h1_1_1"
            )
        );

      // case "2":
      //   return dynamic(
      //     () =>
      //       import("../level-2/ProductCard-v2")
      //   );

      // default:
      //   return dynamic(
      //     () =>
      //       import("../level-2/ProductCard-h1")
      //   );
    }
  }, [cardType]);

  // =====================================================
  // CONTAINER CLASS
  // =====================================================

  let containerClass = "";

  switch (cardType) {
    case "1":
      containerClass =
        "flex flex-col justify-between md:flex-row md:flex-wrap";
      break;

    case "11":
      containerClass =
        "flex flex-col justify-between md:flex-row md:flex-wrap";
      break;

    case "12":
      containerClass =
        "flex flex-col justify-between md:flex-row md:flex-wrap";
      break;

    case "2":
    case "3":
      containerClass =
        "flex flex-col md:flex-row justify-between md:flex-wrap justify-center";
      break;

    default:
      containerClass = "flex flex-wrap";
  }

  // =====================================================
  // SEARCH HANDLERS
  // =====================================================

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProductToSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setProductToSearchQuery("");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
    <div className="w-full">
      {/* =================================================
    SEARCH + ORDER TYPE
================================================= */}

      <div
        className="
    sticky
    top-0
    z-20
    w-full
    px-2
    py-2
    bg-inherit
  "
      >
        <div
          className="
      flex
      items-center
      gap-2
      w-full
    "
        >

          {/* =============================================
        SEARCH
    ============================================= */}

          <div
            className="
        relative
        flex
        items-center
        flex-1
        h-11
        rounded-md
        border
        border-zinc-300
        dark:border-zinc-600
        bg-white
        dark:bg-zinc-800
      "
          >

            <FiSearch
              size={19}
              className="
          ml-3
          shrink-0
          text-zinc-400
        "
            />

            <input
              type="text"
              value={
                productToSearchQuery ?? ""
              }
              onChange={handleSearchChange}
              placeholder="Search product name or code..."
              className="
          flex-1
          h-full
          px-3
          text-sm
          outline-none
          bg-transparent
          text-zinc-800
          dark:text-white
          placeholder:text-zinc-400
        "
            />

            {productToSearchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                title="Clear search"
                className="
            mr-2
            p-1.5
            rounded
            text-zinc-400
            hover:text-zinc-700
            dark:hover:text-white
            hover:bg-zinc-100
            dark:hover:bg-zinc-700
            transition
          "
              >
                <FiX size={18} />
              </button>
            )}

          </div>


          {/* =============================================
        ORDER TYPE
    ============================================= */}

          <div
            className="
    flex
    h-11
    shrink-0
    overflow-hidden
    rounded-md
    border
    border-zinc-300
    dark:border-zinc-600
    bg-white
    dark:bg-zinc-800
  "
          >

            {/* DINE IN */}

            <button
              type="button"
              onClick={() => {

                setActiveOrder({
                  orderType: "DINE_IN",
                  orderNo: "",
                  tableId: activeTable!.tableId,
                  tableName: activeTable!.tableName,
                });

              }}
              className={`
      px-3
      text-[11px]
      font-semibold
      transition

      ${activeOrder?.orderType === "DINE_IN"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }
    `}
            >
              DINE IN
            </button>


            {/* TAKEAWAY */}

            <button
              type="button"
              onClick={async () => {

                try {

                  const orderNo =
                    await window.posApi.generateNextPosOrderNumber(
                      "TAKEAWAY"
                    );

                  setActiveTable({
                    tableId: orderNo,
                    tableName: orderNo,
                  });

                  setActiveOrder({
                    orderType: "TAKEAWAY",
                    orderNo,
                    tableId: orderNo,
                    tableName: orderNo,
                  });

                } catch (error) {

                  console.error(
                    "Failed to generate takeaway order number",
                    error
                  );

                  showToast(
                    "Failed to create takeaway order."
                  );
                }

              }}
              className={`
      px-3
      text-[11px]
      font-semibold
      transition

      border-l
      border-r
      border-zinc-300
      dark:border-zinc-600

      ${activeOrder?.orderType === "TAKEAWAY"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }
    `}
            >
              TAKEAWAY
            </button>


            {/* DELIVERY */}

            <button
              type="button"
              onClick={async () => {

                try {

                  const orderNo =
                    await window.posApi.generateNextPosOrderNumber(
                      "DELIVERY"
                    );

                  setActiveTable({
                    tableId: orderNo,
                    tableName: orderNo,
                  });

                  setActiveOrder({
                    orderType: "DELIVERY",
                    orderNo,
                    tableId: orderNo,
                    tableName: orderNo,
                  });

                } catch (error) {

                  console.error(
                    "Failed to generate delivery order number",
                    error
                  );

                  showToast(
                    "Failed to create delivery order."
                  );
                }

              }}
              className={`
      px-3
      text-[11px]
      font-semibold
      transition

      ${activeOrder?.orderType === "DELIVERY"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }
    `}
            >
              DELIVERY
            </button>

          </div>

        </div>
      </div>

      {/* =================================================
          PRODUCTS
      ================================================= */}

      {Card && (
        <div className="flex flex-wrap ml-2">
          {products.map((product, i) => (
            <Card
              key={
                product.id ??
                `${product.name}-${i}`
              }
              product={product}
              variants={variants}
              allAddOns={addOns}
              modifierGroups={modifierGroups}
              productModifiers={productModifiers}
            />
          ))}
        </div>
      )}

      {/* =================================================
          NO RESULTS
      ================================================= */}

      {products.length === 0 &&
        productToSearchQuery?.trim() && (
          <div
            className="
              flex
              items-center
              justify-center
              py-10
              text-sm
              text-zinc-500
            "
          >
            No products found
          </div>
        )}
    </div>
        {toastComponent}
  </>
  );
}