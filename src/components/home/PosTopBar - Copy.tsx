"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { usePosUi } from "@/PosUiStore/PosUiContext";
import { usePosTheme } from "@/PosThemeStore/PosThemeContext";

export default function PosTopBar() {
const pathname = usePathname();

const {
theme,
background,
} = usePosTheme();

const handleMenuClick = () => {
window.dispatchEvent(
new CustomEvent("pos-toggle-sidebar")
);
};

const isPOS = pathname === "/";
const isKOT = pathname.startsWith("/kot");
const isOrders = pathname.startsWith("/orders");
const isTables = pathname.startsWith("/tables");
const isPrinter = pathname.startsWith("/settings/printer");

const isSettings =
pathname === "/settings" ||
pathname.startsWith("/settings/");

const {
rightSidebarView,
setRightSidebarView,
} = usePosUi();

// =====================================================
// NAV BUTTON CLASS
// =====================================================

const navButtonClass = (active: boolean) =>
`      px-4
      py-1.5
      rounded-lg
      text-xs
      font-semibold
      transition-all
      border
      ${
        active
          ? ""
          :`${background.border} hover:opacity-90`       }
    `;

// =====================================================
// SIDEBAR BUTTON CLASS
// =====================================================

const sidebarButtonClass = `rounded-lg
    border
    px-3
    py-2
    text-sm
    font-medium
    transition-all
    active:scale-[0.97]
  `;

return (
<header
className={`         h-[60px]
        shrink-0
        flex
        items-center
        px-3
        relative
        z-[100]
        ${background.className}
        ${background.text}
        border-b
      `}
style={{
borderColor: theme.primaryLight,
}}
> <div className="w-full flex justify-between items-center">

 
    {/* ================================================= */}
    {/* LEFT SIDE */}
    {/* ================================================= */}

    <div className="flex gap-3 items-center">

      {/* ================================================= */}
      {/* BURGER */}
      {/* ================================================= */}

      <button
        type="button"
        onClick={handleMenuClick}
        className="
          w-10
          h-10
          flex
          items-center
          justify-center
          rounded-lg
          border
          transition-all
          active:scale-95
          hover:opacity-90
        "
       style={{
          backgroundColor: theme.inactive,
          borderColor: "#aaa",
        }}
        aria-label="Open menu"
      >
        <Menu size={21} />
      </button>

      {/* ================================================= */}
      {/* TITLE */}
      {/* ================================================= */}

      <div className="ml-3 mr-5">
        <div
          className="
            text-sm
            font-semibold
          "
          style={{
            color: theme.inactive,
          }}
        >
          IT10x
        </div>
      </div>

      {/* ================================================= */}
      {/* MAIN NAVIGATION */}
      {/* ================================================= */}

      <div
        className="
          flex
          items-center
          gap-1
          p-1
          rounded-xl
          border
        "
        style={{
          backgroundColor: theme.primaryLight,
          borderColor: theme.primarySelected,
        }}
      >

        {/* ================================================= */}
        {/* POS */}
        {/* ================================================= */}

        <Link
          href="/"
          className={navButtonClass(isPOS)}
          style={{
            backgroundColor: isPOS
              ? theme.primary
              : theme.inactive,

            borderColor: isPOS
              ? theme.primary
              : theme.primarySelected,

            color: isPOS
              ? "#FFFFFF"
              : "#EEEEEE",
          }}
          onMouseEnter={(e) => {
            if (!isPOS) {
              e.currentTarget.style.backgroundColor =
                theme.primaryHover;

              e.currentTarget.style.borderColor =
                theme.primary;

              e.currentTarget.style.color =
                "#FFFFFF";
            }
          }}
          onMouseLeave={(e) => {
            if (!isPOS) {
              e.currentTarget.style.backgroundColor =
                theme.inactive;

              e.currentTarget.style.borderColor =
                theme.primarySelected;

              e.currentTarget.style.color =
                "#EEEEEE";
            }
          }}
        >
          POS
        </Link>

        {/* ================================================= */}
        {/* KOT */}
        {/* ================================================= */}

        <Link
          href="/kot"
          className={navButtonClass(isKOT)}
          style={{
            backgroundColor: isKOT
              ? theme.primary
              : theme.inactive,

            borderColor: isKOT
              ? theme.primary
              : theme.primarySelected,

            color: isKOT
              ? "#FFFFFF"
              : "#EEEEEE",
          }}
          onMouseEnter={(e) => {
            if (!isKOT) {
              e.currentTarget.style.backgroundColor =
                theme.primaryHover;

              e.currentTarget.style.borderColor =
                theme.primary;

              e.currentTarget.style.color =
                "#FFFFFF";
            }
          }}
          onMouseLeave={(e) => {
            if (!isKOT) {
              e.currentTarget.style.backgroundColor =
                theme.inactive;

              e.currentTarget.style.borderColor =
                theme.primarySelected;

              e.currentTarget.style.color =
                "#EEEEEE";
            }
          }}
        >
          KOT
        </Link>

        {/* ================================================= */}
        {/* ORDERS */}
        {/* ================================================= */}

        <Link
          href="/orders"
          className={navButtonClass(isOrders)}
          style={{
            backgroundColor: isOrders
              ? theme.primary
              : theme.inactive,

            borderColor: isOrders
              ? theme.primary
              : theme.primarySelected,

            color: isOrders
              ? "#FFFFFF"
              : "#EEEEEE",
          }}
          onMouseEnter={(e) => {
            if (!isOrders) {
              e.currentTarget.style.backgroundColor =
                theme.primaryHover;

              e.currentTarget.style.borderColor =
                theme.primary;

              e.currentTarget.style.color =
                "#FFFFFF";
            }
          }}
          onMouseLeave={(e) => {
            if (!isOrders) {
              e.currentTarget.style.backgroundColor =
                theme.inactive;

              e.currentTarget.style.borderColor =
                theme.primarySelected;

              e.currentTarget.style.color =
                "#EEEEEE";
            }
          }}
        >
          ORDERS
        </Link>

        {/* ================================================= */}
        {/* TABLES */}
        {/* ================================================= */}

        <Link
          href="/tables"
          className={navButtonClass(isTables)}
          style={{
            backgroundColor: isTables
              ? theme.primary
              : theme.inactive,

            borderColor: isTables
              ? theme.primary
              : theme.primarySelected,

            color: isTables
              ? "#FFFFFF"
              : "#EEEEEE",
          }}
          onMouseEnter={(e) => {
            if (!isTables) {
              e.currentTarget.style.backgroundColor =
                theme.primaryHover;

              e.currentTarget.style.borderColor =
                theme.primary;

              e.currentTarget.style.color =
                "#FFFFFF";
            }
          }}
          onMouseLeave={(e) => {
            if (!isTables) {
              e.currentTarget.style.backgroundColor =
                theme.inactive;

              e.currentTarget.style.borderColor =
                theme.primarySelected;

              e.currentTarget.style.color =
                "#EEEEEE";
            }
          }}
        >
          TABLES
        </Link>

        {/* ================================================= */}
        {/* PRINTER */}
        {/* ================================================= */}

        <Link
          href="/settings/printers"
          className={navButtonClass(isPrinter)}
          style={{
            backgroundColor: isPrinter
              ? theme.primary
              : theme.inactive,

            borderColor: isPrinter
              ? theme.primary
              : theme.primarySelected,

            color: isPrinter
              ? "#FFFFFF"
              : "#EEEEEE",
          }}
          onMouseEnter={(e) => {
            if (!isPrinter) {
              e.currentTarget.style.backgroundColor =
                theme.primaryHover;

              e.currentTarget.style.borderColor =
                theme.primary;

              e.currentTarget.style.color =
                "#FFFFFF";
            }
          }}
          onMouseLeave={(e) => {
            if (!isPrinter) {
              e.currentTarget.style.backgroundColor =
                theme.inactive;

              e.currentTarget.style.borderColor =
                theme.primarySelected;

              e.currentTarget.style.color =
                "#EEEEEE";
            }
          }}
        >
          Printer
        </Link>

        {/* ================================================= */}
        {/* SETTINGS */}
        {/* ================================================= */}

        <Link
          href="/settings"
          className={navButtonClass(isSettings)}
          style={{
            backgroundColor: isSettings
              ? theme.primary
              : theme.inactive,

            borderColor: isSettings
              ? theme.primary
              : theme.primarySelected,

            color: isSettings
              ? "#FFFFFF"
              : "#EEEEEE",
          }}
          onMouseEnter={(e) => {
            if (!isSettings) {
              e.currentTarget.style.backgroundColor =
                theme.primaryHover;

              e.currentTarget.style.borderColor =
                theme.primary;

              e.currentTarget.style.color =
                "#FFFFFF";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSettings) {
              e.currentTarget.style.backgroundColor =
                theme.inactive;

              e.currentTarget.style.borderColor =
                theme.primarySelected;

              e.currentTarget.style.color =
                "#EEEEEE";
            }
          }}
        >
          Settings
        </Link>

      </div>
    </div>

    {/* ================================================= */}
    {/* RIGHT SIDEBAR SWITCH */}
    {/* ================================================= */}

    <div className="shrink-0 p-2">
      <div className="grid grid-cols-3 gap-2">

        {/* ================================================= */}
        {/* CART */}
        {/* ================================================= */}

        <button
          type="button"
          onClick={() =>
            setRightSidebarView("cart")
          }
          className={sidebarButtonClass}
          style={{
            backgroundColor:
              rightSidebarView === "cart"
                ? theme.primary
                : theme.inactive,

            borderColor:
              rightSidebarView === "cart"
                ? theme.primary
                : theme.primarySelected,

            color:
              rightSidebarView === "cart"
                ? "#FFFFFF"
                : "#EEEEEE",
          }}
          onMouseEnter={(e) => {
            if (rightSidebarView !== "cart") {
              e.currentTarget.style.backgroundColor =
                theme.primaryHover;

              e.currentTarget.style.borderColor =
                theme.primary;

              e.currentTarget.style.color =
                "#FFFFFF";
            }
          }}
          onMouseLeave={(e) => {
            if (rightSidebarView !== "cart") {
              e.currentTarget.style.backgroundColor =
                theme.inactive;

              e.currentTarget.style.borderColor =
                theme.primarySelected;

              e.currentTarget.style.color =
                "#EEEEEE";
            }
          }}
        >
          🛒 Cart
        </button>

        {/* ================================================= */}
        {/* BILL */}
        {/* ================================================= */}

        <button
          type="button"
          onClick={() =>
            setRightSidebarView("bill")
          }
          className={sidebarButtonClass}
          style={{
            backgroundColor:
              rightSidebarView === "bill"
                ? theme.primary
                : theme.inactive,

            borderColor:
              rightSidebarView === "bill"
                ? theme.primary
                : theme.primarySelected,

            color:
              rightSidebarView === "bill"
                ? "#FFFFFF"
                : "#EEEEEE",
          }}
          onMouseEnter={(e) => {
            if (rightSidebarView !== "bill") {
              e.currentTarget.style.backgroundColor =
                theme.primaryHover;

              e.currentTarget.style.borderColor =
                theme.primary;

              e.currentTarget.style.color =
                "#FFFFFF";
            }
          }}
          onMouseLeave={(e) => {
            if (rightSidebarView !== "bill") {
              e.currentTarget.style.backgroundColor =
                theme.inactive;

              e.currentTarget.style.borderColor =
                theme.primarySelected;

              e.currentTarget.style.color =
                "#EEEEEE";
            }
          }}
        >
          🧾 Bill
        </button>

        {/* ================================================= */}
        {/* KITCHEN */}
        {/* ================================================= */}

        <button
          type="button"
          onClick={() =>
            setRightSidebarView("kitchen")
          }
          className={sidebarButtonClass}
          style={{
            backgroundColor:
              rightSidebarView === "kitchen"
                ? theme.primary
                : theme.inactive,

            borderColor:
              rightSidebarView === "kitchen"
                ? theme.primary
                : theme.primarySelected,

            color:
              rightSidebarView === "kitchen"
                ? "#FFFFFF"
                : "#EEEEEE",
          }}
          onMouseEnter={(e) => {
            if (rightSidebarView !== "kitchen") {
              e.currentTarget.style.backgroundColor =
                theme.primaryHover;

              e.currentTarget.style.borderColor =
                theme.primary;

              e.currentTarget.style.color =
                "#FFFFFF";
            }
          }}
          onMouseLeave={(e) => {
            if (rightSidebarView !== "kitchen") {
              e.currentTarget.style.backgroundColor =
                theme.inactive;

              e.currentTarget.style.borderColor =
                theme.primarySelected;

              e.currentTarget.style.color =
                "#EEEEEE";
            }
          }}
        >
          🍳 Kitchen
        </button>

      </div>
    </div>

  </div>
 
 

  </header>
);
}
