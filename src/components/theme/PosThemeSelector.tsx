'use client';

import {
  POS_THEMES,
  POS_BACKGROUNDS,
  PosThemeName,
  PosBackground,
} from '@/config/POS_THEME';

import { usePosTheme } from '@/PosThemeStore/PosThemeContext';

export default function PosThemeSelector() {

  const {
    themeName,
    setThemeName,
    backgroundName,
    setBackgroundName,
  } = usePosTheme();

  const theme = POS_THEMES[themeName];
  const background = POS_BACKGROUNDS[backgroundName];

  return (
    <div className='flex max-w-5xl justify-between '>
    <div className="space-y-6">

      {/* =====================================================
          THEME COLOR
      ===================================================== */}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          POS Theme Color
        </h2>

        <div className="grid grid-cols-2 gap-2">

          {(
            Object.entries(POS_THEMES) as [
              PosThemeName,
              (typeof POS_THEMES)[PosThemeName]
            ][]
          ).map(([name, themeItem]) => {

            const selected =
              themeName === name;

            return (
              <button
                key={name}
                type="button"
                onClick={() =>
                  setThemeName(name)
                }
                className={`
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  border
                  px-3
                  py-2
                  text-left
                  transition
                  ${
                    selected
                      ? 'border-slate-500 ring-2 ring-slate-200'
                      : 'border-slate-200 hover:bg-slate-50'
                  }
                `}
              >

                {/* =================================================
                    COLOR PREVIEW
                ================================================= */}

                <div
                  className="
                    relative
                    h-9
                    w-12
                    shrink-0
                    overflow-hidden
                    rounded-md
                    border
                    border-slate-300
                    shadow-sm
                  "
                  style={{
                    backgroundColor:
                      getBackgroundColor(backgroundName),
                  }}
                >

                  {/* TOPBAR */}

                  <div
                    className="absolute left-0 right-0 top-0 h-2"
                    style={{
                      backgroundColor:
                        getTopbarColor(backgroundName),
                    }}
                  />

                  {/* CATEGORY */}

                  <div
                    className="absolute bottom-0 left-0 top-2 w-2"
                    style={{
                      backgroundColor:
                        getCategorySidebarColor(
                          backgroundName
                        ),
                    }}
                  />

                  {/* PRIMARY */}

                  <div
                    className="
                      absolute
                      bottom-1
                      right-1
                      h-3
                      w-5
                      rounded-sm
                    "
                    style={{
                      backgroundColor:
                        themeItem.primary,
                    }}
                  />

                </div>


                {/* NAME */}

                <span className="text-sm font-medium text-slate-700 capitalize">
                  {name}
                </span>


                {/* SELECTED */}

                {selected && (
                  <span className="ml-auto text-xs font-semibold text-slate-500">
                    ✓
                  </span>
                )}

              </button>
            );
          })}

        </div>
      </div>


      {/* =====================================================
          POS BACKGROUND
      ===================================================== */}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          POS Background
        </h2>

        <div className="grid grid-cols-3 gap-2">

          {(
            Object.entries(POS_BACKGROUNDS) as [
              PosBackground,
              (typeof POS_BACKGROUNDS)[PosBackground]
            ][]
          ).map(([name, backgroundItem]) => {

            const selected =
              backgroundName === name;

            return (
              <button
                key={name}
                type="button"
                onClick={() =>
                  setBackgroundName(name)
                }
                className={`
                  relative
                  overflow-hidden
                  rounded-lg
                  border
                  p-2
                  transition
                  ${
                    selected
                      ? 'border-slate-500 ring-2 ring-slate-200'
                      : 'border-slate-200'
                  }
                `}
              >

                {/* =================================================
                    BACKGROUND PREVIEW
                ================================================= */}

                <div
                  className={`
                    ${backgroundItem.className}
                    ${backgroundItem.text}
                    relative
                    flex
                    h-14
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-md
                    text-xs
                    font-semibold
                  `}
                >

                  {/* TOPBAR */}

                  <div
                    className={`
                      absolute
                      left-0
                      right-0
                      top-0
                      h-2
                      ${backgroundItem.topbarBg}
                    `}
                  />

                  {/* CATEGORY SIDEBAR */}

                  <div
                    className={`
                      absolute
                      bottom-0
                      left-0
                      top-2
                      w-3
                      ${backgroundItem.categorySidebarBg}
                    `}
                  />

                  {/* PRIMARY */}

                  <div
                    className="
                      absolute
                      bottom-2
                      right-2
                      h-3
                      w-7
                      rounded-sm
                    "
                    style={{
                      backgroundColor:
                        theme.primary,
                    }}
                  />

                  <span className="relative">
                    POS
                  </span>

                </div>


                {/* NAME */}

                <div className="mt-2 text-xs font-medium text-slate-700">
                  {backgroundItem.name}
                </div>


                {/* SELECTED */}

                {selected && (
                  <div
                    className="
                      absolute
                      right-2
                      top-2
                      flex
                      h-5
                      w-5
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-xs
                      font-bold
                      text-slate-700
                      shadow
                    "
                  >
                    ✓
                  </div>
                )}

              </button>
            );
          })}

        </div>
      </div>


      {/* =====================================================
          DUMMY POS PREVIEW
      ===================================================== */}

    

    </div>
     <div>

        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          Preview
        </h2>

        <div
          className={`
            relative
            overflow-hidden
            rounded-xl
            border
            shadow-sm
            ${background.className}
            ${background.text}
          `}
          style={{
            borderColor:
              getBorderColor(backgroundName),
          }}
        >

          {/* =================================================
              DUMMY TOPBAR
          ================================================= */}

          <div
            className={`
              flex
              h-10
              items-center
              justify-between
              border-b
              px-3
              ${background.topbarBg}
              ${background.topbarText}
            `}
            style={{
              borderColor:
                getBorderColor(backgroundName),
            }}
          >

            {/* LEFT */}

            <div className="flex items-center gap-2">

              {/* MENU */}

              <div
                className="
                  flex
                  h-6
                  w-6
                  items-center
                  justify-center
                  rounded
                  border
                  text-[9px]
                "
                style={{
                  borderColor:
                    getBorderColor(backgroundName),
                }}
              >
                ☰
              </div>

              {/* BRAND */}

              <span className="text-[10px] font-bold">
                IT10x
              </span>

              {/* NAV */}

              <div className="flex gap-1">

                <PreviewButton
                  label="POS"
                  active={true}
                  theme={theme}
                />

                <PreviewButton
                  label="ORDERS"
                  theme={theme}
                />

                <PreviewButton
                  label="TABLES"
                  theme={theme}
                />

              </div>

            </div>


            {/* RIGHT */}

            <div className="flex gap-1">

              <PreviewButton
                label="CART"
                active={true}
                theme={theme}
              />

              <PreviewButton
                label="KOT"
                theme={theme}
              />

            </div>

          </div>


          {/* =================================================
              MAIN POS AREA
          ================================================= */}

          <div className="flex h-[210px]">

            {/* =================================================
                CATEGORY SIDEBAR
            ================================================= */}

            <div
              className={`
                w-[72px]
                shrink-0
                border-r
                ${background.categorySidebarBg}
                ${background.categorySidebarText}
              `}
              style={{
                borderColor:
                  getBorderColor(backgroundName),
              }}
            >

              <div
                className="
                  px-2
                  py-2
                  text-[8px]
                  font-bold
                "
              >
                CATEGORIES
              </div>


              <PreviewCategory
                label="Favorites"
                active={true}
                theme={theme}
              />

              <PreviewCategory
                label="Pizza"
                theme={theme}
              />

              <PreviewCategory
                label="Drinks"
                theme={theme}
              />

              <PreviewCategory
                label="Food"
                theme={theme}
              />

              <PreviewCategory
                label="Dessert"
                theme={theme}
              />

            </div>


            {/* =================================================
                PRODUCTS
            ================================================= */}

            <div className="flex-1 p-3">

              <div className="mb-2 flex items-center justify-between">

                <span className="text-[10px] font-semibold">
                  Products
                </span>

                <div
                  className="
                    rounded
                    border
                    px-2
                    py-1
                    text-[7px]
                  "
                  style={{
                    borderColor:
                      getBorderColor(backgroundName),
                  }}
                >
                  Search...
                </div>

              </div>


              <div className="grid grid-cols-3 gap-2">

                <PreviewProduct
                  name="Burger"
                  price="₹180"
                  theme={theme}
                  background={background}
                />

                <PreviewProduct
                  name="Pizza"
                  price="₹250"
                  theme={theme}
                  background={background}
                />

                <PreviewProduct
                  name="Coffee"
                  price="₹120"
                  theme={theme}
                  background={background}
                />

                <PreviewProduct
                  name="Fries"
                  price="₹100"
                  theme={theme}
                  background={background}
                />

                <PreviewProduct
                  name="Coke"
                  price="₹70"
                  theme={theme}
                  background={background}
                />

                <PreviewProduct
                  name="Dessert"
                  price="₹150"
                  theme={theme}
                  background={background}
                />

              </div>

            </div>


            {/* =================================================
                CART
            ================================================= */}

            <div
              className="
                w-[105px]
                shrink-0
                border-l
                p-2
              "
              style={{
                borderColor:
                  getBorderColor(backgroundName),
              }}
            >

              <div className="mb-2 text-[9px] font-bold">
                CART
              </div>


              <div
                className="
                  mb-2
                  rounded
                  border
                  p-2
                "
                style={{
                  borderColor:
                    getBorderColor(backgroundName),
                }}
              >

                <div className="flex justify-between text-[8px]">
                  <span>Burger</span>
                  <span>₹180</span>
                </div>

                <div
                  className="
                    mt-1
                    text-[7px]
                  "
                  style={{
                    color:
                      background.mutedTextColor,
                  }}
                >
                  Qty: 1
                </div>

              </div>


              <div className="mb-2 flex justify-between text-[8px] font-semibold">
                <span>Total</span>
                <span>₹180</span>
              </div>


              {/* CHECKOUT */}

              <button
                type="button"
                className="
                  w-full
                  rounded
                  py-1.5
                  text-[8px]
                  font-bold
                  text-white
                "
                style={{
                  backgroundColor:
                    theme.primary,
                }}
              >
                CHECKOUT
              </button>

            </div>

          </div>

        </div>


        {/* =================================================
            CURRENT COMBINATION
        ================================================= */}

        <div className="mt-2 flex items-center justify-between">

          <span className="text-[11px] text-slate-500">
            {capitalize(themeName)} + {background.name}
          </span>

          <div className="flex items-center gap-1">

            <span
              className="
                h-3
                w-3
                rounded-full
                border
                border-slate-300
              "
              style={{
                backgroundColor:
                  theme.primary,
              }}
            />

            <span
              className="
                h-3
                w-3
                rounded-full
                border
                border-slate-300
              "
              style={{
                backgroundColor:
                  getBackgroundColor(backgroundName),
              }}
            />

          </div>

        </div>

      </div>
    </div>
  );
}


