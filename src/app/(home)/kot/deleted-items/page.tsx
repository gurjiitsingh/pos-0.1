'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type DeletedKotItem = {
  id: string;
  kotHistoryId: string;
  kotNumber: string | number;
  tableNo: string | number;
  tableName?: string | null;
  orderType?: string | null;
  name: string;
  quantity: number;
  finalTotal: number;
  deletedAt: number | null;
  businessDate?: string | null;
};

type DeletedKotItemsResult = {
  success: boolean;
  data?: DeletedKotItem[];
  error?: string;
};

function getTodayDate() {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
}

export default function DeletedKotItemsPage() {
  const [items, setItems] = useState<DeletedKotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayDate);

  // Fetch only the selected date from the database.
  const loadDeletedItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const result: DeletedKotItemsResult =
        await window.posApi.getDeletedKotHistoryItems(selectedDate);

      if (!result?.success) {
        throw new Error(
          result?.error || 'Failed to load deleted KOT items'
        );
      }

      setItems(result.data ?? []);
    } catch (err) {
      console.error('LOAD DELETED KOT ITEMS FAILED', err);

      setItems([]);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load deleted KOT items'
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Load on first render and whenever the selected date changes.
  useEffect(() => {
    void loadDeletedItems();
  }, [loadDeletedItems]);

  function formatDeletedAt(value: number | null) {
    if (value == null) return '—';

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? '—'
      : date.toLocaleString();
  }

  function formatAmount(value: number) {
    return Number(value || 0).toFixed(2);
  }

  // Search only within the records returned for the selected date.
  const filteredItems = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return items;

    return items.filter((item) =>
      [
        item.kotNumber,
        item.tableNo,
        item.tableName,
        item.name,
        item.orderType,
        item.businessDate,
      ].some((field) =>
        String(field ?? '').toLowerCase().includes(value)
      )
    );
  }, [items, search]);

  const totalQuantity = filteredItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const totalAmount = filteredItems.reduce(
    (sum, item) => sum + Number(item.finalTotal || 0),
    0
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 text-slate-900">
      {/* HEADER */}
      <div className="shrink-0 border-b border-slate-200 bg-white">
        <div className="px-4 py-4 md:px-6 md:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <span className="text-lg font-bold">!</span>
              </div>

              <div className="min-w-0">
                <h1 className="text-base font-semibold tracking-tight md:text-lg">
                  Deleted KOT Items
                </h1>
                <p className="text-xs text-slate-500">
                  History of items deleted from kitchen orders
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => void loadDeletedItems()}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className={loading ? 'animate-spin' : ''}>↻</span>
                <span className="hidden sm:inline">
                  {loading ? 'Loading' : 'Refresh'}
                </span>
              </button>

              <Link
                href="/kot/history"
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
              >
               
                <span className="hidden sm:inline">KOT History</span>
                <span className="sm:hidden">History</span>
              </Link>
            </div>
          </div>

          {/* DATE SELECTOR + SEARCH */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
            <div>
              <label
                htmlFor="deleted-kot-date"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Select Date
              </label>

              <input
                id="deleted-kot-date"
                type="date"
                value={selectedDate}
                max={getTodayDate()}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="deleted-kot-search"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Search Items
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                  ⌕
                </span>

                <input
                  id="deleted-kot-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search item, KOT number or table..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-3 gap-px border-t border-slate-100 bg-slate-100">
          <div className="bg-white px-4 py-3 md:px-6">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Deleted Records
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {filteredItems.length}
            </p>
          </div>

          <div className="bg-white px-4 py-3 md:px-6">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Total Quantity
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {totalQuantity}
            </p>
          </div>

          <div className="bg-white px-4 py-3 md:px-6">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Total Amount
            </p>
            <p className="mt-1 truncate text-lg font-bold text-red-600">
              ₹{formatAmount(totalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-5">
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-bold">!</span>
            <span className="min-w-0 flex-1">{error}</span>
            <button
              type="button"
              onClick={() => void loadDeletedItems()}
              className="shrink-0 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div className="flex h-56 flex-col items-center justify-center gap-3 text-sm text-slate-400">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-red-500" />
            Loading deleted items...
          </div>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-lg font-bold text-red-400">
              !
            </div>

            <p className="text-sm font-semibold text-slate-700">
              {search
                ? 'No matching deleted items'
                : 'No deleted items found'}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {search
                ? 'Try another item name, KOT number or table.'
                : `No deleted kitchen order items found for ${selectedDate}.`}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden grid-cols-[145px_100px_minmax(150px,1fr)_100px_100px_130px] items-center border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 lg:grid">
              <span>Deleted At</span>
              <span>KOT</span>
              <span>Item</span>
              <span>Table</span>
              <span>Quantity</span>
              <span className="text-right">Amount</span>
            </div>

            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-3 border-b border-slate-100 px-4 py-4 transition last:border-b-0 hover:bg-slate-50/70 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center md:px-5 lg:grid-cols-[145px_100px_minmax(150px,1fr)_100px_100px_130px] lg:gap-0"
              >
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400 lg:hidden">
                    Deleted At
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDeletedAt(item.deletedAt)}
                  </p>
                  {item.businessDate && (
                    <p className="mt-1 text-[10px] text-slate-400">
                      Business: {item.businessDate}
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400 lg:hidden">
                    KOT Number
                  </p>
                  <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    {item.kotNumber}
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400 lg:hidden">
                    Item Name
                  </p>
                  <p className="break-words text-sm font-semibold text-slate-800">
                    {item.name || '-'}
                  </p>
                  {item.orderType && (
                    <p className="mt-1 text-[10px] text-slate-400">
                      {item.orderType}
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400 lg:hidden">
                    Table
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    {item.tableName || item.tableNo || '-'}
                  </p>
                  {item.tableName && (
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      No. {item.tableNo}
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400 lg:hidden">
                    Quantity
                  </p>
                  <span className="inline-flex min-w-8 justify-center rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                    {item.quantity}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 sm:col-span-2 lg:col-span-1 lg:justify-end lg:border-0 lg:pt-0">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 lg:hidden">
                    Amount
                  </p>
                  <div className="text-right">
                    <p className="text-base font-bold tabular-nums text-red-600">
                      ₹{formatAmount(item.finalTotal)}
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium text-red-400">
                      Deleted item
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-400">
            <span>
              Showing {filteredItems.length} of {items.length} records for {selectedDate}
            </span>

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="font-medium text-slate-600 hover:text-slate-900"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
 