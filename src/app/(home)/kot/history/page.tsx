'use client';

import BackButton from '@/components/buttons/Back';
import { useEffect, useState } from 'react';

type KotHistory = {
  id: string;
  kotBatchId: string;
  kotNumber: string;

  tableNo: string;
  tableName?: string;

  orderType: string;

  status: string;

  businessDate: string;

  createdAt: number;
  completedAt?: number | null;

  orderId?: string | null;
  billNo?: string | null;

  deviceId: string;
  deviceName?: string | null;
  appVersion?: string | null;

  sentBy?: string | null;

  syncStatus: string;
  lastSyncedAt?: number | null;
};

type KotHistoryItem = {
  id: string;

  kotHistoryId: string;
  kotNumber: string;

  tableNo: string;

  productId: string;
  name: string;

  categoryId?: string | null;
  categoryName?: string | null;

  parentId?: string | null;
  isVariant: number;

  productMode?: string | null;

  basePrice: number;
  quantity: number;

  modifierPrice: number;
  modifierSummary?: string | null;
  modifiersJson?: string | null;

  note?: string | null;

  taxRate: number;
  taxType: string;

  taxAmountPerItem: number;
  taxTotal: number;

  finalPricePerItem: number;
  finalTotal: number;

  status: string;

  source: string;

  createdAt: number;
  deletedAt?: number | null;

  syncStatus: string;
  lastSyncedAt?: number | null;
};

type KotHistoryDetail =
  KotHistory & {
    items: KotHistoryItem[];
  };