// =====================================================
// PREVIEW NAV BUTTON
// =====================================================

function PreviewButton({
  label,
  active = false,
  theme,
}: {
  label: string;
  active?: boolean;
  theme: (typeof POS_THEMES)[PosThemeName];
}) {

  return (
    <div
      className="
        rounded
        border
        px-2
        py-1
        text-[7px]
        font-semibold
      "
      style={{
        backgroundColor:
          active
            ? theme.primary
            : theme.inactive,

        borderColor:
          active
            ? theme.primary
            : theme.primarySelected,

        color:
          active
            ? '#FFFFFF'
            : '#FFFFFF',
      }}
    >
      {label}
    </div>
  );
}


// =====================================================
// PREVIEW CATEGORY
// =====================================================

function PreviewCategory({
  label,
  active = false,
  theme,
}: {
  label: string;
  active?: boolean;
  theme: (typeof POS_THEMES)[PosThemeName];
}) {

  return (
    <div
      className="
        mx-1
        mb-1
        rounded
        px-1.5
        py-1.5
        text-[7px]
        font-medium
      "
      style={{
        backgroundColor:
          active
            ? theme.primary
            : 'transparent',

        color:
          active
            ? '#FFFFFF'
            : undefined,
      }}
    >
      {label}
    </div>
  );
}


