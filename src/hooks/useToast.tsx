
'use client';

import { useCallback, useEffect, useState } from 'react';

type ToastType = 'success' | 'error';

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastType = 'error') => {
      setToast({
        id: Date.now() + Math.random(),
        message,
        type,
      });
    },
    []
  );

  useEffect(() => {
    if (!toast) return;

    const timeoutId = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [toast]);

  const toastComponent = toast ? (
    <div
      key={toast.id}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className={`fixed right-5 top-5 z-[99999] flex max-w-md items-center gap-3 rounded-lg px-4 py-3 text-white shadow-lg ${
        toast.type === 'success'
          ? 'bg-green-600'
          : 'bg-red-600'
      }`}
    >
      <span className="flex-1 break-words">
        {toast.message}
      </span>

      <button
        type="button"
        onClick={() => setToast(null)}
        className="text-xl font-bold"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  ) : null;

  return {
    showToast,
    toastComponent,
  };
}
