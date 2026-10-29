'use client';

import Link from 'next/link';


// =====================================================
// TYPES
// =====================================================

type SettingItem = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};


// =====================================================
// PAGE
// =====================================================

export default function SettingsPage() {

  const settings: SettingItem[] = [

    // =================================================
    // POS & NETWORK
    // =================================================

    {
      title: 'POS Network',
      description:
        'Configure this POS terminal and local network connection for Waiter devices.',
      href: '/settings/pos-network',

      icon: (
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect
            x="3"
            y="4"
            width="18"
            height="13"
            rx="2"
          />

          <path d="M8 21h8" />

          <path d="M12 17v4" />
        </svg>
      ),
    },


    // =================================================
    // PRINTERS
    // =================================================

    {
      title: 'Printers',
      description:
        'Configure bill, kitchen and other POS printers.',
      href: '/settings/printers',

      icon: (
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M6 9V3h12v6"
          />

          <path
            d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
          />

          <path
            d="M6 14h12v7H6z"
          />
        </svg>
      ),
    },


    // =================================================
    // DATA SYNC
    // =================================================

    {
      title: 'Data Sync',
      description:
        'Download cloud data and upload pending POS orders.',
      href: '/sync',

      icon: (
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M12 3v12" />

          <path d="m7 10 5 5 5-5" />

          <path d="M5 21h14" />
        </svg>
      ),
    },

    // =================================================
    // APPEARANCE
    // =================================================

    {
      title: 'Appearance',
      description:
        'Customize the POS theme, colors and display appearance.',
      href: '/settings/theme',

      icon: (
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle
            cx="12"
            cy="12"
            r="4"
          />

          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ),
    },

        // =================================================
    // BUSINESS
    // =================================================

    {
      title: 'Init',
      description:
        'First time setting.',
      href: '/settings/init',

      icon: (
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M3 21h18"
          />

          <path
            d="M5 21V7l7-4 7 4v14"
          />

          <path
            d="M9 21v-5h6v5"
          />

          <path
            d="M9 9h.01"
          />

          <path
            d="M15 9h.01"
          />

          <path
            d="M9 12h.01"
          />

          <path
            d="M15 12h.01"
          />
        </svg>
      ),
    },


    // =================================================
    // TAX
    // =================================================

    {
      title: 'Tax & GST',
      description:
        'Configure GST, tax mode and tax calculation settings.',
      href: '/settings/tax',

      icon: (
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M6 3h12" />

          <path d="M6 21h12" />

          <path d="M8 3v4a4 4 0 0 0 8 0V3" />

          <path d="M8 21v-4a4 4 0 0 1 8 0v4" />

          <path d="M9 12h6" />
        </svg>
      ),
    },


    // =================================================
    // BILLING
    // =================================================

    {
      title: 'Billing',
      description:
        'Configure invoice numbering, billing behaviour and receipt options.',
      href: '/settings/billing',

      icon: (
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M6 2h12v20l-3-2-3 2-3-2-3 2z"
          />

          <path d="M9 7h6" />

          <path d="M9 11h6" />

          <path d="M9 15h3" />
        </svg>
      ),
    },


    // =================================================
    // PAYMENTS
    // =================================================

    {
      title: 'Payments',
      description:
        'Configure payment methods such as Cash, UPI, Card and Wallet.',
      href: '/settings/payments',

      icon: (
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
          />

          <path d="M3 10h18" />

          <path d="M7 15h3" />
        </svg>
      ),
    },

  ];


  // ===================================================
  // UI
  // ===================================================

  return (

    <div
      className="
        min-h-screen
        bg-slate-50
        px-4
        py-6
        sm:px-6
      "
    >

      <div
        className="
          mx-auto
          max-w-5xl
        "
      >

        {/* =============================================
            HEADER
        ============================================= */}

        <div
          className="
            mb-7
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-slate-900
                text-white
                shadow-sm
              "
            >

              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >

                <path
                  d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
                />

                <path
                  d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V22h-2.4v-.2a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.46 17a1.7 1.7 0 0 0-1.56-1.03H6.7v-2.4h.2A1.7 1.7 0 0 0 8.46 12a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 12.73 7.2V7h2.4v.2a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06A1.7 1.7 0 0 0 19.4 12c.25.6.83 1.03 1.48 1.03h.2v2.4h-.2A1.7 1.7 0 0 0 19.4 15z"
                />

              </svg>

            </div>


            <div>

              <h1
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  text-slate-900
                "
              >
                Settings
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Configure and manage your POS system.
              </p>

            </div>

          </div>

        </div>


        {/* =============================================
            SETTINGS GRID
        ============================================= */}

        <div
          className="
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
          "
        >

          {settings.map(
            (setting) => (

              <Link
                key={
                  setting.href
                }
                href={
                  setting.href
                }
                className="
                  group
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-4
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:border-slate-300
                  hover:shadow-md
                "
              >

                {/* ICON */}

                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-slate-100
                    text-slate-600
                    transition
                    group-hover:bg-slate-900
                    group-hover:text-white
                  "
                >

                  {setting.icon}

                </div>


                {/* TEXT */}

                <div
                  className="
                    min-w-0
                    flex-1
                  "
                >

                  <h2
                    className="
                      text-sm
                      font-semibold
                      text-slate-900
                    "
                  >
                    {setting.title}
                  </h2>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    {setting.description}
                  </p>

                </div>


                {/* ARROW */}

                <div
                  className="
                    shrink-0
                    text-slate-300
                    transition
                    group-hover:translate-x-0.5
                    group-hover:text-slate-600
                  "
                >

                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >

                    <path
                      d="m9 18 6-6-6-6"
                    />

                  </svg>

                </div>

              </Link>

            )
          )}

        </div>


        {/* =============================================
            FOOTER
        ============================================= */}

        <div
          className="
            mt-6
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-4
            py-3
          "
        >

          <p
            className="
              text-xs
              text-slate-500
            "
          >

            POS settings are stored locally where
            appropriate and synchronized with your
            configured cloud data when required.

          </p>

        </div>

      </div>

    </div>

  );

}