// =====================================================
// PREVIEW PRODUCT
// =====================================================

function PreviewProduct({
  name,
  price,
  theme,
  background,
}: {
  name: string;
  price: string;
  theme: (typeof POS_THEMES)[PosThemeName];
  background: (typeof POS_BACKGROUNDS)[PosBackground];
}) {

  return (
    <div
      className="
        rounded-lg
        border
        p-2
      "
      style={{
        borderColor:
          getBorderColorFromBackground(
            background
          ),
      }}
    >

      <div
        className="
          mb-1
          flex
          h-7
          items-center
          justify-center
          rounded
          text-[9px]
        "
        style={{
          backgroundColor:
            theme.primaryLight,

          color:
            theme.primaryText,
        }}
      >
        ●
      </div>

      <div className="text-[8px] font-semibold">
        {name}
      </div>

      <div
        className="mt-0.5 text-[8px]"
        style={{
          color:
            theme.primaryText,
        }}
      >
        {price}
      </div>

    </div>
  );
}


// =====================================================
// BACKGROUND HELPERS
// =====================================================

function getBackgroundColor(
  backgroundName: PosBackground
): string {

  switch (backgroundName) {

    case 'white':
      return '#FFFFFF';

    case 'softSlate':
      return '#D4D4D8';

    case 'darkSlate':
      return '#334155';

    case 'black':
      return '#000000';

    case 'dark':
      return '#1E293B';

    case 'blue':
      return '#5C6A83';

    default:
      return '#FFFFFF';
  }
}


