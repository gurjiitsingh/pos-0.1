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

  return (
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
          ).map(([name, theme]) => {

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
                  flex items-center gap-3
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

                {/* COLOR PREVIEW */}

                <span
                  className="h-6 w-6 shrink-0 rounded-md"
                  style={{
                    backgroundColor:
                      theme.primary,
                  }}
                />

                {/* <span className="text-sm font-medium text-slate-700">
                  {theme.name ?? name}
                </span> */}

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
          ).map(([name, background]) => {

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

                {/* BACKGROUND PREVIEW */}

                <div
                  className={`
                    ${background.className}
                    ${background.text}
                    flex
                    h-14
                    items-center
                    justify-center
                    rounded-md
                    text-xs
                    font-semibold
                  `}
                >
                  POS
                </div>

                <div className="mt-2 text-xs font-medium text-slate-700">
                  {background.name}
                </div>

                {selected && (
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700 shadow">
                    ✓
                  </div>
                )}

              </button>
            );
          })}

        </div>
      </div>

    </div>
  );
}