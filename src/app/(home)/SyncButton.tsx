'use client';

import { useEffect, useState } from 'react';

export default function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('error');

  function showToast(
    message: string,
    type: 'success' | 'error' = 'error'
  ) {
    setToastMessage(message);
    setToastType(type);
  }

  // Automatically dismiss toast after 3 seconds
  useEffect(() => {
    if (!toastMessage) return;

    const timeoutId = setTimeout(() => {
      setToastMessage('');
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [toastMessage]);

  // SYNC ICON
  function SyncIcon({ size = 20 }: { size?: number }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 11a8.1 8.1 0 0 0-14.8-4L3 9" />
        <path d="M3 4v5h5" />
        <path d="M4 13a8.1 8.1 0 0 0 14.8 4L21 15" />
        <path d="M21 20v-5h-5" />
      </svg>
    );
  }

  async function handleSync() {
    if (loading) return;

    try {
      setLoading(true);

      const res = await window.posApi.syncAll();

      console.log('SYNC RESULT', res);

      // Check failure only if syncAll returns an explicit success field.
      if (res && res.success === false) {
        throw new Error(res.error || 'Sync failed');
      }

      showToast('Data synced successfully', 'success');
    } catch (e) {
      console.error('SYNC ERROR', e);

      showToast(
        e instanceof Error ? e.message : 'Sync failed',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        aria-label={loading ? 'Syncing data' : 'Sync data'}
        title={loading ? 'Syncing...' : 'Sync data'}
        className="rounded-full bg-blue-600 p-1 text-white disabled:opacity-50"
      >
        {loading ? 'Syncing...' : <SyncIcon size={20} />}
      </button>

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
 