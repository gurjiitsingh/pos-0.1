 
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ShoppingBasket,
  Receipt,
  IndianRupee,
} from 'lucide-react';
import { usePosUi } from '@/PosUiStore/PosUiContext';
import { usePosSession } from '@/PosSessionStore/PosSessionContext';
import { usePosTheme } from '@/PosThemeStore/PosThemeContext';
import { useRouter } from 'next/navigation';

export default function TablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { activeTable, setActiveTable } = usePosSession();
  const { setRightSidebarView } = usePosUi();

  const { theme, background } = usePosTheme();

  const router = useRouter();

  // =====================================================
  // LOAD TABLES
  // =====================================================

  useEffect(() => {
    loadTables();
  }, []);

  async function loadTables() {
    try {
      setLoading(true);

      const rows = await window.posApi.getTables();

      setTables(rows);
    } catch (e) {
      console.error('Failed to load tables', e);
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // GROUP TABLES BY AREA
  // =====================================================

  const tablesByArea = useMemo(() => {
    const grouped: Record<string, any[]> = {};

    for (const table of tables) {
      const area = table.area || 'General';

      if (!grouped[area]) {
        grouped[area] = [];
      }

      grouped[area].push(table);
    }

    // Sort tables inside each area
    for (const area of Object.keys(grouped)) {
      grouped[area].sort((a, b) => {
        const aOrder = a.sortOrder ?? 9999;
        const bOrder = b.sortOrder ?? 9999;

        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }

        return (a.tableName || '').localeCompare(
          b.tableName || ''
        );
      });
    }

    // Sort area names alphabetically
    return Object.entries(grouped).sort(([a], [b]) =>
      a.localeCompare(b)
    );
  }, [tables]);

  // =====================================================
  // TABLE CLICK
  // =====================================================

  function handleTableClick(table: any) {
    setActiveTable({
      tableId: table.id,
      tableName: table.tableName,
      status: table.status,
    });

    setRightSidebarView('cart');

    setTimeout(() => {
      router.push('/');
    }, 50);
  }

  // =====================================================
  // TABLE STATUS
  // =====================================================

  function getTableStatus(table: any) {
    return String(
      table.status || 'FREE'
    ).toUpperCase();
  }

  // =====================================================
  // CHECK DARK BACKGROUND
  // =====================================================

  function isDarkBackground() {
    return (
      background.className === 'bg-black' ||
      background.className === 'bg-slate-800' ||
      background.className === 'bg-slate-700' ||
      background.className === 'bg-[#406093]'
    );
  }

  // =====================================================
  // TABLE STATUS STYLE
  // =====================================================

  function getStatusStyle(
    table: any,
    isActive: boolean
  ) {
    const status = getTableStatus(table);

    // ===================================================
    // SELECTED
    // ===================================================

    if (isActive) {
      return {
        background: theme.primarySelected,
        color: theme.primaryText,
        border: theme.primary,
        secondaryText: theme.primaryText,
        separator: theme.primary,
      };
    }

    // ===================================================
    // RUNNING / OCCUPIED
    // ===================================================

    if (
      status === 'RUNNING' ||
      status === 'OCCUPIED'
    ) {
      return {
        background: theme.primaryLight,
        color: theme.primaryText,
        border: theme.primary,
        secondaryText: theme.primaryText,
        separator: theme.primary,
      };
    }

    // ===================================================
    // HOLD
    // ===================================================

    if (status === 'HOLD') {
      return {
        background: '#FFF3E8',
        color: '#C96F25',
        border: '#F4C7A1',
        secondaryText: '#C96F25',
        separator: '#F4C7A1',
      };
    }

    // ===================================================
    // FREE
    // ===================================================

    if (background.className === 'bg-white') {
      return {
        background: '#FFFFFF',
        color: '#334155',
        border: background.line,
        secondaryText: '#64748B',
        separator: background.line,
      };
    }

    if (background.className === 'bg-slate-200') {
      return {
        background: '#E2E8F0',
        color: '#1E293B',
        border: background.line,
        secondaryText: '#475569',
        separator: background.line,
      };
    }

    if (background.className === 'bg-slate-700') {
      return {
        background: '#475569',
        color: '#FFFFFF',
        border: '#94A3B8',
        secondaryText: '#CBD5E1',
        separator: '#94A3B8',
      };
    }

    // ===================================================
    // BLACK
    // ===================================================

    if (background.className === 'bg-black') {
      return {
        background: '#111111',
        color: '#FFFFFF',
        border: '#475569',
        secondaryText: '#CBD5E1',
        separator: '#475569',
      };
    }

    // ===================================================
    // DARK
    // ===================================================

    if (background.className === 'bg-slate-800') {
      return {
        background: '#1E293B',
        color: '#FFFFFF',
        border: '#64748B',
        secondaryText: '#CBD5E1',
        separator: '#64748B',
      };
    }

    // ===================================================
    // BLUE
    // ===================================================

    if (background.className === 'bg-[#406093]') {
      return {
        background: '#334F7A',
        color: '#FFFFFF',
        border: '#8FAED6',
        secondaryText: '#C7D2E3',
        separator: '#8FAED6',
      };
    }

    // ===================================================
    // FALLBACK
    // ===================================================

    return {
      background: '#FFFFFF',
      color: '#334155',
      border: background.line,
      secondaryText: '#64748B',
      separator: background.line,
    };
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className={`
        ${background.className}
        ${background.text}
        p-4
        h-screen
        overflow-y-auto
      `}
    >
      <div className="mb-40">

        {loading ? (
          <p className="text-sm opacity-60">
            Loading tables...
          </p>
        ) : (
          <div className="space-y-6">

            {tablesByArea.map(
              ([area, areaTables]) => (
                <div
                  key={area}
                  className="space-y-3"
                >

                  {/* =================================================
                      AREA HEADER
                  ================================================= */}

                  <div
                    className={`
                      sticky
                      top-0
                      z-10
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      border
                      px-3
                      py-2
                      backdrop-blur
                    `}
                    style={{
                      borderColor: background.line,
                    }}
                  >
                    <h2 className="text-sm font-semibold opacity-80">
                      {area}
                    </h2>

                    <span className="text-xs opacity-60">
                      {areaTables.length} tables
                    </span>
                  </div>

                  {/* =================================================
                      AREA TABLES
                  ================================================= */}

                  <div
                    className="
                      grid
                      grid-cols-3
                      gap-2
                      md:grid-cols-8
                      lg:grid-cols-13
                    "
                  >
                    {areaTables.map((table) => {
                      const isActive =
                        activeTable?.tableId ===
                        table.id;

                      const status =
                        getTableStatus(table);

                      const statusStyle =
                        getStatusStyle(
                          table,
                          isActive
                        );

                      return (
                        <button
                          type="button"
                          key={table.id}
                          onClick={() =>
                            handleTableClick(table)
                          }
                          className="
                            rounded-xl
                            border
                            p-3
                            text-left
                            transition-all
                            duration-150
                            hover:shadow-md
                            active:scale-[0.98]
                          "
                          style={{
                            backgroundColor:
                              statusStyle.background,

                            color:
                              statusStyle.color,

                            borderColor:
                              statusStyle.border,

                            boxShadow: isActive
                              ? `0 0 0 2px ${theme.primary}40`
                              : undefined,
                          }}
                        >

                          {/* =================================================
                              TABLE NAME
                          ================================================= */}

                          <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold">
                              {table.tableName}
                            </h2>
                          </div>

                          {/* =================================================
                              STATUS
                          ================================================= */}

                          {/* <div className="mt-1">
                            <span
                              className="
                                text-[10px]
                                font-semibold
                                uppercase
                                tracking-wide
                              "
                              style={{
                                color:
                                  statusStyle.secondaryText,
                                opacity: 0.75,
                              }}
                            >
                              {status}
                            </span>
                          </div> */}

                          {/* =================================================
                              TABLE INFORMATION
                          ================================================= */}

                <div
  className="
    mt-3
    space-y-1
    border-t
    pt-2
  "
  style={{
    borderColor: statusStyle.separator,
  }}
>
  {/* ITEMS */}

  <div className="flex items-center justify-between text-xs">
    <ShoppingBasket
      size={14}
      strokeWidth={2}
      style={{
        color: statusStyle.secondaryText,
        opacity: 0.75,
      }}
    />

    <span
      className="font-medium"
      style={{
        color: statusStyle.color,
      }}
    >
      {table.cartCount || 0}
    </span>
  </div>

  {/* BILLS */}

  <div className="flex items-center justify-between text-xs">
    <Receipt
      size={14}
      strokeWidth={2}
      style={{
        color: statusStyle.secondaryText,
        opacity: 0.75,
      }}
    />

    <span
      className="font-medium"
      style={{
        color: statusStyle.color,
      }}
    >
      {table.billCount || 0}
    </span>
  </div>

  {/* AMOUNT */}

  <div className="flex items-center justify-between text-xs">
    <IndianRupee
      size={14}
      strokeWidth={2}
      style={{
        color: statusStyle.secondaryText,
        opacity: 0.75,
      }}
    />

    <span
      className="font-semibold"
      style={{
        color: statusStyle.color,
      }}
    >
      {Number(table.billAmount || 0).toFixed(2)}
    </span>
  </div>
</div>

                        </button>
                      );
                    })}
                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>
    </div>
  );
}

