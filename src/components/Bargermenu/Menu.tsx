"use client";

import { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useClickAway } from "react-use";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { IoClose } from "react-icons/io5";
import {
  BiHomeSmile,
  BiUser
} from "react-icons/bi";
import { HiOutlineChatBubbleBottomCenterText } from "react-icons/hi2";
import { TbBrandBooking } from "react-icons/tb";
 

// Icon mapping (optional)
const iconMap: Record<string, any> = {
  "/": BiHomeSmile,
  "/about": BiUser,
  "/contact": HiOutlineChatBubbleBottomCenterText,
  "/reservation": TbBrandBooking,
};

// Framer Motion Variants
const framerMenuBackground = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: { delay: 0.2 } },
  transition: { duration: 0.3 },
};

const framerMenuPanel = {
  initial: { y: "-100%" },
  animate: { y: 0 },
  exit: { y: "-100%" },
  transition: { duration: 0.3 },
};

const framerText = (delay: number) => ({
  initial: { opacity: 0, y: -50 },
  animate: { opacity: 1, y: 0 },
  transition: {
    delay: 0.5 + delay / 10,
  },
});

const framerIcon = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  transition: {
    type: "spring" as const,
    stiffness: 260,
    damping: 20,
    delay: 1.5,
  },
};

export const BargerMenu = () => {
  const { openBargerMenu, bargerMenuToggle } = UseSiteContext();
  const ref = useRef(null);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useClickAway(ref, () => bargerMenuToggle(false));

  if (!hasMounted) return null;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {openBargerMenu && (
        <>
          <motion.div
            {...framerMenuBackground}
            aria-hidden="true"
            className="fixed mx-auto rounded-b-3xl top-28 z-50 backdrop-blur-sm"
          />
          <motion.div
            {...framerMenuPanel}
            className="fixed mx-auto right-5 left-5 rounded-b-3xl top-0 px-6 pt-12 pb-3 z-50 bg-dark"
            ref={ref}
            aria-label="Menu"
          >
            {/* Close Button */}
            <div
              translate="no"
              className="flex w-full items-center justify-end border-b-2 border-zinc-50"
            >
              <button
                onClick={() => bargerMenuToggle(false)}
                className="p-2 mb-2 border-2 border-zinc-100 rounded-xl"
                aria-label="close Menu"
              >
                <IoClose />
              </button>
            </div>

            {/* Menu Items */}
           
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
