
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


// =====================================================
// LIVE TABLE UPDATE
// =====================================================

useEffect(() => {

  if (!window.posApi?.onKotReceived) {
    console.log(
      'TABLES: KOT LISTENER API NOT AVAILABLE'
    );
    return;
  }

  console.log(
    'TABLES: REGISTERING KOT LISTENER'
  );

  const unsubscribe =
    window.posApi.onKotReceived((data) => {

      console.log(
        'TABLES: KOT RECEIVED',
        data
      );

      loadTables();

    });

  // return () => {

  //  unsubscribe?.();

  // };
  return () => {
  console.log(
    'TABLES: KOT LISTENER REMOVED'
  );
};

}, []);


 

  async function loadTables() {
    try {
      setLoading(true);

      const rows = await window.posApi.getTables();

      console.log(
        '========== GET TABLES RESULT =========='
      );

      console.log('ROWS:', rows);

      console.log(
        'ROW COUNT:',
        Array.isArray(rows)
          ? rows.length
          : 'NOT ARRAY'
      );

      if (Array.isArray(rows)) {
        rows.forEach((table, index) => {
          // console.log(
          //   `TABLE [${index}]`,
          //   table
          // );

          // console.log(
          //   `TABLE [${index}] COUNTS`,
          //   {
          //     id: table.id,
          //     tableName: table.tableName,
          //     status: table.status,

          //     cartCount: table.cartCount,
          //     billCount: table.billCount,
          //     billAmount: table.billAmount,

          //     cartItems: table.cartItems,
          //     billItems: table.billItems,
          //   }
          // );
        });
      }

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
  const cartCount = Number(table.cartCount || 0);
  const billCount = Number(table.billCount || 0);
  const billAmount = Number(table.billAmount || 0);

  console.log('🪑 TABLE STATUS CHECK', {
    table: table.tableName,
    rawStatus: table.status,
    cartCount,
    billCount,
    billAmount,
    billItems: table.billItems,
    cartItems: table.cartItems,
    activeOrderId: table.activeOrderId,
  });

  // ===================================================
  // EMPTY
  // ===================================================

  if (
    cartCount === 0 &&
    billCount === 0 &&
    billAmount === 0
  ) {
    console.log('🟢 AVAILABLE:', table.tableName);

    return 'AVAILABLE';
  }

  // ===================================================
  // CART HAS ITEMS
  // ===================================================

  if (cartCount > 0) {
    console.log('🟩 OCCUPIED / RUNNING:', table.tableName);

    return 'OCCUPIED';
  }

  // ===================================================
  // BILL EXISTS
  // ===================================================

  if (billCount > 0 || billAmount > 0) {
    console.log('🟠 PENDING PAYMENT:', table.tableName);

    return 'PENDING_PAYMENT';
  }

  return 'AVAILABLE';
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

function getStatusStyle(table: any) {
  const status = getTableStatus(table);

  console.log(
    '🎨 STATUS STYLE:',
    {
      table: table.tableName,
      status,
    }
  );

  // ===================================================
  // AVAILABLE / FREE
  // ===================================================

  if (
    status === 'AVAILABLE' 
    
  ) {
    console.log(
      '🟢 AVAILABLE STYLE',
      table.tableName
    );

    return {
      background: '#F0FDF4',
      color: '#166534',
      border: '#86EFAC',
      secondaryText: '#16A34A',
      separator: '#BBF7D0',
    };
  }

  // ===================================================
  // RUNNING / OCCUPIED
  // ===================================================

  if (
   
    status === 'OCCUPIED'
  ) {
    console.log(
      '🟩 RUNNING DARK GREEN STYLE',
      table.tableName
    );

    return {
      background: '#166534',
      color: '#FFFFFF',
      border: '#14532D',
      secondaryText: '#DCFCE7',
      separator: '#22C55E',
    };
  }

  // ===================================================
  // PENDING PAYMENT
  // ===================================================

  if (
    status === 'PENDING_PAYMENT' ||
    status === 'PENDING'
  ) {
    console.log(
      '🟠 PENDING PAYMENT STYLE',
      table.tableName
    );

    return {
      background: '#d4937d',
      color: '#9A3412',
      border: '#F97316',
      secondaryText: '#EA580C',
      separator: '#FDBA74',
    };
  }

  // ===================================================
  // HOLD
  // ===================================================

  if (status === 'HOLD') {
    console.log(
      '🟡 HOLD STYLE',
      table.tableName
    );

    return {
      background: '#FEFCE8',
      color: '#854D0E',
      border: '#EAB308',
      secondaryText: '#CA8A04',
      separator: '#FDE047',
    };
  }

  // ===================================================
  // CLOSED
  // ===================================================

  if (status === 'CLOSED') {
    console.log(
      '⚪ CLOSED STYLE',
      table.tableName
    );

    return {
      background: '#f1f9f8',
      color: '#334155',
      border: '#94A3B8',
      secondaryText: '#64748B',
      separator: '#CBD5E1',
    };
  }

  // ===================================================
  // UNKNOWN
  // ===================================================

  console.log(
    '❌ UNKNOWN STATUS - FALLBACK',
    {
      table: table.tableName,
      status,
      rawStatus: table.status,
    }
  );

  return {
    background: '#F8FAFC',
    color: '#334155',
    border: '#CBD5E1',
    secondaryText: '#64748B',
    separator: '#E2E8F0',
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
    items-end
  "
>
                    {areaTables.map((table) => {
                      const isActive =
                        activeTable?.tableId ===
                        table.id;

                      const status =
                        getTableStatus(table);

                     const statusStyle =
  getStatusStyle(table);

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
  ? `0 0 0 3px ${statusStyle.border}`
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

{/* <div className="mt-2">
  <span
    className="
      inline-flex
      items-center
      rounded-md
      px-2
      py-1
      text-[9px]
      font-semibold
      uppercase
      tracking-wide
    "
    style={{
      color: statusStyle.secondaryText,
      backgroundColor:
        statusStyle.statusBackground,
    }}
  >
    {status}
  </span>
</div> */}
                          {/* =================================================
                              TABLE INFORMATION
                          ================================================= */}

               {/* =================================================
    TABLE INFORMATION
================================================= */}

{/* =================================================
    TABLE INFORMATION
================================================= */}

{(() => {
  const cartCount = Number(table.cartCount || 0);
  const billCount = Number(table.billCount || 0);
  const billAmount = Number(table.billAmount || 0);

  const hasInformation =
    cartCount > 0 ||
    billCount > 0 ||
    billAmount > 0;

  return (
    <div
      className="
        mt-3
        space-y-1
     
        pt-2
        min-h-[58px]
      "
      style={{
        borderColor: hasInformation
          ? statusStyle.separator
          : 'transparent',
      }}
    >

      {/* =================================================
          ITEMS
      ================================================= */}

      {cartCount > 0 ? (
        <div className="flex items-center  gap-1 text-xs">
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
            {cartCount}
          </span>
        </div>
      ) : (
        <div className="h-[16px]" />
      )}

      {/* =================================================
          BILLS
      ================================================= */}

      {billCount > 0 ? (
        <div className="flex items-center gap-1  text-xs">
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
            {billCount}
          </span>
        </div>
      ) : (
        <div className="h-[16px]" />
      )}

      {/* =================================================
          AMOUNT
      ================================================= */}

      {billAmount > 0 ? (
        <div className="flex items-center gap-1 text-xs">
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
            {billAmount.toFixed(2)}
          </span>
        </div>
      ) : (
        <div className="h-[16px]" />
      )}

    </div>
  );
})()}

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

