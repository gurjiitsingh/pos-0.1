'use client';

import Link from 'next/link';
import {
  Printer,
  Receipt,
  ChefHat,
  Wine,
} from 'lucide-react';

import { usePosTheme } from '@/PosThemeStore/PosThemeContext';

export default function PrinterSettingsPage() {

  const { theme, background } =
    usePosTheme();

  return (
    <div
      className={`
        h-[calc(100vh-64px)]
        overflow-y-auto
        app-scrollbar
        ${background.className}
        ${background.text}
      `}
    >

      <div className="mx-auto max-w-4xl p-6">

        {/* HEADER */}

        <div className="mb-8 flex items-center gap-4">

          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor:
                theme.primaryLight,
              color:
                theme.primaryText,
            }}
          >
            <Printer className="h-8 w-8" />
          </div>

          <div>

            <h1
              className="text-3xl font-bold"
              style={{
                color:
                  theme.primaryText,
              }}
            >
              Printer Settings
            </h1>

            <p className="mt-1 text-sm opacity-60">
              Select a printer to configure.
            </p>

          </div>

        </div>


        {/* PRINTER LINKS */}

        <div className="grid gap-4">

          {/* BILL */}

          <Link
            href="/settings/printers/bill"
            className={`
              flex
              items-center
              gap-4
              rounded-xl
              border
              ${background.border}
              p-5
              transition
              hover:shadow-md
            `}
          >

            <div
              className="rounded-xl p-3"
              style={{
                backgroundColor:
                  theme.primaryLight,
                color:
                  theme.primaryText,
              }}
            >
              <Receipt className="h-7 w-7" />
            </div>

            <div>

              <h2 className="text-lg font-semibold">
                Bill Printer
              </h2>

              <p className="text-sm opacity-60">
                Configure receipt / bill printer
              </p>

            </div>

          </Link>


          {/* KITCHEN */}

          <Link
            href="/settings/printers/kitchen"
            className={`
              flex
              items-center
              gap-4
              rounded-xl
              border
              ${background.border}
              p-5
              transition
              hover:shadow-md
            `}
          >

            <div
              className="rounded-xl p-3"
              style={{
                backgroundColor:
                  theme.primaryLight,
                color:
                  theme.primaryText,
              }}
            >
              <ChefHat className="h-7 w-7" />
            </div>

            <div>

              <h2 className="text-lg font-semibold">
                Kitchen Printer
              </h2>

              <p className="text-sm opacity-60">
                Configure kitchen KOT printer
              </p>

            </div>

          </Link>


          {/* BAR */}

          <Link
            href="/settings/printers/bar"
            className={`
              flex
              items-center
              gap-4
              rounded-xl
              border
              ${background.border}
              p-5
              transition
              hover:shadow-md
            `}
          >

            <div
              className="rounded-xl p-3"
              style={{
                backgroundColor:
                  theme.primaryLight,
                color:
                  theme.primaryText,
              }}
            >
              <Wine className="h-7 w-7" />
            </div>

            <div>

              <h2 className="text-lg font-semibold">
                Bar Printer
              </h2>

              <p className="text-sm opacity-60">
                Configure bar printer
              </p>

            </div>

          </Link>

        </div>

      </div>

    </div>
  );
}