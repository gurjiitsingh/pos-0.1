"use client";

import { useEffect, useState } from "react";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { usePosTheme } from "@/PosThemeStore/PosThemeContext";
import { FaStar } from "react-icons/fa";

export type CategoryType = {
  id: string;
  name: string;
  desc?: string;
  productDesc?: string;
  slug?: string;
  image?: string;
  isFeatured?: boolean | string;
  sortOrder?: number;
  disablePickupDiscount?: boolean;
};

// =====================================================
// SPECIAL POS CATEGORY
// =====================================================

export const FAVORITES_CATEGORY_ID = "__FAVORITES__";

export default function PosSidebarCategories() {
  const [categoryData, setCategoryData] = useState<CategoryType[]>([]);
  const [displayCategory, setDisplayCategory] =
    useState<string | null>(null);

  const {
    productCategoryIdG,
    setProductCategoryIdG,
    setProductToSearchQuery,
 
    
  } = UseSiteContext();

  // =====================================================
  // POS THEME
  // =====================================================

  const { theme, background } = usePosTheme();

  // =====================================================
  // DISPLAY CATEGORY
  // =====================================================

  useEffect(() => {
    // No category selected yet
    // Default to FAVORITES
    if (!productCategoryIdG) {
      setDisplayCategory(FAVORITES_CATEGORY_ID);
    } else {
      setDisplayCategory(productCategoryIdG);
    }
  }, [productCategoryIdG]);

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const categories: CategoryType[] =
          await window.posApi.getAllCategories();

        if (!isMounted) return;

        categories.sort(
          (a, b) =>
            Number(a.sortOrder ?? 0) -
            Number(b.sortOrder ?? 0)
        );

        // Keep your existing featured-category behavior
        const featured = categories.filter(
          (c) => c.isFeatured !== "no"
        );

        setCategoryData(featured);

        // Pickup discount disabled categories
        const pickupDisabled = categories
          .filter(
            (c) => c.disablePickupDiscount === true
          )
          .map((c) => c.id);

     
      } catch (error) {
        console.error(
          "SQLite category load error:",
          error
        );
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);
 
  // =====================================================
  // CATEGORY BUTTON
  // =====================================================

  const renderCategoryButton = (
    id: string,
    name: string,
    favorite = false
  ) => {
    const active = displayCategory === id;

    return (
      <button
        key={id}
        type="button"
        onClick={() => {
          setProductToSearchQuery("");
          setProductCategoryIdG(id);
          setDisplayCategory(id);
        }}
        className={`
          w-full
          h-11
          px-3
          mb-1
          flex
          items-center
          gap-2
          text-left
          text-sm
          rounded-xl
          border 
           ${background.categorySidebarBg}
          ${background.categorySidebarBorder}
          transition-all
          duration-100
          outline-none

          ${
            active
              ? "text-white"
              : `
                  ${background.categorySidebarText}
                  ${background.categorySidebarHover}
                  opacity-60
                `
          }
        `}
        style={
          active
            ? {
                backgroundColor: theme.primary,
                borderColor: theme.primary,
              }
            : undefined
        }
      >
        {favorite && (
          <FaStar
            size={14}
            className="shrink-0"
          />
        )}

        <span
          className="
            text-[12px]
            font-medium
            truncate
          "
        >
          {name}
        </span>
      </button>
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <aside
      className={`
        h-full
        w-full
       
        ${background.categorySidebarText}
        flex
        flex-col
      `}
    >
      <div
        className="
          pos-sidebar-scroll
          flex-1
          overflow-y-auto
          app-scrollbar
          py-2
        "
      >
        {/* =================================================
            FAVORITES
        ================================================= */}

        {renderCategoryButton(
          FAVORITES_CATEGORY_ID,
          "Favorites",
          true
        )}

        {/* =================================================
            NORMAL CATEGORIES
        ================================================= */}

        {categoryData.map((cat) =>
          renderCategoryButton(
            cat.id,
            cat.name
          )
        )}
      </div>
    </aside>
  );
}