'use client';

import PosSidebarCategories from "@/components/home/PosSidebarCategories";
import Products from "@/components/product-card/Products";
import RightSideBar from "@/components/rightSideBar/RightSidebar";
import { usePosTheme } from "@/PosThemeStore/PosThemeContext";

export default function Page() {

  const { background } = usePosTheme();
  

  return (
    <div
      className={`
        h-full
        flex
        flex-col
        overflow-hidden
        ${background.className}
        ${background.text}
      `}
    >

      <div
        className={`
          flex
          flex-1
          min-h-0
          overflow-hidden
          p-0
          m-0
          ${background.className}
          ${background.text}
        `}
      >

        {/* LEFT SIDEBAR */}
        <aside
          className={`
            w-[250px]
            shrink-0
            overflow-y-auto
            border-r
            ${background.border}
            ${background.className}
          `}
        >
          <PosSidebarCategories />
        </aside>


        {/* PRODUCTS */}
        <section
          className={`
            min-w-0
            flex-1
            overflow-y-auto
            mx-0
            px-0
            app-scrollbar
            ${background.className}
          `}
        >
          <Products />
        </section>


        {/* RIGHT SIDEBAR */}
        <aside
          className={`
           
            xl:flex
            w-[440px]
            shrink-0
            overflow-y-auto
            border-l
            ${background.border}
            ${background.className}
          `}
        >
          <RightSideBar />
        </aside>

      </div>

    </div>
  );
}