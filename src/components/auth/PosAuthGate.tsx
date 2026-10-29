
"use client";

import { useEffect, useState } from "react";

import { usePosAuth } from "@/store/PosAuthContext";
import LoginScreen from "./LoginScreen";

// =====================================================
// POS AUTH GATE
// =====================================================

export default function PosAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    isAuthenticated,
    isInitializing,
  } = usePosAuth();

  // ===================================================
  // FIREBASE CONFIGURATION STATE
  // ===================================================

  const [configChecked, setConfigChecked] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [clientId, setClientId] = useState("");
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState("");
  const [configStatus, setConfigStatus] = useState("");

  // ===================================================
  // CHECK FIREBASE CONFIGURATION
  // ===================================================

  useEffect(() => {
    let cancelled = false;

    async function checkConfig() {
      try {
        const result =
         
      await window.posApi.firebase.getConfig();
        if (cancelled) return;

        if (!result.success) {
          setConfigError(
            result.error ||
              "Failed to check Firebase configuration."
          );
          return;
        }

        setConfigured(result.configured === true);
        setConfigError("");
      } catch (error) {
        if (cancelled) return;

        setConfigError(
          error instanceof Error
            ? error.message
            : "Failed to check Firebase configuration."
        );
      } finally {
        if (!cancelled) {
          setConfigChecked(true);
        }
      }
    }

    void checkConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  // ===================================================
  // INITIALIZE FIREBASE
  // ===================================================

  async function handleFirebaseInitialize() {
    const cleanClientId = clientId.trim();

    if (!cleanClientId) {
      setConfigError("Please enter Client ID.");
      return;
    }

    setConfigLoading(true);
    setConfigError("");

    try {
      const result =
        await window.posApi.firebase.initialize(
          cleanClientId
        );

      if (!result.success) {
        setConfigError(
          result.error ||
            "Failed to initialize Firebase."
        );
        return;
      }

      // Verify that configuration was saved.


const check = await window.posApi.firebase.getConfig();

// Verify that configuration was saved.
if (!check.success) {
  setConfigError(
    check.error ||
      "Could not verify Firebase configuration."
  );
  return;
}

if (!check.configured) {
  setConfigError(
    "Firebase configuration is incomplete."
  );
  return;
}


//DONLOAD DATA


// Download Firestore data into the local POS database.
setConfigStatus("initializing POS data...");
setConfigError("");

const res = await window.posApi.syncAll();

if (!res.success) {
  setConfigError(
    res.error || "Failed to In."
  );
  setConfigStatus("");
  return;
}

// Continue to the existing login screen.
setConfigured(true);
setConfigError("");
setConfigStatus("");


    } catch (error) {
      setConfigError(
        error instanceof Error
          ? error.message
          : "Initialization failed."
      );
    } finally {
      setConfigLoading(false);
    }
  }

  // ===================================================
  // CONFIGURATION CHECKING
  // ===================================================

  if (!configChecked) {
    return (
      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          bg-black/5
        "
      >
        <div className="text-xs opacity-50">
          Checking POS configuration...
        </div>
      </div>
    );
  }

  // ===================================================
  // CONFIGURATION READ ERROR
  // ===================================================

  if (configError && !configured) {
    return (
      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          p-4
        "
      >
        <div
          className="
            w-full
            max-w-sm
            rounded-xl
            border
            bg-background
            p-5
          "
        >
          <p className="text-sm font-semibold">
            Firebase Configuration Error
          </p>

          <p className="mt-2 text-xs text-red-500">
            {configError}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="
              mt-4
              rounded-md
              border
              px-3
              py-2
              text-xs
            "
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ===================================================
  // FIREBASE INITIALIZATION SCREEN
  // ===================================================

  if (!configured) {
    return (
    
<div className="absolute inset-0 flex items-center justify-center overflow-y-auto bg-slate-950 p-4">
  {/* Background glow */}
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-blue-600/20 blur-[100px]" />
    <div className="absolute -right-32 top-0 h-80 w-80 rounded-full bg-indigo-600/20 blur-[100px]" />
  </div>

  <form
    onSubmit={(event) => {
      event.preventDefault();
      void handleFirebaseInitialize();
    }}
    className="relative w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8"
  >
    {/* Header */}
    <div className="text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 shadow-lg shadow-blue-500/10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="6" rx="2" />
          <rect x="3" y="14" width="18" height="6" rx="2" />
          <path d="M7 7h.01M7 17h.01M17 7h.01M17 17h.01" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-white">
        Initialize System
      </h2>

      <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-400">
        Enter your Client ID to securely initialize your POS.
      </p>
    </div>

    <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

    {/* Client ID */}
    <div>
      <label
        htmlFor="firebase-client-id"
        className="mb-2 block text-sm font-medium text-slate-200"
      >
        Client ID
      </label>

      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-slate-500"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
        </svg>

        <input
          id="firebase-client-id"
          type="text"
          value={clientId}
          onChange={(event) => setClientId(event.target.value)}
          placeholder="Enter your Client ID"
          autoComplete="off"
          disabled={configLoading}
          className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-50"
        />
      </div>
    </div>

    {/* Status */}
    {configStatus && (
      <div className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
        <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-blue-300/30 border-t-blue-400" />
        <span>{configStatus}</span>
      </div>
    )}

    {configError && (
      <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        <span className="mt-0.5 shrink-0">!</span>
        <span>{configError}</span>
      </div>
    )}

    {/* Submit */}
    <button
      type="submit"
      disabled={configLoading || !clientId.trim()}
      className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
    >
      {configLoading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <span>Initializing POS...</span>
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 15V3m0 0-4 4m4-4 4 4" />
            <path d="M5 12v6a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-6" />
          </svg>
          <span>Initialize Configuration</span>
        </>
      )}
    </button>

    {/* Footer */}
    <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-500">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
      <span>Secure setup · Restaurant POS</span>
    </div>
  </form>
</div>
 
    );
  }

  // ===================================================
  // AUTH INITIALIZATION
  // ===================================================

  if (isInitializing) {
    return (
      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          bg-black/5
        "
      >
        <div
          className="
            text-xs
            opacity-50
          "
        >
          Loading POS...
        </div>
      </div>
    );
  }

  // ===================================================
  // AUTHENTICATED
  // ===================================================

  if (isAuthenticated) {
    return (
      <div className="h-full w-full">
        {children}
      </div>
    );
  }

  // ===================================================
  // LOGIN / LOCK SCREEN
  // ORIGINAL UI PRESERVED
  // ===================================================

  return (
    <div
      className="
        absolute
        inset-0
        overflow-hidden
      "
    >
      {/* =================================================
          POS BACKGROUND
      ================================================= */}

      <div
        className="
          absolute
          inset-0
          overflow-hidden
          blur-[5px]
          scale-[1.015]
          opacity-90
          pointer-events-none
          select-none
        "
      >
        {children}
      </div>

      {/* =================================================
          DARK / GLASS OVERLAY
      ================================================= */}

      <div
        className="
          absolute
          inset-0
          bg-black/20
          backdrop-blur-[2px]
        "
      />

      {/* =================================================
          LOGIN
      ================================================= */}

      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          p-4
        "
      >
        <LoginScreen />
      </div>
    </div>
  );
}