export default function KotHistoryPage() {

  const [history, setHistory] =
    useState<KotHistory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [selectedKot, setSelectedKot] =
    useState<KotHistoryDetail | null>(null);

  const [loadingDetail, setLoadingDetail] =
    useState(false);

    const [toastMessage, setToastMessage] = useState('');
const [toastType, setToastType] = useState<'success' | 'error'>('error');

function showToast(
  message: string,
  type: 'success' | 'error' = 'error'
) {
  setToastMessage(message);
  setToastType(type);
}

  const [activeFilter, setActiveFilter] = useState<
  'ALL' | 'OPEN' | 'PARTIAL' | 'DELETED' | 'PAID'
>('ALL');  

const [activeTab, setActiveTab] = useState<
  'KOT_HISTORY' | 'DELETED_ITEMS'
>('KOT_HISTORY');

  const [search, setSearch] =
    useState('');


    

  // =====================================================
  // LOAD HISTORY
  // =====================================================

  async function loadHistory() {

    try {

      setLoading(true);
      setError(null);

      const result =
        await window.posApi.getKotHistory();

      if (!result?.success) {

        throw new Error(
          result?.error ||
          'Failed to load KOT history'
        );
      }

      setHistory(
        result.data || []
      );

    } catch (error: any) {

      console.error(
        'LOAD KOT HISTORY FAILED',
        error
      );

      setError(
        error?.message ||
        'Failed to load KOT history'
      );

    } finally {

      setLoading(false);

    }
  }

  // =====================================================
  // LOAD DETAIL
  // =====================================================

  async function openKot(
    kotHistoryId: string
  ) {

    try {

      setLoadingDetail(true);


//       const result1 =
//   await window.posApi.getRecentKotHistoryItems(20);

// console.log(
//   'RECENT KOT HISTORY ITEMS:',
//   result1
// );

// const history =
//   await window.posApi.getKotHistory();

// console.log(
//   'KOT HISTORY:',
//   history
// );

      const result =
        await window.posApi.getKotHistoryDetail(
          kotHistoryId
        );

      if (!result?.success) {

        throw new Error(
          result?.error ||
          'Failed to load KOT'
        );
      }
     
 
      setSelectedKot(
        result.data || null
      );

    } catch (error: any) {

      console.error(
        'LOAD KOT DETAIL FAILED',
        error
      );

   showToast(
  error?.message || 'Failed to load KOT',
  'error'
);
    } finally {

      setLoadingDetail(false);

    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadHistory();

  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

const filteredHistory =
  history.filter((kot) => {

    // =================================================
    // STATUS FILTER
    // =================================================

    if (
      activeFilter !== 'ALL' &&
      kot.status?.toUpperCase() !== activeFilter
    ) {
      return false;
    }

    // =================================================
    // SEARCH FILTER
    // =================================================

    const value =
      search
        .trim()
        .toLowerCase();

    if (!value) {
      return true;
    }

    return (
      kot.kotNumber
        ?.toLowerCase()
        .includes(value) ||

      kot.tableNo
        ?.toLowerCase()
        .includes(value) ||

      kot.tableName
        ?.toLowerCase()
        .includes(value) ||

      kot.billNo
        ?.toLowerCase()
        .includes(value) ||

      kot.orderId
        ?.toLowerCase()
        .includes(value)
    );

  });


  const deletedItems = history
  .filter(
    (kot) =>
      kot.status?.toUpperCase() === 'DELETED'
  )
  .flatMap((kot) => {
    // Items are loaded separately through getKotHistoryDetail.
    return [];
  });

  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(
    timestamp?: number | null
  ) {

    if (!timestamp) {
      return '-';
    }

    return new Date(timestamp)
      .toLocaleString();
  }

  // =====================================================
  // STATUS
  // =====================================================

  function statusClass(
    status: string
  ) {

    switch (
      status?.toUpperCase()
    ) {

      case 'PAID':
      case 'COMPLETED':

        return `
          bg-green-100
          text-green-700
        `;

      case 'PARTIAL':

        return `
          bg-yellow-100
          text-yellow-700
        `;

      case 'DELETED':

        return `
          bg-red-100
          text-red-700
        `;

      default:

        return `
          bg-gray-100
          text-gray-700
        `;
    }
  }

  const statusCounts = {
  ALL: history.length,

  OPEN: history.filter(
    (kot) =>
      kot.status?.toUpperCase() === 'OPEN'
  ).length,

  PARTIAL: history.filter(
    (kot) =>
      kot.status?.toUpperCase() === 'PARTIAL'
  ).length,

  DELETED: history.filter(
    (kot) =>
      kot.status?.toUpperCase() === 'DELETED'
  ).length,

  PAID: history.filter(
    (kot) =>
      kot.status?.toUpperCase() === 'PAID'
  ).length,
};

  // =====================================================
  // RENDER
  // =====================================================

return (<>
  <div className="flex h-full min-h-0 flex-col bg-slate-50 text-slate-900">

    {/* =========================================================
        HEADER
    ========================================================= */}
    <div className="shrink-0 border-b border-slate-200 bg-white">

      <div className="px-4 py-4 md:px-6 md:py-5">

        <div className="flex items-center justify-between gap-4">

          <div className="min-w-0">

            <div className="flex items-center gap-2">

              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-900
                  text-white
                "
              >
                <span className="text-sm font-bold">
                  K
                </span>
              </div>

              <div>

                <h1 className="text-base font-semibold tracking-tight md:text-lg">
                  KOT History
                </h1>

                <p className="text-xs text-slate-500">
                  Previously sent kitchen orders
                </p>

              </div>

            </div>

          </div>
          <div className='flex gap-3'>
<BackButton />

          {/* REFRESH */}
          <button
            type="button"
            onClick={loadHistory}
            disabled={loading}
            className="
              flex
              shrink-0
              items-center
              gap-2
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              py-2
              text-xs
              font-medium
              text-slate-700
              shadow-sm
              transition
              hover:bg-slate-50
              hover:border-slate-300
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            <span
              className={
                loading
                  ? 'animate-spin'
                  : ''
              }
            >
              ↻
            </span>

            {loading
              ? 'Loading'
              : 'Refresh'}

          </button>

        </div>
</div>

        {/* =====================================================
            SEARCH
        ===================================================== */}
        <div className="relative mt-5">

          <span
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          >
            ⌕
          </span>

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search KOT, table, bill or order..."
            className="
              h-10
              w-full
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              pl-9
              pr-3
              text-sm
              text-slate-800
              outline-none
              placeholder:text-slate-400
              transition
              focus:border-slate-400
              focus:bg-white
              focus:ring-2
              focus:ring-slate-100
            "
          />

        </div>

      </div>



{/* MAIN TABS */}
<div className="flex gap-2 border-t border-slate-100 px-4 py-3 md:px-6">
  <button
    type="button"
    onClick={() => setActiveTab('KOT_HISTORY')}
    className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
      activeTab === 'KOT_HISTORY'
        ? 'bg-slate-900 text-white'
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`}
  >
    KOT History
  </button>

  <button
    type="button"
    onClick={() => setActiveTab('DELETED_ITEMS')}
    className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
      activeTab === 'DELETED_ITEMS'
        ? 'bg-red-600 text-white'
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`}
  >
    Deleted Items
  </button>
</div>

      {/* =========================================================
          FILTER BAR
      ========================================================= */}
      <div
        className="
          flex
          gap-1.5
          overflow-x-auto
          border-t
          border-slate-100
          px-4
          py-2.5
          md:px-6
        "
      >

        {(
          [
            ['ALL', 'All'],
            ['OPEN', 'Open'],
            ['PARTIAL', 'Partial'],
            ['DELETED', 'Deleted'],
            ['PAID', 'Paid'],
          ] as const
        ).map(([key, label]) => {

          const isActive =
            activeFilter === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() =>
                setActiveFilter(key)
              }
              className={`
                flex
                shrink-0
                items-center
                gap-1.5
                rounded-lg
                px-3
                py-1.5
                text-xs
                font-medium
                transition

                ${
                  isActive
                    ? `
                      bg-slate-900
                      text-white
                      shadow-sm
                    `
                    : `
                      text-slate-500
                      hover:bg-slate-100
                      hover:text-slate-800
                    `
                }
              `}
            >

              <span>
                {label}
              </span>

              <span
                className={`
                  rounded-md
                  px-1.5
                  py-0.5
                  text-[10px]

                  ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }
                `}
              >
                {statusCounts[key]}
              </span>

            </button>
          );

        })}

      </div>

    </div>


    {/* =========================================================
        CONTENT
    ========================================================= */}
    <div
      className="
        min-h-0
        flex-1
        overflow-y-auto
        px-3
        py-4
        md:px-6
        md:py-5
      "
    >

      {/* ERROR */}
      {error && (

        <div
          className="
            mb-4
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-red-100
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
          "
        >

          <span className="font-semibold">
            !
          </span>

          <span>
            {error}
          </span>

        </div>

      )}


      {/* LOADING */}
      {loading && (

        <div
          className="
            flex
            h-56
            flex-col
            items-center
            justify-center
            gap-3
            text-sm
            text-slate-400
          "
        >

          <div
            className="
              h-7
              w-7
              animate-spin
              rounded-full
              border-2
              border-slate-200
              border-t-slate-700
            "
          />

          Loading KOT history...

        </div>

      )}


      {/* EMPTY */}
      {!loading &&
        filteredHistory.length === 0 && (

          <div
            className="
              flex
              min-h-[360px]
              flex-col
              items-center
              justify-center
              rounded-2xl
              border
              border-slate-200
              bg-white
              text-center
            "
          >

            <div
              className="
                mb-3
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-slate-100
                text-lg
                text-slate-400
              "
            >
              K
            </div>

            <p className="text-sm font-medium text-slate-700">
              No KOT history found
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {search
                ? 'Try changing your search or filter.'
                : 'Previously sent kitchen orders will appear here.'}
            </p>

          </div>

        )}


      {/* =========================================================
          HISTORY
      ========================================================= */}
      {!loading &&
        filteredHistory.length > 0 && (

          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-sm
            "
          >

            {/* =====================================================
                DESKTOP HEADER
            ===================================================== */}
            <div
              className="
                hidden
                grid-cols-[110px_minmax(180px,1fr)_150px_130px_110px]
                items-center
                border-b
                border-slate-100
                bg-slate-50/70
                px-5
                py-3
                text-[10px]
                font-semibold
                uppercase
                tracking-wider
                text-slate-400
                md:grid
              "
            >

              <span>KOT</span>

              <span>Table</span>

              <span>Created</span>

              <span>Bill</span>

              <span>Status</span>

            </div>


            {/* =====================================================
                ROWS
            ===================================================== */}
            {filteredHistory.map(
              (kot) => (

                <button
                  key={kot.id}
                  type="button"
                  onClick={() =>
                    openKot(kot.id)
                  }
                  className="
                    group
                    grid
                    w-full
                    grid-cols-1
                    gap-3
                    border-b
                    border-slate-100
                    px-4
                    py-4
                    text-left
                    transition
                    last:border-b-0
                    hover:bg-slate-50/70
                    md:grid-cols-[110px_minmax(180px,1fr)_150px_130px_110px]
                    md:items-center
                    md:gap-0
                    md:px-5
                  "
                >

                  {/* =================================================
                      KOT
                  ================================================= */}
                  <div>

                    <p
                      className="
                        mb-1
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-wide
                        text-slate-400
                        md:hidden
                      "
                    >
                      KOT
                    </p>

                    <div className="flex items-center gap-2">

                      <span
                        className="
                          text-sm
                          font-bold
                          tracking-tight
                          text-slate-800
                        "
                      >
                        {kot.kotNumber}
                      </span>

                      <span
                        className="
                          text-slate-300
                          opacity-0
                          transition
                          group-hover:opacity-100
                        "
                      >
                        →
                      </span>

                    </div>

                  </div>


                  {/* =================================================
                      TABLE
                  ================================================= */}
                  <div className="min-w-0">

                    <p
                      className="
                        mb-1
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-wide
                        text-slate-400
                        md:hidden
                      "
                    >
                      Table
                    </p>

                    <p
                      className="
                        truncate
                        text-sm
                        font-medium
                        text-slate-700
                      "
                    >
                      {kot.tableName ||
                        kot.tableNo ||
                        '-'}
                    </p>

                    {kot.tableName && (
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {kot.tableNo}
                      </p>
                    )}

                  </div>


                  {/* =================================================
                      DATE
                  ================================================= */}
                  <div>

                    <p
                      className="
                        mb-1
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-wide
                        text-slate-400
                        md:hidden
                      "
                    >
                      Created
                    </p>

                    <span className="text-xs text-slate-500">
                      {formatDate(
                        kot.createdAt
                      )}
                    </span>

                  </div>


                  {/* =================================================
                      BILL
                  ================================================= */}
                  <div>

                    <p
                      className="
                        mb-1
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-wide
                        text-slate-400
                        md:hidden
                      "
                    >
                      Bill
                    </p>

                    <span
                      className="
                        text-xs
                        font-medium
                        text-slate-600
                      "
                    >
                      {kot.billNo || '-'}
                    </span>

                  </div>


                  {/* =================================================
                      STATUS
                  ================================================= */}
                  <div>

                    <p
                      className="
                        mb-1
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-wide
                        text-slate-400
                        md:hidden
                      "
                    >
                      Status
                    </p>

                    <span
                      className={`
                        inline-flex
                        rounded-full
                        px-2.5
                        py-1
                        text-[10px]
                        font-semibold
                        ${statusClass(
                          kot.status
                        )}
                      `}
                    >
                      {kot.status}
                    </span>

                  </div>

                </button>

              )
            )}

          </div>

        )}

    </div>


    {/* =========================================================
        DETAIL MODAL
    ========================================================= */}
 {selectedKot && (

  <div
    className="
      fixed
      inset-0
      z-50
      flex
      top-16
      items-center
      justify-center
      bg-slate-950/40
      p-3
      backdrop-blur-[2px]
      md:p-5
    "
  >

    <div
      className="
        flex
        max-h-[93vh]
        w-full
        max-w-4xl
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-2xl
      "
    >

      {/* =====================================================
          MODAL HEADER
      ===================================================== */}

      <div
        className="
          flex
          shrink-0
          items-start
          justify-between
          gap-4
          border-b
          border-slate-100
          bg-white
          px-5
          py-4
        "
      >

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-3">

            <div>

              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                Kitchen Order
              </p>

              <h2
                className="
                  mt-0.5
                  text-xl
                  font-bold
                  tracking-tight
                  text-slate-900
                "
              >
                {selectedKot.kotNumber}
              </h2>

            </div>


            {/* KOT STATUS */}

            <span
              className={`
                inline-flex
                items-center
                rounded-full
                px-3
                py-1.5
                text-[10px]
                font-bold
                uppercase
                tracking-wide
                ${statusClass(
                  selectedKot.status
                )}
              `}
            >
              {selectedKot.status}
            </span>

          </div>


          <div
            className="
              mt-2
              flex
              flex-wrap
              items-center
              gap-x-4
              gap-y-1
              text-xs
              text-slate-500
            "
          >

            <span>
              Table:
              <span className="ml-1 font-medium text-slate-700">
                {selectedKot.tableName ||
                  selectedKot.tableNo ||
                  '-'}
              </span>
            </span>

            <span>
              Bill:
              <span className="ml-1 font-medium text-slate-700">
                {selectedKot.billNo || '-'}
              </span>
            </span>

            <span>
              Date:
              <span className="ml-1 font-medium text-slate-700">
                {formatDate(
                  selectedKot.createdAt
                )}
              </span>
            </span>

          </div>

        </div>


        {/* CLOSE */}

        <button
          type="button"
          onClick={() =>
            setSelectedKot(null)
          }
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-slate-400
            transition
            hover:bg-slate-100
            hover:text-slate-700
          "
        >
          ✕
        </button>

      </div>


      {/* =====================================================
          KOT SUMMARY
      ===================================================== */}

      <div
        className="
          grid
          shrink-0
          grid-cols-2
          gap-px
          border-b
          border-slate-100
          bg-slate-100
          md:grid-cols-4
        "
      >

        {/* KOT */}

        <div className="bg-white px-5 py-3">

          <p
            className="
              text-[10px]
              font-medium
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            KOT
          </p>

          <p
            className="
              mt-1
              text-sm
              font-semibold
              text-slate-800
            "
          >
            {selectedKot.kotNumber}
          </p>

        </div>


        {/* TABLE */}

        <div className="bg-white px-5 py-3">

          <p
            className="
              text-[10px]
              font-medium
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            Table
          </p>

          <p
            className="
              mt-1
              truncate
              text-sm
              font-semibold
              text-slate-800
            "
          >
            {selectedKot.tableName ||
              selectedKot.tableNo ||
              '-'}
          </p>

        </div>


        {/* BILL */}

        <div className="bg-white px-5 py-3">

          <p
            className="
              text-[10px]
              font-medium
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            Bill
          </p>

          <p
            className="
              mt-1
              text-sm
              font-semibold
              text-slate-800
            "
          >
            {selectedKot.billNo || '-'}
          </p>

        </div>


        {/* CREATED */}

        <div className="bg-white px-5 py-3">

          <p
            className="
              text-[10px]
              font-medium
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            Created
          </p>

          <p
            className="
              mt-1
              text-sm
              font-semibold
              text-slate-800
            "
          >
            {formatDate(
              selectedKot.createdAt
            )}
          </p>

        </div>

      </div>


      {/* =====================================================
          KOT LIFECYCLE INFO
      ===================================================== */}

      <div
        className="
          shrink-0
          border-b
          border-slate-100
          bg-slate-50/70
          px-5
          py-3
        "
      >

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-x-6
            gap-y-2
            text-xs
          "
        >

          {/* STATUS */}

          <div>

            <span className="text-slate-400">
              Status
            </span>

            <span
              className="
                ml-2
                font-semibold
                text-slate-700
              "
            >
              {selectedKot.status || '-'}
            </span>

          </div>


          {/* BUSINESS DATE */}

          <div>

            <span className="text-slate-400">
              Business Date
            </span>

            <span
              className="
                ml-2
                font-medium
                text-slate-700
              "
            >
              {selectedKot.businessDate || '-'}
            </span>

          </div>


          {/* DEVICE */}

          <div>

            <span className="text-slate-400">
              Device
            </span>

            <span
              className="
                ml-2
                font-medium
                text-slate-700
              "
            >
              {selectedKot.deviceName ||
                selectedKot.deviceId ||
                '-'}
            </span>

          </div>


          {/* APP */}

          <div>

            <span className="text-slate-400">
              App
            </span>

            <span
              className="
                ml-2
                font-medium
                text-slate-700
              "
            >
              {selectedKot.appVersion || '-'}
            </span>

          </div>


          {/* COMPLETED */}

          {selectedKot.completedAt && (

            <div>

              <span className="text-slate-400">
                Completed
              </span>

              <span
                className="
                  ml-2
                  font-medium
                  text-slate-700
                "
              >
                {formatDate(
                  selectedKot.completedAt
                )}
              </span>

            </div>

          )}


          {/* DELETED */}

          {/* {selectedKot.deletedAt && (

            <div>

              <span className="text-slate-400">
                Deleted
              </span>

              <span
                className="
                  ml-2
                  font-medium
                  text-red-600
                "
              >
                {formatDate(
                  selectedKot.deletedAt
                )}
              </span>

            </div>

          )} */}

        </div>

      </div>


      {/* =====================================================
          ITEMS
      ===================================================== */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          bg-slate-50/60
          px-4
          py-4
          md:px-5
        "
      >

        {loadingDetail ? (

          <div
            className="
              flex
              h-40
              items-center
              justify-center
              text-sm
              text-slate-400
            "
          >
            Loading items...
          </div>

        ) : (

          <div className="space-y-3">

            {selectedKot.items.length === 0 ? (

              <div
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-12
                  text-center
                  text-sm
                  text-slate-400
                "
              >
                No items found.
              </div>

            ) : (

              selectedKot.items.map(
                (item, index) => (

                  <div
                    key={item.id}
                    className="
                      overflow-hidden
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      shadow-sm
                    "
                  >

                    {/* =================================================
                        ITEM HEADER
                    ================================================= */}

                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-4
                        border-b
                        border-slate-100
                        px-4
                        py-3
                      "
                    >

                      <div className="flex min-w-0 items-start gap-3">

                        {/* ITEM NUMBER */}

                        <div
                          className="
                            flex
                            h-8
                            w-8
                           bottom-0
                           top-26
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-100
                            text-xs
                            pt-10
                            font-bold
                            text-slate-600
                          "
                        >
                          {index + 1}
                        </div>


                        <div className="min-w-0">

                          <div
                            className="
                              flex
                              flex-wrap
                              items-center
                              gap-2
                            "
                          >

                            <h3
                              className="
                                text-sm
                                font-bold
                                text-slate-900
                              "
                            >
                              {item.name || '-'}
                            </h3>


                            {/* ITEM STATUS */}

                            {item.status && (

                              <span
                                className={`
                                  rounded-full
                                  px-2
                                  py-0.5
                                  text-[9px]
                                  font-bold
                                  uppercase
                                  tracking-wide
                                  ${statusClass(
                                    item.status
                                  )}
                                `}
                              >
                                {item.status}
                              </span>

                            )}

                          </div>


                          <div
                            className="
                              mt-1
                              flex
                              flex-wrap
                              gap-x-3
                              gap-y-1
                              text-[10px]
                              text-slate-400
                            "
                          >

                            <span>
                              Qty:
                              <span className="ml-1 font-semibold text-slate-600">
                                {item.quantity}
                              </span>
                            </span>

                            <span>
                              Category:
                              <span className="ml-1 text-slate-600">
                                {item.categoryName || '-'}
                              </span>
                            </span>

                            <span>
                              Mode:
                              <span className="ml-1 text-slate-600">
                                {item.productMode || '-'}
                              </span>
                            </span>

                          </div>

                        </div>

                      </div>


                      {/* FINAL TOTAL */}

                      <div className="shrink-0 text-right">

                        <p
                          className="
                            text-base
                            font-bold
                            text-slate-900
                          "
                        >
                          ₹
                          {Number(
                            item.finalTotal || 0
                          ).toFixed(2)}
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-[10px]
                            text-slate-400
                          "
                        >
                          Final total
                        </p>

                      </div>

                    </div>


                    {/* =================================================
                        ITEM PRICING
                    ================================================= */}

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-px
                        bg-slate-100
                        sm:grid-cols-4
                      "
                    >

                      {/* BASE PRICE */}

                      <div className="bg-white px-4 py-3">

                        <p
                          className="
                            text-[9px]
                            uppercase
                            tracking-wide
                            text-slate-400
                          "
                        >
                          Base Price
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            font-semibold
                            text-slate-700
                          "
                        >
                          ₹
                          {Number(
                            item.basePrice || 0
                          ).toFixed(2)}
                        </p>

                      </div>


                      {/* MODIFIER */}

                      <div className="bg-white px-4 py-3">

                        <p
                          className="
                            text-[9px]
                            uppercase
                            tracking-wide
                            text-slate-400
                          "
                        >
                          Modifier
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            font-semibold
                            text-slate-700
                          "
                        >
                          ₹
                          {Number(
                            item.modifierPrice || 0
                          ).toFixed(2)}
                        </p>

                      </div>


                      {/* PRICE PER ITEM */}

                      <div className="bg-white px-4 py-3">

                        <p
                          className="
                            text-[9px]
                            uppercase
                            tracking-wide
                            text-slate-400
                          "
                        >
                          Price / Item
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            font-semibold
                            text-slate-700
                          "
                        >
                          ₹
                          {Number(
                            item.finalPricePerItem || 0
                          ).toFixed(2)}
                        </p>

                      </div>


                      {/* SUBTOTAL */}

                      {/* <div className="bg-white px-4 py-3">

                        <p
                          className="
                            text-[9px]
                            uppercase
                            tracking-wide
                            text-slate-400
                          "
                        >
                          Subtotal
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            font-semibold
                            text-slate-700
                          "
                        >
                          ₹
                          {Number(
                            item.itemSubtotal ||
                            0
                          ).toFixed(2)}
                        </p>

                      </div> */}

                    </div>


                    {/* =================================================
                        TAX INFORMATION
                    ================================================= */}

                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-x-5
                        gap-y-2
                        border-t
                        border-slate-100
                        px-4
                        py-3
                      "
                    >

                      <div>

                        <p className="text-[9px] uppercase tracking-wide text-slate-400">
                          Tax
                        </p>

                        <p className="mt-0.5 text-xs font-semibold text-slate-700">
                          {Number(
                            item.taxRate || 0
                          ).toFixed(2)}
                          %
                        </p>

                      </div>


                      <div>

                        <p className="text-[9px] uppercase tracking-wide text-slate-400">
                          Tax Type
                        </p>

                        <p className="mt-0.5 text-xs font-semibold text-slate-700">
                          {item.taxType || '-'}
                        </p>

                      </div>


                      <div>

                        <p className="text-[9px] uppercase tracking-wide text-slate-400">
                          Tax Amount
                        </p>

                        <p className="mt-0.5 text-xs font-semibold text-slate-700">
                          ₹
                          {Number(
                            item.taxTotal || 0
                          ).toFixed(2)}
                        </p>

                      </div>


                      {/* <div>

                        <p className="text-[9px] uppercase tracking-wide text-slate-400">
                          Currency
                        </p>

                        <p className="mt-0.5 text-xs font-semibold text-slate-700">
                          {item.currency || '₹'}
                        </p>

                      </div> */}

                    </div>


                    {/* =================================================
                        MODIFIERS / NOTE
                    ================================================= */}

                    {(item.modifierSummary ||
                      item.modifiersJson ||
                      item.note) && (

                      <div
                        className="
                          border-t
                          border-slate-100
                          bg-slate-50/70
                          px-4
                          py-3
                        "
                      >

                        {item.modifierSummary && (

                          <div className="mb-2">

                            <p
                              className="
                                text-[9px]
                                font-semibold
                                uppercase
                                tracking-wide
                                text-slate-400
                              "
                            >
                              Modifiers
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                text-slate-600
                              "
                            >
                              {item.modifierSummary}
                            </p>

                          </div>

                        )}


                        {item.note && (

                          <div>

                            <p
                              className="
                                text-[9px]
                                font-semibold
                                uppercase
                                tracking-wide
                                text-amber-500
                              "
                            >
                              Note
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                text-amber-700
                              "
                            >
                              {item.note}
                            </p>

                          </div>

                        )}

                      </div>

                    )}


                    {/* =================================================
                        ITEM METADATA
                    ================================================= */}

                    <div
                      className="
                        flex
                        flex-wrap
                        gap-x-5
                        gap-y-1
                        border-t
                        border-slate-100
                        px-4
                        py-2.5
                        text-[9px]
                        text-slate-400
                      "
                    >

                      {/* <span>
                        Product ID:
                        <span className="ml-1 text-slate-500">
                          {item.productId || '-'}
                        </span>
                      </span>

                      <span>
                        Category ID:
                        <span className="ml-1 text-slate-500">
                          {item.categoryId || '-'}
                        </span>
                      </span> */}

                      <span>
                        Source:
                        <span className="ml-1 text-slate-500">
                          {item.source || '-'}
                        </span>
                      </span>

                      {item.isVariant ? (

                        <span className="font-medium text-slate-500">
                          Variant
                        </span>

                      ) : null}

                    </div>


                    {/* =================================================
                        DELETED INFORMATION
                    ================================================= */}

                    {item.deletedAt && (

                      <div
                        className="
                          border-t
                          border-red-100
                          bg-red-50
                          px-4
                          py-2.5
                          text-[10px]
                          text-red-600
                        "
                      >

                        Deleted:
                        <span className="ml-1 font-medium">
                          {formatDate(
                            item.deletedAt
                          )}
                        </span>

                      </div>

                    )}

                  </div>

                )

              )

            )}

          </div>

        )}

      </div>


      {/* =====================================================
          FOOTER
      ===================================================== */}

  

    </div>

  </div>

)}
  </div>
{toastMessage && (
  <div
    role="status"
    aria-live="polite"
    className={`fixed right-5 top-5 z-[9999] flex max-w-md items-center gap-3 rounded-lg px-4 py-3 text-white shadow-lg ${
      toastType === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}
  >
    <span className="flex-1">{toastMessage}</span>

    <button
      type="button"
      onClick={() => setToastMessage('')}
      className="text-xl font-bold"
      aria-label="Dismiss notification"
    >
      ×
    </button>
  </div>
)}
  </>
);
}