function getTopbarColor(
  backgroundName: PosBackground
): string {

  switch (backgroundName) {

    case 'white':
      return '#F8FAFC';

    case 'softSlate':
      return '#E4E4E7';

    case 'darkSlate':
      return '#1E293B';

    case 'black':
      return '#020617';

    case 'dark':
      return '#0F172A';

    case 'blue':
      return '#4F5D75';

    default:
      return '#F8FAFC';
  }
}


function getCategorySidebarColor(
  backgroundName: PosBackground
): string {

  switch (backgroundName) {

    case 'white':
      return '#FFFFFF';

    case 'softSlate':
      return '#D4D4D8';

    case 'darkSlate':
      return '#334155';

    case 'black':
      return '#000000';

    case 'dark':
      return '#1E293B';

    case 'blue':
      return '#5C6A83';

    default:
      return '#FFFFFF';
  }
}


function getBorderColor(
  backgroundName: PosBackground
): string {

  switch (backgroundName) {

    case 'white':
      return '#E2E8F0';

    case 'softSlate':
      return '#A1A1AA';

    case 'darkSlate':
      return '#64748B';

    case 'black':
      return '#334155';

    case 'dark':
      return '#475569';

    case 'blue':
      return '#6F7D94';

    default:
      return '#E2E8F0';
  }
}


function getBorderColorFromBackground(
  background: (typeof POS_BACKGROUNDS)[PosBackground]
): string {

  switch (background.name) {

    case 'White':
      return '#E2E8F0';

    case 'Soft Slate':
      return '#A1A1AA';

    case 'Dark Slate':
      return '#64748B';

    case 'Black':
      return '#334155';

    case 'Dark':
      return '#475569';

    case 'Blue':
      return '#6F7D94';

    default:
      return '#E2E8F0';
  }
}


// =====================================================
// CAPITALIZE
// =====================================================

function capitalize(
  value: string
): string {

  return value.charAt(0).toUpperCase() + value.slice(1);
}