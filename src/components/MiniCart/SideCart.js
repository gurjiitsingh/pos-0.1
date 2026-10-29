"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useClickAway } from "react-use";
import {
  IoClose,
  IoReceiptOutline,
  IoGlobeOutline,
  IoDocumentTextOutline,
  IoSwapHorizontalOutline,
  IoTimeOutline,
  IoBarChartOutline,
  IoPeopleOutline,
  IoSyncOutline,
  IoSettingsOutline,
  IoColorPaletteOutline,
  IoPrintOutline,
} from "react-icons/io5";
import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

import { UseSiteContext } from "@/SiteContext/SiteContext";
import { usePosTheme } from "@/PosThemeStore/PosThemeContext";
import { usePosAuth } from "@/store/PosAuthContext";

const framerSidebarPanel = {
  initial: {
    x: "-100%",
  },

  animate: {
    x: 0,
  },

  exit: {
    x: "-100%",
  },

  transition: {
    duration: 0.25,
    ease: "easeOut",
  },
};

export const SideCart = () => {
  const pathname = usePathname();

  

  const {
  open,
  sideBarToggle,
} = UseSiteContext();

useEffect(() => {
  if (open) {
    sideBarToggle();
  }
}, [pathname]);

  const {
    theme,
    background,
  } = usePosTheme();

  const {
    logout,
  } = usePosAuth();

  const ref = useRef(null);

  useClickAway(ref, () => {
    if (open) {
      sideBarToggle();
    }
  });

  const handleLogout = async () => {
    try {
      sideBarToggle();
      logout();
    } catch (error) {
      console.error("POS logout failed:", error);
    }
  };

  // =====================================================
  // CLOSE SIDEBAR AFTER LINK CLICK
  // =====================================================

  const handleLinkClick = () => {
    sideBarToggle();
  };

  // =====================================================
  // ACTIVE PATH
  // =====================================================

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  // =====================================================
  // TEXT COLOR
  // =====================================================

  const textColor =
    background.text === "text-white"
      ? "#FFFFFF"
      : "#334155";

  // =====================================================
  // SIDEBAR LINK
  // =====================================================

  const sidebarLinkClass = `
    group
    relative
    flex
    items-center
    gap-3
    w-full
    px-3
    py-1.5
    my-1
    rounded-xl
    text-sm
    font-medium
    transition-all
    duration-200
    cursor-pointer
  `;

  // =====================================================
  // SECTION TITLE
  // =====================================================

  const sectionTitleClass = `
    px-3
    pt-5
    pb-2
    text-[10px]
    font-bold
    uppercase
    tracking-[0.14em]
  `;

  // =====================================================
  // NAV ITEM
  // =====================================================

const NavItem = ({
  href,
  label,
  icon,
}) => {
    const active = isActive(href);

    return (
      <Link
        href={href}
        onClick={handleLinkClick}
        className={sidebarLinkClass}
        style={{
          color: active
            ? theme.primary
            : textColor,

          backgroundColor: active
            ? theme.primarySelected
            : "transparent",

          fontWeight: active ? 600 : 500,
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor =
              theme.primarySelected;
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor =
              "transparent";
          }
        }}
      >
        {/* Active indicator */}
        {active && (
          <span
            className="
              absolute
              left-0
              top-1/2
              -translate-y-1/2
              w-1
              h-6
              rounded-r-full
            "
            style={{
              backgroundColor: theme.primary,
            }}
          />
        )}

        {/* Icon */}
        <span
          className="
            flex
            items-center
            justify-center
            w-7
            h-7
            rounded-lg
            shrink-0
            transition-all
          "
          style={{
            backgroundColor: active
              ? theme.primary
              : "transparent",

            color: active
              ? "#FFFFFF"
              : textColor,
          }}
        >
          {icon}
        </span>

        {/* Label */}
        <span className="truncate">
          {label}
        </span>
      </Link>
    );
  };

  return (
    <div
      translate="no"
      className="z-50"
    >
      <AnimatePresence
        mode="wait"
        initial={false}
      >
        {open && (
          <motion.div
            {...framerSidebarPanel}
            ref={ref}
            className={`
              fixed
              top-[60px]
              bottom-0
              left-0
              z-50

              w-full
              max-w-[280px]

              h-[calc(100vh-60px)]

              flex
              flex-col

              overflow-hidden

              border-r

              shadow-[8px_0_30px_rgba(0,0,0,0.08)]

              ${background.className}
            `}
            style={{
              borderColor:
                theme.primarySelected,
            }}
            aria-label="Sidebar"
          >

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div
              className="
                shrink-0
                flex
                items-center
                justify-between

                px-4
                py-1

                border-b
              "
              style={{
                borderColor:
                  theme.primarySelected,
              }}
            >
              <div className="flex items-center gap-3">

                {/* Menu Icon */}
                <div
                  className="
                    flex
                    items-center
                    justify-center
                    w-9
                    h-9
                    rounded-xl
                  "
                  style={{
                    backgroundColor:
                      theme.primary,
                    color: "#FFFFFF",
                  }}
                >
                  <IoReceiptOutline
                    size={19}
                  />
                </div>

                <div>
                  <div
                    className="
                      text-sm
                      font-bold
                      leading-tight
                    "
                    style={{
                      color: theme.primaryText,
                    }}
                  >
                    POS Menu
                  </div>

                  <div
                    className="
                      text-[11px]
                      mt-0.5
                      opacity-60
                    "
                    style={{
                      color: textColor,
                    }}
                  >
                    Restaurant System
                  </div>
                </div>
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={sideBarToggle}
                className="
                  flex
                  items-center
                  justify-center
                  w-9
                  h-9
                  rounded-xl
                  transition-all
                  cursor-pointer
                "
                style={{
                  color: textColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme.primarySelected;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "transparent";
                }}
                aria-label="Close sidebar"
              >
                <IoClose size={22} />
              </button>
            </div>

            {/* ================================================= */}
            {/* NAVIGATION */}
            {/* ================================================= */}

            <div
              className="
                flex-1
                min-h-0
                overflow-y-auto
                px-3
                pb-4
                app-scrollbar
                pos-sidebar-scroll
              "
            >

              {/* ================================================= */}
              {/* ORDERS */}
              {/* ================================================= */}

              <div>
                <div
                  className={sectionTitleClass}
                  style={{
                    color:
                      background.text === "text-white"
                        ? "rgba(255,255,255,0.55)"
                        : "#94A3B8",
                  }}
                >
                  Orders
                </div>

                <NavItem
                  href="/orders"
                  label="Local Orders"
                  icon={
                    <IoReceiptOutline size={18} />
                  }
                />

                <NavItem
                  href="/orders/online"
                  label="Online Orders"
                  icon={
                    <IoGlobeOutline size={18} />
                  }
                />

                <NavItem
                  href="/kot/deleted-items"
                  label="KOT History"
                  icon={
                    <IoDocumentTextOutline size={18} />
                  }
                />

                <NavItem
                  href="/table-migrate"
                  label="Table Shift"
                  icon={
                    <IoSwapHorizontalOutline size={18} />
                  }
                />
              </div>

              {/* ================================================= */}
              {/* REPORTS */}
              {/* ================================================= */}

              <div>
                <div
                  className={sectionTitleClass}
                  style={{
                    color:
                      background.text === "text-white"
                        ? "rgba(255,255,255,0.55)"
                        : "#94A3B8",
                  }}
                >
                  Reports
                </div>

                <NavItem
                  href="/reports/day-close"
                  label="Day Close"
                  icon={
                    <IoTimeOutline size={18} />
                  }
                />

                <NavItem
                  href="/reports/sales"
                  label="Sales / Z-Reports"
                  icon={
                    <IoBarChartOutline size={18} />
                  }
                />
              </div>

              {/* ================================================= */}
              {/* CUSTOMERS */}
              {/* ================================================= */}

              <div>
                <div
                  className={sectionTitleClass}
                  style={{
                    color:
                      background.text === "text-white"
                        ? "rgba(255,255,255,0.55)"
                        : "#94A3B8",
                  }}
                >
                  Customers
                </div>

                <NavItem
                  href="/customers"
                  label="Customer List"
                  icon={
                    <IoPeopleOutline size={18} />
                  }
                />
              </div>

              {/* ================================================= */}
              {/* SYSTEM */}
              {/* ================================================= */}

              <div>
                <div
                  className={sectionTitleClass}
                  style={{
                    color:
                      background.text === "text-white"
                        ? "rgba(255,255,255,0.55)"
                        : "#94A3B8",
                  }}
                >
                  System
                </div>

                <NavItem
                  href="/sync"
                  label="Sync"
                  icon={
                    <IoSyncOutline size={18} />
                  }
                />
              </div>

              {/* ================================================= */}
              {/* SETTINGS */}
              {/* ================================================= */}

              <div>
                <div
                  className={sectionTitleClass}
                  style={{
                    color:
                      background.text === "text-white"
                        ? "rgba(255,255,255,0.55)"
                        : "#94A3B8",
                  }}
                >
                  Settings
                </div>

                <NavItem
                  href="/settings"
                  label="All Settings"
                  icon={
                    <IoSettingsOutline size={18} />
                  }
                />

                <NavItem
                  href="/settings/theme"
                  label="Theme Setting"
                  icon={
                    <IoColorPaletteOutline
                      size={18}
                    />
                  }
                />

                <NavItem
                  href="/settings/printers"
                  label="Printer Setting"
                  icon={
                    <IoPrintOutline size={18} />
                  }
                />
              </div>

            </div>

            {/* ================================================= */}
            {/* LOGOUT */}
            {/* ================================================= */}

            <div
              className="
                shrink-0
                px-3
                py-3
                border-t
              "
              style={{
                borderColor:
                  theme.primarySelected,
              }}
            >
              <button
                type="button"
                onClick={handleLogout}
                className="
                  group
                  w-full
                  flex
                  items-center
                  gap-3
                  px-3
                  py-2.5
                  rounded-xl
                  text-sm
                  font-medium
                  transition-all
                  duration-200
                  cursor-pointer
                "
                style={{
                  color: textColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme.primarySelected;

                  e.currentTarget.style.color =
                    theme.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "transparent";

                  e.currentTarget.style.color =
                    textColor;
                }}
              >
                <span
                  className="
                    flex
                    items-center
                    justify-center
                    w-8
                    h-8
                    rounded-lg
                  "
                  style={{
                    backgroundColor:
                      theme.primarySelected,
                  }}
                >
                  <LogOut
                    size={17}
                    strokeWidth={2}
                  />
                </span>

                <span>
                  Logout
                </span>
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};