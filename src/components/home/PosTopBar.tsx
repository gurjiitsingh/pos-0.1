"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";

import { usePosUi } from "@/PosUiStore/PosUiContext";
import { usePosTheme } from "@/PosThemeStore/PosThemeContext";
import { UseSiteContext } from "@/SiteContext/SiteContext";

export default function PosTopBar() {
  const pathname = usePathname();

  const {
    theme,
    background,
  } = usePosTheme();

  const {
    open,
    sideBarToggle,
  } = UseSiteContext();

  const handleMenuClick = () => {
    sideBarToggle(true);

    window.dispatchEvent(
      new CustomEvent("pos-toggle-sidebar")
    );
  };

  const isPOS = pathname === "/";
  const isKOT = pathname.startsWith("/kot");
  const isOrders = pathname.startsWith("/orders");
  const isTables = pathname.startsWith("/tables");
  const isPrinter = pathname.startsWith("/settings/printers");

  const isSettings =
    pathname === "/settings" ||
    pathname.startsWith("/settings/");

  const {
    rightSidebarView,
    setRightSidebarView,
  } = usePosUi();

  const router = useRouter();

  // =====================================================
  // NAV BUTTON CLASS
  // =====================================================

  const navButtonClass = (active: boolean) =>
    `
      px-4
      py-1.5
      rounded-lg
      text-xs
      font-semibold
      transition-all
      border
      ${
        active
          ? ""
          : `${background.border} hover:opacity-90`
      }
    `;

  // =====================================================
  // RIGHT SIDEBAR BUTTON CLASS
  // =====================================================

  const rightSidebarButtonClass = `
    rounded-lg
    border
    px-1.5
    py-2.5
    text-xs
     min-w-20
    text-center
    font-medium
    leading-none
    whitespace-nowrap
    transition-all
    active:scale-[0.97]
  `;

  // =====================================================
  // SIDEBAR BUTTON CLASS
  // =====================================================

  const sidebarButtonClass = `
    rounded-lg
    border
    px-1.5
    py-2.5
    text-xs
    min-w-17
    text-center
    font-medium
    leading-none
    transition-all
    active:scale-[0.97]
  `;

  return (
    <header
      className={`
        h-[55px]
        shrink-0
        flex
        items-center
        px-3
        relative
        z-[100]

        ${background.topbarBg}
        ${background.topbarText}

      
      `}
      style={{
        borderColor: background.topbarBorder,
      }}
    >
      <div className="w-full flex justify-between items-center">

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
              borderColor: background.topbarBorder,
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

          {/* ================================================= */}
          {/* POS */}
          {/* ================================================= */}

          <Link
            href="/"
            className={sidebarButtonClass}
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
          {/* ORDERS */}
          {/* ================================================= */}

          <Link
            href="/orders"
            className={sidebarButtonClass}
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
            className={sidebarButtonClass}
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

        </div>

        {/* ================================================= */}
        {/* RIGHT SIDE SWITCH */}
        {/* ================================================= */}

        <div className="shrink-0">
          <div className="grid grid-cols-4 gap-2">

            {/* ================================================= */}
            {/* CART */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={() => {
                setRightSidebarView("cart");
                router.push("/");
              }}
              className={rightSidebarButtonClass}
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
              🛒 CART
            </button>

            {/* ================================================= */}
            {/* BILL */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={() => {
                setRightSidebarView("bill");
                router.push("/");
              }}
              className={rightSidebarButtonClass}
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
              onClick={() => {
                setRightSidebarView("kitchen");
                router.push("/");
              }}
              className={rightSidebarButtonClass}
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
              🍳KOTs
            </button>

            {/* ================================================= */}
            {/* RUNNING ORDER */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={() => {
                setRightSidebarView("RO");
                router.push("/");
              }}
              className={rightSidebarButtonClass}
              style={{
                backgroundColor:
                  rightSidebarView === "RO"
                    ? theme.primary
                    : theme.inactive,

                borderColor:
                  rightSidebarView === "RO"
                    ? theme.primary
                    : theme.primarySelected,

                color:
                  rightSidebarView === "RO"
                    ? "#FFFFFF"
                    : "#EEEEEE",
              }}
              onMouseEnter={(e) => {
                if (rightSidebarView !== "RO") {
                  e.currentTarget.style.backgroundColor =
                    theme.primaryHover;

                  e.currentTarget.style.borderColor =
                    theme.primary;

                  e.currentTarget.style.color =
                    "#FFFFFF";
                }
              }}
              onMouseLeave={(e) => {
                if (rightSidebarView !== "RO") {
                  e.currentTarget.style.backgroundColor =
                    theme.inactive;

                  e.currentTarget.style.borderColor =
                    theme.primarySelected;

                  e.currentTarget.style.color =
                    "#EEEEEE";
                }
              }}
            >
            TW/DL
            </button>

          </div>
        </div>

      </div>
    </header>
  );
}